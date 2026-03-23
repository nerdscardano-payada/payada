import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';
import * as CSL from 'npm:@emurgo/cardano-serialization-lib-nodejs@11.5.0';
import { mnemonicToEntropySync } from 'npm:bip39@3.1.0';

const BLOCKFROST_API_KEY = Deno.env.get('BLOCKFROST_API_KEY');
const BLOCKFROST_URL = 'https://cardano-mainnet.blockfrost.io/api/v0';
const MIN_TOKEN_OUTPUT_LOVELACE = 1_500_000n;
const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

function hexToBytes(hex) {
  const result = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) result[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  return result;
}

function bytesToHex(bytes) {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function base64ToBytes(value) {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

function harden(index) {
  return 0x80000000 + index;
}

function getNetworkId(address) {
  return String(address).startsWith('addr_test') ? 0 : 1;
}

async function blockfrost(path, options = {}) {
  const response = await fetch(`${BLOCKFROST_URL}${path}`, {
    ...options,
    headers: {
      project_id: BLOCKFROST_API_KEY,
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Blockfrost ${response.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

async function getEncryptionKey(secret, usages) {
  const secretBytes = new TextEncoder().encode(secret);
  const hashed = await crypto.subtle.digest('SHA-256', secretBytes);
  return crypto.subtle.importKey('raw', hashed, 'AES-GCM', false, usages);
}

async function decryptMnemonic(encryptedSeed, iv, secret) {
  const key = await getEncryptionKey(secret, ['decrypt']);
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: base64ToBytes(iv) }, key, base64ToBytes(encryptedSeed));
  return new TextDecoder().decode(decrypted).trim();
}

function derivePaymentKeyFromMnemonic(mnemonic, networkId) {
  const entropy = hexToBytes(mnemonicToEntropySync(mnemonic));
  const rootKey = CSL.Bip32PrivateKey.from_bip39_entropy(entropy, new Uint8Array());
  const accountKey = rootKey.derive(harden(1852)).derive(harden(1815)).derive(harden(0));
  const paymentKey = accountKey.derive(0).derive(0).to_raw_key();
  const stakeKey = accountKey.derive(2).derive(0).to_raw_key();
  const address = CSL.BaseAddress.new(
    networkId,
    CSL.StakeCredential.from_keyhash(paymentKey.to_public().hash()),
    CSL.StakeCredential.from_keyhash(stakeKey.to_public().hash())
  ).to_address().to_bech32();

  return { paymentKey, address };
}

function encodeCborUint(n) {
  const bn = BigInt(n);
  if (bn <= 23n) return [Number(bn)];
  if (bn <= 0xffn) return [0x18, Number(bn)];
  if (bn <= 0xffffn) return [0x19, Number(bn >> 8n), Number(bn & 0xffn)];
  if (bn <= 0xffffffffn) return [0x1a, Number(bn >> 24n), Number((bn >> 16n) & 0xffn), Number((bn >> 8n) & 0xffn), Number(bn & 0xffn)];
  return [0x1b, Number(bn >> 56n), Number((bn >> 48n) & 0xffn), Number((bn >> 40n) & 0xffn), Number((bn >> 32n) & 0xffn), Number((bn >> 24n) & 0xffn), Number((bn >> 16n) & 0xffn), Number((bn >> 8n) & 0xffn), Number(bn & 0xffn)];
}

function encodeCborBytes(bytes) {
  const arr = Array.isArray(bytes) ? bytes : Array.from(bytes);
  const len = arr.length;
  if (len <= 23) return [0x40 + len, ...arr];
  if (len <= 0xff) return [0x58, len, ...arr];
  return [0x59, len >> 8, len & 0xff, ...arr];
}

function encodeCborArrayHeader(len) {
  if (len <= 23) return [0x80 + len];
  return [0x98, len];
}

function encodeCborMapHeader(len) {
  if (len <= 23) return [0xa0 + len];
  return [0xb8, len];
}

function encodeTxOutValue(lovelace, assets) {
  if (!assets || assets.size === 0) return encodeCborUint(lovelace);
  const result = [0x82, ...encodeCborUint(lovelace)];
  const sortedPolicies = Array.from(assets.keys()).sort();
  result.push(...encodeCborMapHeader(sortedPolicies.length));
  for (const policyId of sortedPolicies) {
    const assetMap = assets.get(policyId);
    result.push(...encodeCborBytes(hexToBytes(policyId)));
    const sortedAssetNames = Array.from(assetMap.keys()).sort();
    result.push(...encodeCborMapHeader(sortedAssetNames.length));
    for (const assetName of sortedAssetNames) {
      result.push(...encodeCborBytes(assetName ? hexToBytes(assetName) : []));
      result.push(...encodeCborUint(assetMap.get(assetName)));
    }
  }
  return result;
}

function encodeTxOut(addrBytes, lovelace, assets) {
  return [0x82, ...encodeCborBytes(Array.from(addrBytes)), ...encodeTxOutValue(lovelace, assets)];
}

function bech32Decode(bechStr) {
  const lower = bechStr.toLowerCase();
  const pos = lower.lastIndexOf('1');
  if (pos < 1 || pos + 7 > lower.length) return null;
  const data = [];
  for (let i = pos + 1; i < lower.length; i++) {
    const d = CHARSET.indexOf(lower[i]);
    if (d < 0) return null;
    data.push(d);
  }
  const decoded = [];
  let value = 0;
  let bits = 0;
  for (let i = 0; i < data.length - 6; i++) {
    value = (value << 5) | data[i];
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      decoded.push((value >> bits) & 0xff);
    }
  }
  return { bytes: new Uint8Array(decoded) };
}

function getAddrBytes(addr) {
  if (addr.startsWith('addr') || addr.startsWith('stake')) return bech32Decode(addr)?.bytes;
  return hexToBytes(addr);
}

function estimateFee(numInputs, numOutputs) {
  const txSize = 320 + 110 * numInputs + 200 * numOutputs;
  return 155381n + 44n * BigInt(txSize) + 400000n;
}

async function buildUnsignedTransferTx(log, senderAddress) {
  const [utxos, latestBlock] = await Promise.all([
    blockfrost(`/addresses/${senderAddress}/utxos?count=100&order=desc`),
    blockfrost('/blocks/latest'),
  ]);

  if (!utxos?.length) throw new Error('No UTxOs found in hot wallet');

  const assetUnit = `${log.policy_id}${log.asset_name_hex}`;
  const tokenUtxos = utxos.filter((utxo) => utxo.amount.some((amount) => amount.unit === assetUnit));
  const adaUtxos = utxos.filter((utxo) => utxo.amount.length === 1 && utxo.amount[0].unit === 'lovelace');
  if (!tokenUtxos.length) throw new Error('Required NFT asset not found in hot wallet');

  let selectedQuantity = 0n;
  let selectedLovelace = 0n;
  const selectedUtxos = [];
  const quantityNeeded = BigInt(log.quantity || 1);

  for (const utxo of tokenUtxos) {
    selectedUtxos.push(utxo);
    for (const amount of utxo.amount) {
      if (amount.unit === 'lovelace') selectedLovelace += BigInt(amount.quantity);
      if (amount.unit === assetUnit) selectedQuantity += BigInt(amount.quantity);
    }
    if (selectedQuantity >= quantityNeeded) break;
  }

  if (selectedQuantity < quantityNeeded) throw new Error('Insufficient NFT quantity in hot wallet');

  const txFee = estimateFee(selectedUtxos.length + 2, 2);
  const adaNeeded = MIN_TOKEN_OUTPUT_LOVELACE + txFee + 1_500_000n;

  if (selectedLovelace < adaNeeded) {
    for (const utxo of adaUtxos) {
      if (selectedLovelace >= adaNeeded) break;
      if (selectedUtxos.some((item) => item.tx_hash === utxo.tx_hash && item.tx_index === utxo.tx_index)) continue;
      selectedUtxos.push(utxo);
      selectedLovelace += BigInt(utxo.amount[0].quantity);
    }
  }

  if (selectedLovelace < adaNeeded) throw new Error('Insufficient ADA in hot wallet for fee and output');

  const tokenChange = selectedQuantity - quantityNeeded;
  const adaChange = selectedLovelace - MIN_TOKEN_OUTPUT_LOVELACE - txFee;
  const recipientAddrBytes = getAddrBytes(log.recipient_address);
  const senderAddrBytes = getAddrBytes(senderAddress);
  if (!recipientAddrBytes) throw new Error('Invalid recipient address');

  const outputsData = [];
  const transferAssets = new Map([[log.policy_id, new Map([[log.asset_name_hex || '', quantityNeeded]])]]);
  outputsData.push({ addrBytes: recipientAddrBytes, lovelace: MIN_TOKEN_OUTPUT_LOVELACE, assets: transferAssets });
  const changeAssets = tokenChange > 0n ? new Map([[log.policy_id, new Map([[log.asset_name_hex || '', tokenChange]])]]) : new Map();
  outputsData.push({ addrBytes: senderAddrBytes, lovelace: adaChange, assets: changeAssets });

  const inputs = selectedUtxos.map((utxo) => [hexToBytes(utxo.tx_hash), utxo.tx_index]);
  const sortedInputs = [...inputs].sort((a, b) => {
    const hexA = bytesToHex(a[0]) + String(a[1]).padStart(8, '0');
    const hexB = bytesToHex(b[0]) + String(b[1]).padStart(8, '0');
    return hexA < hexB ? -1 : 1;
  });

  const cborBytes = [];
  cborBytes.push(...encodeCborMapHeader(4));
  cborBytes.push(...encodeCborUint(0));
  cborBytes.push(...encodeCborArrayHeader(sortedInputs.length));
  for (const [txHashBytes, txIndex] of sortedInputs) {
    cborBytes.push(0x82, ...encodeCborBytes(Array.from(txHashBytes)), ...encodeCborUint(txIndex));
  }
  cborBytes.push(...encodeCborUint(1), ...encodeCborArrayHeader(outputsData.length));
  for (const output of outputsData) cborBytes.push(...encodeTxOut(output.addrBytes, output.lovelace, output.assets));
  cborBytes.push(...encodeCborUint(2), ...encodeCborUint(txFee));
  cborBytes.push(...encodeCborUint(3), ...encodeCborUint(BigInt(latestBlock.slot) + 3600n));

  return bytesToHex(new Uint8Array([0x84, ...cborBytes, 0xa0, 0xf5, 0xf6]));
}

async function autoSubmitTransfer(sr, log, hotWallet, encryptionSecret) {
  const mnemonic = await decryptMnemonic(hotWallet.encrypted_seed, hotWallet.encryption_iv, encryptionSecret);
  const networkId = getNetworkId(hotWallet.wallet_address);
  const { paymentKey, address } = derivePaymentKeyFromMnemonic(mnemonic, networkId);

  if (address !== hotWallet.wallet_address) {
    throw new Error('Stored hot wallet phrase does not match the configured wallet address');
  }

  const txCbor = await buildUnsignedTransferTx(log, hotWallet.wallet_address);
  const unsignedTx = CSL.Transaction.from_bytes(hexToBytes(txCbor));
  const txHash = CSL.hash_transaction(unsignedTx.body());
  const witnesses = CSL.Vkeywitnesses.new();
  witnesses.add(CSL.make_vkey_witness(txHash, paymentKey));
  const witnessSet = CSL.TransactionWitnessSet.new();
  witnessSet.set_vkeys(witnesses);
  const signedTx = CSL.Transaction.new(unsignedTx.body(), witnessSet, unsignedTx.auxiliary_data());

  const submitResponse = await fetch(`${BLOCKFROST_URL}/tx/submit`, {
    method: 'POST',
    headers: {
      project_id: BLOCKFROST_API_KEY,
      'Content-Type': 'application/cbor',
    },
    body: signedTx.to_bytes(),
  });

  const submitText = await submitResponse.text();
  if (!submitResponse.ok) throw new Error(`Blockfrost submit failed: ${submitText}`);

  const submittedHash = submitText.replace(/"/g, '').trim();
  const now = new Date().toISOString();

  await sr.entities.NftTransferLog.update(log.id, {
    status: 'submitted',
    merchant_hot_wallet_id: hotWallet.id,
    tx_hash: submittedHash,
    submitted_at: now,
    error_message: null,
  });

  await sr.entities.MerchantHotWallet.update(hotWallet.id, { last_used_at: now });

  return { status: 'submitted', tx_hash: submittedHash };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const isAuthenticated = await base44.auth.isAuthenticated();

    if (isAuthenticated) {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
      }
    }

    const body = await req.json();
    const sr = base44.asServiceRole;
    const event = body?.event;
    const oldData = body?.old_data;
    let payment = body?.data;

    if ((!payment || !payment.id) && body?.payload_too_large && event?.entity_id) {
      const payments = await sr.entities.Payment.filter({ id: event.entity_id }, '-created_date', 1);
      payment = payments[0];
    }

    if (!payment?.id) {
      return Response.json({ success: true, skipped: true, reason: 'No payment payload provided' });
    }

    if (payment.status !== 'confirmed') {
      return Response.json({ success: true, skipped: true, reason: 'Payment is not confirmed' });
    }

    if (event?.type === 'update' && oldData?.status === 'confirmed') {
      return Response.json({ success: true, skipped: true, reason: 'Payment was already confirmed earlier' });
    }

    if (!payment.payment_link_id) {
      return Response.json({ success: true, skipped: true, reason: 'Payment has no payment_link_id' });
    }

    const rules = await sr.entities.NftFulfillmentRule.filter({
      merchant_id: payment.merchant_id,
      payment_link_id: payment.payment_link_id,
      status: 'active',
    }, '-created_date', 25);

    if (rules.length === 0) {
      return Response.json({ success: true, skipped: true, reason: 'No active NFT fulfillment rules for this payment link' });
    }

    const profiles = await sr.entities.MerchantProfile.filter({ user_id: payment.merchant_id }, '-created_date', 1);
    const merchantProfile = profiles[0] || null;
    const fulfillmentMode = merchantProfile?.nft_fulfillment_mode || 'manual';
    const recipientAddress = payment.payer_address || '';
    const now = new Date().toISOString();
    const results = [];
    const encryptionSecret = fulfillmentMode === 'automatic' ? Deno.env.get('NFT_WALLET_ENCRYPTION_KEY') : null;
    const hotWallets = fulfillmentMode === 'automatic'
      ? await sr.entities.MerchantHotWallet.filter({ merchant_id: payment.merchant_id, status: 'active' }, '-updated_date', 1)
      : [];
    const hotWallet = hotWallets[0] || null;

    for (const rule of rules) {
      const existingLogs = await sr.entities.NftTransferLog.filter({ payment_id: payment.id, nft_rule_id: rule.id }, '-created_date', 1);
      if (existingLogs.length > 0) {
        results.push({ rule_id: rule.id, status: 'skipped', reason: 'Already queued' });
        continue;
      }

      const status = recipientAddress ? 'pending' : 'failed';
      const log = await sr.entities.NftTransferLog.create({
        merchant_id: payment.merchant_id,
        payment_id: payment.id,
        payment_link_id: payment.payment_link_id,
        nft_rule_id: rule.id,
        recipient_address: recipientAddress,
        policy_id: rule.policy_id,
        asset_name_hex: rule.asset_name_hex,
        quantity: rule.quantity || 1,
        status,
        error_message: recipientAddress ? null : 'Missing customer wallet address on payment record',
        completed_at: recipientAddress ? null : now,
      });

      if (!recipientAddress) {
        results.push({ rule_id: rule.id, status: 'failed', log_id: log.id, reason: 'Missing customer wallet address on payment record' });
        continue;
      }

      if (fulfillmentMode !== 'automatic') {
        results.push({ rule_id: rule.id, status: log.status, log_id: log.id });
        continue;
      }

      if (!encryptionSecret) {
        await sr.entities.NftTransferLog.update(log.id, {
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: 'Missing NFT_WALLET_ENCRYPTION_KEY secret',
        });
        results.push({ rule_id: rule.id, status: 'failed', log_id: log.id, reason: 'Missing NFT_WALLET_ENCRYPTION_KEY secret' });
        continue;
      }

      if (!hotWallet) {
        await sr.entities.NftTransferLog.update(log.id, {
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: 'Automatic mode is enabled but no active hot wallet is configured',
        });
        results.push({ rule_id: rule.id, status: 'failed', log_id: log.id, reason: 'Automatic mode is enabled but no active hot wallet is configured' });
        continue;
      }

      try {
        const submitted = await autoSubmitTransfer(sr, log, hotWallet, encryptionSecret);
        results.push({ rule_id: rule.id, status: submitted.status, log_id: log.id, tx_hash: submitted.tx_hash });
      } catch (error) {
        await sr.entities.NftTransferLog.update(log.id, {
          status: 'failed',
          merchant_hot_wallet_id: hotWallet.id,
          completed_at: new Date().toISOString(),
          error_message: error.message,
        });
        results.push({ rule_id: rule.id, status: 'failed', log_id: log.id, reason: error.message });
      }
    }

    return Response.json({ success: true, payment_id: payment.id, fulfillment_mode: fulfillmentMode, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});