import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const merchantId = user.email;

    const entitiesToClean = [
      'Payment', 'PaymentLink', 'Subscription', 'SubscriptionPlan',
      'Customer', 'PayTerminal', 'WebhookEndpoint', 'ApiKey',
      'AuditLog', 'Notification', 'LedgerEntry', 'IdempotencyKey',
      'WebhookLog', 'CheckoutSession', 'CommunityAccessLink',
      'PaymentLinkTemplate', 'ActiveAddress', 'MerchantPlugin', 'MerchantProfile'
    ];

    for (const entityName of entitiesToClean) {
      try {
        // Fetch in batches of 50 and delete
        let hasMore = true;
        while (hasMore) {
          const records = await base44.asServiceRole.entities[entityName].filter({ merchant_id: merchantId }, null, 50);
          if (!records || records.length === 0) {
            hasMore = false;
            break;
          }
          await Promise.all(records.map(r => base44.asServiceRole.entities[entityName].delete(r.id)));
          if (records.length < 50) hasMore = false;
        }
      } catch (e) {
        // Skip entities that don't have merchant_id or other errors
        console.log(`Skipping ${entityName}: ${e.message}`);
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});