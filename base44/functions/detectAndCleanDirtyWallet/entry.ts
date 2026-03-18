const BLOCKFROST_API_KEY = Deno.env.get("BLOCKFROST_API_KEY");
const BLOCKFROST_URL = "https://cardano-mainnet.blockfrost.io/api/v0";

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

function bech32Decode(bechStr) {
  const lower = bechStr.toLowerCase();
  const pos = lower.lastIndexOf('1');
  if (pos < 1 || pos + 7 > lower.length) return null;
  const hrp = lower.slice(0, pos);
  const data = [];
  for (let i = pos + 1; i < lower.length; i++) {
    const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
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

function getAddrBytes(addr) {
  if (addr.startsWith('addr') || addr.startsWith('stake')) {
    return bech32Decode(addr)?.bytes;
  }
  return hexToBytes(addr);
}

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { walletAddress, cntPolicyId, cntAssetName } = body;

    console.log("detectAndCleanDirtyWallet input:", { walletAddress, cntPolicyId, cntAssetName });

    if (!walletAddress || typeof walletAddress !== 'string') {
      const errMsg = `Invalid walletAddress: expected string, got ${typeof walletAddress}`;
      console.error(errMsg);
      return Response.json({ error: errMsg }, { status: 400 });
    }

    const walletAddrBytes = getAddrBytes(walletAddress);
    if (!walletAddrBytes) {
      return Response.json({ error: 'Invalid wallet address' }, { status: 400 });
    }

    // Validate address format
    const walletBech32 = walletAddress.startsWith('addr') ? walletAddress : null;
    if (!walletBech32) {
      const errMsg = `Address must start with 'addr', got: ${walletAddress.slice(0, 20)}...`;
      console.error(errMsg);
      return Response.json({ error: errMsg }, { status: 400 });
    }

    console.log("Fetching UTXOs for:", walletBech32);
    const utxos = await blockfrost(`/addresses/${walletBech32}/utxos?count=100&order=desc`);
    console.log("UTXOs fetched:", utxos?.length || 0);

    if (!utxos || utxos.length === 0) {
      return Response.json({ error: 'No UTxOs found' }, { status: 400 });
    }

    // Check if wallet is clean for CNT
    const cntUnit = cntPolicyId && cntAssetName ? (cntPolicyId + cntAssetName) : null;
    let walletStatus = {
      isClean: true,
      totalUtxos: utxos.length,
      cleanUtxos: 0,
      dirtyUtxos: 0,
      targetToken: cntUnit,
      otherTokens: new Set(),
      recommendation: "CLEAN"
    };

    // Count clean vs dirty
    const cleanUtxos = [];
    const dirtyUtxos = [];

    for (const utxo of utxos) {
      const hasOnlyAdaAndCnt = utxo.amount.every(a => a.unit === 'lovelace' || a.unit === cntUnit);
      
      if (hasOnlyAdaAndCnt) {
        cleanUtxos.push(utxo);
        walletStatus.cleanUtxos++;
      } else {
        dirtyUtxos.push(utxo);
        walletStatus.dirtyUtxos++;
        walletStatus.isClean = false;
        
        // Track other tokens
        for (const asset of utxo.amount) {
          if (asset.unit !== 'lovelace' && asset.unit !== cntUnit) {
            walletStatus.otherTokens.add(asset.unit.slice(0, 56) + '...' + asset.unit.slice(-16));
          }
        }
      }
    }

    // Determine recommendation
    if (walletStatus.isClean) {
      walletStatus.recommendation = "CLEAN";
    } else if (dirtyUtxos.length > 0 && cleanUtxos.length > 0) {
      walletStatus.recommendation = "MIXED";
    } else {
      walletStatus.recommendation = "DIRTY";
    }

    walletStatus.otherTokens = Array.from(walletStatus.otherTokens);

    return Response.json({
      status: walletStatus,
      cleanUtxos: cleanUtxos.length,
      dirtyUtxos: dirtyUtxos.length
    });

  } catch (error) {
    console.error("detectAndCleanDirtyWallet FATAL ERROR:", {
      message: error?.message,
      stack: error?.stack,
      type: error?.constructor?.name
    });
    return Response.json({ 
      error: error?.message || 'Unknown error',
      details: error?.stack?.split('\n')[0] || 'No stack trace'
    }, { status: 500 });
  }
});