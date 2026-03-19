import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const {
      title,
      message,
      severity = 'warning',
      resourceType,
      resourceId,
      merchantId,
      metadata
    } = await req.json();

    if (!title || !message) {
      return Response.json({
        error: 'Missing required fields: title, message'
      }, { status: 400 });
    }

    // Create notification for all admins
    const admins = await base44.asServiceRole.entities.User.filter(
      { role: 'admin' }
    );

    const alerts = [];

    for (const admin of admins) {
      const alert = await base44.asServiceRole.entities.Notification.create({
        merchant_id: admin.id,
        type: 'system_alert',
        category: 'admin',
        title,
        message,
        resource_type: resourceType || null,
        resource_id: resourceId || null,
        severity,
        metadata: {
          ...metadata,
          affected_merchant: merchantId || null
        }
      });

      alerts.push(alert.id);

      // Send email alert for critical issues
      if (severity === 'critical') {
        try {
          await base44.integrations.Core.SendEmail({
            to: admin.email,
            subject: `🚨 CRITICAL ALERT: ${title}`,
            body: `${message}\n\nMerchant: ${merchantId || 'N/A'}\nSeverity: ${severity}`
          });
        } catch (emailError) {
          console.error('Admin alert email failed:', emailError.message);
        }
      }
    }

    return Response.json({
      success: true,
      alertIds: alerts,
      adminCount: admins.length
    });

  } catch (error) {
    return Response.json({
      error: error.message,
      type: 'admin_alert_error'
    }, { status: 500 });
  }
});