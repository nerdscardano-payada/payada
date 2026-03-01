import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Admin-only operation
    if (!user || user.role !== 'admin') {
      return Response.json({
        error: 'Forbidden: Admin access required'
      }, { status: 403 });
    }

    // Fetch all merchants
    const profiles = await base44.entities.MerchantProfile.list();

    let resetCount = 0;

    for (const profile of profiles) {
      // Reset daily API call counter (stored in user metadata)
      await base44.auth.updateMe({
        api_calls_today: 0,
        api_calls_reset_at: new Date().toISOString()
      });

      resetCount++;
    }

    return Response.json({
      success: true,
      merchantsReset: resetCount,
      timestamp: new Date().toISOString(),
      message: 'Daily API call limits reset for all merchants'
    });

  } catch (error) {
    return Response.json({
      error: error.message,
      type: 'daily_limit_reset_error'
    }, { status: 500 });
  }
});