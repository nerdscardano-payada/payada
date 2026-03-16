import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const merchantId = user.email;

    // Most entities use merchant_id, MerchantProfile uses user_id
    const entitiesToClean = [
      'Payment', 'PaymentLink', 'Subscription', 'SubscriptionPlan',
      'Customer', 'PayTerminal', 'WebhookEndpoint', 'ApiKey',
      'AuditLog', 'Notification', 'LedgerEntry', 'IdempotencyKey',
      'WebhookLog', 'CheckoutSession', 'CommunityAccessLink',
      'PaymentLinkTemplate', 'ActiveAddress', 'MerchantPlugin'
    ];

    for (const entityName of entitiesToClean) {
      try {
        let hasMore = true;
        while (hasMore) {
          const records = await base44.asServiceRole.entities[entityName].filter({ merchant_id: merchantId }, null, 50);
          if (!records || records.length === 0) { hasMore = false; break; }
          await Promise.all(records.map(r => base44.asServiceRole.entities[entityName].delete(r.id)));
          if (records.length < 50) hasMore = false;
        }
      } catch (e) {
        console.log(`Skipping ${entityName}: ${e.message}`);
      }
    }

    // MerchantProfile uses user_id instead of merchant_id
    try {
      const profiles = await base44.asServiceRole.entities.MerchantProfile.filter({ user_id: merchantId }, null, 10);
      await Promise.all(profiles.map(r => base44.asServiceRole.entities.MerchantProfile.delete(r.id)));
    } catch (e) {
      console.log(`Skipping MerchantProfile: ${e.message}`);
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});