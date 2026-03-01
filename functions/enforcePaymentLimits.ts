import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Global rate limits for all merchants (plan-agnostic)
const GLOBAL_RATE_LIMITS = {
  api_requests_per_minute: 100,
  checkout_creates_per_minute: 20
};

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

    // Check merchant status - suspended/blocked merchants are rate-limited
    if (profile.status === 'blocked') {
      return Response.json({
        success: false,
        allowed: false,
        reason: 'merchant_blocked',
        message: 'Merchant account is blocked',
        code: 'MERCHANT_BLOCKED'
      }, { status: 403 });
    }

    // Return global rate limits (same for all active merchants)
    return Response.json({
      success: true,
      allowed: true,
      status: profile.status,
      limits: GLOBAL_RATE_LIMITS,
      message: 'Global rate limits apply to all merchants'
    });

  } catch (error) {
    return Response.json({
      error: error.message,
      type: 'rate_limit_check_error'
    }, { status: 500 });
  }
});