import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    const event = payload?.event || {};
    const data = payload?.data || null;
    const old = payload?.old_data || null;
    const changed = payload?.changed_fields || [];

    if (event?.type !== 'update' || !data) {
      return Response.json({ ok: true, skipped: true });
    }

    const statusChanged = changed.includes('status') || (old?.status !== data?.status);
    if (!statusChanged || data.status !== 'confirmed') {
      return Response.json({ ok: true, reason: 'not_confirmed' });
    }

    const paymentLinkId = data.payment_link_id;
    if (!paymentLinkId) {
      return Response.json({ ok: true, reason: 'no_payment_link' });
    }

    // Try to find a related listing first
    const listings = await base44.asServiceRole.entities.NftListing.filter({ payment_link_id: paymentLinkId }, '-created_date', 1);
    if (Array.isArray(listings) && listings.length > 0) {
      const listing = listings[0];
      const currentQty = Number(listing.quantity || 0);
      const newQty = currentQty > 0 ? currentQty - 1 : 0;

      const updates = { quantity: newQty };
      if (newQty === 0 && listing.status !== 'disabled') {
        updates.status = 'disabled';
      }
      await base44.asServiceRole.entities.NftListing.update(listing.id, updates);

      if (newQty === 0) {
        // Disable its payment link to prevent new purchases
        try {
          await base44.asServiceRole.entities.PaymentLink.update(paymentLinkId, { status: 'disabled' });
        } catch (_) {}
      }

      return Response.json({ ok: true, adjusted: 'listing', listing_id: listing.id, newQty });
    }

    // Otherwise try fulfillment rule
    const rules = await base44.asServiceRole.entities.NftFulfillmentRule.filter({ payment_link_id: paymentLinkId }, '-created_date', 1);
    if (Array.isArray(rules) && rules.length > 0) {
      const rule = rules[0];
      const currentQty = Number(rule.quantity || 0);
      const newQty = currentQty > 0 ? currentQty - 1 : 0;

      const updates = { quantity: newQty };
      if (newQty === 0 && rule.status !== 'disabled') {
        updates.status = 'disabled';
      }
      await base44.asServiceRole.entities.NftFulfillmentRule.update(rule.id, updates);

      if (newQty === 0) {
        try {
          await base44.asServiceRole.entities.PaymentLink.update(paymentLinkId, { status: 'disabled' });
        } catch (_) {}
      }

      return Response.json({ ok: true, adjusted: 'rule', rule_id: rule.id, newQty });
    }

    return Response.json({ ok: true, reason: 'no_related_resource' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});