import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Called AFTER the signed tx is submitted on-chain.
// Marks the given purchase_ids as distributed in the database.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { purchase_ids, tx_hash } = await req.json();
    if (!purchase_ids || !Array.isArray(purchase_ids) || purchase_ids.length === 0) {
      return Response.json({ error: 'Missing purchase_ids array' }, { status: 400 });
    }
    if (!tx_hash) {
      return Response.json({ error: 'Missing tx_hash' }, { status: 400 });
    }

    const now = new Date().toISOString();
    await Promise.all(purchase_ids.map(id =>
      base44.asServiceRole.entities.TokenSalePurchase.update(id, {
        status: 'distributed',
        distributed_at: now,
        distribution_tx_hash: tx_hash,
      })
    ));

    return Response.json({ success: true, distributed: purchase_ids.length, tx_hash });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});