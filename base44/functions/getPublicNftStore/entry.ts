import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { merchant_id: merchantIdFromPayload, store_slug } = await req.json();

    let profile = null;

    if (store_slug) {
      const profilesBySlug = await base44.asServiceRole.entities.MerchantProfile.filter({ nft_store_slug: store_slug }, '-created_date', 1);
      profile = profilesBySlug[0] || null;
    }

    const merchantId = merchantIdFromPayload || profile?.user_id;

    if (!merchantId) {
      return Response.json({ error: 'merchant_id or store_slug is required' }, { status: 400 });
    }

    if (!profile) {
      const profilesByMerchant = await base44.asServiceRole.entities.MerchantProfile.filter({ user_id: merchantId }, '-created_date', 1);
      profile = profilesByMerchant[0] || null;
    }

    const [listings, paymentLinks] = await Promise.all([
      base44.asServiceRole.entities.NftListing.filter({ merchant_id: merchantId, status: 'active' }, '-created_date', 100),
      base44.asServiceRole.entities.PaymentLink.filter({ merchant_id: merchantId }, '-created_date', 100),
    ]);

    const paymentLinksById = Object.fromEntries(paymentLinks.map((link) => [link.id, link]));
    const activeListings = listings
      .map((listing) => ({
        ...listing,
        payment_link_slug: paymentLinksById[listing.payment_link_id]?.slug || null,
        payment_link_status: paymentLinksById[listing.payment_link_id]?.status || null,
      }))
      .filter((listing) => listing.payment_link_slug && listing.payment_link_status === 'active');

    return Response.json({
      merchant: {
        id: merchantId,
        business_name: profile?.business_name || merchantId,
        nft_store_name: profile?.nft_store_name || profile?.business_name || merchantId,
        nft_store_slug: profile?.nft_store_slug || null,
        nft_store_description: profile?.nft_store_description || null,
        logo_url: profile?.logo_url || null,
        website_url: profile?.website_url || null,
      },
      listings: activeListings,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});