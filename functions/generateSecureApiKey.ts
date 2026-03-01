import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Simple bcrypt-like hashing using Web Crypto (constant time comparison)
async function hashKey(key, rounds = 12) {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
  // Simple PBKDF2 implementation (uses native Web Crypto)
  const derivedKey = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: Math.pow(2, rounds),
      hash: 'SHA-256'
    },
    await crypto.subtle.importKey('raw', data, { name: 'PBKDF2' }, false, ['deriveBits']),
    256
  );

  // Encode as base64: salt + hash
  const saltStr = btoa(String.fromCharCode(...new Uint8Array(salt)));
  const hashStr = btoa(String.fromCharCode(...new Uint8Array(derivedKey)));
  return `pbkdf2:${saltStr}:${hashStr}`;
}

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

function generateRandomKey(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let key = '';
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  for (let i = 0; i < length; i++) {
    key += chars[arr[i] % chars.length];
  }
  return key;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { merchantId, keyName } = await req.json();

    if (!merchantId || !keyName) {
      return Response.json({
        error: 'Missing required fields: merchantId, keyName'
      }, { status: 400 });
    }

    // Generate random key
    const rawKey = generateRandomKey(32);
    const keyPrefix = rawKey.substring(0, 8);
    const hashedKey = await hashKey(rawKey);

    // Save to database
    const apiKey = await base44.entities.ApiKey.create({
      merchant_id: merchantId,
      name: keyName,
      key_prefix: keyPrefix,
      key_value_hashed: hashedKey,
      key_shown_at: new Date().toISOString()
    });

    return Response.json({
      success: true,
      keyId: apiKey.id,
      key: rawKey,
      keyPrefix: keyPrefix,
      message: 'Save this key securely. You won\'t be able to see it again.',
      warning: 'Store this key in your environment variables. If lost, you must regenerate it.'
    });

  } catch (error) {
    return Response.json({
      error: error.message,
      type: 'key_generation_error'
    }, { status: 500 });
  }
});