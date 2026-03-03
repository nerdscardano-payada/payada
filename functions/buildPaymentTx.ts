import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Build unsigned Cardano transaction using pure CBOR encoding (no WASM/eval needed)
// Returns txCbor ready for wallet signing via CIP-30

const BLOCKFROST_API_KEY = Deno.env.get("BLOCKFROST_API_KEY");
const BLOCKFROST_URL = "https://cardano-mainnet.blockfrost.io/api/v0";
const PAYADA_FEE_WALLET = Deno.env.get("PAYADA_FEE_WALLET");

async function blockfrost(path) {
  const res = await fetch(`${BLOCKFROST_URL}${path}`, {
    headers: { project_id: BLOCKFROST_API_KEY }
  });
  if (!res.ok) throw new Error(`Blockfrost error ${res.status}: ${await res.text()}`);
  return res.json();
}

// Convert hex address string to Uint8Array
function hexToBytes(hex) {
  const result = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    result[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return result;
}

// Convert Uint8Array to hex string
function bytesToHex(bytes) {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Encode a positive integer as CBOR
function encodeCborUint(n) {
  const bn = BigInt(n);
  if (bn <= 23n) return [Number(bn)];
  if (bn <= 0xffn) return [0x18, Number(bn)];
  if (bn <= 0xffffn) return [0x19, Number(bn >> 8n), Number(bn & 0xffn)];
  if (bn <= 0xffffffffn) return [0x1a, Number(bn >> 24n), Number((bn >> 16n) & 0xffn), Number((bn >> 8n) & 0xffn), Number(bn & 0xffn)];
  // 8-byte uint
  return [0x1b,
    Number(bn >> 56n), Number((bn >> 48n) & 0xffn), Number((bn >> 40n) & 0xffn), Number((bn >> 32n) & 0xffn),
    Number((bn >> 24n) & 0xffn), Number((bn >> 16n) & 0xffn), Number((bn >> 8n) & 0xffn), Number(bn & 0xffn)
  ];
}

// Encode bytes as CBOR byte string
function encodeCborBytes(bytes) {
  const len = bytes.length;
  let header;
  if (len <= 23) header = [0x40 + len];
  else if (len <= 0xff) header = [0x58, len];
  else header = [0x59, len >> 8, len & 0xff];
  return [...header, ...bytes];
}

// Encode CBOR array header
function encodeCborArrayHeader(len) {
  if (len <= 23) return [0x80 + len];
  return [0x98, len];
}

// Encode CBOR map header
function encodeCborMapHeader(len) {
  if (len <= 23) return [0xa0 + len];
  return [0xb8, len];
}

// Build a bech32 address -> raw bytes (strip network byte and decode)
// For Blockfrost we use the bech32 address directly
// But for CBOR we need raw address bytes

// Decode bech32 address to raw bytes using the CIP-19 format
// We'll use a simple bech32 decoder
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
  // Convert 5-bit groups to 8-bit (drop checksum last 6)
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
  return { hrp, bytes: new Uint8Array(decoded) };
}

// Convert a CIP-30 hex CBOR address to bech32 address string
// The raw address bytes from CIP-30 can be used directly with Blockfrost by converting to bech32
function hexAddrToBech32(hexAddr) {
  if (!hexAddr || hexAddr.startsWith('addr') || hexAddr.startsWith('stake')) return hexAddr;
  const bytes = hexToBytes(hexAddr);
  // First byte is header: network nibble (0xe=mainnet, 0x0=testnet)
  const header = bytes[0];
  const isMainnet = (header & 0x0f) === 1 || (header & 0x0f) === 0; // enterprise=0x60 mainnet
  // Actually check high nibble for type
  const hrp = (header & 0x0f) === 1 ? 'addr' : (header & 0x0f) === 0 ? 'addr' : 'addr';
  // Use bech32 encoding
  return encodeBech32(hrp, bytes);
}

// Simple bech32 encoder
function encodeBech32(hrp, data) {
  function polymod(values) {
    const GEN = [0x3b6a57b2n, 0x26508e6dn, 0x1ea119fan, 0x3d4233ddn, 0x2a1462b3n];
    let chk = 1n;
    for (const v of values) {
      const b = chk >> 25n;
      chk = ((chk & 0x1ffffffn) << 5n) ^ BigInt(v);
      for (let i = 0; i < 5; i++) {
        if ((b >> BigInt(i)) & 1n) chk ^= GEN[i];
      }
    }
    return chk;
  }
  function hrpExpand(hrp) {
    const ret = [];
    for (const c of hrp) ret.push(c.charCodeAt(0) >> 5);
    ret.push(0);
    for (const c of hrp) ret.push(c.charCodeAt(0) & 31);
    return ret;
  }
  function convertBits(data, fromBits, toBits, pad) {
    let acc = 0, bits = 0;
    const result = [];
    const maxv = (1 << toBits) - 1;
    for (const value of data) {
      acc = (acc << fromBits) | value;
      bits += fromBits;
      while (bits >= toBits) {
        bits -= toBits;
        result.push((acc >> bits) & maxv);
      }
    }
    if (pad && bits > 0) result.push((acc << (toBits - bits)) & maxv);
    return result;
  }
  const words = convertBits(data, 8, 5, true);
  const combined = [...hrpExpand(hrp), ...words, 0, 0, 0, 0, 0, 0];
  const chk = polymod(combined) ^ 1n;
  const checksum = [];
  for (let i = 5; i >= 0; i--) checksum.push(Number((chk >> BigInt(i * 5)) & 31n));
  return hrp + '1' + [...words, ...checksum].map(v => CHARSET[v]).join('');
}

Deno.serve(async (req) => {
  try {
    const { walletAddress, merchantAddress, merchantLovelace, platformFeeLovelace } = await req.json();

    if (!walletAddress || !merchantAddress || !merchantLovelace) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Convert addresses: if hex, convert to bech32 for Blockfrost
    const walletBech32 = hexAddrToBech32(walletAddress);
    const merchantBech32 = hexAddrToBech32(merchantAddress);

    // Get raw bytes for addresses (for CBOR encoding)
    const walletAddrBytes = walletAddress.startsWith('addr') || walletAddress.startsWith('stake')
      ? bech32Decode(walletAddress)?.bytes
      : hexToBytes(walletAddress);

    const merchantAddrBytes = merchantAddress.startsWith('addr') || merchantAddress.startsWith('stake')
      ? bech32Decode(merchantAddress)?.bytes
      : hexToBytes(merchantAddress);

    // Fetch UTxOs
    const utxos = await blockfrost(`/addresses/${walletBech32}/utxos`);
    if (!utxos || utxos.length === 0) {
      return Response.json({ error: 'No UTxOs found for wallet address.' }, { status: 400 });
    }

    // Get latest block for TTL
    const latestBlock = await blockfrost('/blocks/latest');
    const ttl = latestBlock.slot + 7200;

    const merchantLov = BigInt(merchantLovelace);
    const feeLov = platformFeeLovelace && PAYADA_FEE_WALLET ? BigInt(platformFeeLovelace) : 0n;
    const totalOutput = merchantLov + feeLov;
    const minFee = 200000n;

    // Coin selection - prefer pure ADA UTxOs (no native tokens) to avoid token bleed
    const pureAdaUtxos = utxos.filter(u => u.amount.length === 1 && u.amount[0].unit === 'lovelace');
    const utxosToUse = pureAdaUtxos.length > 0 ? pureAdaUtxos : utxos.filter(u => u.amount.find(a => a.unit === 'lovelace'));

    let selectedUtxos = [];
    let selectedTotal = 0n;
    for (const utxo of utxosToUse) {
      const adaAmount = utxo.amount.find(a => a.unit === 'lovelace');
      if (!adaAmount) continue;
      selectedUtxos.push(utxo);
      selectedTotal += BigInt(adaAmount.quantity);
      if (selectedTotal >= totalOutput + minFee) break;
    }

    if (selectedTotal < totalOutput + minFee) {
      return Response.json({
        error: `Insufficient balance. Need ₳ ${Number(totalOutput + minFee) / 1_000_000}, have ₳ ${Number(selectedTotal) / 1_000_000}`
      }, { status: 400 });
    }

    const changeLovelace = selectedTotal - totalOutput - minFee;

    // Build transaction body as CBOR map
    // inputs = set of [txhash, index]
    const inputs = selectedUtxos.map(u => [hexToBytes(u.tx_hash), u.tx_index]);

    // outputs = [address_bytes, lovelace]
    const outputs = [
      { addr: merchantAddrBytes, lovelace: merchantLov }
    ];

    if (feeLov > 0n && PAYADA_FEE_WALLET) {
      const feeAddrBytes = PAYADA_FEE_WALLET.startsWith('addr')
        ? bech32Decode(PAYADA_FEE_WALLET)?.bytes
        : hexToBytes(PAYADA_FEE_WALLET);
      outputs.push({ addr: feeAddrBytes, lovelace: feeLov });
    }

    if (changeLovelace > 0n) {
      outputs.push({ addr: walletAddrBytes, lovelace: changeLovelace });
    }

    // Encode transaction body
    // tx_body = { 0: inputs, 1: outputs, 2: fee, 3: ttl }
    const cborBytes = [];

    // Map with 4 entries
    cborBytes.push(...encodeCborMapHeader(4));

    // Key 0: inputs (array of [txhash_bytes, index])
    cborBytes.push(...encodeCborUint(0));
    cborBytes.push(...encodeCborArrayHeader(inputs.length));
    for (const [txHash, txIndex] of inputs) {
      cborBytes.push(...encodeCborArrayHeader(2));
      cborBytes.push(...encodeCborBytes(Array.from(txHash)));
      cborBytes.push(...encodeCborUint(txIndex));
    }

    // Key 1: outputs
    cborBytes.push(...encodeCborUint(1));
    cborBytes.push(...encodeCborArrayHeader(outputs.length));
    for (const { addr, lovelace } of outputs) {
      cborBytes.push(...encodeCborArrayHeader(2));
      cborBytes.push(...encodeCborBytes(Array.from(addr)));
      cborBytes.push(...encodeCborUint(lovelace));
    }

    // Key 2: fee
    cborBytes.push(...encodeCborUint(2));
    cborBytes.push(...encodeCborUint(minFee));

    // Key 3: ttl
    cborBytes.push(...encodeCborUint(3));
    cborBytes.push(...encodeCborUint(ttl));

    // Full transaction: [tx_body_cbor, {}, null, null]
    // Wrap tx_body in a byte string first, then build full tx
    const txBodyBytes = new Uint8Array(cborBytes);

    // Full unsigned tx CBOR: array of [txBody, witnessSet, true, null]
    const fullTx = [];
    fullTx.push(0x84); // array of 4
    // tx body
    fullTx.push(...cborBytes);
    // empty witness set {}
    fullTx.push(0xa0);
    // valid = true
    fullTx.push(0xf5);
    // auxiliary data = null
    fullTx.push(0xf6);

    const txCbor = bytesToHex(new Uint8Array(fullTx));

    return Response.json({ success: true, txCbor });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});