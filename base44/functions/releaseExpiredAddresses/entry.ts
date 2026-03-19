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

    const now = new Date();

    // Find all active addresses that have expired
    const activeAddresses = await base44.entities.ActiveAddress.filter({
      status: 'in_use'
    });

    let expiredCount = 0;
    let releasedCount = 0;

    for (const addr of activeAddresses) {
      if (addr.expires_at && new Date(addr.expires_at) < now) {
        // Mark as expired and set cooldown (24 hours)
        const cooldownUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        await base44.entities.ActiveAddress.update(addr.id, {
          status: 'expired',
          cooldown_until: cooldownUntil.toISOString()
        });

        expiredCount++;
      }
    }

    // Find all expired addresses that have completed their cooldown
    const expiredAddresses = await base44.entities.ActiveAddress.filter({
      status: 'expired'
    });

    for (const addr of expiredAddresses) {
      if (addr.cooldown_until && new Date(addr.cooldown_until) <= now) {
        // Release back to available pool
        await base44.entities.ActiveAddress.update(addr.id, {
          status: 'available',
          payment_id: null,
          cooldown_until: null
        });

        releasedCount++;
      }
    }

    return Response.json({
      success: true,
      expiredToday: expiredCount,
      releasedFromCooldown: releasedCount,
      timestamp: now.toISOString()
    });

  } catch (error) {
    return Response.json({
      error: error.message,
      type: 'address_release_error'
    }, { status: 500 });
  }
});