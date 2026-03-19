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
    const signature = req.headers.get('X-PayADA-Signature') || '';
    const timestamp = req.headers.get('X-PayADA-Timestamp') || '';
    const nonce = req.headers.get('X-PayADA-Nonce') || '';

    if (!signature || !timestamp || !nonce) {
      return Response.json({
        error: 'Missing webhook security headers',
        code: 'MISSING_HEADERS'
      }, { status: 401 });
    }

    const { webhookSecret, replayProtectionWindow = 300000 } = await req.json();

    if (!webhookSecret) {
      return Response.json({
        error: 'Missing webhook secret',
        code: 'MISSING_SECRET'
      }, { status: 400 });
    }

    // Verify timestamp is within acceptable window (default 5 minutes)
    const now = Date.now();
    const receivedTime = parseInt(timestamp);
    const timeDiff = Math.abs(now - receivedTime);

    if (timeDiff > replayProtectionWindow) {
      return Response.json({
        error: 'Webhook timestamp outside acceptable window (possible replay attack)',
        code: 'REPLAY_ATTACK_DETECTED',
        timeDiffMs: timeDiff,
        windowMs: replayProtectionWindow
      }, { status: 401 });
    }

    // Reconstruct payload from request body for signature verification
    const rawBody = await req.text();
    const computedSignature = await generateHmacSignature(rawBody, webhookSecret);

    // Constant-time comparison to prevent timing attacks
    const providedBytes = new TextEncoder().encode(signature);
    const computedBytes = new TextEncoder().encode(computedSignature);

    let isValid = providedBytes.length === computedBytes.length;
    for (let i = 0; i < providedBytes.length; i++) {
      if (providedBytes[i] !== computedBytes[i]) {
        isValid = false;
      }
    }

    if (!isValid) {
      return Response.json({
        error: 'Invalid webhook signature',
        code: 'INVALID_SIGNATURE'
      }, { status: 401 });
    }

    return Response.json({
      success: true,
      verified: true,
      message: 'Webhook signature is valid',
      payload: JSON.parse(rawBody),
      verifiedAt: new Date().toISOString()
    });

  } catch (error) {
    return Response.json({
      error: error.message,
      type: 'webhook_verification_error'
    }, { status: 500 });
  }
});