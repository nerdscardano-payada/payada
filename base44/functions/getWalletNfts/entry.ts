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
    const assets = (data.amount || [])
      .filter((item) => item.unit !== 'lovelace')
      .map((item) => ({
        unit: item.unit,
        quantity: Number(item.quantity || 0),
        policy_id: item.unit.slice(0, 56),
        asset_name_hex: item.unit.slice(56),
        asset_label: decodeAssetLabel(item.unit.slice(56)),
      }))
      .filter((item) => item.quantity > 0);

    return Response.json({ success: true, assets });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});