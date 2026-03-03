import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Build a real unsigned Cardano transaction CBOR using @emurgo/cardano-serialization-lib-nodejs
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

Deno.serve(async (req) => {
  try {
    const { walletAddress, merchantAddress, merchantLovelace, platformFeeLovelace } = await req.json();

    if (!walletAddress || !merchantAddress || !merchantLovelace) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Use lucid-cardano which works without WASM/eval in Deno
    const { Lucid, Blockfrost: BlockfrostProvider } = await import("npm:lucid-cardano@0.10.7");

    // Convert hex CBOR address to bech32 if needed (CIP-30 wallets return hex)
    const hexToAddr = (addr) => {
      if (!addr || addr.startsWith("addr") || addr.startsWith("stake")) return addr;
      // Decode hex address bytes to bech32 using Lucid utils
      return addr; // Lucid handles hex addresses natively
    };

    const senderAddr = hexToAddr(walletAddress);
    const recipientAddr = hexToAddr(merchantAddress);

    // Initialize Lucid with Blockfrost
    const lucid = await Lucid.new(
      new BlockfrostProvider(`https://cardano-mainnet.blockfrost.io/api/v0`, BLOCKFROST_API_KEY),
      "Mainnet"
    );

    // Select wallet from address so Lucid can fetch UTxOs
    lucid.selectWalletFrom({ address: senderAddr });

    const merchantLov = BigInt(merchantLovelace);
    const feeLov = platformFeeLovelace && PAYADA_FEE_WALLET ? BigInt(platformFeeLovelace) : 0n;

    // Build transaction
    let tx = lucid.newTx().payToAddress(recipientAddr, { lovelace: merchantLov });

    if (feeLov > 0n && PAYADA_FEE_WALLET) {
      tx = tx.payToAddress(PAYADA_FEE_WALLET, { lovelace: feeLov });
    }

    const builtTx = await tx.complete();
    const txCbor = builtTx.toString();

    return Response.json({ success: true, txCbor });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});