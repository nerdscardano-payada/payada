const BLOCKFROST_API_KEY = Deno.env.get("BLOCKFROST_API_KEY");
const BLOCKFROST_URL = "https://cardano-mainnet.blockfrost.io/api/v0";

function hexToBytes(hex) {
  if (!hex) throw new Error("Empty transaction CBOR");
  return Uint8Array.from(
    hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
  );
}

function bytesToHex(bytes) {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Some CIP-30 wallets return signTx(txCbor, true) as a CBOR-encoded map:
 *   { 0: <raw-tx-bytes> }
 * which encodes as a1 00 <bytestring-of-tx>.
 * Blockfrost /tx/submit expects the raw tx bytes directly.
 * This function detects that wrapper and unwraps it.
 */
function maybeUnwrapCborMap(bytes) {
  // a1 = CBOR map(1), 00 = key 0, next byte = bytestring header
  if (bytes[0] === 0xa1 && bytes[1] === 0x00) {
    const bsHeader = bytes[2];
    const majorType = (bsHeader & 0xe0) >> 5; // should be 2 (byte string)
    if (majorType === 2) {
      const addInfo = bsHeader & 0x1f;
      let offset;
      let length;
      if (addInfo <= 23) {
        length = addInfo;
        offset = 3;
      } else if (addInfo === 24) {
        length = bytes[3];
        offset = 4;
      } else if (addInfo === 25) {
        length = (bytes[3] << 8) | bytes[4];
        offset = 5;
      } else if (addInfo === 26) {
        length = (bytes[3] << 24) | (bytes[4] << 16) | (bytes[5] << 8) | bytes[6];
        offset = 7;
      } else {
        return bytes; // can't parse, return original
      }
      const inner = bytes.slice(offset, offset + length);
      console.log("Unwrapped CBOR map wrapper, inner tx preview:", bytesToHex(inner).slice(0, 20));
      return inner;
    }
  }
  return bytes; // no wrapper detected, return as-is
}

Deno.serve(async (req) => {
  try {
    const rawBody = await req.json();
    console.log("Incoming payload:", JSON.stringify(rawBody));

    // Handle Base44 SDK payload wrapping
    const signedTxCbor =
      rawBody?.signedTxCbor ||
      rawBody?.data?.signedTxCbor ||
      rawBody?.tx ||
      rawBody?.data?.tx;

    if (!signedTxCbor) {
      return Response.json(
        { error: "Missing signedTxCbor in request payload" },
        { status: 400 }
      );
    }

    if (!/^[0-9a-fA-F]+$/.test(signedTxCbor)) {
      return Response.json(
        { error: "signedTxCbor must be hex encoded string" },
        { status: 400 }
      );
    }

    console.log("signedTxCbor preview:", signedTxCbor.slice(0, 20));

    let txBytes = hexToBytes(signedTxCbor);
    txBytes = maybeUnwrapCborMap(txBytes);

    const res = await fetch(`${BLOCKFROST_URL}/tx/submit`, {
      method: "POST",
      headers: {
        "project_id": BLOCKFROST_API_KEY,
        "Content-Type": "application/cbor",
      },
      body: txBytes,
    });

    const text = await res.text();
    console.log("Blockfrost response:", res.status, text);

    if (!res.ok) {
      return Response.json(
        { error: `Blockfrost submission failed: ${text}` },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      txHash: text.replace(/"/g, "").trim(),
    });

  } catch (err) {
    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
});