import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const PAYMENT_LINK_ID = '69c11b47a1a0596e69022fc5';
const CORRECT_RECEIVE_ADDRESS = 'addr1qytqjrw0fwtx3gq3vcf9xtjy45yp7egqnd3lu3tkujkllx0wj92zup59d5rwl5rwsn8m8wc7spav5aecjnw692fcxfjqy30dsy';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const links = await base44.asServiceRole.entities.PaymentLink.filter({ id: PAYMENT_LINK_ID }, '-created_date', 1);
    const paymentLink = links[0];

    if (!paymentLink) {
      return Response.json({ error: 'Payment link not found' }, { status: 404 });
    }

    const updated = await base44.asServiceRole.entities.PaymentLink.update(PAYMENT_LINK_ID, {
      receive_address: CORRECT_RECEIVE_ADDRESS,
    });

    return Response.json({
      success: true,
      paymentLinkId: PAYMENT_LINK_ID,
      title: paymentLink.title,
      previous_receive_address: paymentLink.receive_address || null,
      new_receive_address: updated.receive_address,
      amount_ada: paymentLink.amount_ada,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});