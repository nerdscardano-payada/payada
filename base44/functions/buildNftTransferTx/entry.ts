import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

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

async function blockfrost(path) {
  const response = await fetch(`${BLOCKFROST_URL}${path}`, { headers: { project_id: BLOCKFROST_API_KEY } });
  const text = await response.text();
  if (!response.ok) throw new Error(`Blockfrost ${response.status}: ${text}`);
  return text ? JSON.parse(text) : null;
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
  let value = 0, bits = 0;
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

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { transfer_log_id, wallet_address } = await req.json();
    if (!transfer_log_id) return Response.json({ error: 'transfer_log_id is required' }, { status: 400 });

    const sr = base44.asServiceRole;
    const logs = await sr.entities.NftTransferLog.filter({ id: transfer_log_id }, '-created_date', 1);
    const log = logs[0];
    if (!log) return Response.json({ error: 'Transfer log not found' }, { status: 404 });
    if (user.role !== 'admin' && user.email !== log.merchant_id) return Response.json({ error: 'Forbidden' }, { status: 403 });
    if (log.status !== 'pending') return Response.json({ error: 'Only pending transfers can be signed' }, { status: 400 });

    const signerWallets = await sr.entities.MerchantSignerWallet.filter({ merchant_id: log.merchant_id, status: 'active' }, '-updated_date', 1);
    const signerWallet = signerWallets[0];
    if (!signerWallet) return Response.json({ error: 'No active signer wallet configured' }, { status: 400 });
    if (wallet_address && wallet_address !== signerWallet.wallet_address) return Response.json({ error: 'Connected wallet does not match configured signer wallet' }, { status: 400 });

    const senderAddress = signerWallet.wallet_address;
    const [utxos, latestBlock] = await Promise.all([
      blockfrost(`/addresses/${senderAddress}/utxos?count=100&order=desc`),
      blockfrost('/blocks/latest'),
    ]);

    if (!utxos?.length) return Response.json({ error: 'No UTxOs found in signer wallet' }, { status: 400 });

    const assetUnit = `${log.policy_id}${log.asset_name_hex}`;
    const tokenUtxos = utxos.filter((utxo) => utxo.amount.some((a) => a.unit === assetUnit));
    const adaUtxos = utxos.filter((utxo) => utxo.amount.length === 1 && utxo.amount[0].unit === 'lovelace');
    if (!tokenUtxos.length) return Response.json({ error: 'Required NFT asset not found in signer wallet' }, { status: 400 });

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

    if (selectedQuantity < quantityNeeded) return Response.json({ error: 'Insufficient NFT quantity in signer wallet' }, { status: 400 });

    const txFee = estimateFee(selectedUtxos.length + 2, 2);
    const adaNeeded = MIN_TOKEN_OUTPUT_LOVELACE + txFee + 1_500_000n;

    if (selectedLovelace < adaNeeded) {
      for (const utxo of adaUtxos) {
        if (selectedLovelace >= adaNeeded) break;
        if (selectedUtxos.some((s) => s.tx_hash === utxo.tx_hash && s.tx_index === utxo.tx_index)) continue;
        selectedUtxos.push(utxo);
        selectedLovelace += BigInt(utxo.amount[0].quantity);
      }
    }

    if (selectedLovelace < adaNeeded) return Response.json({ error: 'Insufficient ADA in signer wallet for fee and output' }, { status: 400 });

    const tokenChange = selectedQuantity - quantityNeeded;
    const adaChange = selectedLovelace - MIN_TOKEN_OUTPUT_LOVELACE - txFee;
    const recipientAddrBytes = getAddrBytes(log.recipient_address);
    const senderAddrBytes = getAddrBytes(senderAddress);
    if (!recipientAddrBytes) return Response.json({ error: 'Invalid recipient address' }, { status: 400 });

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

    const txBodyCbor = bytesToHex(new Uint8Array(cborBytes));
    const txCbor = bytesToHex(new Uint8Array([0x84, ...cborBytes, 0xa0, 0xf5, 0xf6]));

    return Response.json({
      success: true,
      txCbor,
      txBodyCbor,
      sender_address: senderAddress,
      recipient_address: log.recipient_address,
      quantity: Number(quantityNeeded),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});