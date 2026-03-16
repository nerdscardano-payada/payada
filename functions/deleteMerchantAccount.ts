import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const merchantId = user.email;

    // Delete all related entities
    const entitiesToClean = [
      'Payment', 'PaymentLink', 'Subscription', 'SubscriptionPlan',
      'Customer', 'PayTerminal', 'WebhookEndpoint', 'ApiKey',
      'AuditLog', 'Notification', 'LedgerEntry', 'IdempotencyKey',
      'WebhookLog', 'CheckoutSession', 'CommunityAccessLink',
      'PaymentLinkTemplate', 'ActiveAddress', 'MerchantPlugin', 'MerchantProfile'
    ];

    for (const entityName of entitiesToClean) {
      const records = await base44.asServiceRole.entities[entityName].filter({ merchant_id: merchantId });
      for (const record of records) {
        await base44.asServiceRole.entities[entityName].delete(record.id);
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});