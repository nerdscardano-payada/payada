import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';
import * as CSL from 'npm:@emurgo/cardano-serialization-lib-nodejs@11.5.0';

const BLOCKFROST_API_KEY = Deno.env.get('BLOCKFROST_API_KEY');
const BLOCKFROST_URL = 'https://cardano-mainnet.blockfrost.io/api/v0';

function hexToBytes(hex) {
  const result = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) result[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  return result;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { transfer_log_id, tx_cbor, witness_set_cbor } = await req.json();
    if (!transfer_log_id || !tx_cbor || !witness_set_cbor) {
      return Response.json({ error: 'transfer_log_id, tx_cbor and witness_set_cbor are required' }, { status: 400 });
    }

    const sr = base44.asServiceRole;
    const logs = await sr.entities.NftTransferLog.filter({ id: transfer_log_id }, '-created_date', 1);
    const log = logs[0];
    if (!log) return Response.json({ error: 'Transfer log not found' }, { status: 404 });
    if (user.role !== 'admin' && user.email !== log.merchant_id) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const unsignedTx = CSL.Transaction.from_bytes(hexToBytes(tx_cbor));
    const witnessSet = CSL.TransactionWitnessSet.from_bytes(hexToBytes(witness_set_cbor));
    const signedTx = CSL.Transaction.new(unsignedTx.body(), witnessSet, unsignedTx.auxiliary_data());

    const response = await fetch(`${BLOCKFROST_URL}/tx/submit`, {
      method: 'POST',
      headers: {
        project_id: BLOCKFROST_API_KEY,
        'Content-Type': 'application/cbor',
      },
      body: signedTx.to_bytes(),
    });

    const text = await response.text();
    if (!response.ok) {
      return Response.json({ error: `Blockfrost submit failed: ${text}` }, { status: 400 });
    }

    const txHash = text.replace(/"/g, '').trim();
    await sr.entities.NftTransferLog.update(log.id, {
      status: 'submitted',
      tx_hash: txHash,
      submitted_at: new Date().toISOString(),
      error_message: null,
    });

    const signerWallets = await sr.entities.MerchantSignerWallet.filter({ merchant_id: log.merchant_id, status: 'active' }, '-updated_date', 1);
    if (signerWallets[0]) {
      await sr.entities.MerchantSignerWallet.update(signerWallets[0].id, { last_verified_at: new Date().toISOString() });
    }

    return Response.json({ success: true, txHash });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});