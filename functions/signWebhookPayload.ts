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

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { eventType, eventId, eventData, webhookSecret, eventTimestamp } = await req.json();

    if (!eventType || !eventId || !webhookSecret || !eventData) {
      return Response.json({
        error: 'Missing required fields: eventType, eventId, eventData, webhookSecret'
      }, { status: 400 });
    }

    // Generate nonce for replay protection
    const nonce = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const timestamp = eventTimestamp || Date.now();

    // Create signed payload
    const payload = JSON.stringify({
      event_type: eventType,
      event_id: eventId,
      timestamp: timestamp,
      nonce: nonce,
      data: eventData
    });

    const signature = await generateHmacSignature(payload, webhookSecret);

    return Response.json({
      success: true,
      payload: JSON.parse(payload),
      signature: signature,
      headers: {
        'X-PayADA-Signature': signature,
        'X-PayADA-Timestamp': timestamp,
        'X-PayADA-Nonce': nonce
      },
      signedPayload: payload
    });

  } catch (error) {
    return Response.json({
      error: error.message,
      type: 'webhook_signing_error'
    }, { status: 500 });
  }
});