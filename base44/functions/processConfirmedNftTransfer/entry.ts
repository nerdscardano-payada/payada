import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';
import * as CSL from 'npm:@emurgo/cardano-serialization-lib-nodejs@11.5.0';
import bip39 from 'npm:bip39@3.1.0';

const BLOCKFROST_API_KEY = Deno.env.get('BLOCKFROST_API_KEY');
const BLOCKFROST_URL = 'https://cardano-mainnet.blockfrost.io/api/v0';
const MIN_TOKEN_OUTPUT_LOVELACE = 1_500_000n;

function bytesToHex(bytes) {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(hex) {
  if (!hex || hex.length % 2 !== 0) throw new Error('Invalid hex string');
  const result = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    result[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return result;
}

function bytesToBase64(bytes) {
  return btoa(String.fromCharCode(...bytes));
}

function base64ToBytes(base64) {
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
}

async function getAesKey(secret, usage) {
  const secretBytes = new TextEncoder().encode(secret);
  const hashed = await crypto.subtle.digest('SHA-256', secretBytes);
  return crypto.subtle.importKey('raw', hashed, 'AES-GCM', false, [usage]);
}

async function decryptMnemonic(ciphertextBase64, ivBase64, secret) {
  const key = await getAesKey(secret, 'decrypt');
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: base64ToBytes(ivBase64) },
    key,
    base64ToBytes(ciphertextBase64),
  );
  return new TextDecoder().decode(decrypted);
}

async function blockfrost(path, init = {}) {
  const response = await fetch(`${BLOCKFROST_URL}${path}`, {
    ...init,
    headers: {
      project_id: BLOCKFROST_API_KEY,
      ...(init.headers || {}),
    },
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Blockfrost ${response.status}: ${text}`);
  }

  return text ? JSON.parse(text) : null;
}

function encodeCborUint(n) {
  const bn = BigInt(n);
  if (bn <= 23n) return [Number(bn)];
  if (bn <= 0xffn) return [0x18, Number(bn)];
  if (bn <= 0xffffn) return [0x19, Number(bn >> 8n), Number(bn & 0xffn)];
  if (bn <= 0xffffffffn) return [0x1a, Number(bn >> 24n), Number((bn >> 16n) & 0xffn), Number((bn >> 8n) & 0xffn), Number(bn & 0xffn)];
  return [
    0x1b,
    Number(bn >> 56n),
    Number((bn >> 48n) & 0xffn),
    Number((bn >> 40n) & 0xffn),
    Number((bn >> 32n) & 0xffn),
    Number((bn >> 24n) & 0xffn),
    Number((bn >> 16n) & 0xffn),
    Number((bn >> 8n) & 0xffn),
    Number(bn & 0xffn),
  ];
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

const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

function bech32Decode(bechStr) {
  const lower = bechStr.toLowerCase();
  const pos = lower.lastIndexOf('1');
  if (pos < 1 || pos + 7 > lower.length) return null;
  const hrp = lower.slice(0, pos);
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
  return { hrp, bytes: new Uint8Array(decoded) };
}

function getAddrBytes(addr) {
  if (addr && (addr.startsWith('addr') || addr.startsWith('stake'))) {
    return bech32Decode(addr)?.bytes;
  }
  return hexToBytes(addr);
}

function estimateFee(numInputs, numOutputs) {
  const txSize = 320 + 110 * numInputs + 200 * numOutputs;
  return 155381n + 44n * BigInt(txSize) + 400000n;
}

function signTransaction(txBodyCbor, mnemonic) {
  const entropyHex = bip39.mnemonicToEntropy(mnemonic.trim());
  const rootKey = CSL.Bip32PrivateKey.from_bip39_entropy(hexToBytes(entropyHex), new Uint8Array());
  const accountKey = rootKey.derive(0x80000000 + 1852).derive(0x80000000 + 1815).derive(0x80000000 + 0);
  const paymentKey = accountKey.derive(0).derive(0).to_raw_key();
  const txBody = CSL.TransactionBody.from_bytes(hexToBytes(txBodyCbor));
  const txHash = CSL.hash_transaction(txBody);
  const witnesses = CSL.Vkeywitnesses.new();
  witnesses.add(CSL.make_vkey_witness(txHash, paymentKey));
  const witnessSet = CSL.TransactionWitnessSet.new();
  witnessSet.set_vkeys(witnesses);
  const tx = CSL.Transaction.new(txBody, witnessSet);
  return bytesToHex(tx.to_bytes());
}

async function submitSignedTx(signedTxCbor) {
  const response = await fetch(`${BLOCKFROST_URL}/tx/submit`, {
    method: 'POST',
    headers: {
      project_id: BLOCKFROST_API_KEY,
      'Content-Type': 'application/cbor',
    },
    body: hexToBytes(signedTxCbor),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Blockfrost submit failed: ${text}`);
  }

  return text.replace(/"/g, '').trim();
}

async function buildAndSubmitNftTransfer({ walletAddress, mnemonic, recipientAddress, policyId, assetNameHex, quantity }) {
  const [utxos, latestBlock] = await Promise.all([
    blockfrost(`/addresses/${walletAddress}/utxos?count=100&order=desc`),
    blockfrost('/blocks/latest'),
  ]);

  if (!utxos || utxos.length === 0) {
    throw new Error('No UTxOs found in merchant NFT wallet');
  }

  const assetUnit = `${policyId}${assetNameHex}`;
  const tokenUtxos = utxos.filter((utxo) => utxo.amount.some((asset) => asset.unit === assetUnit));
  const adaUtxos = utxos
    .filter((utxo) => utxo.amount.length === 1 && utxo.amount[0].unit === 'lovelace')
    .sort((a, b) => Number(BigInt(b.amount[0].quantity) - BigInt(a.amount[0].quantity)));

  if (tokenUtxos.length === 0) {
    throw new Error('Required NFT asset not found in merchant hot wallet');
  }

  const quantityNeeded = BigInt(quantity || 1);
  let selectedQuantity = 0n;
  let selectedLovelace = 0n;
  const selectedUtxos = [];

  for (const utxo of tokenUtxos) {
    selectedUtxos.push(utxo);
    for (const amount of utxo.amount) {
      if (amount.unit === 'lovelace') selectedLovelace += BigInt(amount.quantity);
      if (amount.unit === assetUnit) selectedQuantity += BigInt(amount.quantity);
    }
    if (selectedQuantity >= quantityNeeded) break;
  }

  if (selectedQuantity < quantityNeeded) {
    throw new Error(`Insufficient NFT quantity in merchant wallet. Need ${quantityNeeded}, found ${selectedQuantity}`);
  }

  const txFee = estimateFee(selectedUtxos.length + 2, 2);
  const adaNeeded = MIN_TOKEN_OUTPUT_LOVELACE + txFee + 1_500_000n;

  if (selectedLovelace < adaNeeded) {
    for (const utxo of adaUtxos) {
      if (selectedLovelace >= adaNeeded) break;
      if (selectedUtxos.some((selected) => selected.tx_hash === utxo.tx_hash && selected.tx_index === utxo.tx_index)) continue;
      selectedUtxos.push(utxo);
      selectedLovelace += BigInt(utxo.amount[0].quantity);
    }
  }

  if (selectedLovelace < adaNeeded) {
    throw new Error('Insufficient ADA in merchant hot wallet to send NFT and pay network fee');
  }

  const tokenChange = selectedQuantity - quantityNeeded;
  const adaChange = selectedLovelace - MIN_TOKEN_OUTPUT_LOVELACE - txFee;
  const recipientAddrBytes = getAddrBytes(recipientAddress);
  const merchantAddrBytes = getAddrBytes(walletAddress);

  if (!recipientAddrBytes) {
    throw new Error('Invalid recipient address');
  }

  const outputsData = [];
  const nftAssetMap = new Map([[policyId, new Map([[assetNameHex || '', quantityNeeded]])]]);
  outputsData.push({ addrBytes: recipientAddrBytes, lovelace: MIN_TOKEN_OUTPUT_LOVELACE, assets: nftAssetMap });

  const changeAssets = tokenChange > 0n ? new Map([[policyId, new Map([[assetNameHex || '', tokenChange]])]]) : new Map();
  outputsData.push({ addrBytes: merchantAddrBytes, lovelace: adaChange, assets: changeAssets });

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
    cborBytes.push(0x82);
    cborBytes.push(...encodeCborBytes(Array.from(txHashBytes)));
    cborBytes.push(...encodeCborUint(txIndex));
  }
  cborBytes.push(...encodeCborUint(1));
  cborBytes.push(...encodeCborArrayHeader(outputsData.length));
  for (const output of outputsData) {
    cborBytes.push(...encodeTxOut(output.addrBytes, output.lovelace, output.assets));
  }
  cborBytes.push(...encodeCborUint(2));
  cborBytes.push(...encodeCborUint(txFee));
  cborBytes.push(...encodeCborUint(3));
  cborBytes.push(...encodeCborUint(BigInt(latestBlock.slot) + 3600n));

  const txBodyCbor = bytesToHex(new Uint8Array(cborBytes));
  const signedTxCbor = signTransaction(txBodyCbor, mnemonic);
  return submitSignedTx(signedTxCbor);
}

async function createLog(base44, payload) {
  return base44.asServiceRole.entities.NftTransferLog.create(payload);
}

async function updateLog(base44, id, payload) {
  return base44.asServiceRole.entities.NftTransferLog.update(id, payload);
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

    const recipientAddress = payment.payer_address;
    if (!recipientAddress) {
      for (const rule of rules) {
        await createLog(base44, {
          merchant_id: payment.merchant_id,
          payment_id: payment.id,
          payment_link_id: payment.payment_link_id,
          nft_rule_id: rule.id,
          recipient_address: '',
          policy_id: rule.policy_id,
          asset_name_hex: rule.asset_name_hex,
          quantity: rule.quantity || 1,
          status: 'failed',
          error_message: 'Missing customer wallet address on payment record',
          completed_at: new Date().toISOString(),
        });
      }
      return Response.json({ success: false, reason: 'Missing customer wallet address on payment record' }, { status: 400 });
    }

    const wallets = await sr.entities.MerchantHotWallet.filter({
      merchant_id: payment.merchant_id,
      status: 'active',
    }, '-updated_date', 1);
    const wallet = wallets[0];

    if (!wallet) {
      for (const rule of rules) {
        await createLog(base44, {
          merchant_id: payment.merchant_id,
          payment_id: payment.id,
          payment_link_id: payment.payment_link_id,
          nft_rule_id: rule.id,
          recipient_address: recipientAddress,
          policy_id: rule.policy_id,
          asset_name_hex: rule.asset_name_hex,
          quantity: rule.quantity || 1,
          status: 'failed',
          error_message: 'No active merchant NFT hot wallet configured',
          completed_at: new Date().toISOString(),
        });
      }
      return Response.json({ success: false, reason: 'No active merchant NFT hot wallet configured' }, { status: 400 });
    }

    const encryptionSecret = Deno.env.get('NFT_WALLET_ENCRYPTION_KEY');
    if (!encryptionSecret) {
      return Response.json({ error: 'Missing NFT_WALLET_ENCRYPTION_KEY secret' }, { status: 500 });
    }

    const mnemonic = await decryptMnemonic(wallet.encrypted_seed, wallet.encryption_iv, encryptionSecret);

    const results = [];
    for (const rule of rules) {
      const existingLogs = await sr.entities.NftTransferLog.filter({ payment_id: payment.id, nft_rule_id: rule.id }, '-created_date', 1);
      const existingLog = existingLogs[0];

      if (existingLog && ['submitted', 'confirmed'].includes(existingLog.status)) {
        results.push({ rule_id: rule.id, status: 'skipped', reason: 'Already processed' });
        continue;
      }

      const baseLog = existingLog || await createLog(base44, {
        merchant_id: payment.merchant_id,
        payment_id: payment.id,
        payment_link_id: payment.payment_link_id,
        merchant_hot_wallet_id: wallet.id,
        nft_rule_id: rule.id,
        recipient_address: recipientAddress,
        policy_id: rule.policy_id,
        asset_name_hex: rule.asset_name_hex,
        quantity: rule.quantity || 1,
        status: 'pending',
      });

      try {
        const txHash = await buildAndSubmitNftTransfer({
          walletAddress: wallet.wallet_address,
          mnemonic,
          recipientAddress,
          policyId: rule.policy_id,
          assetNameHex: rule.asset_name_hex,
          quantity: rule.quantity || 1,
        });

        await updateLog(base44, baseLog.id, {
          merchant_hot_wallet_id: wallet.id,
          status: 'submitted',
          tx_hash: txHash,
          submitted_at: new Date().toISOString(),
          error_message: null,
        });

        await sr.entities.MerchantHotWallet.update(wallet.id, {
          last_used_at: new Date().toISOString(),
        });

        results.push({ rule_id: rule.id, status: 'submitted', tx_hash: txHash });
      } catch (error) {
        await updateLog(base44, baseLog.id, {
          merchant_hot_wallet_id: wallet.id,
          status: 'failed',
          error_message: error.message,
          completed_at: new Date().toISOString(),
        });

        results.push({ rule_id: rule.id, status: 'failed', error: error.message });
      }
    }

    return Response.json({ success: true, payment_id: payment.id, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});