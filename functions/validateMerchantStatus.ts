import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Utility function to validate merchant status
 * Used across all payment-related endpoints
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { merchantId } = await req.json();
    if (!merchantId) {
      return Response.json({ error: 'Missing merchantId' }, { status: 400 });
    }

    const profiles = await base44.entities.MerchantProfile.filter({ user_id: merchantId });
    if (profiles.length === 0) {
      return Response.json({ error: 'Merchant profile not found' }, { status: 404 });
    }

    const profile = profiles[0];
    const isActive = profile.status === 'active';
    const statusReason = !isActive ? `Merchant account is ${profile.status}` : null;

    return Response.json({
      success: true,
      merchantId: merchantId,
      status: profile.status,
      isActive: isActive,
      statusReason: statusReason,
      fee_percent: profile.platform_fee_percent || 1.75
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});