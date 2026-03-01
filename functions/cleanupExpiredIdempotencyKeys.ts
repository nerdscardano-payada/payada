import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const now = new Date().toISOString();

    // Fetch all expired idempotency keys
    const expiredKeys = await base44.asServiceRole.entities.IdempotencyKey.filter({
      // Query for keys where expires_at < now
      // Note: This uses base44 SDK filtering - adjust based on actual SDK capabilities
    });

    let deletedCount = 0;

    // Manually filter and delete expired keys
    const allKeys = await base44.asServiceRole.entities.IdempotencyKey.list();
    
    if (allKeys && allKeys.length > 0) {
      for (const key of allKeys) {
        if (new Date(key.expires_at) < new Date(now)) {
          try {
            await base44.asServiceRole.entities.IdempotencyKey.delete(key.id);
            deletedCount++;
          } catch (deleteError) {
            console.error(`Error deleting expired key ${key.id}:`, deleteError.message);
          }
        }
      }
    }

    return Response.json({
      status: 'success',
      cleaned_up: deletedCount,
      timestamp: now,
      message: `Cleaned up ${deletedCount} expired idempotency keys`
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});