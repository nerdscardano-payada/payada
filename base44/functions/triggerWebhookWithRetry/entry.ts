import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

async function generateHmacSignature(payload, secret) {
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  const keyData = encoder.encode(secret);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, data);
  const signatureArray = Array.from(new Uint8Array(signature));
  return signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function calculateBackoffDelay(attemptNumber) {
  // Exponential backoff: 2^attempt * 1000ms, capped at 1 hour
  const delayMs = Math.min(Math.pow(2, attemptNumber) * 1000, 3600000);
  // Add jitter (±10%)
  const jitter = delayMs * 0.1 * (Math.random() - 0.5);
  return delayMs + jitter;
}

async function sendWebhookRequest(url, payload, signature, timestamp, nonce) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-PayADA-Signature': signature,
        'X-PayADA-Timestamp': String(timestamp),
        'X-PayADA-Nonce': nonce
      },
      body: payload,
      signal: controller.signal
    });

    const responseBody = await response.text();
    return {
      success: response.ok,
      statusCode: response.status,
      body: responseBody
    };
  } catch (error) {
    return {
      success: false,
      statusCode: null,
      body: null,
      error: error.message
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const {
      webhookLogId,
      merchantId,
      webhookEndpointId,
      eventType,
      resourceType,
      resourceId,
      payload,
      endpointUrl,
      webhookSecret,
      attemptNumber = 1,
      maxRetries = 5
    } = await req.json();

    // Validate required fields
    if (!webhookLogId || !merchantId || !endpointUrl) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate signature
    const payloadString = JSON.stringify(payload);
    const timestamp = Date.now();
    const nonce = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const signature = await generateHmacSignature(payloadString, webhookSecret);

    // Attempt delivery
    const result = await sendWebhookRequest(
      endpointUrl,
      payloadString,
      signature,
      timestamp,
      nonce
    );

    // Update webhook log
    const logUpdate = {
      attempt_number: attemptNumber,
      http_status_code: result.statusCode,
      response_body: result.body,
      signature: signature
    };

    if (result.success) {
      logUpdate.status = 'delivered';
      logUpdate.delivered_at = new Date().toISOString();
      logUpdate.error_message = null;

      // Update webhook endpoint stats
      await base44.entities.WebhookEndpoint.update(webhookEndpointId, {
        last_triggered_at: new Date().toISOString(),
        delivery_count: (webhook?.delivery_count || 0) + 1,
        failure_count: webhook?.failure_count || 0
      });
    } else {
      if (attemptNumber < maxRetries) {
        // Schedule retry with exponential backoff
        const delayMs = calculateBackoffDelay(attemptNumber);
        const nextRetryAt = new Date(Date.now() + delayMs);

        logUpdate.status = 'retrying';
        logUpdate.next_retry_at = nextRetryAt.toISOString();
        logUpdate.error_message = result.error;

        // Schedule the retry function
        await base44.functions.invoke('retryWebhookDelivery', {
          webhookLogId,
          merchantId,
          webhookEndpointId,
          eventType,
          resourceType,
          resourceId,
          payload,
          endpointUrl,
          webhookSecret,
          attemptNumber: attemptNumber + 1,
          maxRetries,
          scheduledFor: nextRetryAt.toISOString()
        });
      } else {
        // Max retries exceeded
        logUpdate.status = 'failed';
        logUpdate.error_message = `Failed after ${maxRetries} attempts. Last error: ${result.error}`;

        // Update webhook endpoint stats
        const webhook = await base44.entities.WebhookEndpoint.filter({
          id: webhookEndpointId,
          merchant_id: merchantId
        });

        if (webhook.length > 0) {
          await base44.entities.WebhookEndpoint.update(webhookEndpointId, {
            last_triggered_at: new Date().toISOString(),
            failure_count: (webhook[0].failure_count || 0) + 1,
            last_error_message: logUpdate.error_message,
            retry_count: maxRetries
          });
        }

        // Send admin alert for critical failure
        await base44.functions.invoke('sendAdminAlert', {
          title: 'Webhook Delivery Failed',
          message: `Webhook for ${eventType} (${resourceType}:${resourceId}) failed after ${maxRetries} retries to ${endpointUrl}`,
          severity: 'critical',
          resourceType: 'webhook',
          resourceId: webhookEndpointId
        });
      }
    }

    // Update the log
    await base44.entities.WebhookLog.update(webhookLogId, logUpdate);

    return Response.json({
      success: result.success,
      attempt: attemptNumber,
      maxRetries,
      nextRetryScheduled: logUpdate.next_retry_at || null,
      statusCode: result.statusCode
    });
  } catch (error) {
    return Response.json({
      error: error.message,
      type: 'webhook_delivery_error'
    }, { status: 500 });
  }
});