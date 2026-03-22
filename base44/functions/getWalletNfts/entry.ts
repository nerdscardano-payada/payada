import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const BLOCKFROST_API_KEY = Deno.env.get('BLOCKFROST_API_KEY');
const BLOCKFROST_URL = 'https://cardano-mainnet.blockfrost.io/api/v0';

function decodeAssetLabel(assetNameHex) {
  if (!assetNameHex) return 'Unnamed asset';
  try {
    const bytes = assetNameHex.match(/.{1,2}/g)?.map((part) => parseInt(part, 16)) || [];
    const text = new TextDecoder().decode(new Uint8Array(bytes)).trim();
    return text && /^[\x20-\x7E]+$/.test(text) ? text : assetNameHex;
  } catch {
    return assetNameHex;
  }
}

function normalizeIpfsUrl(value) {
  if (!value || typeof value !== 'string') return null;
  if (value.startsWith('ipfs://')) return `https://ipfs.io/ipfs/${value.replace('ipfs://', '')}`;
  if (value.startsWith('ipfs/')) return `https://ipfs.io/ipfs/${value.replace('ipfs/', '')}`;
  return value;
}

function pickImageUrl(metadata) {
  if (!metadata) return null;
  const image = metadata.image || metadata.logo || metadata.mediaType;
  if (Array.isArray(image)) return normalizeIpfsUrl(image.join(''));
  return normalizeIpfsUrl(image);
}

function pickDescription(metadata) {
  if (!metadata?.description) return '';
  if (Array.isArray(metadata.description)) return metadata.description.join(' ');
  if (typeof metadata.description === 'string') return metadata.description;
  return '';
}

function pickDisplayName(metadata, fallback) {
  if (!metadata) return fallback;
  if (typeof metadata.name === 'string' && metadata.name.trim()) return metadata.name.trim();
  return fallback;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { wallet_address } = await req.json();
    if (!wallet_address) {
      return Response.json({ error: 'wallet_address is required' }, { status: 400 });
    }

    const response = await fetch(`${BLOCKFROST_URL}/addresses/${wallet_address}`, {
      headers: { project_id: BLOCKFROST_API_KEY },
    });
    const text = await response.text();
    if (!response.ok) {
      return Response.json({ error: `Blockfrost ${response.status}: ${text}` }, { status: 400 });
    }

    const data = JSON.parse(text);
    const baseAssets = (data.amount || [])
      .filter((item) => item.unit !== 'lovelace')
      .map((item) => ({
        unit: item.unit,
        quantity: Number(item.quantity || 0),
        policy_id: item.unit.slice(0, 56),
        asset_name_hex: item.unit.slice(56),
        asset_label: decodeAssetLabel(item.unit.slice(56)),
      }))
      .filter((item) => item.quantity > 0);

    const assets = await Promise.all(baseAssets.map(async (asset) => {
      const metadataResponse = await fetch(`${BLOCKFROST_URL}/assets/${asset.unit}`, {
        headers: { project_id: BLOCKFROST_API_KEY },
      });

      if (!metadataResponse.ok) {
        return asset;
      }

      const metadataText = await metadataResponse.text();
      const assetData = metadataText ? JSON.parse(metadataText) : {};
      const metadata = assetData.onchain_metadata || assetData.metadata || null;

      return {
        ...asset,
        asset_label: pickDisplayName(metadata, asset.asset_label),
        image_url: pickImageUrl(metadata),
        description: pickDescription(metadata),
      };
    }));

    return Response.json({ success: true, assets });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});