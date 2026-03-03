const BLOCKFROST_API_KEY = Deno.env.get("BLOCKFROST_API_KEY");
const BLOCKFROST_URL = "https://cardano-mainnet.blockfrost.io/api/v0";

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

// Simple CBOR parser to extract the tx body from a full tx array
// Full Cardano tx CBOR = array of 4: [txBody, witnessSet, isValid, auxiliaryData]
// We need to extract txBody bytes to re-wrap with real witness set.

// The wallet's signTx returns the COMPLETE signed tx (not just witness set)
// in CIP-30: "The function returns the signed transaction in its entirety"
// So we just need to submit that directly.

// However some wallets return partial witness set — detect and handle both.

function parseCborArrayLength(bytes, offset) {
  const byte = bytes[offset];
  const majorType = byte >> 5;
  const addInfo = byte & 0x1f;
  if (majorType !== 4) return null;
  if (addInfo <= 23) return { length: addInfo, headerSize: 1 };
  if (addInfo === 24) return { length: bytes[offset + 1], headerSize: 2 };
  return null;
}

Deno.serve(async (req) => {
  try {
    const { unsignedTxCbor, witnessCbor } = await req.json();

    if (!unsignedTxCbor || !witnessCbor) {
      return Response.json({ error: 'Missing unsignedTxCbor or witnessCbor' }, { status: 400 });
    }

    const unsignedBytes = hexToBytes(unsignedTxCbor);
    const witnessBytes = hexToBytes(witnessCbor);

    // Check if witnessCbor is already a full tx (array of 4)
    const witnessInfo = parseCborArrayLength(witnessBytes, 0);

    let fullTxBytes;

    if (witnessInfo && witnessInfo.length === 4) {
      // witnessCbor is already a complete signed tx — submit directly
      fullTxBytes = witnessBytes;
    } else if (witnessInfo && witnessInfo.length === 3) {
      // Some wallets return [txBody, witnessSet, auxiliaryData] — submit directly
      fullTxBytes = witnessBytes;
    } else {
      // witnessCbor is just the witness set map
      // unsignedTxCbor is our full tx: [txBody, {}, true, null]
      // We need to extract txBody and re-wrap with the real witness set.
      
      const unsignedInfo = parseCborArrayLength(unsignedBytes, 0);
      if (!unsignedInfo || unsignedInfo.length !== 4) {
        return Response.json({ error: 'Invalid unsigned tx CBOR format' }, { status: 400 });
      }

      // Find txBody bytes: skip the array header, extract first element
      // The txBody is a CBOR map starting after the array header
      const txBodyStart = unsignedInfo.headerSize;
      
      // Find the length of the txBody by parsing it
      // Walk through CBOR to find end of first element (txBody map)
      // Simpler: re-assemble as [txBody_bytes, witnessSet, true, null]
      // We can slice txBody from unsigned tx by finding where witness set starts
      // The unsigned tx has 0xa0 (empty map) as witness set

      // Find the 0xa0 byte that represents the empty witness map
      // It follows immediately after the txBody
      let txBodyEnd = txBodyStart;
      txBodyEnd = findCborElementEnd(unsignedBytes, txBodyStart);
      
      const txBodyBytes = unsignedBytes.slice(txBodyStart, txBodyEnd);

      // Rebuild: array[4] header + txBody + witnessSet + 0xf5 (true) + 0xf6 (null)
      const result = [0x84, ...txBodyBytes, ...witnessBytes, 0xf5, 0xf6];
      fullTxBytes = new Uint8Array(result);
    }

    const res = await fetch(`${BLOCKFROST_URL}/tx/submit`, {
      method: 'POST',
      headers: {
        'project_id': BLOCKFROST_API_KEY,
        'Content-Type': 'application/cbor',
      },
      body: fullTxBytes,
    });

    const text = await res.text();

    if (!res.ok) {
      return Response.json({ error: `Blockfrost submission failed: ${text}` }, { status: 400 });
    }

    const txHash = text.replace(/"/g, '').trim();
    return Response.json({ success: true, txHash });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// Walk CBOR bytes starting at offset, return the offset of the byte AFTER this element
function findCborElementEnd(bytes, offset) {
  const byte = bytes[offset];
  const majorType = byte >> 5;
  const addInfo = byte & 0x1f;

  let headerSize = 1;
  let length = addInfo;

  if (addInfo === 24) { headerSize = 2; length = bytes[offset + 1]; }
  else if (addInfo === 25) { headerSize = 3; length = (bytes[offset + 1] << 8) | bytes[offset + 2]; }
  else if (addInfo === 26) { headerSize = 5; length = (bytes[offset + 1] << 24) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 8) | bytes[offset + 4]; }
  else if (addInfo === 27) { headerSize = 9; length = Number(BigInt(bytes[offset + 1]) << 56n | BigInt(bytes[offset + 2]) << 48n | BigInt(bytes[offset + 3]) << 40n | BigInt(bytes[offset + 4]) << 32n | BigInt(bytes[offset + 5]) << 24n | BigInt(bytes[offset + 6]) << 16n | BigInt(bytes[offset + 7]) << 8n | BigInt(bytes[offset + 8])); }

  offset += headerSize;

  if (majorType === 0 || majorType === 1) {
    // uint or negint: no payload
    return offset;
  } else if (majorType === 2 || majorType === 3) {
    // bytes or text: payload of `length` bytes
    return offset + length;
  } else if (majorType === 4) {
    // array: `length` items
    for (let i = 0; i < length; i++) {
      offset = findCborElementEnd(bytes, offset);
    }
    return offset;
  } else if (majorType === 5) {
    // map: `length` key-value pairs
    for (let i = 0; i < length * 2; i++) {
      offset = findCborElementEnd(bytes, offset);
    }
    return offset;
  } else if (majorType === 6) {
    // tag: one tagged item
    return findCborElementEnd(bytes, offset);
  } else if (majorType === 7) {
    // simple/float
    if (addInfo <= 23) return offset;
    return offset + (addInfo === 24 ? 1 : addInfo === 25 ? 2 : addInfo === 26 ? 4 : 8);
  }
  return offset;
}