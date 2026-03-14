import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const { token_sale_id, wallet_address, ada_amount, tx_hash } = await req.json();

  if (!token_sale_id || !wallet_address || !ada_amount || !tx_hash) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Load sale (service role - public endpoint)
  const sales = await base44.asServiceRole.entities.TokenSale.filter({ id: token_sale_id });
  const sale = sales[0];
  if (!sale) return Response.json({ error: 'Sale not found' }, { status: 404 });
  if (sale.status !== 'active') return Response.json({ error: 'Sale is not active' }, { status: 400 });

  // Whitelist check
  if (sale.whitelist_enabled) {
    const wl = sale.whitelist_addresses || [];
    if (!wl.includes(wallet_address)) {
      return Response.json({ error: 'Wallet address is not whitelisted for this sale' }, { status: 403 });
    }
  }

  // Min/max checks
  if (sale.min_buy_ada && ada_amount < sale.min_buy_ada) {
    return Response.json({ error: `Minimum purchase is ₳${sale.min_buy_ada}` }, { status: 400 });
  }
  if (sale.max_buy_ada && ada_amount > sale.max_buy_ada) {
    return Response.json({ error: `Maximum purchase is ₳${sale.max_buy_ada}` }, { status: 400 });
  }

  // Check raise cap
  const currentRaised = sale.total_raised_ada || 0;
  if (sale.max_raise_ada && currentRaised + ada_amount > sale.max_raise_ada) {
    return Response.json({ error: 'This purchase would exceed the raise cap' }, { status: 400 });
  }

  // Prevent duplicate tx
  const existing = await base44.asServiceRole.entities.TokenSalePurchase.filter({ tx_hash });
  if (existing.length > 0) {
    return Response.json({ purchase: existing[0], duplicate: true });
  }

  const tokens_allocated = sale.token_price_ada ? Math.floor(ada_amount / sale.token_price_ada) : 0;

  // Record purchase
  const purchase = await base44.asServiceRole.entities.TokenSalePurchase.create({
    token_sale_id,
    wallet_address,
    ada_amount,
    tokens_allocated,
    tx_hash,
    status: 'pending_distribution',
    token_ticker: sale.token_ticker,
    token_price_ada_snapshot: sale.token_price_ada
  });

  // Update sale totals
  await base44.asServiceRole.entities.TokenSale.update(token_sale_id, {
    total_raised_ada: currentRaised + ada_amount,
    tokens_sold: (sale.tokens_sold || 0) + tokens_allocated
  });

  return Response.json({ purchase, tokens_allocated });
});