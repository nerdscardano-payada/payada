import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const PLATFORM_FEE_PERCENT = 1.75;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { paymentLinkId } = await req.json();
    if (!paymentLinkId) {
      return Response.json({ error: 'Missing paymentLinkId' }, { status: 400 });
    }

    // Fetch payment link
    const links = await base44.entities.PaymentLink.filter({ id: paymentLinkId });
    if (links.length === 0) return Response.json({ error: 'Payment link not found' }, { status: 404 });
    const paymentLink = links[0];

    // Fetch merchant profile
    const profiles = await base44.entities.MerchantProfile.filter({ user_id: paymentLink.merchant_id });
    if (profiles.length === 0) return Response.json({ error: 'Merchant profile not found' }, { status: 404 });
    const merchant = profiles[0];

    // Check merchant status
    if (merchant.status !== 'active') {
      return Response.json({ error: 'Merchant account is not active' }, { status: 403 });
    }

    // Get fee percentage (default 1.75% or merchant override)
    const feePercent = (merchant.platform_fee_percent || PLATFORM_FEE_PERCENT) / 100;

    // Determine amount in lovelace
    let amountLovelace = 0;
    if (paymentLink.amount_mode === 'fixed_ada') {
      amountLovelace = Math.floor((paymentLink.amount_ada || 0) * 1000000);
    } else if (paymentLink.amount_mode === 'fixed_fiat') {
      // TODO: In production, fetch real-time exchange rate
      const adaToEurRate = 0.5; // Mock rate
      const adaAmount = (paymentLink.amount_fiat || 0) / adaToEurRate;
      amountLovelace = Math.floor(adaAmount * 1000000);
    }

    // Calculate fee split
    const platformFeeLovelace = Math.floor(amountLovelace * feePercent);
    const merchantAmountLovelace = amountLovelace - platformFeeLovelace;

    // Create checkout session record
    const session = await base44.entities.CheckoutSession.create({
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
      amount_total_ada: amountLovelace / 1000000,
      platform_fee_lovelace: platformFeeLovelace,
      platform_fee_ada: platformFeeLovelace / 1000000,
      platform_fee_percent: merchant.platform_fee_percent || PLATFORM_FEE_PERCENT,
      merchant_amount_lovelace: merchantAmountLovelace,
      merchant_amount_ada: merchantAmountLovelace / 1000000,
      merchant_address: paymentLink.receive_address,
      receive_address: paymentLink.receive_address
    });

  } catch (error) {
    return Response.json({ error: error.message, type: 'checkout_error' }, { status: 500 });
  }
});