import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const BLOCKFROST_API_KEY = Deno.env.get("BLOCKFROST_API_KEY");
const BLOCKFROST_URL = "https://cardano-mainnet.blockfrost.io/api/v0";

Deno.serve(async (req) => {
  try {
    const { signedTxCbor } = await req.json();

    if (!signedTxCbor) {
      return Response.json({ error: 'Missing signedTxCbor' }, { status: 400 });
    }

    // Convert hex CBOR to binary
    const bytes = new Uint8Array(signedTxCbor.match(/.{1,2}/g).map(b => parseInt(b, 16)));

    const res = await fetch(`${BLOCKFROST_URL}/tx/submit`, {
      method: 'POST',
      headers: {
        'project_id': BLOCKFROST_API_KEY,
        'Content-Type': 'application/cbor',
      },
      body: bytes,
    });

    const text = await res.text();

    if (!res.ok) {
      return Response.json({ error: `Blockfrost submission failed: ${text}` }, { status: 400 });
    }

    // Blockfrost returns the tx hash as a quoted string
    const txHash = text.replace(/"/g, '').trim();
    return Response.json({ success: true, txHash });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});