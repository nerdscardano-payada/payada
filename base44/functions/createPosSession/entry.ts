import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const PLATFORM_FEE_PERCENT = 1.75;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { amountAda, label } = await req.json();
    if (!amountAda || amountAda <= 0) {
      return Response.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Get merchant profile
    const profiles = await base44.asServiceRole.entities.MerchantProfile.filter({ user_id: user.email });
    const merchant = profiles[0] || null;
    const feePercent = (merchant?.platform_fee_percent || PLATFORM_FEE_PERCENT) / 100;
    const receiveAddress = merchant?.default_receive_address || '';
    const feeWallet = Deno.env.get("PAYADA_FEE_WALLET") || '';

    // Create a temporary PaymentLink for this POS transaction
    const slug = 'pos-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
    const paymentLink = await base44.asServiceRole.entities.PaymentLink.create({
      merchant_id: user.email,
      slug,
      title: label || 'POS Payment',
      amount_mode: 'fixed_ada',
      amount_ada: parseFloat(amountAda),
      receive_address: receiveAddress,
      status: 'active',
      confirmations_required: 2,
      is_hidden: true,
      creation_source: 'pos'
    });

    const amountLovelace = Math.floor(parseFloat(amountAda) * 1_000_000);
    // Identical fee calculation as createPublicCheckoutSession — fee deducted from merchant, customer pays original amount
    const platformFeeLovelace = Math.floor(amountLovelace * feePercent);
    const merchantAmountLovelace = amountLovelace - platformFeeLovelace;

    const session = await base44.asServiceRole.entities.CheckoutSession.create({
      payment_link_id: paymentLink.id,
      merchant_id: user.email,
      amount_total_lovelace: amountLovelace,
      platform_fee_lovelace: platformFeeLovelace,
      merchant_amount_lovelace: merchantAmountLovelace,
      fee_percent: merchant?.platform_fee_percent || PLATFORM_FEE_PERCENT,
      status: 'pending'
    });

    return Response.json({
      success: true,
      slug,
      payment_link_id: paymentLink.id,
      session_id: session.id,
      amount_ada: parseFloat(amountAda),
      receive_address: receiveAddress,
      fee_wallet_address: feeWallet,
      platform_fee_ada: platformFeeLovelace / 1_000_000,
      merchant_amount_ada: merchantAmountLovelace / 1_000_000,
      platform_fee_percent: merchant?.platform_fee_percent || PLATFORM_FEE_PERCENT,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});