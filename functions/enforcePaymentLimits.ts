import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const PLAN_LIMITS = {
  free: {
    payments_per_month: 50,
    api_calls_per_day: 1000
  },
  pro: {
    payments_per_month: 5000,
    api_calls_per_day: 50000
  },
  business: {
    payments_per_month: 50000,
    api_calls_per_day: 500000
  },
  enterprise: {
    payments_per_month: -1,
    api_calls_per_day: -1
  }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { merchantId, operationType } = await req.json();

    if (!merchantId || !operationType) {
      return Response.json({
        error: 'Missing required fields: merchantId, operationType'
      }, { status: 400 });
    }

    // Fetch merchant profile
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
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

    // Check payments per month limit
    if (operationType === 'create_payment') {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const payments = await base44.entities.Payment.filter({
        merchant_id: merchantId
      });
      
      const thisMonthPayments = payments.filter(p => new Date(p.created_date) >= monthStart).length;
      const limit = limits.payments_per_month;

      if (limit !== -1 && thisMonthPayments >= limit) {
        return Response.json({
          success: false,
          allowed: false,
          plan: plan,
          reason: 'monthly_payment_limit_reached',
          limitType: 'payments_per_month',
          limit: limit,
          currentUsage: thisMonthPayments,
          message: `You have reached the monthly payment limit of ${limit} for the ${plan} plan`,
          code: 'LIMIT_EXCEEDED'
        }, { status: 429 });
      }

      return Response.json({
        success: true,
        allowed: true,
        plan: plan,
        remaining: limit === -1 ? -1 : limit - thisMonthPayments
      });
    }

    return Response.json({
      error: 'Unknown operation type',
      code: 'INVALID_OPERATION'
    }, { status: 400 });

  } catch (error) {
    return Response.json({
      error: error.message,
      type: 'payment_limit_enforcement_error'
    }, { status: 500 });
  }
});