import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Global rate limits (not plan-based anymore)
const GLOBAL_LIMITS = {
  requests_per_minute_per_key: 100,
  checkout_creations_per_minute_per_ip: 20,
  webhook_endpoints: Infinity,
  payment_links: Infinity,
  payments: Infinity
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { merchantId, limitType } = await req.json();
    if (!merchantId || !limitType) {
      return Response.json({ error: 'Missing required fields: merchantId, limitType' }, { status: 400 });
    }

    // Check merchant status
    const profiles = await base44.entities.MerchantProfile.filter({ user_id: merchantId });
    if (profiles.length === 0) return Response.json({ error: 'Merchant profile not found' }, { status: 404 });

    const profile = profiles[0];

    // Blocked merchants cannot access any features
    if (profile.status === 'blocked') {
      return Response.json({ error: 'Merchant account is blocked', code: 'MERCHANT_BLOCKED' }, { status: 403 });
    }

    // All active and suspended merchants have unlimited feature access
    // (suspension affects payment acceptance, not feature availability)
    const limits = {
      requests_per_minute_per_key: GLOBAL_LIMITS.requests_per_minute_per_key,
      checkout_creations_per_minute_per_ip: GLOBAL_LIMITS.checkout_creations_per_minute_per_ip,
      webhook_endpoints: 'unlimited',
      payment_links: 'unlimited',
      payments: 'unlimited'
    };

    return Response.json({
      success: true,
      merchantId: merchantId,
      status: profile.status,
      limits: limits,
      message: 'All features are available. Global rate limits apply equally to all merchants. Flat 1.75% fee per transaction.'
    });

  } catch (error) {
    return Response.json({ error: error.message, type: 'plan_limit_check_error' }, { status: 500 });
  }
});