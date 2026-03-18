import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { tx_prefix, merchant_id } = await req.json();

    if (!tx_prefix || !merchant_id) {
      return Response.json({ error: 'Missing tx_prefix or merchant_id' }, { status: 400 });
    }

    const payments = await base44.asServiceRole.entities.Payment.filter({ merchant_id }, '-created_date', 200);
    const payment = payments.find((item) => (item.tx_hash || '').startsWith(tx_prefix));

    if (!payment) {
      return Response.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (payment.payment_link_id) {
      const paymentLink = await base44.asServiceRole.entities.PaymentLink.get(payment.payment_link_id);
      if (paymentLink) {
        await base44.asServiceRole.entities.PaymentLink.update(paymentLink.id, {
          payment_count: Math.max(0, (paymentLink.payment_count || 0) - 1),
          total_received_ada: Math.max(0, (paymentLink.total_received_ada || 0) - (payment.received_amount_ada || 0)),
          total_received_cnt: Math.max(0, (paymentLink.total_received_cnt || 0) - (payment.received_amount_cnt || 0)),
        });
      }
    }

    if (payment.access_link_id) {
      const accessLink = await base44.asServiceRole.entities.CommunityAccessLink.get(payment.access_link_id);
      if (accessLink) {
        await base44.asServiceRole.entities.CommunityAccessLink.update(accessLink.id, {
          payment_count: Math.max(0, (accessLink.payment_count || 0) - 1),
          total_received_ada: Math.max(0, (accessLink.total_received_ada || 0) - (payment.received_amount_ada || 0)),
        });
      }
    }

    if (payment.payer_email) {
      const customers = await base44.asServiceRole.entities.Customer.filter({ merchant_id, email: payment.payer_email }, '-created_date', 10);
      const customer = customers[0];
      if (customer) {
        const nextPaymentCount = Math.max(0, (customer.payment_count || 0) - 1);
        const nextTotalPaidAda = Math.max(0, (customer.total_paid_ada || 0) - (payment.payment_type === 'cnt' ? 0 : (payment.received_amount_ada || 0)));

        if (nextPaymentCount === 0) {
          await base44.asServiceRole.entities.Customer.delete(customer.id);
        } else {
          await base44.asServiceRole.entities.Customer.update(customer.id, {
            payment_count: nextPaymentCount,
            total_paid_ada: nextTotalPaidAda,
          });
        }
      }
    }

    await base44.asServiceRole.entities.Payment.delete(payment.id);

    return Response.json({ success: true, deleted_payment_id: payment.id, tx_hash: payment.tx_hash });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});