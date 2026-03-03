import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const BLOCKFROST_API_KEY = Deno.env.get("BLOCKFROST_API_KEY");
const BLOCKFROST_URL = "https://cardano-mainnet.blockfrost.io/api/v0";

async function fetchTxUtxos(txHash) {
  const res = await fetch(`${BLOCKFROST_URL}/txs/${txHash}/utxos`, {
    headers: { project_id: BLOCKFROST_API_KEY }
  });
  if (!res.ok) throw new Error(`Blockfrost UTXOs error: ${res.statusText}`);
  return res.json();
}

async function fetchTxInfo(txHash) {
  const res = await fetch(`${BLOCKFROST_URL}/txs/${txHash}`, {
    headers: { project_id: BLOCKFROST_API_KEY }
  });
  if (!res.ok) throw new Error(`Blockfrost TX error: ${res.statusText}`);
  return res.json();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { txHash, paymentLinkId, merchantId, payerAddress, payerEmail, payerName } = await req.json();

    if (!txHash || !paymentLinkId || !merchantId) {
      return Response.json({ error: 'Missing required fields: txHash, paymentLinkId, merchantId' }, { status: 400 });
    }

    // Use service role for all operations - this is called from a public page
    const sr = base44.asServiceRole;

    const paymentLinks = await sr.entities.PaymentLink.filter({ id: paymentLinkId, merchant_id: merchantId });
    const paymentLink = paymentLinks[0];
    if (!paymentLink) return Response.json({ error: 'Payment link not found' }, { status: 404 });

    // Avoid duplicate payment records for same tx
    const existingPayments = await sr.entities.Payment.filter({ tx_hash: txHash });
    if (existingPayments.length > 0) {
      return Response.json({ success: true, paymentId: existingPayments[0].id, duplicate: true });
    }

    // Fetch blockchain data
    const [txInfo, utxos] = await Promise.all([fetchTxInfo(txHash), fetchTxUtxos(txHash)]);
    const outputs = utxos.outputs || [];

    // Calculate amounts from outputs sent to merchant address
    let merchantLovelace = 0;
    outputs.forEach(output => {
      if (output.address === paymentLink.receive_address) {
        output.amount.forEach(a => {
          if (a.unit === 'lovelace') merchantLovelace += parseInt(a.quantity);
        });
      }
    });

    const receivedAmountAda = merchantLovelace / 1_000_000;
    const expectedAmountAda = paymentLink.amount_ada || 0;

    // Create Payment record
    const payment = await sr.entities.Payment.create({
      merchant_id: merchantId,
      payment_link_id: paymentLinkId,
      status: 'detected',
      expected_amount_ada: expectedAmountAda,
      received_amount_ada: receivedAmountAda,
      tx_hash: txHash,
      payer_address: payerAddress || null,
      payer_email: payerEmail || null,
      payer_name: payerName || null,
      block_height_detected: txInfo.block_height,
      confirmations: 0,
      detected_at: new Date().toISOString(),
      merchant_output_validated: merchantLovelace > 0,
      merchant_amount_ada: receivedAmountAda
    });

    // Update PaymentLink stats
    await sr.entities.PaymentLink.update(paymentLinkId, {
      total_received_ada: (paymentLink.total_received_ada || 0) + receivedAmountAda,
      payment_count: (paymentLink.payment_count || 0) + 1
    });

    return Response.json({ success: true, paymentId: payment.id, receivedAmountAda });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});