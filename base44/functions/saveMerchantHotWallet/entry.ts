import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

function bytesToBase64(bytes) {
  return btoa(String.fromCharCode(...bytes));
}

async function getEncryptionKey(secret) {
  const secretBytes = new TextEncoder().encode(secret);
  const hashed = await crypto.subtle.digest('SHA-256', secretBytes);
  return crypto.subtle.importKey('raw', hashed, 'AES-GCM', false, ['encrypt']);
}

async function encryptMnemonic(mnemonic, secret) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await getEncryptionKey(secret);
  const encoded = new TextEncoder().encode(mnemonic);
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);

  return {
    encrypted_seed: bytesToBase64(new Uint8Array(encrypted)),
    encryption_iv: bytesToBase64(iv),
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const encryptionSecret = Deno.env.get('NFT_WALLET_ENCRYPTION_KEY');
    if (!encryptionSecret) {
      return Response.json({ error: 'Missing NFT_WALLET_ENCRYPTION_KEY secret' }, { status: 500 });
    }

    const { wallet_address, mnemonic, wallet_name } = await req.json();

    if (!wallet_address || !mnemonic) {
      return Response.json({ error: 'wallet_address and mnemonic are required' }, { status: 400 });
    }

    const encryptedWallet = await encryptMnemonic(String(mnemonic).trim(), encryptionSecret);
    const existing = await base44.asServiceRole.entities.MerchantHotWallet.filter({ merchant_id: user.email }, '-updated_date', 1);

    let record;
    if (existing.length > 0) {
      record = await base44.asServiceRole.entities.MerchantHotWallet.update(existing[0].id, {
        wallet_name: wallet_name || existing[0].wallet_name || 'Primary NFT Wallet',
        wallet_address,
        encrypted_seed: encryptedWallet.encrypted_seed,
        encryption_iv: encryptedWallet.encryption_iv,
        encryption_version: 'v1',
        status: 'active',
      });
    } else {
      record = await base44.asServiceRole.entities.MerchantHotWallet.create({
        merchant_id: user.email,
        wallet_name: wallet_name || 'Primary NFT Wallet',
        wallet_address,
        encrypted_seed: encryptedWallet.encrypted_seed,
        encryption_iv: encryptedWallet.encryption_iv,
        encryption_version: 'v1',
        status: 'active',
      });
    }

    return Response.json({
      success: true,
      wallet_id: record.id,
      wallet_address: record.wallet_address,
      merchant_id: user.email,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});