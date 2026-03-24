import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const createSlug = (value = '') => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    await req.json().catch(() => ({}));

    const [listings, paymentLinks, merchants] = await Promise.all([
      base44.asServiceRole.entities.NftListing.filter({ status: 'active' }, '-created_date', 500),
      base44.asServiceRole.entities.PaymentLink.filter({ status: 'active' }, '-created_date', 500),
      base44.asServiceRole.entities.MerchantProfile.filter({ status: 'active' }, '-created_date', 500),
    ]);

    const paymentLinksById = Object.fromEntries(paymentLinks.map((link) => [link.id, link]));
    const merchantsById = Object.fromEntries(merchants.map((merchant) => [merchant.user_id, merchant]));

    const marketplaceListings = listings
      .map((listing) => {
        const merchant = merchantsById[listing.merchant_id];
        const paymentLink = paymentLinksById[listing.payment_link_id];

        if (!merchant || !paymentLink?.slug) {
          return null;
        }

        const storeSlug = merchant.nft_store_slug || createSlug(merchant.business_name || merchant.user_id || 'nft-store');
        const hasStoreSlug = Boolean(merchant.nft_store_slug);

        return {
          ...listing,
          payment_link_slug: paymentLink.slug,
          storefront_path: hasStoreSlug
            ? `/nft/${storeSlug}`
            : `/NFTStore?merchant=${encodeURIComponent(merchant.user_id)}`,
          detail_path: hasStoreSlug ? `/nft/${storeSlug}/${listing.id}` : null,
          merchant: {
            id: merchant.user_id,
            business_name: merchant.business_name,
            nft_store_name: merchant.nft_store_name || merchant.business_name,
            nft_store_slug: merchant.nft_store_slug || storeSlug,
            logo_url: merchant.logo_url || null,
            website_url: merchant.website_url || null,
            nft_fulfillment_mode: merchant.nft_fulfillment_mode || 'manual',
            verified_merchant: !!merchant.verified_merchant,
          },
        };
      })
      .filter(Boolean);

    const uniqueMerchants = new Set(marketplaceListings.map((listing) => listing.merchant.id));
    const uniqueCollections = new Set(
      marketplaceListings.map((listing) => listing.collection_name || 'Featured NFTs')
    );

    return Response.json({
      listings: marketplaceListings,
      merchant_count: uniqueMerchants.size,
      collection_count: uniqueCollections.size,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});