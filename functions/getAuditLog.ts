import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { merchantId, eventType, startDate, endDate, limit = 100, offset = 0 } = await req.json();

    if (!merchantId) {
      return Response.json({
        error: 'Missing required field: merchantId'
      }, { status: 400 });
    }

    // Build filter
    const filter = {
      merchant_id: merchantId
    };

    if (eventType) {
      filter.event_type = eventType;
    }

    // Fetch audit logs
    let auditLogs = await base44.entities.AuditLog.filter(filter, '-created_date', limit + offset);

    // Filter by date range if provided
    if (startDate || endDate) {
      auditLogs = auditLogs.filter(log => {
        const logDate = new Date(log.created_date);
        if (startDate && logDate < new Date(startDate)) return false;
        if (endDate && logDate > new Date(endDate)) return false;
        return true;
      });
    }

    // Apply offset and limit
    const paginatedLogs = auditLogs.slice(offset, offset + limit);

    // Aggregate statistics
    const stats = {
      total_events: auditLogs.length,
      success_count: auditLogs.filter(l => l.result === 'success').length,
      failure_count: auditLogs.filter(l => l.result === 'failure').length,
      blocked_count: auditLogs.filter(l => l.result === 'blocked').length,
      event_types: {}
    };

    for (const log of auditLogs) {
      stats.event_types[log.event_type] = (stats.event_types[log.event_type] || 0) + 1;
    }

    return Response.json({
      success: true,
      logs: paginatedLogs,
      pagination: {
        offset: offset,
        limit: limit,
        total: auditLogs.length
      },
      statistics: stats,
      queryDate: new Date().toISOString()
    });

  } catch (error) {
    return Response.json({
      error: error.message,
      type: 'audit_log_retrieval_error'
    }, { status: 500 });
  }
});