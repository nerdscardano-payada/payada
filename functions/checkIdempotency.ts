import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

async function computeHash(data) {
  const jsonString = JSON.stringify(data);
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(jsonString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const body = await req.json();
    const { 
      merchantId, 
      idempotencyKey, 
      endpoint, 
      method, 
      requestBody,
      responsePayload,
      responseStatus,
      errorMessage,
      isRetry = false
    } = body;

    if (!merchantId || !idempotencyKey || !endpoint || !method || !requestBody) {
      return Response.json({ 
        error: 'Missing required fields: merchantId, idempotencyKey, endpoint, method, requestBody' 
      }, { status: 400 });
    }

    const requestHash = await computeHash(requestBody);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // Check for existing idempotency key
    const existingKey = await base44.asServiceRole.entities.IdempotencyKey.filter({
      merchant_id: merchantId,
      idempotency_key: idempotencyKey,
      endpoint: endpoint
    });

    if (existingKey && existingKey.length > 0) {
      const key = existingKey[0];
      
      // If the request body hash doesn't match, it's a different request with same key
      if (key.request_hash !== requestHash) {
        return Response.json({ 
          error: 'Idempotency key reused with different request body',
          conflict: true
        }, { status: 409 });
      }

      // If still pending, return in-progress status
      if (key.status === 'pending') {
        return Response.json({
          status: 'pending',
          message: 'Request is still being processed',
          idempotency_id: key.id
        }, { status: 202 });
      }

      // Return cached response
      if (key.status === 'success') {
        return Response.json({
          status: 'success',
          cached: true,
          response: key.response_payload,
          idempotency_id: key.id,
          message: 'Response retrieved from cache'
        }, { status: key.response_status || 200 });
      }

      // Return cached error
      if (key.status === 'failed') {
        return Response.json({
          status: 'failed',
          cached: true,
          error: key.error_message,
          idempotency_id: key.id
        }, { status: key.response_status || 400 });
      }
    }

    // New idempotency key - create entry
    if (!isRetry) {
      const newKey = await base44.asServiceRole.entities.IdempotencyKey.create({
        merchant_id: merchantId,
        idempotency_key: idempotencyKey,
        endpoint: endpoint,
        method: method,
        request_hash: requestHash,
        request_body: requestBody,
        status: 'pending',
        expires_at: expiresAt
      });

      return Response.json({
        status: 'new',
        message: 'New idempotency key created',
        idempotency_id: newKey.id,
        proceed: true
      }, { status: 201 });
    }

    // Update existing key with response
    if (existingKey && existingKey.length > 0) {
      const keyId = existingKey[0].id;
      const newStatus = responsePayload ? 'success' : 'failed';

      await base44.asServiceRole.entities.IdempotencyKey.update(keyId, {
        status: newStatus,
        response_payload: responsePayload || null,
        response_status: responseStatus || 200,
        error_message: errorMessage || null
      });

      return Response.json({
        status: 'updated',
        message: 'Idempotency key updated with response',
        idempotency_id: keyId
      }, { status: 200 });
    }

    return Response.json({ error: 'Unexpected error' }, { status: 500 });
  } catch (error) {
    console.error('Idempotency check error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});