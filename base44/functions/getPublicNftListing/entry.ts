import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { store_slug: storeSlug, listing_id: listingId } = await req.json();

    if (!storeSlug || !listingId) {
      return Response.json({ error: 'store_slug and listing_id are required' }, { status: 400 });
    }

    const profiles = await base44.asServiceRole.entities.MerchantProfile.filter({ nft_store_slug: storeSlug }, '-created_date', 1);
    const profile = profiles[0] || null;

    if (!profile) {
      return Response.json({ error: 'Store not found' }, { status: 404 });
    }

    const merchantId = profile.user_id;
    const listings = await base44.asServiceRole.entities.NftListing.filter({ id: listingId, merchant_id: merchantId }, '-created_date', 1);
    const listing = listings[0] || null;

    if (!listing) {
      return Response.json({ error: 'Listing not found' }, { status: 404 });
    }

    let payment_link_slug = null;
    let payment_link_status = null;
    if (listing.payment_link_id) {
      const links = await base44.asServiceRole.entities.PaymentLink.filter({ id: listing.payment_link_id }, '-created_date', 1);
      const link = links[0] || null;
      payment_link_slug = link?.slug || null;
      payment_link_status = link?.status || null;
    }

    return Response.json({
      merchant: {
        id: merchantId,
        business_name: profile.business_name || merchantId,
        nft_store_name: profile.nft_store_name || profile.business_name || merchantId,
        nft_store_slug: profile.nft_store_slug || null,
        nft_store_description: profile.nft_store_description || null,
        logo_url: profile.logo_url || null,
        website_url: profile.website_url || null,
        default_receive_address: profile.default_receive_address || null,
        verified_merchant: !!profile.verified_merchant,
      },
      listing: {
        id: listing.id,
        title: listing.title,
        description: listing.description,
        image_url: listing.image_url,
        price_ada: listing.price_ada,
        asset_label: listing.asset_label,
        collection_name: listing.collection_name,
        policy_id: listing.policy_id,
        asset_name_hex: listing.asset_name_hex,
        quantity: listing.quantity,
        payment_link_slug,
        payment_link_status,
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});