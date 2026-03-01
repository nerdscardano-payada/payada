import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const BLOCKFROST_API_KEY = Deno.env.get("BLOCKFROST_API_KEY");
const BLOCKFROST_URL = "https://cardano-mainnet.blockfrost.io/api/v0";

async function getLatestBlockHeight() {
  const response = await fetch(`${BLOCKFROST_URL}/blocks/latest`, {
    headers: { "project_id": BLOCKFROST_API_KEY }
  });

  if (!response.ok) {
    throw new Error(`Failed to get latest block: ${response.statusText}`);
  }

  const data = await response.json();
  return data.height;
}

async function triggerWebhook(base44, payment, merchantId) {
  try {
    const webhooks = await base44.entities.WebhookEndpoint.filter({
      merchant_id: merchantId,
      enabled: true
    });

    for (const webhook of webhooks) {
      if (webhook.event_types && webhook.event_types.includes('payment.confirmed')) {
        const payload = {
          event: 'payment.confirmed',
          data: {
            payment_id: payment.id,
            tx_hash: payment.tx_hash,
            amount_ada: payment.received_amount_ada,
            merchant_amount_ada: payment.merchant_amount_ada,
            fee_amount_ada: payment.fee_amount_ada,
            confirmations: payment.confirmations,
            confirmed_at: payment.confirmed_at
          },
          timestamp: Date.now()
        };

        // Send webhook asynchronously (fire and forget)
        fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-payada-event': 'payment.confirmed',
            'x-payada-timestamp': String(payload.timestamp)
          },
          body: JSON.stringify(payload)
        }).catch(err => console.error(`Webhook delivery failed: ${err.message}`));

        // Update webhook stats
        await base44.entities.WebhookEndpoint.update(webhook.id, {
          last_triggered_at: new Date().toISOString(),
          delivery_count: (webhook.delivery_count || 0) + 1
        });
      }
    }
  } catch (error) {
    console.error(`Error triggering webhooks: ${error.message}`);
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Admin-only operation
    if (!user || user.role !== 'admin') {
      return Response.json({
        error: 'Forbidden: Admin access required'
      }, { status: 403 });
    }

    // Get latest block height
    const latestBlock = await getLatestBlockHeight();

    // Find all payments in 'detected' status
    const detectedPayments = await base44.entities.Payment.filter({
      status: 'detected'
    });

    let confirmedCount = 0;
    let updatedCount = 0;

    for (const payment of detectedPayments) {
      if (!payment.block_height_detected) {
        continue;
      }

      // Calculate confirmations
      const confirmations = latestBlock - payment.block_height_detected;
      const confirmationsRequired = payment.confirmations_required || 2;

      if (confirmations >= confirmationsRequired) {
        // Mark as confirmed
        const confirmedAt = new Date().toISOString();
        await base44.entities.Payment.update(payment.id, {
          status: 'confirmed',
          confirmations: confirmations,
          confirmed_at: confirmedAt
        });

        // Trigger webhook
        await triggerWebhook(base44, {
          ...payment,
          confirmations,
          confirmed_at: confirmedAt
        }, payment.merchant_id);

        confirmedCount++;
      } else {
        // Just update confirmation count
        await base44.entities.Payment.update(payment.id, {
          confirmations: confirmations
        });
        updatedCount++;
      }
    }

    return Response.json({
      success: true,
      latestBlockHeight: latestBlock,
      confirmedCount,
      updatedCount,
      totalProcessed: detectedPayments.length
    });

  } catch (error) {
    return Response.json({
      error: error.message,
      type: 'confirmation_update_error'
    }, { status: 500 });
  }
});