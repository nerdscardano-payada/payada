import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { paymentId, txHash, accessLinkId, confirmed, confirmations } = await req.json();

    if ((!paymentId && !txHash) || !accessLinkId) {
      return Response.json({ error: 'Missing paymentId or txHash, and accessLinkId' }, { status: 400 });
    }

    const sr = base44.asServiceRole;

    let link = null;
    try {
      link = await sr.entities.CommunityAccessLink.get(accessLinkId);
    } catch {
      link = null;
    }

    if (!link) {
      return Response.json({ error: 'Access link not found' }, { status: 404 });
    }

    let payment = null;
    if (paymentId) {
      try {
        payment = await sr.entities.Payment.get(paymentId);
      } catch {
        payment = null;
      }
    }

    if (!payment && txHash) {
      const payments = await sr.entities.Payment.filter({ tx_hash: txHash }, '-created_date', 1);
      payment = payments[0] || null;
    }

    if (!payment && txHash) {
      try {
        const recordRes = await sr.functions.invoke('recordWalletPayment', {
          txHash,
          merchantId: link.merchant_id,
          accessLinkId: link.id,
        });
        const recordedPaymentId = recordRes?.data?.paymentId;
        if (recordedPaymentId) {
          payment = await sr.entities.Payment.get(recordedPaymentId);
        }
      } catch (error) {
        console.error('[grantCommunityAccess] recordWalletPayment failed:', error.message);
      }
    }

    if (!payment) {
      return Response.json({
        success: true,
        status: 'pending_recording',
        platform: link.platform,
        invite_link: link.invite_link,
      });
    }

    if (payment.status !== 'confirmed') {
      if (!confirmed) {
        return Response.json({
          success: true,
          status: 'pending_confirmation',
          paymentId: payment.id,
          platform: link.platform,
        });
      }

      payment = await sr.entities.Payment.update(payment.id, {
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
        confirmations: Math.max(confirmations || 0, payment.confirmations || 0, 2),
      });
    }

    if (link.platform === 'discord' && payment.payer_discord_username) {
      setTimeout(() => {
        sr.functions.invoke('grantDiscordAccess', { paymentId: payment.id })
          .catch((error) => console.error('[grantCommunityAccess] grantDiscordAccess failed:', error.message));
      }, 0);
    }

    if (link.platform !== 'discord') {
      const amountLabel = payment.payment_type === 'cnt'
        ? `${Number(payment.merchant_amount_cnt ?? payment.received_amount_cnt ?? payment.expected_amount_cnt ?? 0).toLocaleString()} ${payment.cnt_ticker || 'CNT'}`
        : `₳ ${Number(payment.received_amount_ada || 0).toFixed(2)}`;

      await sr.entities.Notification.create({
        merchant_id: payment.merchant_id,
        type: 'payment_confirmed',
        title: 'Community access granted',
        message: `${payment.payer_name || payment.payer_email || 'A member'} received access after payment of ${amountLabel}`,
        resource_type: 'payment',
        resource_id: payment.id,
        severity: 'info'
      });
    }

    return Response.json({
      success: true,
      status: 'confirmed',
      paymentId: payment.id,
      platform: link.platform,
      invite_link: link.invite_link,
      access_processing: link.platform === 'discord' && !!payment.payer_discord_username ? 'async' : 'completed',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});