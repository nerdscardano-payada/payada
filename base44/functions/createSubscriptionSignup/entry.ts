import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const PLATFORM_FEE_PERCENT = 1.75;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { planId, customerEmail, customerName } = await req.json();

    if (!planId || !customerEmail) {
      return Response.json({ error: 'Missing planId or customerEmail' }, { status: 400 });
    }

    const plans = await base44.asServiceRole.entities.SubscriptionPlan.filter({ id: planId, status: 'active' }, '-created_date', 1);
    const plan = plans[0];
    if (!plan) {
      return Response.json({ error: 'Plan not found or inactive' }, { status: 404 });
    }

    const profiles = await base44.asServiceRole.entities.MerchantProfile.filter({ user_id: plan.merchant_id }, '-created_date', 1);
    const merchant = profiles[0];
    if (!merchant) {
      return Response.json({ error: 'Merchant not found' }, { status: 404 });
    }

    if (merchant.status !== 'active') {
      return Response.json({ error: 'Merchant account is not active' }, { status: 403 });
    }

    let amountLovelace = 0;
    if (plan.amount_mode === 'fixed_ada') {
      amountLovelace = Math.floor((plan.amount_ada || 0) * 1_000_000);
    } else {
      const adaToEurRate = 0.5;
      amountLovelace = Math.floor(((plan.amount_fiat || 0) / adaToEurRate) * 1_000_000);
    }

    const feePercent = (merchant.platform_fee_percent || PLATFORM_FEE_PERCENT) / 100;
    const feeModel = plan.fee_model || 'merchant_pays';
    const baseLovelace = amountLovelace;
    const calculatedFeeLovelace = Math.floor(baseLovelace * feePercent);
    const fullFeeLovelace = calculatedFeeLovelace > 0 ? Math.max(calculatedFeeLovelace, 1_000_000) : 0;
    let platformFeeLovelace;
    let merchantAmountLovelace;

    if (feeModel === 'customer_pays') {
      platformFeeLovelace = fullFeeLovelace;
      merchantAmountLovelace = baseLovelace;
      amountLovelace = baseLovelace + fullFeeLovelace;
    } else if (feeModel === 'split') {
      const halfFee = Math.floor(fullFeeLovelace / 2);
      platformFeeLovelace = fullFeeLovelace;
      merchantAmountLovelace = baseLovelace - halfFee;
      amountLovelace = baseLovelace + halfFee;
    } else {
      platformFeeLovelace = fullFeeLovelace;
      merchantAmountLovelace = baseLovelace - fullFeeLovelace;
    }

    const now = new Date();
    const firstDueDate = new Date(now);
    const hasTrial = (plan.trial_days || 0) > 0;

    if (hasTrial) {
      firstDueDate.setDate(firstDueDate.getDate() + plan.trial_days);
    }

    const existing = await base44.asServiceRole.entities.Subscription.filter({
      subscription_plan_id: plan.id,
      customer_email: customerEmail,
    }, '-created_date', 1);

    let subscription = existing[0];

    if (!subscription || subscription.status === 'cancelled') {
      subscription = await base44.asServiceRole.entities.Subscription.create({
        merchant_id: plan.merchant_id,
        subscription_plan_id: plan.id,
        plan_name: plan.name,
        customer_email: customerEmail,
        customer_name: customerName || '',
        status: hasTrial ? 'trial' : 'due',
        started_at: now.toISOString(),
        current_period_start: hasTrial ? now.toISOString() : undefined,
        current_period_end: hasTrial ? firstDueDate.toISOString() : undefined,
        next_due_date: firstDueDate.toISOString(),
        amount_ada: amountLovelace / 1_000_000,
        reminders_sent: 0,
      });
    }

    return Response.json({
      success: true,
      subscription_id: subscription.id,
      subscription_status: subscription.status,
      amount_total_lovelace: amountLovelace,
      amount_total_ada: amountLovelace / 1_000_000,
      base_amount_lovelace: baseLovelace,
      base_amount_ada: baseLovelace / 1_000_000,
      platform_fee_lovelace: platformFeeLovelace,
      platform_fee_ada: platformFeeLovelace / 1_000_000,
      platform_fee_percent: merchant.platform_fee_percent || PLATFORM_FEE_PERCENT,
      fee_model: feeModel,
      merchant_amount_lovelace: merchantAmountLovelace,
      merchant_amount_ada: merchantAmountLovelace / 1_000_000,
      merchant_address: merchant.default_receive_address || '',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});