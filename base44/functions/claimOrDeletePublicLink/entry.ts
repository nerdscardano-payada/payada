import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    const { action, linkType, linkId, walletAddress } = await req.json();

    if (!action || !linkType || !linkId || !walletAddress) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const entityApi = linkType === 'payment'
      ? base44.asServiceRole.entities.PaymentLink
      : linkType === 'access'
        ? base44.asServiceRole.entities.CommunityAccessLink
        : null;

    if (!entityApi) {
      return Response.json({ error: 'Invalid link type' }, { status: 400 });
    }

    const link = await entityApi.get(linkId);

    if (!link || link.receive_address !== walletAddress) {
      return Response.json({ error: 'Link not found for this wallet' }, { status: 404 });
    }

    if (action === 'delete') {
      await entityApi.delete(linkId);
      return Response.json({ success: true });
    }

    if (action === 'claim') {
      if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const profiles = await base44.asServiceRole.entities.MerchantProfile.filter({ user_id: user.email });
      const profile = profiles[0] || null;
      const knownWallets = [
        profile?.connected_wallet_address,
        profile?.default_receive_address,
      ].filter(Boolean);

      if (knownWallets.length > 0 && !knownWallets.includes(walletAddress)) {
        return Response.json({ error: 'Wallet address does not match your profile' }, { status: 403 });
      }

      const profileUpdate = profile
        ? {}
        : { user_id: user.email, business_name: user.full_name || user.email };

      const walletUpdate = !profile?.connected_wallet_address
        ? { connected_wallet_address: walletAddress }
        : {};

      if (profile) {
        if (Object.keys(walletUpdate).length > 0) {
          await base44.asServiceRole.entities.MerchantProfile.update(profile.id, walletUpdate);
        }
      } else {
        await base44.asServiceRole.entities.MerchantProfile.create({
          ...profileUpdate,
          ...walletUpdate,
        });
      }

      await entityApi.update(linkId, { merchant_id: user.email });
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});