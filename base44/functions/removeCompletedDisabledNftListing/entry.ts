import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const event = body?.event || {};
    const data = body?.data || null;
    const oldData = body?.old_data || null;

    if (event?.type !== 'update' || !data?.id) {
      return Response.json({ ok: true, skipped: true, reason: 'not_update_event' });
    }

    const becameConfirmed = oldData?.status !== 'confirmed' && data?.status === 'confirmed';
    if (!becameConfirmed) {
      return Response.json({ ok: true, skipped: true, reason: 'not_confirmed_transition' });
    }

    if (!data?.merchant_id || !data?.payment_link_id) {
      return Response.json({ ok: true, skipped: true, reason: 'missing_listing_lookup_fields' });
    }

    const listings = await base44.asServiceRole.entities.NftListing.filter({
      merchant_id: data.merchant_id,
      payment_link_id: data.payment_link_id,
      status: 'disabled',
    }, '-created_date', 20);

    if (!Array.isArray(listings) || listings.length === 0) {
      return Response.json({ ok: true, skipped: true, reason: 'no_disabled_listing_found' });
    }

    await Promise.all(listings.map((listing) => base44.asServiceRole.entities.NftListing.delete(listing.id)));

    return Response.json({
      ok: true,
      removed_count: listings.length,
      removed_listing_ids: listings.map((listing) => listing.id),
      transfer_log_id: data.id,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});