import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      merchantId,
      eventType,
      resourceType,
      resourceId,
      result,
      changes,
      errorMessage,
      metadata
    } = await req.json();

    if (!merchantId || !eventType || !resourceType || !result) {
      return Response.json({
        error: 'Missing required fields: merchantId, eventType, resourceType, result'
      }, { status: 400 });
    }

    // Extract IP and User-Agent from request
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                      req.headers.get('cf-connecting-ip') || 
                      'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Create audit log entry
    const auditEntry = await base44.entities.AuditLog.create({
      merchant_id: merchantId,
      event_type: eventType,
      actor: user.email,
      resource_type: resourceType,
      resource_id: resourceId || null,
      result: result,
      changes: changes || null,
      error_message: errorMessage || null,
      ip_address: ipAddress,
      user_agent: userAgent,
      metadata: metadata || null
    });

    return Response.json({
      success: true,
      auditLogId: auditEntry.id,
      timestamp: auditEntry.created_date
    });

  } catch (error) {
    // Fallback logging if audit DB fails
    console.error('Audit logging failed:', error.message);
    
    return Response.json({
      error: error.message,
      type: 'audit_logging_error'
    }, { status: 500 });
  }
});