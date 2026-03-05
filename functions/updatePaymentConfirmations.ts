import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const BLOCKFROST_API_KEY = Deno.env.get("BLOCKFROST_API_KEY");
const BLOCKFROST_URL = "https://cardano-mainnet.blockfrost.io/api/v0";

async function getLatestBlockHeight() {
  const response = await fetch(`${BLOCKFROST_URL}/blocks/latest`, {
    headers: { "project_id": BLOCKFROST_API_KEY }
  });
  if (!response.ok) throw new Error(`Failed to get latest block: ${response.statusText}`);
  const data = await response.json();
  return data.height;
}

async function generateHmacSignature(payload, secret) {
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, data);
  return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function triggerWebhook(sr, payment, merchantId) {
  try {
    const webhooks = await sr.entities.WebhookEndpoint.filter({ merchant_id: merchantId, enabled: true });
    const webhookPromises = webhooks
      .filter(w => w.event_types && w.event_types.includes('payment.confirmed'))
      .map(async (webhook) => {
        const nonce = Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join('');
        const timestamp = Date.now();
        const payload = JSON.stringify({
          event_type: 'payment.confirmed',
          event_id: payment.id,
          timestamp,
          nonce,
          data: {
            payment_id: payment.id,
            tx_hash: payment.tx_hash,
            received_amount_ada: payment.received_amount_ada,
            merchant_amount_ada: payment.merchant_amount_ada,
            fee_amount_ada: payment.fee_amount_ada,
            confirmations: payment.confirmations,
            confirmed_at: payment.confirmed_at
          }
        });
        const signature = await generateHmacSignature(payload, webhook.secret);
        // Both the HTTP call and the DB update are fire-and-forget
        fetch(webhook.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-PayADA-Signature': signature, 'X-PayADA-Timestamp': String(timestamp), 'X-PayADA-Nonce': nonce },
          body: payload
        }).catch(err => console.error(`Webhook delivery failed: ${err.message}`));
        sr.entities.WebhookEndpoint.update(webhook.id, {
          last_triggered_at: new Date().toISOString(),
          delivery_count: (webhook.delivery_count || 0) + 1
        }).catch(err => console.error(`Webhook stat update failed: ${err.message}`));
      });
    // intentionally not awaited — all fire-and-forget
    Promise.all(webhookPromises).catch(() => {});
  } catch (error) {
    console.error(`Error triggering webhooks: ${error.message}`);
  }
}

async function processConfirmations(base44) {
  const sr = base44.asServiceRole;

  const [latestBlock, detectedPayments] = await Promise.all([
    getLatestBlockHeight(),
    sr.entities.Payment.filter({ status: 'detected' })
  ]);

  console.log(`Latest block: ${latestBlock}, detected payments: ${detectedPayments.length}`);

  const toConfirm = [];
  const toUpdateOnly = [];

  for (const payment of detectedPayments) {
    if (!payment.block_height_detected) continue;
    const confirmations = latestBlock - payment.block_height_detected;
    const confirmationsRequired = payment.confirmations_required || 2;
    if (confirmations >= confirmationsRequired) {
      toConfirm.push({ payment, confirmations });
    } else {
      toUpdateOnly.push({ payment, confirmations });
    }
  }

  // Update confirmation counts — batched with a concurrency limit to avoid overloading
  const batchSize = 5;
  for (let i = 0; i < toUpdateOnly.length; i += batchSize) {
    const batch = toUpdateOnly.slice(i, i + batchSize);
    await Promise.all(batch.map(({ payment, confirmations }) =>
      sr.entities.Payment.update(payment.id, { confirmations })
    ));
  }

  // Process confirmations in parallel — only await the Payment update, everything else is fire-and-forget
  await Promise.all(
    toConfirm.map(async ({ payment, confirmations }) => {
      const confirmedAt = new Date().toISOString();
      const updatedPayment = { ...payment, confirmations, confirmed_at: confirmedAt };

      await sr.entities.Payment.update(payment.id, { status: 'confirmed', confirmations, confirmed_at: confirmedAt });

      // Fire-and-forget side effects (do NOT await)
      triggerWebhook(sr, updatedPayment, payment.merchant_id)
        .catch(err => console.error(`Webhook failed: ${err.message}`));

      base44.functions.invoke('logAuditEvent', {
        merchantId: payment.merchant_id,
        eventType: 'payment_confirmed',
        resourceType: 'payment',
        resourceId: payment.id,
        result: 'success',
        changes: { status: 'confirmed', confirmations },
        metadata: { block_height: latestBlock, amount_ada: payment.received_amount_ada }
      }).catch(err => console.error(`Audit log failed: ${err.message}`));

      base44.functions.invoke('sendMerchantNotification', {
        merchantId: payment.merchant_id,
        notificationType: 'payment_confirmed',
        title: '✅ Payment Confirmed',
        message: `Payment of ${(payment.received_amount_ada || 0).toFixed(2)} ADA has been confirmed with ${confirmations} confirmations.`,
        resourceType: 'payment',
        resourceId: payment.id,
        actionUrl: `/payments/${payment.id}`,
        severity: 'info',
        metadata: { confirmations, amount_ada: payment.received_amount_ada }
      }).catch(err => console.error(`Notification failed: ${err.message}`));

      // Discord Gate: grant role if Discord username is present
      if (payment.payer_discord_username) {
        base44.functions.invoke('grantDiscordAccess', { paymentId: payment.id })
          .catch(err => console.error(`Discord grant failed: ${err.message}`));
      }
    })
  );

  return {
    latestBlockHeight: latestBlock,
    confirmedCount: toConfirm.length,
    updatedCount: toUpdateOnly.length,
    totalProcessed: detectedPayments.length
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow both: scheduled automations (no user) and direct admin calls
    const isAuthenticated = await base44.auth.isAuthenticated();
    if (isAuthenticated) {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
      }
    }

    const result = await processConfirmations(base44);
    return Response.json({ success: true, ...result });
  } catch (error) {
    console.error('Confirmation update error:', error.message);
    return Response.json({ error: error.message, type: 'confirmation_update_error' }, { status: 500 });
  }
});