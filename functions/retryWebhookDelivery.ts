import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

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
      attemptNumber,
      maxRetries,
      scheduledFor
    } = await req.json();

    // Check if we should retry now (scheduled time has passed)
    const scheduledTime = new Date(scheduledFor).getTime();
    const now = Date.now();

    if (now < scheduledTime) {
      // Not yet time to retry, reschedule
      return Response.json({
        message: 'Retry scheduled for later',
        scheduledFor,
        waitMs: scheduledTime - now
      });
    }

    // Invoke the main webhook delivery function
    const result = await base44.functions.invoke('triggerWebhookWithRetry', {
      webhookLogId,
      merchantId,
      webhookEndpointId,
      eventType,
      resourceType,
      resourceId,
      payload,
      endpointUrl,
      webhookSecret,
      attemptNumber,
      maxRetries
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({
      error: error.message,
      type: 'webhook_retry_error'
    }, { status: 500 });
  }
});