import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const PLATFORM_FEE_PERCENT = 1.75;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { cartItems } = await req.json();

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return Response.json({ error: 'Missing or invalid cartItems' }, { status: 400 });
    }

    // Get all unique payment links from cart
    const slugs = [...new Set(cartItems.map(item => item.slug))];
    const links = await base44.asServiceRole.entities.PaymentLink.filter({ 
      slug: { $in: slugs },
      status: 'active'
    });

    if (links.length === 0) {
      return Response.json({ error: 'No active payment links found for cart items' }, { status: 404 });
    }

    // Create a map of slug -> link for quick lookup
    const linkMap = {};
    links.forEach(link => {
      linkMap[link.slug] = link;
    });

    // Calculate total amount
    let totalLovelace = 0;
    const itemDetails = [];

    for (const item of cartItems) {
      const link = linkMap[item.slug];
      if (!link) {
        return Response.json({ error: `Payment link not found for item: ${item.name}` }, { status: 404 });
      }

      let itemLovelace = 0;
      if (link.amount_mode === 'fixed_ada') {
        itemLovelace = Math.floor((link.amount_ada || 0) * 1_000_000) * (item.qty || 1);
      } else {
        const adaToEurRate = 0.5;
        const adaAmount = (link.amount_fiat || 0) / adaToEurRate;
        itemLovelace = Math.floor(adaAmount * 1_000_000) * (item.qty || 1);
      }

      totalLovelace += itemLovelace;
      itemDetails.push({
        payment_link_id: link.id,
        name: item.name,
        price: item.price,
        qty: item.qty || 1,
        lovelace: itemLovelace
      });
    }

    // Get merchant profile from first link
    const primaryLink = links[0];
    let merchant = null;
    if (primaryLink.merchant_id) {
      const profiles = await base44.asServiceRole.entities.MerchantProfile.filter({ user_id: primaryLink.merchant_id });
      merchant = profiles[0] || null;
    }
    if (!merchant) {
      const allProfiles = await base44.asServiceRole.entities.MerchantProfile.list();
      merchant = allProfiles[0] || null;
    }

    const feePercent = merchant?.status === 'active'
      ? (merchant.platform_fee_percent || PLATFORM_FEE_PERCENT) / 100
      : PLATFORM_FEE_PERCENT / 100;

    const platformFeeLovelace = Math.floor(totalLovelace * feePercent);
    const merchantAmountLovelace = totalLovelace;

    // Create checkout session
    const session = await base44.asServiceRole.entities.CheckoutSession.create({
      payment_link_id: primaryLink.id, // Reference primary link
      merchant_id: primaryLink.merchant_id || merchant?.user_id || 'unknown',
      amount_total_lovelace: totalLovelace,
      platform_fee_lovelace: platformFeeLovelace,
      merchant_amount_lovelace: merchantAmountLovelace,
      fee_percent: merchant?.platform_fee_percent || PLATFORM_FEE_PERCENT,
      status: 'pending'
    });

    return Response.json({
      success: true,
      session_id: session.id,
      amount_total_lovelace: totalLovelace,
      amount_total_ada: totalLovelace / 1_000_000,
      platform_fee_lovelace: platformFeeLovelace,
      platform_fee_ada: platformFeeLovelace / 1_000_000,
      platform_fee_percent: merchant?.platform_fee_percent || PLATFORM_FEE_PERCENT,
      merchant_amount_lovelace: merchantAmountLovelace,
      merchant_amount_ada: merchantAmountLovelace / 1_000_000,
      merchant_address: primaryLink.receive_address || merchant?.default_receive_address || '',
      receive_address: primaryLink.receive_address || merchant?.default_receive_address || '',
      fee_wallet_address: Deno.env.get("PAYADA_FEE_WALLET") || null,
      items: itemDetails
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});