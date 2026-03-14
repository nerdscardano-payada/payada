import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const BLOCKFROST_API_KEY = Deno.env.get("BLOCKFROST_API_KEY");
const BLOCKFROST_URL = "https://cardano-mainnet.blockfrost.io/api/v0";
const PAYADA_FEE_WALLET = Deno.env.get("PAYADA_FEE_WALLET");
const FEE_PERCENT = 1.75;
const MIN_TOKEN_OUTPUT_LOVELACE = 1_500_000n; // 1.5 ADA per token output (safe minUTxO)

async function blockfrost(path) {
  const res = await fetch(`${BLOCKFROST_URL}${path}`, {
    headers: { project_id: BLOCKFROST_API_KEY }
  });
  if (!res.ok) throw new Error(`Blockfrost ${res.status}: ${await res.text()}`);
  return res.json();
}

function hexToBytes(hex) {
  const result = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2)
    result[i / 2] = parseInt(hex.substr(i, 2), 16);
  return result;
}

function bytesToHex(bytes) {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function encodeCborUint(n) {
  const bn = BigInt(n);
  if (bn <= 23n) return [Number(bn)];
  if (bn <= 0xffn) return [0x18, Number(bn)];
  if (bn <= 0xffffn) return [0x19, Number(bn >> 8n), Number(bn & 0xffn)];
  if (bn <= 0xffffffffn) return [0x1a, Number(bn >> 24n), Number((bn >> 16n) & 0xffn), Number((bn >> 8n) & 0xffn), Number(bn & 0xffn)];
  return [0x1b,
    Number(bn >> 56n), Number((bn >> 48n) & 0xffn), Number((bn >> 40n) & 0xffn), Number((bn >> 32n) & 0xffn),
    Number((bn >> 24n) & 0xffn), Number((bn >> 16n) & 0xffn), Number((bn >> 8n) & 0xffn), Number(bn & 0xffn)
  ];
}

function encodeCborBytes(bytes) {
  const arr = Array.isArray(bytes) ? bytes : Array.from(bytes);
  const len = arr.length;
  let header;
  if (len <= 23) header = [0x40 + len];
  else if (len <= 0xff) header = [0x58, len];
  else header = [0x59, len >> 8, len & 0xff];
  return [...header, ...arr];
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
  const result = [0x82];
  result.push(...encodeCborUint(lovelace));
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
  let value = 0, bits = 0;
  for (let i = 0; i < data.length - 6; i++) {
    value = (value << 5) | data[i];
    bits += 5;
    if (bits >= 8) { bits -= 8; decoded.push((value >> bits) & 0xff); }
  }
  return { hrp, bytes: new Uint8Array(decoded) };
}

function encodeBech32(hrp, data) {
  function polymod(values) {
    const GEN = [0x3b6a57b2n, 0x26508e6dn, 0x1ea119fan, 0x3d4233ddn, 0x2a1462b3n];
    let chk = 1n;
    for (const v of values) {
      const b = chk >> 25n;
      chk = ((chk & 0x1ffffffn) << 5n) ^ BigInt(v);
      for (let i = 0; i < 5; i++) { if ((b >> BigInt(i)) & 1n) chk ^= GEN[i]; }
    }
    return chk;
  }
  function hrpExpand(h) {
    const ret = [];
    for (const c of h) ret.push(c.charCodeAt(0) >> 5);
    ret.push(0);
    for (const c of h) ret.push(c.charCodeAt(0) & 31);
    return ret;
  }
  function convertBits(d, from, to, pad) {
    let acc = 0, bits = 0;
    const result = [], maxv = (1 << to) - 1;
    for (const value of d) {
      acc = (acc << from) | value; bits += from;
      while (bits >= to) { bits -= to; result.push((acc >> bits) & maxv); }
    }
    if (pad && bits > 0) result.push((acc << (to - bits)) & maxv);
    return result;
  }
  const words = convertBits(data, 8, 5, true);
  const combined = [...hrpExpand(hrp), ...words, 0, 0, 0, 0, 0, 0];
  const chk = polymod(combined) ^ 1n;
  const checksum = [];
  for (let i = 5; i >= 0; i--) checksum.push(Number((chk >> BigInt(i * 5)) & 31n));
  return hrp + '1' + [...words, ...checksum].map(v => CHARSET[v]).join('');
}

function hexAddrToBech32(hexAddr) {
  if (!hexAddr || hexAddr.startsWith('addr') || hexAddr.startsWith('stake')) return hexAddr;
  return encodeBech32('addr', hexToBytes(hexAddr));
}

function getAddrBytes(addr) {
  if (addr && (addr.startsWith('addr') || addr.startsWith('stake'))) return bech32Decode(addr)?.bytes;
  return hexToBytes(addr);
}

function estimateFee(numInputs, numOutputs) {
  const txSize = 350 + 110 * numInputs + 200 * numOutputs; // generous per-output for token outputs
  return 155381n + 44n * BigInt(txSize) + 600000n; // +0.6 ADA buffer
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { token_sale_id, merchant_wallet_address } = await req.json();
    if (!token_sale_id || !merchant_wallet_address) {
      return Response.json({ error: 'Missing token_sale_id or merchant_wallet_address' }, { status: 400 });
    }

    // Load sale
    const sales = await base44.asServiceRole.entities.TokenSale.filter({ id: token_sale_id });
    const sale = sales[0];
    if (!sale) return Response.json({ error: 'Sale not found' }, { status: 404 });
    if (!sale.token_policy_id) return Response.json({ error: 'Sale has no token policy ID' }, { status: 400 });

    // Load pending purchases
    const allPurchases = await base44.asServiceRole.entities.TokenSalePurchase.filter({ token_sale_id });
    const pending = allPurchases.filter(p => p.status === 'pending_distribution');

    if (pending.length === 0) return Response.json({ error: 'No pending purchases to distribute' }, { status: 400 });

    // Cap at 50 outputs per tx to avoid size limit
    const batch = pending.slice(0, 50);
    const feeRatio = FEE_PERCENT / 100;

    const distributions = batch.map(p => {
      const gross = p.tokens_allocated || 0;
      const fee = gross - Math.floor(gross * (1 - feeRatio));
      return {
        purchase_id: p.id,
        wallet_address: p.wallet_address,
        gross_tokens: BigInt(gross),
        net_tokens: BigInt(gross - fee),
        fee_tokens: BigInt(fee),
      };
    });

    const totalNetTokens = distributions.reduce((s, d) => s + d.net_tokens, 0n);
    const totalFeeTokens = distributions.reduce((s, d) => s + d.fee_tokens, 0n);
    const totalTokensNeeded = totalNetTokens + totalFeeTokens;

    // Fetch merchant UTxOs
    const merchantBech32 = hexAddrToBech32(merchant_wallet_address);
    const merchantAddrBytes = getAddrBytes(merchant_wallet_address);

    const [utxos, latestBlock] = await Promise.all([
      blockfrost(`/addresses/${merchantBech32}/utxos?count=100&order=desc`),
      blockfrost('/blocks/latest'),
    ]);

    if (!utxos || utxos.length === 0) {
      return Response.json({ error: 'No UTxOs found in merchant wallet' }, { status: 400 });
    }

    const tokenUnit = sale.token_policy_id + (sale.token_asset_name || '');
    const tokenUtxos = utxos.filter(u => u.amount.some(a => a.unit === tokenUnit));
    const adaUtxos = utxos
      .filter(u => u.amount.length === 1 && u.amount[0].unit === 'lovelace')
      .sort((a, b) => Number(BigInt(b.amount[0].quantity) - BigInt(a.amount[0].quantity)));

    if (tokenUtxos.length === 0) {
      return Response.json({ error: `No UTxOs with ${sale.token_ticker} found in merchant wallet` }, { status: 400 });
    }

    // Select token UTxOs
    let selectedTokens = 0n;
    let selectedLovelace = 0n;
    const selectedUtxos = [];

    for (const u of tokenUtxos) {
      selectedUtxos.push(u);
      for (const a of u.amount) {
        if (a.unit === 'lovelace') selectedLovelace += BigInt(a.quantity);
        if (a.unit === tokenUnit) selectedTokens += BigInt(a.quantity);
      }
      if (selectedTokens >= totalTokensNeeded) break;
    }

    if (selectedTokens < totalTokensNeeded) {
      return Response.json({
        error: `Insufficient ${sale.token_ticker}. Need ${totalTokensNeeded}, wallet has ${selectedTokens}`
      }, { status: 400 });
    }

    const hasFeeOutput = totalFeeTokens > 0n && !!PAYADA_FEE_WALLET;
    const numOutputs = distributions.length + (hasFeeOutput ? 1 : 0) + 1;
    const txFee = estimateFee(selectedUtxos.length + 3, numOutputs); // +3 buffer for extra ADA UTxOs

    const adaForOutputs = MIN_TOKEN_OUTPUT_LOVELACE * BigInt(distributions.length + (hasFeeOutput ? 1 : 0));
    const adaNeeded = adaForOutputs + txFee + 1_500_000n; // min 1.5 ADA change

    // Supplement with pure ADA UTxOs if needed
    if (selectedLovelace < adaNeeded) {
      for (const u of adaUtxos) {
        if (selectedLovelace >= adaNeeded) break;
        if (selectedUtxos.some(s => s.tx_hash === u.tx_hash && s.tx_index === u.tx_index)) continue;
        selectedUtxos.push(u);
        const lov = u.amount.find(a => a.unit === 'lovelace');
        if (lov) selectedLovelace += BigInt(lov.quantity);
      }
    }

    if (selectedLovelace < adaNeeded) {
      return Response.json({
        error: `Insufficient ADA in merchant wallet. Need ₳${(Number(adaNeeded) / 1_000_000).toFixed(2)}, have ₳${(Number(selectedLovelace) / 1_000_000).toFixed(2)}`
      }, { status: 400 });
    }

    const adaChange = selectedLovelace - adaForOutputs - txFee;
    const tokenChange = selectedTokens - totalTokensNeeded;

    // Build outputs
    const outputsData = [];

    for (const d of distributions) {
      const addrBytes = getAddrBytes(d.wallet_address);
      const tokenMap = new Map([[sale.token_policy_id, new Map([[sale.token_asset_name || '', d.net_tokens]])]]);
      outputsData.push({ addrBytes, lovelace: MIN_TOKEN_OUTPUT_LOVELACE, assets: tokenMap });
    }

    if (hasFeeOutput) {
      const feeAddrBytes = getAddrBytes(PAYADA_FEE_WALLET);
      const feeTokenMap = new Map([[sale.token_policy_id, new Map([[sale.token_asset_name || '', totalFeeTokens]])]]);
      outputsData.push({ addrBytes: feeAddrBytes, lovelace: MIN_TOKEN_OUTPUT_LOVELACE, assets: feeTokenMap });
    }

    // Change: remaining tokens + remaining ADA back to merchant
    const changeAssets = tokenChange > 0n
      ? new Map([[sale.token_policy_id, new Map([[sale.token_asset_name || '', tokenChange]])]])
      : new Map();
    outputsData.push({ addrBytes: merchantAddrBytes, lovelace: adaChange, assets: changeAssets });

    // Build + sort inputs
    const inputs = selectedUtxos.map(u => [hexToBytes(u.tx_hash), u.tx_index]);
    const sortedInputs = [...inputs].sort((a, b) => {
      const hexA = bytesToHex(a[0]) + a[1].toString().padStart(8, '0');
      const hexB = bytesToHex(b[0]) + b[1].toString().padStart(8, '0');
      return hexA < hexB ? -1 : 1;
    });

    // Encode CBOR tx body
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
    for (const { addrBytes, lovelace, assets } of outputsData) {
      cborBytes.push(...encodeTxOut(addrBytes, lovelace, assets));
    }

    cborBytes.push(...encodeCborUint(2));
    cborBytes.push(...encodeCborUint(txFee));

    cborBytes.push(...encodeCborUint(3));
    cborBytes.push(...encodeCborUint(latestBlock.slot + 7200));

    const fullTx = [0x84, ...cborBytes, 0xa0, 0xf5, 0xf6];
    const txCbor = bytesToHex(new Uint8Array(fullTx));
    const txBodyCbor = bytesToHex(new Uint8Array(cborBytes));

    return Response.json({
      success: true,
      txCbor,
      txBodyCbor,
      summary: {
        buyer_count: distributions.length,
        total_batched: pending.length,
        total_net_tokens: totalNetTokens.toString(),
        total_fee_tokens: totalFeeTokens.toString(),
        token_ticker: sale.token_ticker,
        ada_for_outputs: (Number(adaForOutputs) / 1_000_000).toFixed(2),
        tx_fee_ada: (Number(txFee) / 1_000_000).toFixed(2),
        ada_change: (Number(adaChange) / 1_000_000).toFixed(2),
      },
      purchase_ids: distributions.map(d => d.purchase_id),
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});