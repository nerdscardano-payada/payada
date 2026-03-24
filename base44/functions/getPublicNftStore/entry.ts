import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const BLOCKFROST_API_KEY = Deno.env.get('BLOCKFROST_API_KEY');
const BLOCKFROST_URL = 'https://cardano-mainnet.blockfrost.io/api/v0';

async function getWalletInventory(walletAddress) {
  if (!walletAddress) return null;

  const response = await fetch(`${BLOCKFROST_URL}/addresses/${walletAddress}`, {
    headers: { project_id: BLOCKFROST_API_KEY },
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return (data.amount || []).reduce((result, item) => {
    if (item.unit !== 'lovelace') {
      result[item.unit] = Number(item.quantity || 0);
    }
    return result;
  }, {});
}

function splitListingsByInventory(listings, inventory) {
  if (!inventory) {
    return { availableListings: listings, soldOutListings: [] };
  }

  const remainingInventory = { ...inventory };
  const availableListings = [];
  const soldOutListings = [];

  for (const listing of listings) {
    const unit = `${listing.policy_id || ''}${listing.asset_name_hex || ''}`;
    const quantityNeeded = Number(listing.quantity || 1);
    const quantityAvailable = Number(remainingInventory[unit] || 0);

    if (unit && quantityAvailable >= quantityNeeded) {
      availableListings.push(listing);
      remainingInventory[unit] = quantityAvailable - quantityNeeded;
    } else {
      soldOutListings.push(listing);
    }
  }

  return { availableListings, soldOutListings };
}

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

    const configuredWallets = await Promise.all([
      profile?.nft_fulfillment_mode === 'automatic'
        ? base44.asServiceRole.entities.MerchantHotWallet.filter({ merchant_id: merchantId, status: 'active' }, '-updated_date', 1)
        : Promise.resolve([]),
      profile?.nft_fulfillment_mode !== 'automatic'
        ? base44.asServiceRole.entities.MerchantSignerWallet.filter({ merchant_id: merchantId, status: 'active' }, '-updated_date', 1)
        : Promise.resolve([]),
    ]);

    const inventoryWalletAddress = profile?.nft_fulfillment_mode === 'automatic'
      ? configuredWallets[0]?.[0]?.wallet_address || null
      : configuredWallets[1]?.[0]?.wallet_address || null;

    const [listings, paymentLinks, inventory] = await Promise.all([
      base44.asServiceRole.entities.NftListing.filter({ merchant_id: merchantId, status: 'active' }, '-created_date', 100),
      base44.asServiceRole.entities.PaymentLink.filter({ merchant_id: merchantId }, '-created_date', 100),
      getWalletInventory(inventoryWalletAddress),
    ]);

    const paymentLinksById = Object.fromEntries(paymentLinks.map((link) => [link.id, link]));
    const storefrontListings = listings
      .map((listing) => ({
        ...listing,
        payment_link_slug: paymentLinksById[listing.payment_link_id]?.slug || null,
        payment_link_status: paymentLinksById[listing.payment_link_id]?.status || null,
      }))
      .filter((listing) => listing.payment_link_slug && listing.payment_link_status === 'active');

    const { availableListings, soldOutListings } = splitListingsByInventory(storefrontListings, inventory);

    await Promise.all(soldOutListings.flatMap((listing) => {
      const updates = [base44.asServiceRole.entities.NftListing.update(listing.id, { status: 'disabled' })];
      if (listing.payment_link_id) {
        updates.push(base44.asServiceRole.entities.PaymentLink.update(listing.payment_link_id, { status: 'disabled' }));
      }
      return updates;
    }));

    const activeListings = availableListings;

    return Response.json({
      merchant: {
        id: merchantId,
        business_name: profile?.business_name || merchantId,
        nft_store_name: profile?.nft_store_name || profile?.business_name || merchantId,
        nft_store_slug: profile?.nft_store_slug || null,
        nft_store_description: profile?.nft_store_description || null,
        logo_url: profile?.logo_url || null,
        website_url: profile?.website_url || null,
        default_receive_address: profile?.default_receive_address || null,
        nft_fulfillment_mode: profile?.nft_fulfillment_mode || 'manual',
        preferred_collection_name: profile?.preferred_collection_name || null,
        verified_merchant: !!profile?.verified_merchant,
      },
      listings: activeListings,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});