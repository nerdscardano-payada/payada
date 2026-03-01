import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

async function verifyKey(rawKey, hashedKey) {
  const parts = hashedKey.split(':');
  if (parts.length !== 3) return false;

  const [, saltStr, hashStr] = parts;
  const salt = new Uint8Array(atob(saltStr).split('').map(c => c.charCodeAt(0)));
  const storedHash = atob(hashStr);

  const encoder = new TextEncoder();
  const data = encoder.encode(rawKey);
  const derivedKey = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: Math.pow(2, 12),
      hash: 'SHA-256'
    },
    await crypto.subtle.importKey('raw', data, { name: 'PBKDF2' }, false, ['deriveBits']),
    256
  );

  const computedHash = btoa(String.fromCharCode(...new Uint8Array(derivedKey)));
  return computedHash === hashStr;
}

Deno.serve(async (req) => {
  try {
    // Extract API key from Authorization header
    const authHeader = req.headers.get('Authorization') || '';
    const match = authHeader.match(/^Bearer\s+(.+)$/);

    if (!match) {
      return Response.json({
        error: 'Missing or invalid Authorization header',
        code: 'INVALID_AUTH_HEADER'
      }, { status: 401 });
    }

    const providedKey = match[1];
    const keyPrefix = providedKey.substring(0, 8);

    const base44 = createClientFromRequest(req);

    // Find API key by prefix
    const apiKeys = await base44.entities.ApiKey.filter({
      key_prefix: keyPrefix
    });

    if (apiKeys.length === 0) {
      return Response.json({
        error: 'Invalid API key',
        code: 'KEY_NOT_FOUND'
      }, { status: 401 });
    }

    const apiKey = apiKeys[0];

    if (apiKey.revoked) {
      return Response.json({
        error: 'API key has been revoked',
        code: 'KEY_REVOKED'
      }, { status: 401 });
    }

    // Verify hashed key
    const isValid = await verifyKey(providedKey, apiKey.key_value_hashed);

    if (!isValid) {
      return Response.json({
        error: 'Invalid API key',
        code: 'KEY_INVALID'
      }, { status: 401 });
    }

    // Update last used timestamp
    await base44.entities.ApiKey.update(apiKey.id, {
      last_used_at: new Date().toISOString()
    });

    return Response.json({
      success: true,
      merchantId: apiKey.merchant_id,
      keyId: apiKey.id,
      keyName: apiKey.name
    });

  } catch (error) {
    return Response.json({
      error: error.message,
      type: 'key_validation_error'
    }, { status: 500 });
  }
});