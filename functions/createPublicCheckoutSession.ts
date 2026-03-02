import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const PLATFORM_FEE_PERCENT = 1.75;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { paymentLinkId } = await req.json();

    if (!paymentLinkId) {
      return Response.json({ error: 'Missing paymentLinkId' }, { status: 400 });
    }

    // Use service role — no user auth needed (public checkout)
    const links = await base44.asServiceRole.entities.PaymentLink.filter({ id: paymentLinkId, status: 'active' });
    if (links.length === 0) return Response.json({ error: 'Payment link not found' }, { status: 404 });
    const paymentLink = links[0];

    const profiles = await base44.asServiceRole.entities.MerchantProfile.filter({ user_id: paymentLink.merchant_id });
    if (profiles.length === 0) return Response.json({ error: 'Merchant profile not found' }, { status: 404 });
    const merchant = profiles[0];

    if (merchant.status !== 'active') {
      return Response.json({ error: 'Merchant account is not active' }, { status: 403 });
    }

    const feePercent = (merchant.platform_fee_percent || PLATFORM_FEE_PERCENT) / 100;

    let amountLovelace = 0;
    if (paymentLink.amount_mode === 'fixed_ada') {
      amountLovelace = Math.floor((paymentLink.amount_ada || 0) * 1_000_000);
    } else {
      const adaToEurRate = 0.5;
      const adaAmount = (paymentLink.amount_fiat || 0) / adaToEurRate;
      amountLovelace = Math.floor(adaAmount * 1_000_000);
    }

    const platformFeeLovelace = Math.floor(amountLovelace * feePercent);
    const merchantAmountLovelace = amountLovelace - platformFeeLovelace;

    const session = await base44.asServiceRole.entities.CheckoutSession.create({
      payment_link_id: paymentLinkId,
      merchant_id: paymentLink.merchant_id,
      amount_total_lovelace: amountLovelace,
      platform_fee_lovelace: platformFeeLovelace,
      merchant_amount_lovelace: merchantAmountLovelace,
      fee_percent: merchant.platform_fee_percent || PLATFORM_FEE_PERCENT,
      status: 'pending'
    });

    return Response.json({
      success: true,
      session_id: session.id,
      amount_total_lovelace: amountLovelace,
      amount_total_ada: amountLovelace / 1_000_000,
      platform_fee_lovelace: platformFeeLovelace,
      platform_fee_ada: platformFeeLovelace / 1_000_000,
      platform_fee_percent: merchant.platform_fee_percent || PLATFORM_FEE_PERCENT,
      merchant_amount_lovelace: merchantAmountLovelace,
      merchant_amount_ada: merchantAmountLovelace / 1_000_000,
      merchant_address: paymentLink.receive_address,
      receive_address: paymentLink.receive_address,
      fee_wallet_address: Deno.env.get("PAYADA_FEE_WALLET") || null
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});