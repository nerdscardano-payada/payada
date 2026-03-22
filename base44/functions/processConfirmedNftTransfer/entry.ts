import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const isAuthenticated = await base44.auth.isAuthenticated();

    if (isAuthenticated) {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
      }
    }

    const body = await req.json();
    const sr = base44.asServiceRole;
    const event = body?.event;
    const oldData = body?.old_data;
    let payment = body?.data;

    if ((!payment || !payment.id) && body?.payload_too_large && event?.entity_id) {
      const payments = await sr.entities.Payment.filter({ id: event.entity_id }, '-created_date', 1);
      payment = payments[0];
    }

    if (!payment?.id) {
      return Response.json({ success: true, skipped: true, reason: 'No payment payload provided' });
    }

    if (payment.status !== 'confirmed') {
      return Response.json({ success: true, skipped: true, reason: 'Payment is not confirmed' });
    }

    if (event?.type === 'update' && oldData?.status === 'confirmed') {
      return Response.json({ success: true, skipped: true, reason: 'Payment was already confirmed earlier' });
    }

    if (!payment.payment_link_id) {
      return Response.json({ success: true, skipped: true, reason: 'Payment has no payment_link_id' });
    }

    const rules = await sr.entities.NftFulfillmentRule.filter({
      merchant_id: payment.merchant_id,
      payment_link_id: payment.payment_link_id,
      status: 'active',
    }, '-created_date', 25);

    if (rules.length === 0) {
      return Response.json({ success: true, skipped: true, reason: 'No active NFT fulfillment rules for this payment link' });
    }

    const recipientAddress = payment.payer_address || '';
    const now = new Date().toISOString();
    const results = [];

    for (const rule of rules) {
      const existingLogs = await sr.entities.NftTransferLog.filter({ payment_id: payment.id, nft_rule_id: rule.id }, '-created_date', 1);
      if (existingLogs.length > 0) {
        results.push({ rule_id: rule.id, status: 'skipped', reason: 'Already queued' });
        continue;
      }

      const status = recipientAddress ? 'pending' : 'failed';
      const log = await sr.entities.NftTransferLog.create({
        merchant_id: payment.merchant_id,
        payment_id: payment.id,
        payment_link_id: payment.payment_link_id,
        nft_rule_id: rule.id,
        recipient_address: recipientAddress,
        policy_id: rule.policy_id,
        asset_name_hex: rule.asset_name_hex,
        quantity: rule.quantity || 1,
        status,
        error_message: recipientAddress ? null : 'Missing customer wallet address on payment record',
        completed_at: recipientAddress ? null : now,
      });

      results.push({ rule_id: rule.id, status: log.status, log_id: log.id });
    }

    return Response.json({ success: true, payment_id: payment.id, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});