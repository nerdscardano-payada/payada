import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { slug } = await req.json();

    if (!slug) return Response.json({ error: 'Missing slug' }, { status: 400 });

    const sr = base44.asServiceRole;

    const links = await sr.entities.CommunityAccessLink.filter({ slug });
    const link = links[0];
    if (!link) return Response.json({ error: 'Access link not found' }, { status: 404 });

    const profiles = await sr.entities.MerchantProfile.filter({ user_id: link.merchant_id });
    const merchantProfile = profiles[0] || null;

    return Response.json({ link, merchantProfile });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});