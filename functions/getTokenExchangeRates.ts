import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// TapTools API for CNT/ADA prices (Cardano DEX aggregator)
const TAPTOOLS_BASE = "https://openapi.taptools.io/api/v1";

// Well-known CNT token identifiers
const KNOWN_TOKENS = {
  USDM: {
    policy_id: "c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad",
    asset_name: "0014df1055534d",
    is_stable_usd: true, // pegged to USD, price = 1 USD
  },
  IAG: {
    policy_id: "5d16cc1a177b5d9ba9cfa9793b07e60f1fb70fea1f8aef064415d114",
    asset_name: "494147",
  },
};

async function getAdaFiatRates() {
  const res = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=cardano&vs_currencies=usd,eur"
  );
  if (!res.ok) throw new Error("Failed to fetch ADA fiat rates from CoinGecko");
  const data = await res.json();
  return {
    ada_usd: data.cardano.usd,
    ada_eur: data.cardano.eur,
  };
}

async function getCNTPriceInADA(policy_id, asset_name) {
  // TapTools token price endpoint: price in ADA
  const unit = policy_id + asset_name;
  const res = await fetch(`${TAPTOOLS_BASE}/token/price?unit=${unit}`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) return null;
  const data = await res.json();
  // TapTools returns { price: number } in ADA
  return data?.price ?? null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    // tokens: array of { ticker, policy_id, asset_name } — or use known tokens
    const requestedTokens = body.tokens ?? [];

    // Always fetch ADA/fiat rates
    const adaFiatRates = await getAdaFiatRates();

    const results = {};

    for (const token of requestedTokens) {
      const ticker = token.ticker?.toUpperCase();
      const known = ticker ? KNOWN_TOKENS[ticker] : null;

      const policy_id = token.policy_id ?? known?.policy_id;
      const asset_name = token.asset_name ?? known?.asset_name;
      const is_stable_usd = token.is_stable_usd ?? known?.is_stable_usd ?? false;

      if (!policy_id) {
        results[ticker ?? "unknown"] = { error: "Missing policy_id" };
        continue;
      }

      let price_in_ada = null;

      if (is_stable_usd) {
        // 1 USDM = 1 USD → convert to ADA
        price_in_ada = 1 / adaFiatRates.ada_usd;
      } else {
        price_in_ada = await getCNTPriceInADA(policy_id, asset_name ?? "");
      }

      results[ticker ?? policy_id] = {
        ticker,
        policy_id,
        asset_name,
        price_in_ada,
        price_in_usd: price_in_ada ? price_in_ada * adaFiatRates.ada_usd : null,
        price_in_eur: price_in_ada ? price_in_ada * adaFiatRates.ada_eur : null,
      };
    }

    return Response.json({
      ada_usd: adaFiatRates.ada_usd,
      ada_eur: adaFiatRates.ada_eur,
      tokens: results,
      fetched_at: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});