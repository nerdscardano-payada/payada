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

    // Import CSL (Cardano Serialization Library) for Deno
    const CSL = await import("npm:@emurgo/cardano-serialization-lib-nodejs@14.1.0");

    // Convert hex CBOR address to bech32 if needed (CIP-30 wallets return hex)
    const toBech32 = (addr) => {
      if (!addr) return addr;
      if (addr.startsWith("addr") || addr.startsWith("stake")) return addr; // already bech32
      try {
        return CSL.Address.from_bytes(Buffer.from(addr, 'hex')).to_bech32();
      } catch {
        return addr; // return as-is if conversion fails
      }
    };

    const walletBech32 = toBech32(walletAddress);
    const merchantBech32 = toBech32(merchantAddress);

    // Fetch UTxOs for the wallet (use bech32 for Blockfrost)
    const utxos = await blockfrost(`/addresses/${walletBech32}/utxos`);
    if (!utxos || utxos.length === 0) {
      return Response.json({ error: 'No UTxOs found for wallet address.' }, { status: 400 });
    }

    // Get protocol params and latest block
    const [latestEpoch, latestBlock] = await Promise.all([
      blockfrost('/epochs/latest'),
      blockfrost('/blocks/latest'),
    ]);
    const protocolParams = await blockfrost(`/epochs/${latestEpoch.epoch}/parameters`);
    const ttl = latestBlock.slot + 7200;

    // Build outputs
    const merchantLov = BigInt(merchantLovelace);
    const feeLov = platformFeeLovelace && PAYADA_FEE_WALLET ? BigInt(platformFeeLovelace) : 0n;
    const totalOutput = merchantLov + feeLov;

    // Coin selection
    const minFee = 200000n;
    let selectedUtxos = [];
    let selectedTotal = 0n;

    for (const utxo of utxos) {
      const adaAmount = utxo.amount.find(a => a.unit === 'lovelace');
      if (!adaAmount) continue;
      selectedUtxos.push(utxo);
      selectedTotal += BigInt(adaAmount.quantity);
      if (selectedTotal >= totalOutput + minFee) break;
    }

    if (selectedTotal < totalOutput + minFee) {
      return Response.json({
        error: `Insufficient balance. Need ₳ ${Number(totalOutput + minFee) / 1_000_000}, have ₳ ${Number(selectedTotal) / 1_000_000}`
      }, { status: 400 });
    }

    const changeLovelace = selectedTotal - totalOutput - minFee;

    // Build transaction with CSL
    const txBuilder = CSL.TransactionBuilder.new(
      CSL.TransactionBuilderConfigBuilder.new()
        .fee_algo(CSL.LinearFee.new(
          CSL.BigNum.from_str(String(protocolParams.min_fee_a)),
          CSL.BigNum.from_str(String(protocolParams.min_fee_b))
        ))
        .pool_deposit(CSL.BigNum.from_str(String(protocolParams.pool_deposit)))
        .key_deposit(CSL.BigNum.from_str(String(protocolParams.key_deposit)))
        .max_value_size(protocolParams.max_val_size || 5000)
        .max_tx_size(protocolParams.max_tx_size || 16384)
        .coins_per_utxo_byte(CSL.BigNum.from_str(String(protocolParams.coins_per_utxo_size || protocolParams.coins_per_utxo_word || 4310)))
        .build()
    );

    // Add inputs
    for (const utxo of selectedUtxos) {
      const txInput = CSL.TransactionInput.new(
        CSL.TransactionHash.from_bytes(Buffer.from(utxo.tx_hash, 'hex')),
        utxo.tx_index
      );
      const adaAmt = utxo.amount.find(a => a.unit === 'lovelace');
      const value = CSL.Value.new(CSL.BigNum.from_str(adaAmt.quantity));
      txBuilder.add_input(
        CSL.Address.from_bech32(walletAddress),
        txInput,
        value
      );
    }

    // Add merchant output
    txBuilder.add_output(
      CSL.TransactionOutput.new(
        CSL.Address.from_bech32(merchantAddress),
        CSL.Value.new(CSL.BigNum.from_str(String(merchantLov)))
      )
    );

    // Add fee output
    if (feeLov > 0n && PAYADA_FEE_WALLET) {
      txBuilder.add_output(
        CSL.TransactionOutput.new(
          CSL.Address.from_bech32(PAYADA_FEE_WALLET),
          CSL.Value.new(CSL.BigNum.from_str(String(feeLov)))
        )
      );
    }

    // Add change output
    if (changeLovelace > 0n) {
      txBuilder.add_output(
        CSL.TransactionOutput.new(
          CSL.Address.from_bech32(walletAddress),
          CSL.Value.new(CSL.BigNum.from_str(String(changeLovelace)))
        )
      );
    }

    txBuilder.set_ttl_bignum(CSL.BigNum.from_str(String(ttl)));

    const txBody = txBuilder.build();
    const witnessSet = CSL.TransactionWitnessSet.new();
    const tx = CSL.Transaction.new(txBody, witnessSet);
    const txCbor = Buffer.from(tx.to_bytes()).toString('hex');

    return Response.json({ success: true, txCbor });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});