import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Called AFTER the signed tx is submitted on-chain.
// 1. Marks purchase_ids as distributed
// 2. Creates a Payment fee record so revenue shows up in admin dashboards

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

    // Fetch the purchases to calculate fee info
    const purchases = await Promise.all(
      purchase_ids.map(id => base44.asServiceRole.entities.TokenSalePurchase.filter({ id }).then(r => r[0]))
    );
    const validPurchases = purchases.filter(Boolean);

    // Mark all as distributed
    await Promise.all(purchase_ids.map(id =>
      base44.asServiceRole.entities.TokenSalePurchase.update(id, {
        status: 'distributed',
        distributed_at: now,
        distribution_tx_hash: tx_hash,
      })
    ));

    // Build fee record if we have purchases
    if (validPurchases.length > 0) {
      const token_sale_id = validPurchases[0].token_sale_id;
      const sales = await base44.asServiceRole.entities.TokenSale.filter({ id: token_sale_id });
      const sale = sales[0];

      if (sale) {
        const FEE_PERCENT = 1.75;
        const feeRatio = FEE_PERCENT / 100;

        // Sum fee tokens across all purchases
        const totalFeeTokens = validPurchases.reduce((sum, p) => {
          const gross = p.tokens_allocated || 0;
          const fee = gross - Math.floor(gross * (1 - feeRatio));
          return sum + fee;
        }, 0);

        // ADA value of fee tokens (use snapshot price from first purchase, fallback to sale price)
        const tokenPriceAda = validPurchases[0].token_price_ada_snapshot || sale.token_price_ada || 0;
        const feeValueAda = totalFeeTokens * tokenPriceAda;
        const feeValueLovelace = Math.round(feeValueAda * 1_000_000);

        // Determine if this sale accepted CNT payments
        const acceptedCurrencies = sale.accepted_currencies || ['ADA'];
        const hasCntPayments = acceptedCurrencies.some(c => c !== 'ADA');

        // Always record the token fee in cnt_fees (it IS a native token)
        const cntFees = [{
          policy_id: sale.token_policy_id,
          asset_name: sale.token_asset_name || '',
          ticker: sale.token_ticker,
          decimals: sale.token_decimals || 0,
          amount: totalFeeTokens,
        }];

        // Create a Payment record for the fee
        // - fee_amount_ada: ADA-equivalent value (for ADA-funded sales)
        // - cnt_fees: actual token fee (always, since fee is in tokens)
        await base44.asServiceRole.entities.Payment.create({
          merchant_id: sale.merchant_id,
          status: 'confirmed',
          payment_type: 'cnt',
          tx_hash,
          // ADA equivalent of fee (relevant when buyers paid ADA)
          fee_amount_ada: hasCntPayments ? 0 : feeValueAda,
          merchant_amount_ada: 0,
          // Token fee breakdown
          cnt_fees: cntFees,
          // Context
          confirmed_at: now,
          fee_output_validated: true,
          merchant_output_validated: true,
          // Store in payer_name for admin reference
          payer_name: `LaunchPad distribution: ${sale.title} (${purchase_ids.length} buyers, ${totalFeeTokens.toLocaleString()} ${sale.token_ticker} fee)`,
        });
      }
    }

    return Response.json({ success: true, distributed: purchase_ids.length, tx_hash });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});