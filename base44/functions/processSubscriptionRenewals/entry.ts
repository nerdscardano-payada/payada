import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const DAY_MS = 1000 * 60 * 60 * 24;

const shouldSendReminder = (subscription, daysPastDue, graceDays, now) => {
  if (daysPastDue < 0) return false;
  if (!subscription.customer_email) return false;

  if (subscription.last_reminder_sent_at) {
    const lastReminder = new Date(subscription.last_reminder_sent_at);
    if ((now.getTime() - lastReminder.getTime()) < DAY_MS) {
      return false;
    }
  }

  const reminderMoments = new Set([0, Math.max(1, Math.ceil(graceDays / 2)), graceDays]);
  return reminderMoments.has(daysPastDue);
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const rawBody = await req.text();
    const body = rawBody ? JSON.parse(rawBody) : {};
    const dryRun = body.dryRun === true;
    const now = new Date();

    const [subscriptions, plans, merchants] = await Promise.all([
      base44.asServiceRole.entities.Subscription.list('-next_due_date', 500),
      base44.asServiceRole.entities.SubscriptionPlan.list('-updated_date', 500),
      base44.asServiceRole.entities.MerchantProfile.list('-updated_date', 500),
    ]);

    const planMap = new Map(plans.map((plan) => [plan.id, plan]));
    const merchantMap = new Map(merchants.map((merchant) => [merchant.user_id, merchant]));

    let processed = 0;
    let notified = 0;
    let markedDue = 0;
    let markedLate = 0;

    for (const subscription of subscriptions) {
      if (!['active', 'due', 'late', 'trial'].includes(subscription.status) || !subscription.next_due_date) {
        continue;
      }

      const plan = planMap.get(subscription.subscription_plan_id);
      if (!plan) continue;

      const merchant = merchantMap.get(plan.merchant_id);
      const dueDate = new Date(subscription.next_due_date);
      const daysPastDue = Math.floor((now.getTime() - dueDate.getTime()) / DAY_MS);
      const graceDays = subscription.grace_days_override ?? plan.grace_days ?? 5;
      const nextStatus = daysPastDue > graceDays ? 'late' : daysPastDue >= 0 ? 'due' : subscription.status;
      processed++;

      if (nextStatus !== subscription.status && !dryRun) {
        await base44.asServiceRole.entities.Subscription.update(subscription.id, { status: nextStatus });
      }

      if (nextStatus === 'due' && subscription.status !== 'due') {
        markedDue++;
      }

      if (nextStatus === 'late' && subscription.status !== 'late') {
        markedLate++;
      }

      if (!shouldSendReminder(subscription, daysPastDue, graceDays, now)) {
        continue;
      }

      if (!dryRun) {
        const amount = subscription.amount_ada?.toFixed(2) || '0.00';
        const address = merchant?.default_receive_address || 'Neem contact op met de merchant voor het betaaladres.';
        const daysLeft = Math.max(graceDays - daysPastDue, 0);

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: subscription.customer_email,
          subject: `Payment reminder for ${plan.name}`,
          body: `
            <p>Hi ${subscription.customer_name || 'there'},</p>
            <p>Your Cardano subscription for <strong>${plan.name}</strong> is waiting for the next manual ADA payment.</p>
            <p><strong>Amount due:</strong> ₳ ${amount}<br><strong>Due date:</strong> ${dueDate.toISOString().slice(0, 10)}</p>
            <p>Send the payment to:</p>
            <p><code>${address}</code></p>
            <p>You still have <strong>${daysLeft} day(s)</strong> before access is blocked.</p>
            <p>Once paid, the merchant can confirm the renewal in PayADA.</p>
          `,
        });

        await base44.asServiceRole.entities.Subscription.update(subscription.id, {
          last_reminder_sent_at: now.toISOString(),
          reminders_sent: (subscription.reminders_sent || 0) + 1,
        });
      }

      notified++;
    }

    return Response.json({
      success: true,
      dryRun,
      processed,
      notified,
      markedDue,
      markedLate,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});