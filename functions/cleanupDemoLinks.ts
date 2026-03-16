import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const DEMO_MERCHANT_ID = "demo@payada.io";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const now = new Date().toISOString();
    let deletedCount = 0;

    // Cleanup expired demo PaymentLinks
    const expiredPaymentLinks = await base44.asServiceRole.entities.PaymentLink.filter(
      { merchant_id: DEMO_MERCHANT_ID },
      null,
      200
    );
    for (const link of expiredPaymentLinks) {
      if (link.expires_at && link.expires_at < now) {
        await base44.asServiceRole.entities.PaymentLink.delete(link.id);
        deletedCount++;
      }
    }

    // Cleanup expired demo CommunityAccessLinks
    const expiredAccessLinks = await base44.asServiceRole.entities.CommunityAccessLink.filter(
      { merchant_id: DEMO_MERCHANT_ID },
      null,
      200
    );
    for (const link of expiredAccessLinks) {
      if (link.expires_at && link.expires_at < now) {
        await base44.asServiceRole.entities.CommunityAccessLink.delete(link.id);
        deletedCount++;
      }
    }

    console.log(`Demo cleanup: deleted ${deletedCount} expired links`);
    return Response.json({ success: true, deleted: deletedCount });
  } catch (error) {
    console.error("Demo cleanup error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});