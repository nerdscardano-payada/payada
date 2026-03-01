import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const BLOCKFROST_API_KEY = Deno.env.get("BLOCKFROST_API_KEY");
const BLOCKFROST_URL = "https://cardano-mainnet.blockfrost.io/api/v0";
const PAYADA_FEE_WALLET = Deno.env.get("PAYADA_FEE_WALLET") || "addr1qy2305ppu..."; // Your PayADA wallet address

async function fetchTransactionFromBlockchain(txHash) {
  const response = await fetch(`${BLOCKFROST_URL}/txs/${txHash}`, {
    headers: { "project_id": BLOCKFROST_API_KEY }
  });

  if (!response.ok) {
    throw new Error(`Blockfrost API error: ${response.statusText}`);
  }

  return response.json();
}

async function fetchTransactionUTXOs(txHash) {
  const response = await fetch(`${BLOCKFROST_URL}/txs/${txHash}/utxos`, {
    headers: { "project_id": BLOCKFROST_API_KEY }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch UTXOs: ${response.statusText}`);
  }

  return response.json();
}

async function getLatestBlockHeight() {
  const response = await fetch(`${BLOCKFROST_URL}/blocks/latest`, {
    headers: { "project_id": BLOCKFROST_API_KEY }
  });

  if (!response.ok) {
    throw new Error(`Failed to get latest block: ${response.statusText}`);
  }

  const data = await response.json();
  return data.height;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { txHash, paymentLinkId, merchantId } = await req.json();

    if (!txHash || !paymentLinkId || !merchantId) {
      return Response.json({
        error: 'Missing required fields: txHash, paymentLinkId, merchantId'
      }, { status: 400 });
    }

    // Fetch payment from database
    const payments = await base44.entities.Payment.filter({
      tx_hash: txHash,
      merchant_id: merchantId
    });

    if (payments.length === 0) {
      return Response.json({
        error: 'Payment record not found'
      }, { status: 404 });
    }

    const payment = payments[0];
    const paymentLink = await base44.entities.PaymentLink.filter({
      id: paymentLinkId,
      merchant_id: merchantId
    }).then(links => links[0]);

    if (!paymentLink) {
      return Response.json({
        error: 'Payment link not found'
      }, { status: 404 });
    }

    // Fetch transaction from Blockfrost
    const tx = await fetchTransactionFromBlockchain(txHash);
    const utxos = await fetchTransactionUTXOs(txHash);
    const latestBlock = await getLatestBlockHeight();

    // Calculate confirmations
    const blockHeight = tx.block_height;
    const confirmations = latestBlock - blockHeight;

    // Parse outputs
    const outputs = utxos.outputs || [];
    const expectedMerchantAmount = payment.expected_amount_ada * 1000000; // Convert ADA to lovelace

    // Validate merchant output
    let merchantOutputFound = false;
    let merchantOutputAmount = 0;
    outputs.forEach(output => {
      if (output.address === paymentLink.receive_address) {
        merchantOutputFound = true;
        // Sum all amounts to this address (in case of multiple outputs)
        merchantOutputAmount += output.amount.reduce((sum, amt) => sum + parseInt(amt), 0);
      }
    });

    // Calculate expected fee (2.5% platform fee)
    const feePercent = 0.025;
    const expectedFeeAmount = Math.floor(expectedMerchantAmount * feePercent);
    const expectedNetAmount = expectedMerchantAmount - expectedFeeAmount;

    // Validate PayADA fee output
    let feeOutputFound = false;
    let feeOutputAmount = 0;
    outputs.forEach(output => {
      if (output.address === PAYADA_FEE_WALLET) {
        feeOutputFound = true;
        feeOutputAmount += output.amount.reduce((sum, amt) => sum + parseInt(amt), 0);
      }
    });

    // Validation result
    const isValid = merchantOutputFound && feeOutputFound;
    const merchantAmountAda = merchantOutputAmount / 1000000;
    const feeAmountAda = feeOutputAmount / 1000000;

    // Update payment with validation results
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
      if (!merchantOutputFound) {
        errorMsg += `Merchant output not found at ${paymentLink.receive_address}. `;
      }
      if (!feeOutputFound) {
        errorMsg += `PayADA fee output not found at ${PAYADA_FEE_WALLET}. `;
      }
      updateData.validation_error = errorMsg;
    }

    await base44.entities.Payment.update(payment.id, updateData);

    // Log audit event
    await base44.functions.invoke('logAuditEvent', {
      merchantId: payment.merchant_id,
      eventType: isValid ? 'payment_detected' : 'payment_failed',
      resourceType: 'payment',
      resourceId: payment.id,
      result: isValid ? 'success' : 'failure',
      changes: {
        status: updateData.status,
        tx_hash: txHash
      },
      errorMessage: isValid ? null : updateData.validation_error,
      metadata: {
        merchant_validated: merchantOutputFound,
        fee_validated: feeOutputFound,
        amount_ada: (merchantOutputAmount + feeOutputAmount) / 1000000
      }
    });

    return Response.json({
      success: true,
      paymentId: payment.id,
      status: updateData.status,
      validation: {
        merchantOutputValid: merchantOutputFound,
        feeOutputValid: feeOutputFound,
        merchantAmountAda,
        feeAmountAda,
        confirmations,
        blockHeight
      }
    });

  } catch (error) {
    return Response.json({
      error: error.message,
      type: 'validation_error'
    }, { status: 500 });
  }
});