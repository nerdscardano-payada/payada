import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';
import * as CSL from 'npm:@emurgo/cardano-serialization-lib-nodejs@11.5.0';
import bip39 from 'npm:bip39@3.1.0';

function bytesToBase64(bytes) {
  return btoa(String.fromCharCode(...bytes));
}

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  return bytes;
}

function harden(index) {
  return 0x80000000 + index;
}

function getNetworkId(address) {
  return String(address).startsWith('addr_test') ? 0 : 1;
}

function deriveAddressFromMnemonic(mnemonic, networkId) {
  const entropy = hexToBytes(bip39.mnemonicToEntropy(mnemonic));
  const rootKey = CSL.Bip32PrivateKey.from_bip39_entropy(entropy, new Uint8Array());
  const accountKey = rootKey.derive(harden(1852)).derive(harden(1815)).derive(harden(0));
  const paymentKey = accountKey.derive(0).derive(0).to_raw_key();
  const stakeKey = accountKey.derive(2).derive(0).to_raw_key();

  return CSL.BaseAddress.new(
    networkId,
    CSL.StakeCredential.from_keyhash(paymentKey.to_public().hash()),
    CSL.StakeCredential.from_keyhash(stakeKey.to_public().hash())
  ).to_address().to_bech32();
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
    const normalizedAddress = String(wallet_address || '').trim();
    const normalizedMnemonic = String(mnemonic || '').trim().toLowerCase().replace(/\s+/g, ' ');

    if (!normalizedAddress) {
      return Response.json({ error: 'wallet_address is required' }, { status: 400 });
    }

    const existing = await base44.asServiceRole.entities.MerchantHotWallet.filter({ merchant_id: user.email }, '-updated_date', 1);
    const currentWallet = existing[0] || null;
    const shouldUpdateMnemonic = Boolean(normalizedMnemonic);

    if (!shouldUpdateMnemonic && !currentWallet) {
      return Response.json({ error: 'mnemonic is required for the first wallet setup' }, { status: 400 });
    }

    if (!shouldUpdateMnemonic && currentWallet && normalizedAddress !== currentWallet.wallet_address) {
      return Response.json({ error: 'To change the wallet address, provide the matching recovery phrase as well.' }, { status: 400 });
    }

    if (shouldUpdateMnemonic) {
      if (!bip39.validateMnemonic(normalizedMnemonic, bip39.wordlists.english)) {
        return Response.json({ error: 'The recovery phrase is not a valid Cardano/BIP39 phrase.' }, { status: 400 });
      }

      const derivedAddress = deriveAddressFromMnemonic(normalizedMnemonic, getNetworkId(normalizedAddress));
      if (derivedAddress !== normalizedAddress) {
        return Response.json({ error: 'The wallet address does not match the entered recovery phrase.' }, { status: 400 });
      }
    }

    const encryptedWallet = shouldUpdateMnemonic ? await encryptMnemonic(normalizedMnemonic, encryptionSecret) : null;

    let record;
    if (currentWallet) {
      record = await base44.asServiceRole.entities.MerchantHotWallet.update(currentWallet.id, {
        wallet_name: wallet_name || currentWallet.wallet_name || 'Primary NFT Wallet',
        wallet_address: normalizedAddress,
        encrypted_seed: encryptedWallet?.encrypted_seed || currentWallet.encrypted_seed,
        encryption_iv: encryptedWallet?.encryption_iv || currentWallet.encryption_iv,
        encryption_version: 'v1',
        status: 'active',
      });
    } else {
      record = await base44.asServiceRole.entities.MerchantHotWallet.create({
        merchant_id: user.email,
        wallet_name: wallet_name || 'Primary NFT Wallet',
        wallet_address: normalizedAddress,
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