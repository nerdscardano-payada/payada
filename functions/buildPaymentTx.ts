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

function hexToBytes(hex) {
  const result = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    result[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
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
  if (!assets || assets.size === 0) {
    return encodeCborUint(lovelace);
  }
  const result = [];
  result.push(0x82);
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
  const result = [];
  result.push(0x82);
  result.push(...encodeCborBytes(Array.from(addrBytes)));
  result.push(...encodeTxOutValue(lovelace, assets));
  return result;
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
    if (bits >= 8) {
      bits -= 8;
      decoded.push((value >> bits) & 0xff);
    }
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

function hexAddrToBech32(hexAddr) {
  if (!hexAddr || hexAddr.startsWith('addr') || hexAddr.startsWith('stake')) return hexAddr;
  const bytes = hexToBytes(hexAddr);
  return encodeBech32('addr', bytes);
}

function getAddrBytes(addr) {
  if (addr.startsWith('addr') || addr.startsWith('stake')) {
    return bech32Decode(addr)?.bytes;
  }
  return hexToBytes(addr);
}

// Estimate fee more accurately based on tx size
// Cardano fee formula: a + b * size (a=155381, b=44 lovelace per byte)
function estimateFee(numInputs, numOutputs, hasNativeTokens) {
  // Approximate tx size in bytes
  const baseSize = 300;
  const inputSize = 100 * numInputs;
  const outputSize = hasNativeTokens ? 150 * numOutputs : 100 * numOutputs;
  const txSize = baseSize + inputSize + outputSize;
  const fee = 155381n + 44n * BigInt(txSize);
  // Add generous buffer for witness overhead and safety
  return fee + 400000n; // 0.4 ADA buffer to cover protocol fee validation
}

// Minimum ADA per output (Cardano minimum UTxO requirement)
const MIN_LOVELACE_PER_OUTPUT = 1_000_000n; // 1 ADA

Deno.serve(async (req) => {
  try {
    const {
      walletAddress, merchantAddress,
      merchantLovelace, platformFeeLovelace,
      // CNT payment fields
      cntPolicyId, cntAssetName, cntAmount, cntFeeAmount
    } = await req.json();

    if (!walletAddress || !merchantAddress || !merchantLovelace) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const walletBech32 = hexAddrToBech32(walletAddress);
    const walletAddrBytes = getAddrBytes(walletAddress);
    const merchantAddrBytes = getAddrBytes(merchantAddress);

    if (!walletAddrBytes || !merchantAddrBytes) {
      return Response.json({ error: 'Invalid wallet or merchant address' }, { status: 400 });
    }

    // Fetch UTxOs and latest block in parallel
    const [utxos, latestBlock] = await Promise.all([
      blockfrost(`/addresses/${walletBech32}/utxos?count=100&order=desc`),
      blockfrost('/blocks/latest')
    ]);

    if (!utxos || utxos.length === 0) {
      return Response.json({ error: 'No UTxOs found for wallet address. Ensure your wallet has ADA.' }, { status: 400 });
    }

    const ttl = latestBlock.slot + 7200; // ~2 hour TTL

    // ⭐ Smart Payment Rules Engine: enforce minimum outputs
    const MIN_OUTPUT = 1_000_000n;       // 1 ADA minimum per output (Cardano dust protection)
    const FEE_BUFFER = 400_000n;         // 0.4 ADA buffer on top of estimate (covered in estimateFee)

    // --- CNT payment mode ---
    const isCntPayment = !!(cntPolicyId && cntAssetName && cntAmount);

    if (isCntPayment) {
      // For CNT payments: send CNT tokens to merchant and fee wallet
      // Payer needs enough ADA for minUTxO on each output + tx fee
      const cntTotal = BigInt(cntAmount);          // total CNT
      const cntFee = cntFeeAmount ? BigInt(cntFeeAmount) : 0n;  // CNT fee amount
      const cntMerchant = cntTotal - cntFee;       // CNT to merchant

      // Build token maps
      const merchantTokens = new Map([[cntPolicyId, new Map([[cntAssetName, cntMerchant]])]]);
      const feeTokens = cntFee > 0n ? new Map([[cntPolicyId, new Map([[cntAssetName, cntFee]])]]) : null;

      // Each output with native tokens needs minUTxO ADA
      // Cardano protocol minimum for token UTxOs is ~1.2-1.4 ADA depending on token complexity
      const MIN_CNT_OUTPUT_LOVELACE = 1_300_000n; // 1.3 ADA per token output (above Cardano minimum)

      // Select UTxOs: need enough ADA for minUTxO outputs + fee, plus must have the CNT
      const pureAdaUtxos = utxos
        .filter(u => u.amount.length === 1 && u.amount[0].unit === 'lovelace')
        .sort((a, b) => Number(BigInt(b.amount[0].quantity) - BigInt(a.amount[0].quantity)));
      const cntUnit = cntPolicyId + cntAssetName;
      // Prefer UTxOs that ONLY contain the target CNT (no other tokens) to keep wallet summary clean
      const allCntUtxos = utxos.filter(u => u.amount.some(a => a.unit === cntUnit));
      const cleanCntUtxos = allCntUtxos.filter(u => u.amount.every(a => a.unit === 'lovelace' || a.unit === cntUnit));
      const cntUtxos = cleanCntUtxos.length > 0 ? cleanCntUtxos : allCntUtxos;

      if (cntUtxos.length === 0) {
        return Response.json({ error: `No UTxOs found with ${cntUnit}. Ensure your wallet has the token.` }, { status: 400 });
      }

      // Select CNT UTxOs to cover total CNT needed
      let selectedCntLovelace = 0n;
      let selectedCntTokens = 0n;
      const selectedUtxos = [];
      const collectedOtherAssets = new Map(); // track ALL other tokens in selected UTxOs
      for (const utxo of cntUtxos) {
        selectedUtxos.push(utxo);
        for (const a of utxo.amount) {
          if (a.unit === 'lovelace') {
            selectedCntLovelace += BigInt(a.quantity);
          } else if (a.unit === cntUnit) {
            selectedCntTokens += BigInt(a.quantity);
          } else {
            // Track other tokens so we can return them as change
            const pId = a.unit.slice(0, 56);
            const aName = a.unit.slice(56);
            if (!collectedOtherAssets.has(pId)) collectedOtherAssets.set(pId, new Map());
            const prev = collectedOtherAssets.get(pId).get(aName) || 0n;
            collectedOtherAssets.get(pId).set(aName, prev + BigInt(a.quantity));
          }
        }
        if (selectedCntTokens >= cntTotal) break;
      }

      if (selectedCntTokens < cntTotal) {
        return Response.json({ error: `Insufficient ${cntAssetName} tokens. Need ${cntTotal}, have ${selectedCntTokens}.` }, { status: 400 });
      }

      // Number of outputs: merchant CNT + (fee CNT if any) + change
      const numOutputs = 1 + (cntFee > 0n ? 1 : 0) + 1;
      const txFee = estimateFee(selectedUtxos.length, numOutputs, true); // buffer already included in estimateFee

      // Total ADA needed: minUTxO for each token output + tx fee
      const numTokenOutputs = 1 + (cntFee > 0n ? 1 : 0);
      const adaForTokenOutputs = MIN_CNT_OUTPUT_LOVELACE * BigInt(numTokenOutputs);
      const adaNeeded = adaForTokenOutputs + txFee;

      // If CNT UTxOs don't have enough ADA, supplement with pure ADA UTxOs
      if (selectedCntLovelace < adaNeeded + MIN_OUTPUT) {
        for (const utxo of pureAdaUtxos) {
          selectedUtxos.push(utxo);
          const lov = utxo.amount.find(a => a.unit === 'lovelace');
          if (lov) selectedCntLovelace += BigInt(lov.quantity);
          if (selectedCntLovelace >= adaNeeded + MIN_OUTPUT) break;
        }
      }

      const adaChange = selectedCntLovelace - adaForTokenOutputs - txFee;
      const cntChange = selectedCntTokens - cntTotal;

      if (adaChange < 0n) {
        return Response.json({ error: `Insufficient ADA for token outputs. Need ₳${Number(adaNeeded) / 1_000_000} for minUTxO + fees.` }, { status: 400 });
      }

      // Build inputs
      const inputs = selectedUtxos.map(u => [hexToBytes(u.tx_hash), u.tx_index]);
      const sortedInputs = [...inputs].sort((a, b) => {
        const hexA = bytesToHex(a[0]) + a[1].toString().padStart(8, '0');
        const hexB = bytesToHex(b[0]) + b[1].toString().padStart(8, '0');
        return hexA < hexB ? -1 : 1;
      });

      const outputsData = [];

      // Merchant CNT output
      outputsData.push({ addrBytes: merchantAddrBytes, lovelace: MIN_CNT_OUTPUT_LOVELACE, assets: merchantTokens });

      // Fee CNT output
      if (cntFee > 0n && PAYADA_FEE_WALLET) {
        const feeAddrBytes = getAddrBytes(PAYADA_FEE_WALLET);
        outputsData.push({ addrBytes: feeAddrBytes, lovelace: MIN_CNT_OUTPUT_LOVELACE, assets: feeTokens });
      }

      // Change output (ADA + remaining CNT if any)
      const changeAssets = cntChange > 0n ? new Map([[cntPolicyId, new Map([[cntAssetName, cntChange]])]]) : new Map();
      outputsData.push({ addrBytes: walletAddrBytes, lovelace: adaChange, assets: changeAssets });

      // Encode transaction body
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
        debug: {
          inputs: selectedUtxos.length,
          outputs: outputsData.length,
          fee: Number(txFee) / 1_000_000,
          cntMerchant: cntMerchant.toString(),
          cntFee: cntFee.toString(),
          adaChange: Number(adaChange) / 1_000_000
        }
      });
    }

    // --- ADA payment mode (existing logic) ---

    // Merchant and fee outputs as provided by the frontend (fee model already applied)
    const merchantLov = BigInt(merchantLovelace) < MIN_OUTPUT ? MIN_OUTPUT : BigInt(merchantLovelace);
    let feeLov = 0n;
    if (platformFeeLovelace && PAYADA_FEE_WALLET) {
      const rawFee = BigInt(platformFeeLovelace);
      // Cardano dust protection: minimum 1 ADA per output
      feeLov = rawFee < MIN_OUTPUT ? MIN_OUTPUT : rawFee;
    }

    const totalOutput = merchantLov + feeLov;

    // Separate pure ADA UTxOs from those with native tokens
    const pureAdaUtxos = utxos
      .filter(u => u.amount.length === 1 && u.amount[0].unit === 'lovelace')
      .sort((a, b) => Number(BigInt(b.amount[0].quantity) - BigInt(a.amount[0].quantity)));
    const mixedUtxos = utxos.filter(u => u.amount.length > 1);

    const trySelect = (pool) => {
      const selected = [];
      let selectedLovelace = 0n;
      const collectedAssets = new Map();

      for (const utxo of pool) {
        selected.push(utxo);
        for (const asset of utxo.amount) {
          if (asset.unit === 'lovelace') {
            selectedLovelace += BigInt(asset.quantity);
          } else {
            const policyId = asset.unit.slice(0, 56);
            const assetName = asset.unit.slice(56);
            if (!collectedAssets.has(policyId)) collectedAssets.set(policyId, new Map());
            const prev = collectedAssets.get(policyId).get(assetName) || 0n;
            collectedAssets.get(policyId).set(assetName, prev + BigInt(asset.quantity));
          }
        }

        const hasChange = true; // always plan for change output
        const numOutputs = 1 + (feeLov > 0n ? 1 : 0) + (hasChange ? 1 : 0);
        const fee = estimateFee(selected.length, numOutputs, collectedAssets.size > 0) + FEE_BUFFER;
        const minChange = collectedAssets.size > 0 ? 2_000_000n : MIN_LOVELACE_PER_OUTPUT;
        const needed = totalOutput + fee + minChange;

        if (selectedLovelace >= needed) {
          return { selected, selectedLovelace, collectedAssets, fee };
        }
      }
      return null;
    };

    let selection = trySelect(pureAdaUtxos);
    if (!selection) {
      selection = trySelect([...pureAdaUtxos, ...mixedUtxos]);
    }

    if (!selection) {
      const totalAvailable = utxos.reduce((sum, u) => {
        const lov = u.amount.find(a => a.unit === 'lovelace');
        return sum + (lov ? BigInt(lov.quantity) : 0n);
      }, 0n);
      return Response.json({
        error: `Insufficient ADA. Need ₳${Number(totalOutput) / 1_000_000 + 0.5} (incl. fees + min outputs), have ₳${Number(totalAvailable) / 1_000_000}`
      }, { status: 400 });
    }

    const { selected: selectedUtxos, selectedLovelace, collectedAssets, fee } = selection;
    const changeLovelace = selectedLovelace - totalOutput - fee;

    // Build inputs
    const inputs = selectedUtxos.map(u => [hexToBytes(u.tx_hash), u.tx_index]);

    // Build outputs
    const outputsData = [];

    // Merchant output — guaranteed >= MIN_OUTPUT
    outputsData.push({ addrBytes: merchantAddrBytes, lovelace: merchantLov, assets: new Map() });

    // Platform fee output — guaranteed >= MIN_OUTPUT
    if (feeLov > 0n && PAYADA_FEE_WALLET) {
      const feeAddrBytes = getAddrBytes(PAYADA_FEE_WALLET);
      outputsData.push({ addrBytes: feeAddrBytes, lovelace: feeLov, assets: new Map() });
    }

    // Change output — guaranteed >= MIN_LOVELACE_PER_OUTPUT (or 2 ADA with native tokens)
    const minChange = collectedAssets.size > 0 ? 2_000_000n : MIN_LOVELACE_PER_OUTPUT;
    if (changeLovelace >= minChange) {
      outputsData.push({ addrBytes: walletAddrBytes, lovelace: changeLovelace, assets: collectedAssets });
    }

    // Encode transaction body
    const cborBytes = [];
    cborBytes.push(...encodeCborMapHeader(4));

    // Key 0: inputs (sorted for determinism)
    const sortedInputs = [...inputs].sort((a, b) => {
      const hexA = bytesToHex(a[0]) + a[1].toString().padStart(8, '0');
      const hexB = bytesToHex(b[0]) + b[1].toString().padStart(8, '0');
      return hexA < hexB ? -1 : 1;
    });

    cborBytes.push(...encodeCborUint(0));
    cborBytes.push(...encodeCborArrayHeader(sortedInputs.length));
    for (const [txHashBytes, txIndex] of sortedInputs) {
      cborBytes.push(0x82);
      cborBytes.push(...encodeCborBytes(Array.from(txHashBytes)));
      cborBytes.push(...encodeCborUint(txIndex));
    }

    // Key 1: outputs
    cborBytes.push(...encodeCborUint(1));
    cborBytes.push(...encodeCborArrayHeader(outputsData.length));
    for (const { addrBytes, lovelace, assets } of outputsData) {
      cborBytes.push(...encodeTxOut(addrBytes, lovelace, assets));
    }

    // Key 2: fee
    cborBytes.push(...encodeCborUint(2));
    cborBytes.push(...encodeCborUint(fee));

    // Key 3: ttl
    cborBytes.push(...encodeCborUint(3));
    cborBytes.push(...encodeCborUint(ttl));

    // Full tx: [txBody, witnessSet={}, valid=true, auxiliaryData=null]
    const fullTx = [0x84, ...cborBytes, 0xa0, 0xf5, 0xf6];
    const txCbor = bytesToHex(new Uint8Array(fullTx));

    const txBodyCbor = bytesToHex(new Uint8Array(cborBytes));
    return Response.json({
      success: true,
      txCbor,
      txBodyCbor,
      debug: {
        inputs: selectedUtxos.length,
        outputs: outputsData.length,
        fee: Number(fee) / 1_000_000,
        change: Number(changeLovelace) / 1_000_000,
        hasNativeTokens: collectedAssets.size > 0
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});