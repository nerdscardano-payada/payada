import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const BLOCKFROST_API_KEY = Deno.env.get("BLOCKFROST_API_KEY");
const BLOCKFROST_URL = "https://cardano-mainnet.blockfrost.io/api/v0";
const PAYADA_FEE_WALLET = Deno.env.get("PAYADA_FEE_WALLET");
const PLATFORM_FEE_PERCENT = 1.75;

async function fetchTransactionFromBlockchain(txHash) {
  const response = await fetch(`${BLOCKFROST_URL}/txs/${txHash}`, {
    headers: { "project_id": BLOCKFROST_API_KEY }
  });
  if (!response.ok) throw new Error(`Blockfrost API error: ${response.statusText}`);
  return response.json();
}

async function fetchTransactionUTXOs(txHash) {
  const response = await fetch(`${BLOCKFROST_URL}/txs/${txHash}/utxos`, {
    headers: { "project_id": BLOCKFROST_API_KEY }
  });
  if (!response.ok) throw new Error(`Failed to fetch UTXOs: ${response.statusText}`);
  return response.json();
}

async function getLatestBlockHeight() {
  const response = await fetch(`${BLOCKFROST_URL}/blocks/latest`, {
    headers: { "project_id": BLOCKFROST_API_KEY }
  });
  if (!response.ok) throw new Error(`Failed to get latest block: ${response.statusText}`);
  const data = await response.json();
  return data.height;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { txHash, paymentLinkId, merchantId } = await req.json();
    if (!txHash || !paymentLinkId || !merchantId) {
      return Response.json({ error: 'Missing required fields: txHash, paymentLinkId, merchantId' }, { status: 400 });
    }

    // Fetch payment
    const payments = await base44.entities.Payment.filter({ tx_hash: txHash, merchant_id: merchantId });
    if (payments.length === 0) return Response.json({ error: 'Payment record not found' }, { status: 404 });

    const payment = payments[0];
    const paymentLink = await base44.entities.PaymentLink.filter({ id: paymentLinkId, merchant_id: merchantId }).then(links => links[0]);
    if (!paymentLink) return Response.json({ error: 'Payment link not found' }, { status: 404 });

    // Fetch merchant profile to get fee percentage
    const merchantProfile = await base44.entities.MerchantProfile.filter({ user_id: merchantId }).then(p => p[0]);
    const feePercent = (merchantProfile?.platform_fee_percent || PLATFORM_FEE_PERCENT) / 100;

    // Enforce merchant status checks
    if (merchantProfile?.status === 'blocked') {
      return Response.json({ error: 'Merchant account is blocked', code: 'MERCHANT_BLOCKED' }, { status: 403 });
    }
    if (merchantProfile?.status === 'suspended') {
      return Response.json({ error: 'Merchant account is suspended', code: 'MERCHANT_SUSPENDED' }, { status: 403 });
    }
    if (merchantProfile?.status !== 'active') {
      return Response.json({ error: 'Merchant account is not active' }, { status: 403 });
    }

    // Fetch blockchain data
    const tx = await fetchTransactionFromBlockchain(txHash);
    const utxos = await fetchTransactionUTXOs(txHash);
    const latestBlock = await getLatestBlockHeight();

    const blockHeight = tx.block_height;
    const confirmations = latestBlock - blockHeight;
    const outputs = utxos.outputs || [];
    const totalAmount = payment.expected_amount_ada * 1000000; // lovelace
    const expectedFeeAmount = Math.floor(totalAmount * feePercent);
    const expectedMerchantAmount = totalAmount - expectedFeeAmount;

    // Validate merchant output
    let merchantOutputFound = false;
    let merchantOutputAmount = 0;
    outputs.forEach(output => {
      if (output.address === paymentLink.receive_address) {
        merchantOutputFound = true;
        merchantOutputAmount += output.amount.reduce((sum, amt) => sum + parseInt(amt), 0);
      }
    });

    // Validate PayADA fee output
    let feeOutputFound = false;
    let feeOutputAmount = 0;
    outputs.forEach(output => {
      if (output.address === PAYADA_FEE_WALLET) {
        feeOutputFound = true;
        feeOutputAmount += output.amount.reduce((sum, amt) => sum + parseInt(amt), 0);
      }
    });

    const isValid = merchantOutputFound && feeOutputFound && 
                   merchantOutputAmount >= expectedMerchantAmount && 
                   feeOutputAmount >= expectedFeeAmount;
    const merchantAmountAda = merchantOutputAmount / 1000000;
    const feeAmountAda = feeOutputAmount / 1000000;

    const updateData = {
      status: isValid ? 'detected' : 'failed',
      block_height_detected: blockHeight,
      confirmations: confirmations,
      detected_at: new Date().toISOString(),
      fee_output_validated: feeOutputFound,
      merchant_output_validated: merchantOutputFound,
      merchant_amount_ada: merchantAmountAda,
      fee_amount_ada: feeAmountAda,
      received_amount_ada: (merchantOutputAmount + feeOutputAmount) / 1000000
    };

    if (!isValid) {
      let errorMsg = '';
      if (!merchantOutputFound) errorMsg += `Merchant output not found. `;
      if (!feeOutputFound) errorMsg += `PayADA fee output not found. `;
      if (merchantOutputFound && merchantOutputAmount < expectedMerchantAmount) {
        errorMsg += `Merchant amount insufficient: ${merchantAmountAda} < ${expectedMerchantAmount / 1000000}. `;
      }
      if (feeOutputFound && feeOutputAmount < expectedFeeAmount) {
        errorMsg += `Fee amount insufficient: ${feeAmountAda} < ${expectedFeeAmount / 1000000}. `;
      }
      updateData.validation_error = errorMsg;
    }

    await base44.entities.Payment.update(payment.id, updateData);

    await base44.functions.invoke('logAuditEvent', {
      merchantId: payment.merchant_id,
      eventType: isValid ? 'payment_detected' : 'payment_failed',
      resourceType: 'payment',
      resourceId: payment.id,
      result: isValid ? 'success' : 'failure',
      changes: { status: updateData.status, tx_hash: txHash },
      errorMessage: isValid ? null : updateData.validation_error,
      metadata: {
        merchant_validated: merchantOutputFound,
        fee_validated: feeOutputFound,
        amount_ada: (merchantOutputAmount + feeOutputAmount) / 1000000,
        fee_percent: feePercent * 100
      }
    });

    if (isValid) {
      await base44.functions.invoke('sendMerchantNotification', {
        merchantId: payment.merchant_id,
        notificationType: 'payment_detected',
        title: '💰 Payment Detected',
        message: `Payment of ${((merchantOutputAmount + feeOutputAmount) / 1000000).toFixed(2)} ADA detected (${feePercent * 100}% fee).`,
        resourceType: 'payment',
        resourceId: payment.id,
        actionUrl: `/payments/${payment.id}`,
        severity: 'info',
        metadata: { amount_ada: (merchantOutputAmount + feeOutputAmount) / 1000000, tx_hash: txHash }
      });
    } else {
      await base44.functions.invoke('sendMerchantNotification', {
        merchantId: payment.merchant_id,
        notificationType: 'payment_failed',
        title: '❌ Payment Validation Failed',
        message: updateData.validation_error || 'Payment failed validation checks.',
        resourceType: 'payment',
        resourceId: payment.id,
        severity: 'warning'
      });
    }

    return Response.json({
      success: true,
      paymentId: payment.id,
      status: updateData.status,
      validation: { merchantOutputValid: merchantOutputFound, feeOutputValid: feeOutputFound, merchantAmountAda, feeAmountAda, confirmations, blockHeight }
    });
  } catch (error) {
    return Response.json({ error: error.message, type: 'validation_error' }, { status: 500 });
  }
});