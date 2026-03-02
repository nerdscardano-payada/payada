import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const BLOCKFROST_API_KEY = Deno.env.get("BLOCKFROST_API_KEY");
const BLOCKFROST_URL = "https://cardano-mainnet.blockfrost.io/api/v0";

Deno.serve(async (req) => {
  try {
    const { txHash } = await req.json();
    if (!txHash) {
      return Response.json({ error: 'Missing txHash' }, { status: 400 });
    }

    // Fetch tx info from Blockfrost
    const txRes = await fetch(`${BLOCKFROST_URL}/txs/${txHash}`, {
      headers: { "project_id": BLOCKFROST_API_KEY }
    });

    if (txRes.status === 404) {
      // Not yet on-chain
      return Response.json({ confirmed: false, confirmations: 0 });
    }

    if (!txRes.ok) {
      return Response.json({ confirmed: false, error: 'Blockfrost error' });
    }

    const tx = await txRes.json();

    // Get latest block for confirmation count
    const blockRes = await fetch(`${BLOCKFROST_URL}/blocks/latest`, {
      headers: { "project_id": BLOCKFROST_API_KEY }
    });
    const latestBlock = await blockRes.json();

    const confirmations = latestBlock.height - tx.block_height;
    const confirmed = confirmations >= 2;

    return Response.json({
      confirmed,
      confirmations,
      blockHeight: tx.block_height,
      txHash
    });

  } catch (error) {
    return Response.json({ error: error.message, confirmed: false }, { status: 500 });
  }
});