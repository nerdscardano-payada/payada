import { createClientFromRequest } from 'npm:@base44/sdk';

const BLOCKFROST_API_KEY = Deno.env.get("BLOCKFROST_API_KEY");
const BLOCKFROST_URL = "https://cardano-mainnet.blockfrost.io/api/v0";

async function fetchTxUtxos(txHash) {
  const res = await fetch(`${BLOCKFROST_URL}/txs/${txHash}/utxos`, {
    headers: { project_id: BLOCKFROST_API_KEY }
  });
  if (!res.ok) throw new Error(`Blockfrost UTXOs error: ${res.statusText}`);
  return res.json();
}

async function fetchTxInfo(txHash) {
  const res = await fetch(`${BLOCKFROST_URL}/txs/${txHash}`, {
    headers: { project_id: BLOCKFROST_API_KEY }
  });
  if (!res.ok) throw new Error(`Blockfrost TX error: ${res.statusText}`);
  return res.json();
}

const PAYADA_FEE_WALLET = Deno.env.get("PAYADA_FEE_WALLET");
const PLATFORM_FEE_PERCENT = 1.75;

const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

function hexToBytes(hex) {
  const result = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) result[i / 2] = parseInt(hex.substr(i, 2), 16);
  return result;
}

function encodeBech32(hrp, data) {
  function polymod(values) {
    const GEN = [0x3b6a57b2n, 0x26508e6dn, 0x1ea119fan, 0x3d4233ddn, 0x2a1462b3n];
    let chk = 1n;
    for (const v of values) {
      const b = chk >> 25n;
      chk = ((chk & 0x1ffffffn) << 5n) ^ BigInt(v);
      for (let i = 0; i < 5; i++) { if ((b >> BigInt(i)) & 1n) chk ^= GEN[i]; }
    }
    return chk;
  }
  function hrpExpand(hrp) {
    const ret = [];
    for (const c of hrp) ret.push(c.charCodeAt(0) >> 5);
    ret.push(0);
    for (const c of hrp) ret.push(c.charCodeAt(0) & 31);
    return ret;
  }
  function convertBits(data, fromBits, toBits, pad) {
    let acc = 0, bits = 0;
    const result = [];
    const maxv = (1 << toBits) - 1;
    for (const value of data) { acc = (acc << fromBits) | value; bits += fromBits; while (bits >= toBits) { bits -= toBits; result.push((acc >> bits) & maxv); } }
    if (pad && bits > 0) result.push((acc << (toBits - bits)) & maxv);
    return result;
  }
  const words = convertBits(data, 8, 5, true);
  const combined = [...hrpExpand(hrp), ...words, 0, 0, 0, 0, 0, 0];
  const chk = polymod(combined) ^ 1n;
  const checksum = [];
  for (let i = 5; i >= 0; i--) checksum.push(Number((chk >> BigInt(i * 5)) & 31n));
  return hrp + '1' + [...words, ...checksum].map(v => CHARSET[v]).join('');
}

function normalizeAddress(addr) {
  if (!addr) return null;
  // Already bech32
  if (addr.startsWith('addr') || addr.startsWith('stake')) return addr;
  // Hex CBOR from CIP-30 getChangeAddress — strip leading 5820/5839 CBOR header if present
  let hex = addr;
  if (hex.startsWith('5820') || hex.startsWith('5839') || hex.startsWith('581c') || hex.startsWith('581d') || hex.startsWith('581e')) {
    // CBOR byte string: first 2 bytes = type+length, rest = actual address bytes
    hex = hex.slice(4);
  }
  try {
    return encodeBech32('addr', Array.from(hexToBytes(hex)));
  } catch {
    return addr; // fallback to original
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { txHash, paymentLinkId, merchantId, payerAddress, payerEmail, payerName } = await req.json();

    if (!txHash || !paymentLinkId || !merchantId) {
      return Response.json({ error: 'Missing required fields: txHash, paymentLinkId, merchantId' }, { status: 400 });
    }

    const sr = base44.asServiceRole;

    const paymentLinks = await sr.entities.PaymentLink.filter({ id: paymentLinkId, merchant_id: merchantId });
    const paymentLink = paymentLinks[0];
    if (!paymentLink) return Response.json({ error: 'Payment link not found' }, { status: 404 });

    // Avoid duplicate payment records for same tx
    const existingPayments = await sr.entities.Payment.filter({ tx_hash: txHash }); 
    if (existingPayments.length > 0) {
      return Response.json({ success: true, paymentId: existingPayments[0].id, duplicate: true });
    }

    // Fetch blockchain data
    const [txInfo, utxos] = await Promise.all([fetchTxInfo(txHash), fetchTxUtxos(txHash)]);
    const outputs = utxos.outputs || [];

    // Calculate amounts from outputs
    let merchantLovelace = 0;
    let feeLovelace = 0;
    outputs.forEach(output => {
      if (output.address === paymentLink.receive_address) {
        output.amount.forEach(a => {
          if (a.unit === 'lovelace') merchantLovelace += parseInt(a.quantity);
        });
      }
      if (PAYADA_FEE_WALLET && output.address === PAYADA_FEE_WALLET) {
        output.amount.forEach(a => {
          if (a.unit === 'lovelace') feeLovelace += parseInt(a.quantity);
        });
      }
    });

    const receivedAmountAda = merchantLovelace / 1_000_000;
    const feeAmountAda = feeLovelace / 1_000_000;
    const expectedAmountAda = paymentLink.amount_ada || 0;
    const feeOutputValidated = PAYADA_FEE_WALLET ? feeLovelace > 0 : false;

    // Create Payment record
    const payment = await sr.entities.Payment.create({
      merchant_id: merchantId,
      payment_link_id: paymentLinkId,
      status: 'detected',
      expected_amount_ada: expectedAmountAda,
      received_amount_ada: receivedAmountAda,
      tx_hash: txHash,
      payer_address: normalizeAddress(payerAddress) || null,
      payer_email: payerEmail || null,
      payer_name: payerName || null,
      block_height_detected: txInfo.block_height,
      confirmations: 0,
      detected_at: new Date().toISOString(),
      merchant_output_validated: merchantLovelace > 0,
      fee_output_validated: feeOutputValidated,
      fee_amount_ada: feeAmountAda,
      merchant_amount_ada: receivedAmountAda
    });

    // Update PaymentLink stats
    await sr.entities.PaymentLink.update(paymentLinkId, {
      total_received_ada: (paymentLink.total_received_ada || 0) + receivedAmountAda,
      payment_count: (paymentLink.payment_count || 0) + 1
    });

    return Response.json({ success: true, paymentId: payment.id, receivedAmountAda, feeAmountAda, feeOutputValidated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});