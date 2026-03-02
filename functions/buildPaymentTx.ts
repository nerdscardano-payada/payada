import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Build a Cardano transaction CBOR using Blockfrost for UTxO fetching
// and a lightweight tx builder — returns unsigned CBOR for wallet signing

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

    // Fetch UTxOs for the wallet address from Blockfrost
    const utxos = await blockfrost(`/addresses/${walletAddress}/utxos`);
    if (!utxos || utxos.length === 0) {
      return Response.json({ error: 'No UTxOs found for wallet address. Please fund your wallet.' }, { status: 400 });
    }

    // Get protocol params for fee calculation
    const latestEpoch = await blockfrost('/epochs/latest');
    const protocolParams = await blockfrost(`/epochs/${latestEpoch.epoch}/parameters`);

    // Get latest block for TTL
    const latestBlock = await blockfrost('/blocks/latest');
    const ttl = latestBlock.slot + 7200; // ~2 hours

    // Build outputs
    const outputs = [
      { address: merchantAddress, lovelace: BigInt(merchantLovelace) }
    ];
    if (PAYADA_FEE_WALLET && platformFeeLovelace && BigInt(platformFeeLovelace) > 0n) {
      outputs.push({ address: PAYADA_FEE_WALLET, lovelace: BigInt(platformFeeLovelace) });
    }

    const totalOutputLovelace = outputs.reduce((sum, o) => sum + o.lovelace, 0n);

    // Simple coin selection: pick UTxOs until we have enough
    const minFeeEstimate = 200000n; // 0.2 ADA generous estimate
    const needed = totalOutputLovelace + minFeeEstimate;

    let selectedUtxos = [];
    let selectedTotal = 0n;
    for (const utxo of utxos) {
      const adaAmount = utxo.amount.find(a => a.unit === 'lovelace');
      if (!adaAmount) continue;
      // Only select pure ADA UTxOs to keep it simple
      if (utxo.amount.length > 1) continue;
      selectedUtxos.push(utxo);
      selectedTotal += BigInt(adaAmount.quantity);
      if (selectedTotal >= needed) break;
    }

    if (selectedTotal < needed) {
      // Try including multi-asset UTxOs as well
      selectedUtxos = [];
      selectedTotal = 0n;
      for (const utxo of utxos) {
        const adaAmount = utxo.amount.find(a => a.unit === 'lovelace');
        if (!adaAmount) continue;
        selectedUtxos.push(utxo);
        selectedTotal += BigInt(adaAmount.quantity);
        if (selectedTotal >= needed) break;
      }
    }

    if (selectedTotal < needed) {
      return Response.json({ 
        error: `Insufficient balance. Need ₳ ${Number(needed) / 1_000_000}, have ₳ ${Number(selectedTotal) / 1_000_000}` 
      }, { status: 400 });
    }

    // Return the data needed for the wallet to build the tx
    // We return structured data; the wallet will use its own builder
    const changeLovelace = selectedTotal - totalOutputLovelace - minFeeEstimate;

    return Response.json({
      success: true,
      inputs: selectedUtxos.map(u => ({ txHash: u.tx_hash, index: u.tx_index })),
      outputs: outputs.map(o => ({ address: o.address, lovelace: String(o.lovelace) })),
      changeAddress: walletAddress,
      changeLovelace: String(changeLovelace > 0n ? changeLovelace : 0n),
      ttl,
      feeWallet: PAYADA_FEE_WALLET,
      protocolParams: {
        minFeeA: protocolParams.min_fee_a,
        minFeeB: protocolParams.min_fee_b,
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});