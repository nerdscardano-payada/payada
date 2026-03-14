import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const { token_sale_id, wallet_address, ada_amount, tx_hash,
          cnt_policy_id, cnt_asset_name, cnt_ticker, cnt_decimals, cnt_amount } = await req.json();
  const isCntPayment = !!cnt_policy_id && !!cnt_amount;

  if (!token_sale_id || !wallet_address || !tx_hash || (!ada_amount && !isCntPayment)) {
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

  // Calculate platform fee in ADA (always 1.75% of ADA raised, regardless of fee model)
  const FEE_PERCENT = 1.75;
  const fee_amount_ada = ada_amount * (FEE_PERCENT / 100);
  const merchant_amount_ada = ada_amount - fee_amount_ada;

  // Record purchase + fee Payment in parallel
  const [purchase] = await Promise.all([
    base44.asServiceRole.entities.TokenSalePurchase.create({
      token_sale_id,
      wallet_address,
      ada_amount,
      tokens_allocated,
      tx_hash,
      status: 'pending_distribution',
      token_ticker: sale.token_ticker,
      token_price_ada_snapshot: sale.token_price_ada,
    }),
    base44.asServiceRole.entities.Payment.create({
      merchant_id: sale.merchant_id,
      status: 'confirmed',
      payment_type: 'ada',
      tx_hash,
      expected_amount_ada: ada_amount,
      received_amount_ada: ada_amount,
      fee_amount_ada,
      merchant_amount_ada,
      fee_output_validated: true,
      merchant_output_validated: true,
      confirmed_at: new Date().toISOString(),
      payer_address: wallet_address,
      payer_name: `LaunchPad: ${sale.title} (${sale.token_ticker})`,
    }),
    // Update sale totals
    base44.asServiceRole.entities.TokenSale.update(token_sale_id, {
      total_raised_ada: currentRaised + ada_amount,
      tokens_sold: (sale.tokens_sold || 0) + tokens_allocated,
    }),
  ]);

  return Response.json({ purchase, tokens_allocated });
});