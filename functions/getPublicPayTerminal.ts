import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { terminalId } = await req.json();

    if (!terminalId) {
      return Response.json({ error: 'Missing terminalId' }, { status: 400 });
    }

    const sr = base44.asServiceRole;
    const terminals = await sr.entities.PayTerminal.filter({ id: terminalId, status: 'active' }, '-created_date', 1);
    const terminal = terminals[0] || null;

    if (!terminal) {
      return Response.json({ error: 'Terminal not found' }, { status: 404 });
    }

    let paymentLink = null;
    let plans = [];

    if (terminal.mode === 'one_time' && terminal.payment_link_slug) {
      const links = await sr.entities.PaymentLink.filter({ slug: terminal.payment_link_slug, status: 'active' }, '-created_date', 1);
      paymentLink = links[0] || null;
    }

    if (terminal.mode === 'subscription' && terminal.plan_ids?.length) {
      const planResults = await Promise.all(
        terminal.plan_ids.map((id) => sr.entities.SubscriptionPlan.filter({ id, status: 'active' }, '-created_date', 1))
      );
      plans = planResults.flat();
    }

    return Response.json({ success: true, terminal, paymentLink, plans });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});