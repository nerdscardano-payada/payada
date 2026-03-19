import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // Support both: entity automation payload AND direct call with paymentId
    const paymentId = body.paymentId || body.event?.entity_id || body.data?.id;

    if (!paymentId) {
      return Response.json({ error: 'Missing paymentId' }, { status: 400 });
    }

    // Use service role since this runs as an automation (no logged-in user)
    const payment = await base44.asServiceRole.entities.Payment.get(paymentId);
    if (!payment) {
      return Response.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Only send email for confirmed payments
    if (payment.status !== 'confirmed') {
      return Response.json({ success: false, message: 'Payment not confirmed yet' });
    }

    // Get the merchant's email (merchant_id = email)
    const merchantEmail = payment.merchant_id;
    if (!merchantEmail) {
      return Response.json({ error: 'No merchant email found' }, { status: 400 });
    }

    // Format payment details
    const isCntPayment = payment.payment_type === 'cnt';
    const merchantAda = Number(payment.merchant_amount_ada || payment.received_amount_ada || payment.expected_amount_ada || 0);
    const feeAdaValue = Number(payment.fee_amount_ada || 0);
    const grossAda = (merchantAda + feeAdaValue).toFixed(2);
    const feeAda = feeAdaValue.toFixed(2);
    const netAda = merchantAda.toFixed(2);
    const cntDecimals = payment.cnt_decimals || 0;
    const cntTicker = payment.cnt_ticker || 'CNT';
    const cntAmount = Number(payment.received_amount_cnt || payment.expected_amount_cnt || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: cntDecimals });
    const cntFee = Number(payment.cnt_fees?.[0]?.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: cntDecimals });
    const cntNet = Number(payment.merchant_amount_cnt || payment.received_amount_cnt || payment.expected_amount_cnt || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: cntDecimals });
    const payerInfo = escapeHtml(payment.payer_name || payment.payer_email || 'Unknown');
    const txHash = payment.tx_hash || 'N/A';
    const blockUrl = `https://cexplorer.io/tx/${txHash}`;

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
        <div style="background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1a202c; margin: 0; font-size: 24px;">✓ Payment Confirmed</h1>
          </div>
          <div style="margin: 30px 0; padding: 20px; background: #f0f7ff; border-left: 4px solid #3b82f6; border-radius: 4px;">
            <p style="color: #374151; margin: 0 0 20px 0;">Hello,</p>
            <p style="color: #374151; margin: 0 0 20px 0;">A payment has been confirmed on your PayADA account!</p>
          </div>
          <div style="margin: 30px 0;">
            <h2 style="color: #1a202c; font-size: 18px; margin: 0 0 20px 0;">Payment Details</h2>
            <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 15px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Payer:</td>
                  <td style="padding: 8px 0; color: #1a202c; font-weight: 600; text-align: right;">${payerInfo}</td>
                </tr>
                ${isCntPayment ? `
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Amount:</td>
                  <td style="padding: 8px 0; color: #1a202c; font-weight: 600; text-align: right;">${cntAmount} ${cntTicker}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Platform Fee:</td>
                  <td style="padding: 8px 0; color: #ef4444; text-align: right;">-${cntFee} ${cntTicker}</td>
                </tr>
                <tr style="border-top: 2px solid #e5e7eb;">
                  <td style="padding: 12px 0; color: #1a202c; font-weight: 700; font-size: 16px;">Merchant Receives:</td>
                  <td style="padding: 12px 0; color: #10b981; font-weight: 700; font-size: 16px; text-align: right;">${cntNet} ${cntTicker}</td>
                </tr>
                ` : `
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Amount:</td>
                  <td style="padding: 8px 0; color: #1a202c; font-weight: 600; text-align: right;">₳ ${grossAda}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Platform Fee:</td>
                  <td style="padding: 8px 0; color: #ef4444; text-align: right;">-₳ ${feeAda}</td>
                </tr>
                <tr style="border-top: 2px solid #e5e7eb;">
                  <td style="padding: 12px 0; color: #1a202c; font-weight: 700; font-size: 16px;">Merchant Receives:</td>
                  <td style="padding: 12px 0; color: #10b981; font-weight: 700; font-size: 16px; text-align: right;">₳ ${netAda}</td>
                </tr>
                `}
              </table>
            </div>
            <div style="margin: 20px 0;">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px 0;">Transaction Hash:</p>
              <p style="color: #3b82f6; font-family: monospace; font-size: 12px; margin: 0; word-break: break-all;">${txHash}</p>
            </div>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${blockUrl}" target="_blank" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">
              View on Cardano Explorer →
            </a>
          </div>
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280; font-size: 12px;">
            <p style="margin: 0;">This is an automated notification from PayADA.</p>
            <p style="margin: 8px 0 0 0;">Visit your dashboard for more details.</p>
          </div>
        </div>
      </div>
    `;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: merchantEmail,
      subject: isCntPayment ? `✓ Payment confirmed - ${cntAmount} ${cntTicker}` : `✓ Payment confirmed - ₳ ${amountAda}`,
      body: htmlBody
    });

    return Response.json({ success: true, message: 'Payment confirmation email sent', paymentId, recipient: merchantEmail });
  } catch (error) {
    console.error('Error in sendPaymentConfirmationEmail:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}