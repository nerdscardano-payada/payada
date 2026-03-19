const BLOCKFROST_API_KEY = Deno.env.get("BLOCKFROST_API_KEY");
const BLOCKFROST_URL = "https://cardano-mainnet.blockfrost.io/api/v0";

function hexToBytes(hex) {
  if (!hex) throw new Error("Empty transaction CBOR");
  return Uint8Array.from(
    hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
  );
}

Deno.serve(async (req) => {
  try {
    const rawBody = await req.json();
    console.log("Incoming payload preview:", JSON.stringify(rawBody)?.slice(0, 80));

    const signedTxCbor =
      rawBody?.signedTxCbor ||
      rawBody?.data?.signedTxCbor ||
      rawBody?.tx ||
      rawBody?.data?.tx;

    if (!signedTxCbor) {
      return Response.json({ error: "Missing signedTxCbor in request payload" }, { status: 400 });
    }

    if (!/^[0-9a-fA-F]+$/.test(signedTxCbor)) {
      return Response.json({ error: "signedTxCbor must be hex encoded string" }, { status: 400 });
    }

    console.log("signedTxCbor preview:", signedTxCbor.slice(0, 20));

    const txBytes = hexToBytes(signedTxCbor);

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
      return Response.json({ error: `Blockfrost: ${text}` }, { status: 400 });
    }

    return Response.json({
      success: true,
      txHash: text.replace(/"/g, "").trim(),
    });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});