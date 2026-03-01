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
      notificationType,
      title,
      message,
      resourceType,
      resourceId,
      actionUrl,
      severity = 'info',
      metadata,
      sendEmail = true
    } = await req.json();

    if (!merchantId || !notificationType || !title || !message) {
      return Response.json({
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Get merchant profile for email
    const merchant = await base44.asServiceRole.entities.MerchantProfile.filter(
      { user_id: merchantId }
    );

    // Create in-app notification
    const notification = await base44.asServiceRole.entities.Notification.create({
      merchant_id: merchantId,
      type: notificationType,
      category: 'merchant',
      title,
      message,
      resource_type: resourceType || null,
      resource_id: resourceId || null,
      action_url: actionUrl || null,
      severity,
      metadata: metadata || null,
      email_sent: false
    });

    // Send email if requested and merchant exists
    if (sendEmail && merchant.length > 0) {
      const merchantUser = await base44.asServiceRole.entities.User.filter(
        { id: merchantId }
      );

      if (merchantUser.length > 0) {
        const email = merchantUser[0].email;

        try {
          await base44.integrations.Core.SendEmail({
            to: email,
            subject: title,
            body: `${message}\n\n${actionUrl ? `View details: ${actionUrl}` : ''}`
          });

          // Mark email as sent
          await base44.asServiceRole.entities.Notification.update(notification.id, {
            email_sent: true,
            email_sent_at: new Date().toISOString()
          });
        } catch (emailError) {
          console.error('Email sending failed:', emailError.message);
          // Continue without failing - notification still created
        }
      }
    }

    return Response.json({
      success: true,
      notificationId: notification.id,
      emailSent: sendEmail
    });

  } catch (error) {
    return Response.json({
      error: error.message,
      type: 'notification_error'
    }, { status: 500 });
  }
});