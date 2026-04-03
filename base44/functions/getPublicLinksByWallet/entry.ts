import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { walletAddress } = await req.json();

    if (!walletAddress) {
      return Response.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    const paymentLinks = await base44.asServiceRole.entities.PaymentLink.filter({
      merchant_id: 'public_homepage',
      receive_address: walletAddress,
    });

    const accessLinks = await base44.asServiceRole.entities.CommunityAccessLink.filter({
      merchant_id: 'public_homepage',
      receive_address: walletAddress,
    });

    return Response.json({ paymentLinks, accessLinks });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});