import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

async function generateHmacSignature(payload, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function calculateBackoffDelay(attemptNumber) {
  const delayMs = Math.min(Math.pow(2, attemptNumber) * 1000, 3600000);
  const jitter = delayMs * 0.1 * (Math.random() - 0.5);
  return delayMs + jitter;
}

async function deliverWebhook(log) {
  const payloadString = typeof log.payload === 'string' ? log.payload : JSON.stringify(log.payload);
  const timestamp = Date.now();
  const nonce = Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join('');
  const signature = await generateHmacSignature(payloadString, log.webhook_secret || '');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(log.endpoint_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-PayADA-Signature': signature,
        'X-PayADA-Timestamp': String(timestamp),
        'X-PayADA-Nonce': nonce
      },
      body: payloadString,
      signal: controller.signal
    });
    const body = await response.text();
    return { success: response.ok, statusCode: response.status, body, signature };
  } catch (err) {
    return { success: false, statusCode: null, body: null, error: err.message, signature };
  } finally {
    clearTimeout(timeoutId);
  }
}

Deno.serve(async (req) => {
  try {
    // For scheduled automations there is no user session — always use service role directly
    const base44 = createClientFromRequest(req);
    const sr = base44.asServiceRole;

    // Consume the body to avoid parse errors on empty scheduled invocations
    try { await req.json(); } catch (_) { /* scheduled run has empty body, that's fine */ }

    // Fetch webhook logs due for retry (limit to 20 per run to stay within time limits)
    const now = new Date().toISOString();
    const retryingLogs = await sr.entities.WebhookLog.filter({ status: 'retrying' }, '-next_retry_at', 20);
    const dueLogs = retryingLogs.filter(log => !log.next_retry_at || log.next_retry_at <= now);

    console.log(`[retryWebhookDelivery] Found ${retryingLogs.length} retrying logs, ${dueLogs.length} due now`);

    let delivered = 0, rescheduled = 0, failed = 0;

    for (const log of dueLogs) {
      const attemptNumber = (log.attempt_number || 1);
      const maxRetries = (log.max_retries || 5);

      // Need the webhook secret — fetch the endpoint (with timeout guard)
      let webhookSecret = '';
      if (log.webhook_endpoint_id) {
        const endpoints = await sr.entities.WebhookEndpoint.filter({ id: log.webhook_endpoint_id });
        if (endpoints.length > 0) webhookSecret = endpoints[0].secret || '';
      }

      // Skip logs missing a delivery URL
      if (!log.endpoint_url) {
        await sr.entities.WebhookLog.update(log.id, { status: 'failed', error_message: 'Missing endpoint_url' });
        failed++;
        continue;
      }

      const result = await deliverWebhook({ ...log, webhook_secret: webhookSecret });

      if (result.success) {
        await sr.entities.WebhookLog.update(log.id, {
          status: 'delivered',
          delivered_at: new Date().toISOString(),
          http_status_code: result.statusCode,
          response_body: result.body,
          attempt_number: attemptNumber,
          signature: result.signature,
          error_message: null
        });
        delivered++;
      } else if (attemptNumber < maxRetries) {
        const delayMs = calculateBackoffDelay(attemptNumber);
        const nextRetryAt = new Date(Date.now() + delayMs).toISOString();
        await sr.entities.WebhookLog.update(log.id, {
          status: 'retrying',
          attempt_number: attemptNumber + 1,
          next_retry_at: nextRetryAt,
          http_status_code: result.statusCode,
          response_body: result.body,
          error_message: result.error || `HTTP ${result.statusCode}`
        });
        rescheduled++;
      } else {
        await sr.entities.WebhookLog.update(log.id, {
          status: 'failed',
          attempt_number: attemptNumber,
          http_status_code: result.statusCode,
          response_body: result.body,
          error_message: `Failed after ${maxRetries} attempts. Last error: ${result.error || `HTTP ${result.statusCode}`}`
        });
        failed++;

        // Update endpoint failure stats
        if (log.webhook_endpoint_id) {
          const endpoints = await sr.entities.WebhookEndpoint.filter({ id: log.webhook_endpoint_id });
          if (endpoints.length > 0) {
            const ep = endpoints[0];
            sr.entities.WebhookEndpoint.update(ep.id, {
              failure_count: (ep.failure_count || 0) + 1,
              last_error_message: `Failed after ${maxRetries} attempts`
            }).catch(() => {});
          }
        }
      }
    }

    console.log(`[retryWebhookDelivery] delivered=${delivered} rescheduled=${rescheduled} failed=${failed}`);
    return Response.json({ success: true, processed: dueLogs.length, delivered, rescheduled, failed });
  } catch (error) {
    console.error('[retryWebhookDelivery] Error:', error.message);
    return Response.json({ error: error.message, type: 'webhook_retry_error' }, { status: 500 });
  }
});