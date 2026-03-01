import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Plan tier limits
const PLAN_LIMITS = {
  free: {
    payment_links_per_month: 5,
    payments_per_month: 50,
    api_calls_per_day: 1000,
    webhooks: 1,
    custom_redirect_urls: false,
    priority_support: false
  },
  pro: {
    payment_links_per_month: 50,
    payments_per_month: 5000,
    api_calls_per_day: 50000,
    webhooks: 10,
    custom_redirect_urls: true,
    priority_support: true
  },
  business: {
    payment_links_per_month: 500,
    payments_per_month: 50000,
    api_calls_per_day: 500000,
    webhooks: 50,
    custom_redirect_urls: true,
    priority_support: true
  },
  enterprise: {
    payment_links_per_month: -1,  // unlimited
    payments_per_month: -1,
    api_calls_per_day: -1,
    webhooks: -1,
    custom_redirect_urls: true,
    priority_support: true
  }
};

function getLimitForPlan(plan, limitType) {
  return PLAN_LIMITS[plan] ? PLAN_LIMITS[plan][limitType] : PLAN_LIMITS.free[limitType];
}

function isUnlimited(limit) {
  return limit === -1;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { merchantId, limitType } = await req.json();

    if (!merchantId || !limitType) {
      return Response.json({
        error: 'Missing required fields: merchantId, limitType'
      }, { status: 400 });
    }

    // Fetch merchant profile to get plan
    const profiles = await base44.entities.MerchantProfile.filter({
      user_id: merchantId
    });

    if (profiles.length === 0) {
      return Response.json({
        error: 'Merchant profile not found'
      }, { status: 404 });
    }

    const profile = profiles[0];
    const plan = profile.plan || 'free';
    const limit = getLimitForPlan(plan, limitType);

    if (isUnlimited(limit)) {
      return Response.json({
        success: true,
        plan: plan,
        limitType: limitType,
        limit: 'unlimited',
        remaining: -1,
        percentage: 0,
        enforced: false
      });
    }

    // Get current usage based on limit type
    let currentUsage = 0;

    if (limitType === 'payment_links_per_month') {
      // Count payment links created this month
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const paymentLinks = await base44.entities.PaymentLink.filter({
        merchant_id: merchantId
      });
      currentUsage = paymentLinks.filter(pl => new Date(pl.created_date) >= monthStart).length;
    } else if (limitType === 'payments_per_month') {
      // Count payments this month
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const payments = await base44.entities.Payment.filter({
        merchant_id: merchantId
      });
      currentUsage = payments.filter(p => new Date(p.created_date) >= monthStart).length;
    } else if (limitType === 'webhooks') {
      // Count webhook endpoints
      const webhooks = await base44.entities.WebhookEndpoint.filter({
        merchant_id: merchantId
      });
      currentUsage = webhooks.length;
    }

    const remaining = limit - currentUsage;
    const percentage = (currentUsage / limit) * 100;
    const exceeded = remaining < 0;

    return Response.json({
      success: true,
      plan: plan,
      limitType: limitType,
      limit: limit,
      currentUsage: currentUsage,
      remaining: remaining,
      percentage: percentage,
      exceeded: exceeded,
      enforced: true,
      message: exceeded ? `Limit exceeded for ${limitType}` : `${remaining} remaining of ${limit}`
    });

  } catch (error) {
    return Response.json({
      error: error.message,
      type: 'plan_limit_check_error'
    }, { status: 500 });
  }
});