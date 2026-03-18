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
const KNOWN_CNT_DECIMALS = {
  "0691b2fecca1ac4f53cb6dfb00b7013e561d1f34403b957cbb5af1fa:4e49474854": 6,
  "279c909f348e533da5808898f87f9a14bb2c3dfbbacccd631d927a3:534e454b": 0,
  "29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6:4d494e": 6,
  "533bb94a8850ee3ccbe483106489399112b74c905342cb1792a797a0:494e4459": 6,
  "9a9693a9a37912a5097918f97918d15240c92ab729a0b7c4aa144d77:53554e444145": 6,
  "e5a42a1a1d3d1da71b0449663c32798725888d2eb0843c4dabeca05a:576f726c644d6f62696c65546f6b656e58": 6,
  "804f5544c1962a40546827cab750a88404dc7108c0f588b72964754f:56594649": 6,
  "f43a62fdc3965df486de8a0d32fe800963589c41b38946602a0dc535:41474958": 8,
  "e824c0011176f0926ad51f492bcc63ac6a03a589653520839dc7e3d9:464554": 8,
  "edfd7a1d77bcb8b884c474bdc92a16002d1fb720e454fa6e99344479:4e5458": 6,
  "5d16cc1a177b5d9ba9cfa9793b07e60f1fb70fea1f8aef064415d114:494147": 6,
  "f13ac4d66b3ee19a6aa0f2a22298737bd907cc95121662fc971b5275:535452494b45": 6,
  "5dac8536653edc12f6f5e1045d8164b9f59998d3bdc300fc92843489:4e4d4b52": 6,
  "a0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481ef0:484f534b59": 0,
  "8483844875ce4d61c2aa459240f277d32081ee08fe0ad16899a0f581:0014df10544954414e": 6,
  "da8c30857834c6ae7203935b89278c532b3995245295456f993e1d24:4c51": 6,
};

function getKnownCntDecimals(policyId, assetName, fallback = 0) {
  return KNOWN_CNT_DECIMALS[`${policyId}:${assetName}`] ?? fallback;
}

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
  // Pure hex (no CBOR wrapper) — Cardano address is 29 or 57 bytes = 58 or 114 hex chars
  let hex = addr.toLowerCase();

  // Strip CBOR byte string headers
  if (hex.startsWith('5839') || hex.startsWith('5840') || hex.startsWith('5841') ||
      hex.startsWith('5857') || hex.startsWith('5858') || hex.startsWith('5859') ||
      hex.startsWith('585a') || hex.startsWith('585b') || hex.startsWith('585c')) {
    // 58 xx = 1-byte length → 4 hex chars header
    hex = hex.slice(4);
  } else if (hex.startsWith('59')) {
    // 59 xxxx = 2-byte length → 6 hex chars header
    hex = hex.slice(6);
  } else if (hex.startsWith('58')) {
    // generic 58 xx
    hex = hex.slice(4);
  } else {
    // Try stripping any single-byte CBOR header (4x range)
    const firstByte = parseInt(hex.slice(0, 2), 16);
    const majorType = firstByte >> 5;
    if (majorType === 2) { // byte string
      const addInfo = firstByte & 0x1f;
      if (addInfo <= 23) {
        // length encoded in same byte, strip 1 byte header
        hex = hex.slice(2);
      }
    }
  }

  try {
    const bytes = hexToBytes(hex);
    if (bytes.length < 28) return addr; // too short, not a valid address
    const headerByte = bytes[0];
    const networkId = headerByte & 0x0f;
    const hrp = networkId === 1 ? 'addr' : 'addr_test';
    return encodeBech32(hrp, Array.from(bytes));
  } catch {
    // Return raw hex as-is so we at least have something
    return hex.length >= 56 ? hex : addr;
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
    // Add a small delay to handle near-simultaneous calls (race condition guard)
    const existingPayments = await sr.entities.Payment.filter({ tx_hash: txHash }); 
    if (existingPayments.length > 0) {
      console.log(`[recordWalletPayment] Duplicate detected for txHash=${txHash}, returning existing paymentId=${existingPayments[0].id}`);
      return Response.json({ success: true, paymentId: existingPayments[0].id, duplicate: true });
    }

    // Load payment link or access link to get merchant receive address
    let receiveAddress = null;
    let expectedAmountAda = 0;
    let paymentLink = null;
    let accessLink = null;
    let cntDecimals = 0;
    let cntTicker = null;

    if (paymentLinkId) {
      try {
        paymentLink = await sr.entities.PaymentLink.get(paymentLinkId);
        if (paymentLink) {
          receiveAddress = paymentLink.receive_address;
          expectedAmountAda = paymentLink.amount_ada || 0;
          cntDecimals = getKnownCntDecimals(paymentLink.cnt_policy_id, paymentLink.cnt_asset_name, paymentLink.cnt_decimals || 0);
          cntTicker = paymentLink.cnt_ticker || null;
        }
      } catch { /* not found */ }
    }

    if (!receiveAddress && accessLinkId) {
      try {
        accessLink = await sr.entities.CommunityAccessLink.get(accessLinkId);
        if (accessLink) {
          receiveAddress = accessLink.receive_address;
          expectedAmountAda = accessLink.price_ada || 0;
          cntDecimals = getKnownCntDecimals(accessLink.cnt_policy_id, accessLink.cnt_asset_name, accessLink.cnt_decimals || 0);
          cntTicker = accessLink.cnt_ticker || null;
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
    let cntPolicyId = null;
    let cntAssetName = null;
    let cntMerchantAmount = 0;
    let cntFeeAmount = 0;

    outputs.forEach(output => {
      if (receiveAddress && output.address === receiveAddress) {
        output.amount.forEach(a => {
          if (a.unit === 'lovelace') merchantLovelace += parseInt(a.quantity);
          else {
            // CNT payment detected
            const policyId = a.unit.slice(0, 56);
            const assetName = a.unit.slice(56);
            cntPolicyId = policyId;
            cntAssetName = assetName;
            cntMerchantAmount += parseInt(a.quantity);
          }
        });
      }
      if (PAYADA_FEE_WALLET && output.address === PAYADA_FEE_WALLET) {
        output.amount.forEach(a => {
          if (a.unit === 'lovelace') feeLovelace += parseInt(a.quantity);
          else {
            const policyId = a.unit.slice(0, 56);
            const assetName = a.unit.slice(56);
            if (!cntPolicyId) {
              cntPolicyId = policyId;
              cntAssetName = assetName;
            }
            cntFeeAmount += parseInt(a.quantity);
          }
        });
      }
    });

    // If we couldn't match merchant output by address, sum all non-fee outputs
    if (merchantLovelace === 0 && !receiveAddress) {
      outputs.forEach(output => {
        if (!PAYADA_FEE_WALLET || output.address !== PAYADA_FEE_WALLET) {
          output.amount.forEach(a => {
            if (a.unit === 'lovelace') merchantLovelace += parseInt(a.quantity);
            else {
              const policyId = a.unit.slice(0, 56);
              const assetName = a.unit.slice(56);
              cntPolicyId = policyId;
              cntAssetName = assetName;
              cntMerchantAmount += parseInt(a.quantity);
            }
          });
        }
      });
    }

    const merchantAmountAda = merchantLovelace / 1_000_000;
    const feeAmountAda = feeLovelace / 1_000_000;
    const receivedAmountAda = merchantAmountAda + feeAmountAda; // Total amount = merchant + fee
    const feeOutputValidated = PAYADA_FEE_WALLET ? feeLovelace > 0 : false;

    // Create Payment record
    const isCntPayment = cntPolicyId && cntAssetName && cntMerchantAmount > 0;
    console.log(`[recordWalletPayment] Creating payment: merchantLovelace=${merchantLovelace}, feeLovelace=${feeLovelace}, cntPayment=${isCntPayment}, cntAmount=${cntMerchantAmount}`);
    const normalizedAddress = normalizeAddress(payerAddress) || payerAddress || null;
    console.log(`[recordWalletPayment] Payer address: raw=${payerAddress}, normalized=${normalizedAddress}`);

    const paymentData = {
    merchant_id: merchantId,
    payment_link_id: paymentLinkId || null,
    access_link_id: accessLinkId || null,
    status: 'detected',
    payment_type: isCntPayment ? 'cnt' : 'ada',
    expected_amount_ada: expectedAmountAda,
    received_amount_ada: merchantAmountAda,
    tx_hash: txHash,
    payer_address: normalizedAddress,
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
    merchant_output_validated: isCntPayment ? cntMerchantAmount > 0 : merchantLovelace > 0,
    fee_output_validated: feeOutputValidated,
    fee_amount_ada: feeAmountAda,
    merchant_amount_ada: merchantAmountAda
    };

    if (isCntPayment) {
     const divisor = Math.pow(10, cntDecimals);
     paymentData.cnt_policy_id = cntPolicyId;
     paymentData.cnt_asset_name = cntAssetName;
     paymentData.cnt_ticker = cntTicker;
     paymentData.cnt_decimals = cntDecimals;
     paymentData.expected_amount_cnt = paymentLink?.cnt_amount || accessLink?.cnt_amount || null;
     paymentData.received_amount_cnt = cntMerchantAmount / divisor;
     paymentData.cnt_fees = cntFeeAmount > 0 ? [{
       policy_id: cntPolicyId,
       asset_name: cntAssetName,
       ticker: cntTicker,
       decimals: cntDecimals,
       amount: cntFeeAmount / divisor
     }] : null;
    }

    const payment = await sr.entities.Payment.create(paymentData);
    console.log(`[recordWalletPayment] Payment created: id=${payment.id}`);

    // Update PaymentLink stats (regular payment link)
    if (paymentLink) {
      const update = {
        payment_count: (paymentLink.payment_count || 0) + 1
      };
      if (isCntPayment) {
        const divisor = Math.pow(10, cntDecimals);
        update.total_received_cnt = (paymentLink.total_received_cnt || 0) + (cntMerchantAmount / divisor);
      } else {
        update.total_received_ada = (paymentLink.total_received_ada || 0) + receivedAmountAda;
      }
      await sr.entities.PaymentLink.update(paymentLink.id, update);
    }

    // Update CommunityAccessLink stats
    if (accessLink) {
      await sr.entities.CommunityAccessLink.update(accessLink.id, {
        total_received_ada: (accessLink.total_received_ada || 0) + receivedAmountAda,
        payment_count: (accessLink.payment_count || 0) + 1
      });
    }

    // Upsert Customer record (identified by wallet address or email)
    const normalizedWallet = normalizeAddress(payerAddress) || null;
    const customerIdentifier = payerEmail || normalizedWallet;
    if (customerIdentifier) {
      const filterKey = payerEmail
        ? { merchant_id: merchantId, email: payerEmail }
        : { merchant_id: merchantId, wallet_address: normalizedWallet };
      const existingCustomers = await sr.entities.Customer.filter(filterKey);
      if (existingCustomers.length > 0) {
        const existing = existingCustomers[0];
        const updateData = {
          total_paid_ada: isCntPayment ? (existing.total_paid_ada || 0) : (existing.total_paid_ada || 0) + receivedAmountAda,
          payment_count: (existing.payment_count || 0) + 1,
          wallet_address: normalizedWallet || existing.wallet_address,
          name: payerName || existing.name,
        };
        if (payerEmail) updateData.email = payerEmail;
        await sr.entities.Customer.update(existing.id, updateData);
      } else {
        const newCustomer = {
          merchant_id: merchantId,
          name: payerName || "Anonymous",
          wallet_address: normalizedWallet || null,
          total_paid_ada: isCntPayment ? 0 : receivedAmountAda,
          payment_count: 1,
          has_active_subscription: false,
        };
        // Only set email if provided — avoids ValidationError on null email
        if (payerEmail) newCustomer.email = payerEmail;
        await sr.entities.Customer.create(newCustomer);
      }
    }

    console.log(`[recordWalletPayment] SUCCESS: Payment recorded and returned`);
    return Response.json({ success: true, paymentId: payment.id, receivedAmountAda, feeAmountAda, feeOutputValidated });
  } catch (error) {
    console.log(`[recordWalletPayment] ERROR: ${error.message}`);
    return Response.json({ error: error.message }, { status: 500 });
  }
});