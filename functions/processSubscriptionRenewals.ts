import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // This is a scheduled function - use service role
    const now = new Date();

    // Get all active subscriptions where next_due_date has passed
    const allSubscriptions = await base44.asServiceRole.entities.Subscription.list('-next_due_date', 500);

    const due = allSubscriptions.filter(sub => {
      if (!['active', 'due'].includes(sub.status)) return false;
      if (!sub.next_due_date) return false;
      return new Date(sub.next_due_date) <= now;
    });

    let notified = 0;
    let markedLate = 0;

    for (const sub of due) {
      // Fetch the plan to get merchant info and receive address
      const plans = await base44.asServiceRole.entities.SubscriptionPlan.filter({
        id: sub.subscription_plan_id
      });
      if (plans.length === 0) continue;
      const plan = plans[0];

      const profiles = await base44.asServiceRole.entities.MerchantProfile.filter({
        user_id: plan.merchant_id
      });
      if (profiles.length === 0) continue;
      const merchant = profiles[0];

      // Build the subscriber portal URL for renewal
      const renewalUrl = `${Deno.env.get('APP_URL') || 'https://app.payada.io'}/SubscriberPortal?slug=${plan.slug}`;

      // Send renewal email to customer
      if (sub.customer_email) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: sub.customer_email,
          subject: `Betaalherinnering: ${plan.name}`,
          body: `
Beste ${sub.customer_name || 'abonnee'},

Je abonnement op <strong>${plan.name}</strong> is vervallen. Om je abonnement actief te houden, verzoeken wij je de volgende betaling te voldoen:

<strong>Bedrag:</strong> ₳ ${sub.amount_ada?.toFixed(2)} ADA<br>
<strong>Plan:</strong> ${plan.name}

Klik op de onderstaande link om te betalen via je Cardano wallet:
<a href="${renewalUrl}">${renewalUrl}</a>

Stuur ₳ ${sub.amount_ada?.toFixed(6)} naar:<br>
<code>${merchant.default_receive_address || ''}</code>

Je hebt ${plan.grace_days || 5} dagen respijt voordat je abonnement wordt onderbroken.

Met vriendelijke groet,<br>
PayADA.io
          `
        });
        notified++;
      }

      // Update subscription status to 'due'
      const daysSinceDue = Math.floor((now - new Date(sub.next_due_date)) / (1000 * 60 * 60 * 24));
      const graceDays = plan.grace_days || 5;

      if (daysSinceDue > graceDays && sub.status !== 'late') {
        await base44.asServiceRole.entities.Subscription.update(sub.id, { status: 'late' });
        markedLate++;
      } else if (sub.status === 'active') {
        await base44.asServiceRole.entities.Subscription.update(sub.id, { status: 'due' });
      }
    }

    return Response.json({
      success: true,
      processed: due.length,
      notified,
      markedLate,
      timestamp: now.toISOString()
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});