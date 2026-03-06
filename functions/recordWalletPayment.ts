import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const BLOCKFROST_API_KEY = Deno.env.get("BLOCKFROST_API_KEY");
const BLOCKFROST_URL = "https://cardano-mainnet.blockfrost.io/api/v0";

async function fetchWithRetry(url, retries = 5, delayMs = 4000) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, { headers: { project_id: BLOCKFROST_API_KEY } });
    if (res.ok) return res.json();
    if (res.status === 404 && i < retries - 1) {
      // TX not yet indexed, wait and retry
      await new Promise(r => setTimeout(r, delayMs));
      continue;
    }
    throw new Error(`Blockfrost error ${res.status}: ${res.statusText}`);
  }
  throw new Error('TX not found on Blockfrost after retries');
}

async function fetchTxUtxos(txHash) {
  return fetchWithRetry(`${BLOCKFROST_URL}/txs/${txHash}/utxos`);
}

async function fetchTxInfo(txHash) {
  return fetchWithRetry(`${BLOCKFROST_URL}/txs/${txHash}`);
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
  // Hex CBOR from CIP-30 getChangeAddress
  let hex = addr.toLowerCase();
  // Strip CBOR byte string header: 58xx or 59xxxx
  if (hex.startsWith('58')) {
    // 58 + 1 byte length = 4 hex chars header
    hex = hex.slice(4);
  } else if (hex.startsWith('59')) {
    // 59 + 2 byte length = 6 hex chars header
    hex = hex.slice(6);
  } else if (hex.startsWith('4') || hex.startsWith('5')) {
    // Short form: 4x where x encodes length in same byte
    hex = hex.slice(2);
  }
  try {
    const bytes = hexToBytes(hex);
    // Determine HRP from header byte
    const headerByte = bytes[0];
    const networkId = headerByte & 0x0f;
    const hrp = networkId === 1 ? 'addr' : 'addr_test';
    return encodeBech32(hrp, Array.from(bytes));
  } catch {
    return addr; // fallback to original
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { txHash, paymentLinkId, merchantId, payerAddress, payerEmail, payerName, payerDiscordUsername, shippingStreet, shippingCity, shippingPostalCode, shippingCountry, accessLinkId } = await req.json();

    console.log(`[recordWalletPayment] txHash=${txHash}, merchantId=${merchantId}, accessLinkId=${accessLinkId}`);

    if (!txHash || !merchantId) {
      return Response.json({ error: 'Missing required fields: txHash, merchantId' }, { status: 400 });
    }

    // Always use service role — this endpoint is called from public pages (no user session)
    const sr = base44.asServiceRole;
    console.log('[recordWalletPayment] Service role client initialized');

    // Avoid duplicate payment records for same tx
    const existingPayments = await sr.entities.Payment.filter({ tx_hash: txHash }); 
    if (existingPayments.length > 0) {
      return Response.json({ success: true, paymentId: existingPayments[0].id, duplicate: true });
    }

    // Load payment link or access link to get merchant receive address
    let receiveAddress = null;
    let expectedAmountAda = 0;
    let paymentLink = null;
    let accessLink = null;

    if (paymentLinkId) {
      try {
        paymentLink = await sr.entities.PaymentLink.get(paymentLinkId);
        if (paymentLink) {
          receiveAddress = paymentLink.receive_address;
          expectedAmountAda = paymentLink.amount_ada || 0;
        }
      } catch { /* not found */ }
    }

    if (!receiveAddress && accessLinkId) {
      try {
        accessLink = await sr.entities.CommunityAccessLink.get(accessLinkId);
        if (accessLink) {
          receiveAddress = accessLink.receive_address;
          expectedAmountAda = accessLink.price_ada || 0;
          if (!receiveAddress) {
            const profiles = await sr.entities.MerchantProfile.filter({ user_id: merchantId });
            receiveAddress = profiles[0]?.default_receive_address;
          }
        }
      } catch { /* not found */ }
    }

    // Fetch blockchain data
    console.log(`[recordWalletPayment] Fetching blockchain data for txHash=${txHash}`);
    const [txInfo, utxos] = await Promise.all([fetchTxInfo(txHash), fetchTxUtxos(txHash)]);
    const outputs = utxos.outputs || [];
    console.log(`[recordWalletPayment] TX confirmed at block ${txInfo.block_height}, found ${outputs.length} outputs`);

    // Calculate amounts from outputs
    let merchantLovelace = 0;
    let feeLovelace = 0;
    outputs.forEach(output => {
      if (receiveAddress && output.address === receiveAddress) {
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

    // If we couldn't match merchant output by address, sum all non-fee outputs
    if (merchantLovelace === 0 && !receiveAddress) {
      outputs.forEach(output => {
        if (!PAYADA_FEE_WALLET || output.address !== PAYADA_FEE_WALLET) {
          output.amount.forEach(a => {
            if (a.unit === 'lovelace') merchantLovelace += parseInt(a.quantity);
          });
        }
      });
    }

    const receivedAmountAda = merchantLovelace / 1_000_000;
    const feeAmountAda = feeLovelace / 1_000_000;
    const feeOutputValidated = PAYADA_FEE_WALLET ? feeLovelace > 0 : false;

    // Create Payment record
    console.log(`[recordWalletPayment] Creating payment: merchantLovelace=${merchantLovelace}, receivedAda=${receivedAmountAda}`);
    const payment = await sr.entities.Payment.create({
     merchant_id: merchantId,
     payment_link_id: paymentLinkId || null,
     status: 'detected',
     expected_amount_ada: expectedAmountAda,
     received_amount_ada: receivedAmountAda,
     tx_hash: txHash,
     payer_address: normalizeAddress(payerAddress) || null,
     payer_email: payerEmail || null,
     payer_name: payerName || null,
     payer_discord_username: payerDiscordUsername || null,
     shipping_street: shippingStreet || null,
     shipping_city: shippingCity || null,
     shipping_postal_code: shippingPostalCode || null,
     shipping_country: shippingCountry || null,
     block_height_detected: txInfo.block_height,
     confirmations: 0,
     detected_at: new Date().toISOString(),
     merchant_output_validated: merchantLovelace > 0,
     fee_output_validated: feeOutputValidated,
     fee_amount_ada: feeAmountAda,
     merchant_amount_ada: receivedAmountAda
    });
    console.log(`[recordWalletPayment] Payment created: id=${payment.id}`);

    // Update PaymentLink stats (regular payment link)
    if (paymentLink) {
      await sr.entities.PaymentLink.update(paymentLink.id, {
        total_received_ada: (paymentLink.total_received_ada || 0) + receivedAmountAda,
        payment_count: (paymentLink.payment_count || 0) + 1
      });
    }

    // Update CommunityAccessLink stats
    if (accessLink) {
      await sr.entities.CommunityAccessLink.update(accessLink.id, {
        total_received_ada: (accessLink.total_received_ada || 0) + receivedAmountAda,
        payment_count: (accessLink.payment_count || 0) + 1
      });
    }

    // Upsert Customer record (identified by wallet address or email)
    const customerIdentifier = payerEmail || normalizeAddress(payerAddress);
    if (customerIdentifier) {
      const filterKey = payerEmail ? { merchant_id: merchantId, email: payerEmail } : { merchant_id: merchantId, wallet_address: normalizeAddress(payerAddress) };
      const existingCustomers = await sr.entities.Customer.filter(filterKey);
      if (existingCustomers.length > 0) {
        const existing = existingCustomers[0];
        await sr.entities.Customer.update(existing.id, {
          total_paid_ada: (existing.total_paid_ada || 0) + receivedAmountAda,
          payment_count: (existing.payment_count || 0) + 1,
          wallet_address: normalizeAddress(payerAddress) || existing.wallet_address,
          name: payerName || existing.name,
        });
      } else {
        await sr.entities.Customer.create({
          merchant_id: merchantId,
          email: payerEmail || null,
          name: payerName || "Anonymous",
          wallet_address: normalizeAddress(payerAddress) || null,
          total_paid_ada: receivedAmountAda,
          payment_count: 1,
          has_active_subscription: false,
        });
      }
    }

    console.log(`[recordWalletPayment] SUCCESS: Payment recorded and returned`);
    return Response.json({ success: true, paymentId: payment.id, receivedAmountAda, feeAmountAda, feeOutputValidated });
  } catch (error) {
    console.log(`[recordWalletPayment] ERROR: ${error.message}`);
    return Response.json({ error: error.message }, { status: 500 });
  }
});