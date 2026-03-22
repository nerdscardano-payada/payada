import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subscriptionId } = await req.json();
    if (!subscriptionId) {
      return Response.json({ error: 'Missing subscriptionId' }, { status: 400 });
    }

    const subscriptions = await base44.asServiceRole.entities.Subscription.filter({ id: subscriptionId }, '-created_date', 1);
    const subscription = subscriptions[0];

    if (!subscription) {
      return Response.json({ error: 'Subscription not found' }, { status: 404 });
    }

    if (user.role !== 'admin' && subscription.merchant_id !== user.email) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const plans = await base44.asServiceRole.entities.SubscriptionPlan.filter({ id: subscription.subscription_plan_id }, '-created_date', 1);
    const plan = plans[0];

    if (!plan) {
      return Response.json({ error: 'Plan not found' }, { status: 404 });
    }

    const now = new Date();
    const nextDue = new Date(now);
    nextDue.setDate(nextDue.getDate() + (plan.interval_days || 30));

    const updatedSubscription = await base44.asServiceRole.entities.Subscription.update(subscription.id, {
      status: 'active',
      current_period_start: now.toISOString(),
      current_period_end: nextDue.toISOString(),
      next_due_date: nextDue.toISOString(),
      last_payment_date: now.toISOString(),
      reminders_sent: 0,
      started_at: subscription.started_at || now.toISOString(),
    });

    return Response.json({ success: true, subscription: updatedSubscription });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});