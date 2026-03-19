import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { tx_hash, merchant_id } = body;

    if (!tx_hash) {
      return Response.json({ error: 'tx_hash is required' }, { status: 400 });
    }

    // Build filter
    const filter = { tx_hash };
    if (merchant_id) filter.merchant_id = merchant_id;

    const payments = await base44.asServiceRole.entities.Payment.filter(filter, '-created_date', 1);

    if (!payments || payments.length === 0) {
      return Response.json({ verified: false, error: 'Payment not found' }, { status: 404 });
    }

    const payment = payments[0];

    return Response.json({
      verified: true,
      status: payment.status,
      amount_ada: payment.received_amount_ada || payment.expected_amount_ada,
      payer_wallet: payment.payer_address || null,
      payer_email: payment.payer_email || null,
      merchant_id: payment.merchant_id,
      payment_link_id: payment.payment_link_id,
      tx_hash: payment.tx_hash,
      timestamp: payment.confirmed_at || payment.detected_at || payment.created_date,
      confirmations: payment.confirmations || 0,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});