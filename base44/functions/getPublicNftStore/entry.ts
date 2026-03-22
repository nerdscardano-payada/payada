import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { merchant_id } = await req.json();

    if (!merchant_id) {
      return Response.json({ error: 'merchant_id is required' }, { status: 400 });
    }

    const [profiles, listings, paymentLinks] = await Promise.all([
      base44.asServiceRole.entities.MerchantProfile.filter({ user_id: merchant_id }, '-created_date', 1),
      base44.asServiceRole.entities.NftListing.filter({ merchant_id, status: 'active' }, '-created_date', 100),
      base44.asServiceRole.entities.PaymentLink.filter({ merchant_id }, '-created_date', 100),
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
        id: merchant_id,
        business_name: profiles[0]?.business_name || merchant_id,
        logo_url: profiles[0]?.logo_url || null,
        website_url: profiles[0]?.website_url || null,
      },
      listings: activeListings,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});