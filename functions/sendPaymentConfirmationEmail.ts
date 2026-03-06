import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { paymentId } = body;

    if (!paymentId) {
      return Response.json({ error: 'Missing paymentId' }, { status: 400 });
    }

    // Fetch payment details
    const payment = await base44.asServiceRole.entities.Payment.get(paymentId);
    if (!payment) {
      return Response.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Only send email for confirmed payments
    if (payment.status !== 'confirmed') {
      return Response.json({ success: false, message: 'Payment not confirmed yet' });
    }

    // Only send if this payment belongs to the current user
    if (payment.merchant_id !== user.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Format payment details
    const amountAda = (payment.received_amount_ada || payment.expected_amount_ada || 0).toFixed(2);
    const feeAda = (payment.fee_amount_ada || 0).toFixed(2);
    const netAda = (amountAda - feeAda).toFixed(2);
    const payerInfo = payment.payer_name || payment.payer_email || 'Unknown';
    const txHash = payment.tx_hash || 'N/A';
    const blockUrl = `https://cexplorer.io/tx/${txHash}`;

    // Build email HTML
    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
        <div style="background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1a202c; margin: 0; font-size: 24px;">✓ Payment Confirmed</h1>
          </div>

          <!-- Main Content -->
          <div style="margin: 30px 0; padding: 20px; background: #f0f7ff; border-left: 4px solid #3b82f6; border-radius: 4px;">
            <p style="color: #374151; margin: 0 0 20px 0;">
              Hello,
            </p>
            <p style="color: #374151; margin: 0 0 20px 0;">
              A payment has been confirmed on your PayADA account!
            </p>
          </div>

          <!-- Payment Details -->
          <div style="margin: 30px 0;">
            <h2 style="color: #1a202c; font-size: 18px; margin: 0 0 20px 0;">Payment Details</h2>
            
            <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 15px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Payer:</td>
                  <td style="padding: 8px 0; color: #1a202c; font-weight: 600; text-align: right;">${escapeHtml(payerInfo)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Amount:</td>
                  <td style="padding: 8px 0; color: #1a202c; font-weight: 600; text-align: right;">₳ ${amountAda}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Platform Fee:</td>
                  <td style="padding: 8px 0; color: #ef4444; text-align: right;">-₳ ${feeAda}</td>
                </tr>
                <tr style="border-top: 2px solid #e5e7eb;">
                  <td style="padding: 12px 0; color: #1a202c; font-weight: 700; font-size: 16px;">Net:</td>
                  <td style="padding: 12px 0; color: #10b981; font-weight: 700; font-size: 16px; text-align: right;">₳ ${netAda}</td>
                </tr>
              </table>
            </div>

            <!-- Transaction Hash -->
            <div style="margin: 20px 0;">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px 0;">Transaction Hash:</p>
              <p style="color: #3b82f6; font-family: monospace; font-size: 12px; margin: 0; word-break: break-all;">
                ${txHash}
              </p>
            </div>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${blockUrl}" target="_blank" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">
              View on Cardano Explorer →
            </a>
          </div>

          <!-- Footer -->
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280; font-size: 12px;">
            <p style="margin: 0;">This is an automated notification from PayADA.</p>
            <p style="margin: 8px 0 0 0;">Visit your dashboard for more details.</p>
          </div>
        </div>
      </div>
    `;

    // Send email
    const emailResult = await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: `✓ Payment confirmed - ₳ ${amountAda}`,
      body: htmlBody
    });

    return Response.json({
      success: true,
      message: 'Payment confirmation email sent',
      paymentId,
      recipient: user.email
    });
  } catch (error) {
    console.error('Error in sendPaymentConfirmationEmail:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}