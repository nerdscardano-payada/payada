import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const BLOCKFROST_API_KEY = Deno.env.get('BLOCKFROST_API_KEY');
const BLOCKFROST_URL = 'https://cardano-mainnet.blockfrost.io/api/v0';

function normalizeTraitValue(value) {
  if (value === null || value === undefined || value === '') return null;
  if (Array.isArray(value)) return value.map(normalizeTraitValue).filter(Boolean).join(', ');
  if (typeof value === 'object') {
    if ('value' in value) return normalizeTraitValue(value.value);
    return null;
  }
  return String(value).trim();
}

function dedupeTraits(traits) {
  const seen = new Set();
  return traits.filter((trait) => {
    const key = `${trait.trait_type}::${trait.value}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function extractTraits(metadata) {
  if (!metadata || typeof metadata !== 'object') return [];

  const attributeTraits = [];
  if (Array.isArray(metadata.attributes)) {
    metadata.attributes.forEach((attribute, index) => {
      if (!attribute || typeof attribute !== 'object' || Array.isArray(attribute)) return;

      if ('trait_type' in attribute || 'value' in attribute) {
        const traitType = String(attribute.trait_type || attribute.name || `Trait ${index + 1}`).trim();
        const value = normalizeTraitValue(attribute.value);
        if (traitType && value) {
          attributeTraits.push({ trait_type: traitType, value });
        }
        return;
      }

      Object.entries(attribute).forEach(([key, rawValue]) => {
        const value = normalizeTraitValue(rawValue);
        if (key && value) {
          attributeTraits.push({ trait_type: key, value });
        }
      });
    });
  }

  if (attributeTraits.length) return dedupeTraits(attributeTraits);

  const excludedKeys = new Set(['name', 'image', 'description', 'files', 'mediaType', 'logo', 'website', 'url', 'publisher', 'project']);
  const objectTraits = Object.entries(metadata)
    .filter(([key, value]) => !excludedKeys.has(key) && typeof value !== 'object')
    .map(([key, value]) => ({ trait_type: key, value: normalizeTraitValue(value) }))
    .filter((trait) => trait.value);

  return dedupeTraits(objectTraits);
}

async function fetchAssetMetadata(unit) {
  if (!BLOCKFROST_API_KEY || !unit) return null;

  const response = await fetch(`${BLOCKFROST_URL}/assets/${unit}`, {
    headers: { project_id: BLOCKFROST_API_KEY },
  });

  if (!response.ok) return null;

  const payload = await response.json();
  return payload?.onchain_metadata || payload?.metadata || null;
}

function calculateRarity(entries, currentUnit, scopeLabel) {
  const comparableEntries = entries.filter((entry) => entry.unit && entry.traits.length > 0);
  if (!comparableEntries.length) return null;

  const totalItems = comparableEntries.length;
  const traitCounts = {};

  comparableEntries.forEach((entry) => {
    entry.traits.forEach((trait) => {
      const key = `${trait.trait_type}::${trait.value}`;
      traitCounts[key] = (traitCounts[key] || 0) + 1;
    });
  });

  const scored = comparableEntries.map((entry) => {
    const traits = entry.traits
      .map((trait) => {
        const key = `${trait.trait_type}::${trait.value}`;
        const occurrence = traitCounts[key] || 1;
        const score = totalItems / occurrence;
        return {
          ...trait,
          occurrence,
          percentage: (occurrence / totalItems) * 100,
          score,
        };
      })
      .sort((a, b) => b.score - a.score || a.occurrence - b.occurrence);

    const totalScore = traits.reduce((sum, trait) => sum + trait.score, 0);
    return {
      unit: entry.unit,
      traits,
      score: totalScore,
    };
  }).sort((a, b) => b.score - a.score || b.traits.length - a.traits.length);

  const currentIndex = scored.findIndex((entry) => entry.unit === currentUnit);
  if (currentIndex === -1) return null;

  const current = scored[currentIndex];
  const rank = currentIndex + 1;
  const percentile = totalItems === 1 ? 100 : ((totalItems - rank) / (totalItems - 1)) * 100;

  return {
    score: Number(current.score.toFixed(1)),
    rank,
    total_items: totalItems,
    percentile: Number(percentile.toFixed(1)),
    scope_label: scopeLabel,
    traits: current.traits,
  };
}

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

    const allActiveListings = await base44.asServiceRole.entities.NftListing.filter({ merchant_id: merchantId, status: 'active' }, '-created_date', 200);
    const comparisonListings = allActiveListings.filter((item) => {
      if (item.policy_id !== listing.policy_id) return false;
      if (listing.collection_slug) return item.collection_slug === listing.collection_slug;
      if (listing.collection_name) return item.collection_name === listing.collection_name;
      return true;
    });

    if (!comparisonListings.find((item) => item.id === listing.id)) {
      comparisonListings.unshift(listing);
    }

    const metadataEntries = await Promise.all(
      comparisonListings
        .filter((item) => item.policy_id && item.asset_name_hex)
        .map(async (item) => {
          const unit = `${item.policy_id}${item.asset_name_hex}`;
          const metadata = await fetchAssetMetadata(unit);
          return {
            unit,
            traits: extractTraits(metadata),
          };
        })
    );

    const rarity = calculateRarity(
      metadataEntries,
      `${listing.policy_id || ''}${listing.asset_name_hex || ''}`,
      listing.collection_name || 'deze collectie'
    );

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
      },
      rarity,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});