import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    
    // Support entity automation payload (data.merchant_id) and direct calls
    const userEmail = payload?.data?.merchant_id || payload?.data?.created_by || payload?.event?.created_by || payload?.userEmail;
    
    if (!userEmail) {
      return Response.json({ error: 'No user email found' }, { status: 400 });
    }

    // Fetch the user to get their full name
    const users = await base44.asServiceRole.entities.User.filter({ email: userEmail });
    const user = users[0];

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Build welcome email HTML
    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
        <div style="background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="display: inline-block; background: linear-gradient(to right, #6366f1, #06b6d4); padding: 12px 16px; border-radius: 8px;">
              <span style="color: white; font-weight: 700; font-size: 18px;">Pay<span style="color: #e0f2fe;">ADA</span></span>
            </div>
          </div>

          <!-- Main Content -->
          <div style="margin: 30px 0;">
            <h1 style="color: #1a202c; margin: 0 0 20px 0; font-size: 28px;">Welcome to PayADA!</h1>
            <p style="color: #374151; margin: 0 0 20px 0; line-height: 1.6; font-size: 16px;">
              Hi ${escapeHtml(user.full_name || 'there')},
            </p>
            <p style="color: #374151; margin: 0 0 20px 0; line-height: 1.6; font-size: 16px;">
              Your PayADA merchant account has been successfully created. You're now ready to accept Cardano (ADA) payments from customers worldwide.
            </p>
          </div>

          <!-- Features Section -->
          <div style="margin: 30px 0; background: #f3f4f6; border-radius: 8px; padding: 20px;">
            <h2 style="color: #1a202c; margin: 0 0 16px 0; font-size: 18px;">Get Started:</h2>
            <ul style="color: #374151; margin: 0; padding-left: 20px; font-size: 14px;">
              <li style="margin: 10px 0;">
                <strong>Create Payment Links</strong> - Generate unique checkout links for products and services
              </li>
              <li style="margin: 10px 0;">
                <strong>Access Links</strong> - Sell community memberships or exclusive access with automatic Discord role assignment
              </li>
              <li style="margin: 10px 0;">
                <strong>Payment Terminals</strong> - Deploy POS terminals for in-store transactions
              </li>
              <li style="margin: 10px 0;">
                <strong>Webhooks & API</strong> - Integrate with your own applications
              </li>
            </ul>
          </div>

          <!-- Dashboard CTA -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://payada.io/dashboard" target="_blank" style="display: inline-block; background: linear-gradient(to right, #6366f1, #06b6d4); color: white; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px;">
              Go to Dashboard →
            </a>
          </div>

          <!-- Next Steps -->
          <div style="margin: 30px 0; padding: 20px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
            <h3 style="color: #92400e; margin: 0 0 12px 0;">Next Steps:</h3>
            <ol style="color: #92400e; margin: 0; padding-left: 20px; font-size: 14px;">
              <li style="margin: 8px 0;">Complete your merchant profile with business details</li>
              <li style="margin: 8px 0;">Add your Cardano wallet address to receive payments</li>
              <li style="margin: 8px 0;">Create your first payment link and test a transaction</li>
            </ol>
          </div>

          <!-- Support -->
          <div style="margin: 30px 0; text-align: center; padding: 20px; background: #ecfdf5; border-radius: 8px;">
            <p style="color: #065f46; margin: 0 0 12px 0; font-size: 14px;">
              Need help? Check out our <a href="https://payada.io/documentation" style="color: #059669; text-decoration: none; font-weight: 600;">documentation</a> or contact support.
            </p>
          </div>

          <!-- Footer -->
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280; font-size: 12px;">
            <p style="margin: 0;">Welcome aboard! Start accepting ADA payments today.</p>
            <p style="margin: 8px 0 0 0;">The PayADA Team</p>
          </div>
        </div>
      </div>
    `;

    // Send welcome email
    await base44.integrations.Core.SendEmail({
      to: user.email,
      from_name: 'PayADA',
      subject: 'Welcome to PayADA - Get Started with Cardano Payments',
      body: htmlBody
    });

    return Response.json({
      success: true,
      message: 'Welcome email sent',
      recipient: user.email
    });
  } catch (error) {
    console.error('Error in sendWelcomeEmail:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}