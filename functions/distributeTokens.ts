import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const FEE_PERCENT = 1.75;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Auth check - admin only
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { token_sale_id } = await req.json();
    if (!token_sale_id) {
      return Response.json({ error: 'Missing token_sale_id' }, { status: 400 });
    }

    // Load sale
    const sales = await base44.asServiceRole.entities.TokenSale.filter({ id: token_sale_id });
    const sale = sales[0];
    if (!sale) return Response.json({ error: 'Sale not found' }, { status: 404 });

    // Load all pending_distribution purchases
    const allPurchases = await base44.asServiceRole.entities.TokenSalePurchase.filter({ token_sale_id });
    const pending = allPurchases.filter(p => p.status === 'pending_distribution');

    if (pending.length === 0) {
      return Response.json({ message: 'No pending purchases to distribute', distributed: 0 });
    }

    // Calculate fee
    const totalTokens = pending.reduce((s, p) => s + (p.tokens_allocated || 0), 0);
    const feeTokens = Math.floor(totalTokens * (FEE_PERCENT / 100));
    const netTokens = totalTokens - feeTokens;
    const feeRatio = 1 - (FEE_PERCENT / 100);

    // Mark each purchase as distributed with net token amount
    const now = new Date().toISOString();
    const updatePromises = pending.map(p =>
      base44.asServiceRole.entities.TokenSalePurchase.update(p.id, {
        status: 'distributed',
        tokens_allocated: Math.floor((p.tokens_allocated || 0) * feeRatio),
        distributed_at: now,
      })
    );
    await Promise.all(updatePromises);

    return Response.json({
      success: true,
      distributed: pending.length,
      total_tokens_distributed: netTokens,
      fee_tokens: feeTokens,
      fee_percent: FEE_PERCENT,
      token_ticker: sale.token_ticker,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});