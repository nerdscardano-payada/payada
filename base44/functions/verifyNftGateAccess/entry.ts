import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const BLOCKFROST_API_KEY = Deno.env.get('BLOCKFROST_API_KEY');
const BLOCKFROST_URL = 'https://cardano-mainnet.blockfrost.io/api/v0';

async function getAddressAssets(address) {
  const response = await fetch(`${BLOCKFROST_URL}/addresses/${address}`, {
    headers: { project_id: BLOCKFROST_API_KEY },
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Blockfrost ${response.status}: ${text}`);
  }

  return JSON.parse(text);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { slug, wallet_address } = await req.json();

    if (!slug) {
      return Response.json({ error: 'slug is required' }, { status: 400 });
    }

    const rules = await base44.asServiceRole.entities.NftGateRule.filter({ slug, status: 'active' }, '-created_date', 1);
    const rule = rules[0];

    if (!rule) {
      return Response.json({ error: 'Gate not found' }, { status: 404 });
    }

    if (!wallet_address) {
      return Response.json({
        found: true,
        granted: false,
        requires_wallet: true,
        rule: {
          name: rule.name,
          slug: rule.slug,
          minimum_quantity: rule.minimum_quantity || 1,
          success_message: rule.success_message || 'Access granted',
        },
      });
    }

    if (!wallet_address.startsWith('addr')) {
      return Response.json({ error: 'wallet_address must be a valid Cardano address' }, { status: 400 });
    }

    const addressData = await getAddressAssets(wallet_address);
    const targetUnit = `${rule.policy_id}${rule.asset_name_hex || ''}`;
    const asset = (addressData.amount || []).find((item) => item.unit === targetUnit);
    const quantityOwned = Number(asset?.quantity || 0);
    const requiredQuantity = Number(rule.minimum_quantity || 1);
    const granted = quantityOwned >= requiredQuantity;

    return Response.json({
      found: true,
      granted,
      quantity_owned: quantityOwned,
      required_quantity: requiredQuantity,
      access_url: granted ? rule.access_url : null,
      success_message: rule.success_message || 'Access granted',
      rule: {
        name: rule.name,
        slug: rule.slug,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});