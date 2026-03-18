import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const PLATFORM_FEE_PERCENT = 1.75;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { planId, customerEmail, customerName } = await req.json();

    if (!planId || !customerEmail) {
      return Response.json({ error: 'Missing planId or customerEmail' }, { status: 400 });
    }

    // Fetch plan
    const plans = await base44.asServiceRole.entities.SubscriptionPlan.filter({ id: planId, status: 'active' });
    if (plans.length === 0) return Response.json({ error: 'Plan not found or inactive' }, { status: 404 });
    const plan = plans[0];

    // Fetch merchant profile
    const profiles = await base44.asServiceRole.entities.MerchantProfile.filter({ user_id: plan.merchant_id });
    if (profiles.length === 0) return Response.json({ error: 'Merchant not found' }, { status: 404 });
    const merchant = profiles[0];

    if (merchant.status !== 'active') {
      return Response.json({ error: 'Merchant account is not active' }, { status: 403 });
    }

    // Calculate amount in lovelace
    let amountLovelace = 0;
    if (plan.amount_mode === 'fixed_ada') {
      amountLovelace = Math.floor((plan.amount_ada || 0) * 1_000_000);
    } else {
      // Simple fiat conversion (mock rate)
      const adaToEurRate = 0.5;
      amountLovelace = Math.floor(((plan.amount_fiat || 0) / adaToEurRate) * 1_000_000);
    }

    const feePercent = (merchant.platform_fee_percent || PLATFORM_FEE_PERCENT) / 100;
    const calculatedFeeLovelace = Math.floor(amountLovelace * feePercent);
    const platformFeeLovelace = calculatedFeeLovelace > 0 ? Math.max(calculatedFeeLovelace, 1_000_000) : 0;
    const merchantAmountLovelace = amountLovelace - platformFeeLovelace;

    // Calculate next due date
    const now = new Date();
    const nextDue = new Date(now);
    nextDue.setDate(nextDue.getDate() + (plan.interval_days || 30));

    // Check for existing subscription (avoid duplicates)
    const existing = await base44.asServiceRole.entities.Subscription.filter({
      subscription_plan_id: plan.id,
      customer_email: customerEmail,
      status: 'active'
    });

    let subscription;
    if (existing.length > 0) {
      subscription = existing[0];
    } else {
      // Create subscription record (pending until payment confirmed)
      subscription = await base44.asServiceRole.entities.Subscription.create({
        merchant_id: plan.merchant_id,
        subscription_plan_id: plan.id,
        plan_name: plan.name,
        customer_email: customerEmail,
        customer_name: customerName || '',
        status: 'active',
        started_at: now.toISOString(),
        current_period_start: now.toISOString(),
        current_period_end: nextDue.toISOString(),
        next_due_date: nextDue.toISOString(),
        amount_ada: amountLovelace / 1_000_000,
      });
    }

    return Response.json({
      success: true,
      subscription_id: subscription.id,
      amount_total_lovelace: amountLovelace,
      amount_total_ada: amountLovelace / 1_000_000,
      platform_fee_lovelace: platformFeeLovelace,
      platform_fee_ada: platformFeeLovelace / 1_000_000,
      platform_fee_percent: merchant.platform_fee_percent || PLATFORM_FEE_PERCENT,
      merchant_amount_lovelace: merchantAmountLovelace,
      merchant_amount_ada: merchantAmountLovelace / 1_000_000,
      merchant_address: merchant.default_receive_address || '',
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});