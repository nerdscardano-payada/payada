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
      const profileWallet = profile?.connected_wallet_address || profile?.default_receive_address;

      if (!profileWallet || profileWallet !== walletAddress) {
        return Response.json({ error: 'Wallet address does not match your profile' }, { status: 403 });
      }

      await entityApi.update(linkId, { merchant_id: user.email });
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});