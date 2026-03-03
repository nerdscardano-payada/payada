const BLOCKFROST_API_KEY = Deno.env.get("BLOCKFROST_API_KEY");
const BLOCKFROST_URL = "https://cardano-mainnet.blockfrost.io/api/v0";

function hexToBytes(hex) {
  const result = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    result[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return result;
}

Deno.serve(async (req) => {
  try {

    const { signedTxCbor } = await req.json();

    if (!signedTxCbor) {
      return Response.json(
        { error: "Missing signedTxCbor" },
        { status: 400 }
      );
    }

    // Validate hex
    if (!/^[0-9a-fA-F]+$/.test(signedTxCbor)) {
      return Response.json(
        { error: "signedTxCbor must be hex encoded CBOR string" },
        { status: 400 }
      );
    }

    const fullTxBytes = hexToBytes(signedTxCbor);

    const res = await fetch(`${BLOCKFROST_URL}/tx/submit`, {
      method: "POST",
      headers: {
        project_id: BLOCKFROST_API_KEY,
        "Content-Type": "application/cbor",
      },
      body: fullTxBytes,
    });

    const text = await res.text();

    if (!res.ok) {
      return Response.json(
        { error: `Blockfrost submission failed: ${text}` },
        { status: 400 }
      );
    }

    const txHash = text.replace(/"/g, "").trim();

    return Response.json({
      success: true,
      txHash,
    });

  } catch (err) {
    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
});