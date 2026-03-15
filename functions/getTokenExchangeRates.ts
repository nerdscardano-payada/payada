import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Exact same token whitelist as AdminCNTLab
const KNOWN_CNTS = [
  { ticker: "$NIGHT",  policy_id: "0691b2fecca1ac4f53cb6dfb00b7013e561d1f34403b957cbb5af1fa", asset_name: "4e49474854",                         decimals: 0 },
  { ticker: "$Snek",   policy_id: "279c909f348e533da5808898f87f9a14bb2c3dfbbacccd631d927a3",  asset_name: "534e454b",                           decimals: 0 },
  { ticker: "$MIN",    policy_id: "29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6", asset_name: "4d494e",                             decimals: 6 },
  { ticker: "$INDY",   policy_id: "533bb94a8850ee3ccbe483106489399112b74c905342cb1792a797a0", asset_name: "494e4459",                           decimals: 6 },
  { ticker: "$SUNDAE", policy_id: "9a9693a9a37912a5097918f97918d15240c92ab729a0b7c4aa144d77", asset_name: "53554e444145",                       decimals: 6 },
  { ticker: "$WMTX",   policy_id: "e5a42a1a1d3d1da71b0449663c32798725888d2eb0843c4dabeca05a", asset_name: "576f726c644d6f62696c65546f6b656e58", decimals: 6 },
  { ticker: "$CSWAP",  policy_id: "c863ceaa796d5429b526c336ab45016abd636859f331758e67204e5c", asset_name: "4353574150",                         decimals: 6 },
  { ticker: "$IAG",    policy_id: "5d16cc1a177b5d9ba9cfa9793b07e60f1fb70fea1f8aef064415d114", asset_name: "494147",                             decimals: 6 },
  { ticker: "$STRIKE", policy_id: "f13ac4d66b3ee19a6aa0f2a22298737bd907cc95121662fc971b5275", asset_name: "535452494b45",                       decimals: 6 },
  { ticker: "$NMKR",   policy_id: "5dac8536653edc12f6f5e1045d8164b9f59998d3bdc300fc92843489", asset_name: "4e4d4b52",                           decimals: 6 },
  { ticker: "$HOSKY",  policy_id: "a0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481ef0", asset_name: "484f534b59",                         decimals: 0 },
  { ticker: "$TITAN",  policy_id: "8483844875ce4d61c2aa459240f277d32081ee08fe0ad16899a0f581", asset_name: "0014df10544954414e",                   decimals: 6 },
  // Stablecoins (USD-pegged)
  { ticker: "USDM",   policy_id: "c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad", asset_name: "0014df105553444d",   decimals: 6, is_stable_usd: true },
  { ticker: "USDA",   policy_id: "fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae456", asset_name: "55534441",           decimals: 6, is_stable_usd: true },
  { ticker: "DJED",   policy_id: "8db269c3ec630e06ae29f74bc39edd1f87c819f1056206e879a1cd61", asset_name: "446a65644d6963726f555344", decimals: 6, is_stable_usd: true },
  { ticker: "USDCx",  policy_id: "1f3aec8bfe7ea4fe14c5f121e2a92e301afe414147860d557cac7e34", asset_name: "5553444378",         decimals: 6, is_stable_usd: true },
  { ticker: "$LQ",    policy_id: "da8c30857834c6ae7203935b89278c532b3995245295456f993e1d24", asset_name: "4c51",               decimals: 6 },
];

const TAPTOOLS_BASE = "https://openapi.taptools.io/api/v1";

async function getAdaFiatRates() {
  const res = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=cardano&vs_currencies=usd,eur"
  );
  if (!res.ok) throw new Error("Failed to fetch ADA fiat rates from CoinGecko");
  const data = await res.json();
  return { ada_usd: data.cardano.usd, ada_eur: data.cardano.eur };
}

async function getCNTPriceInADA(policy_id, asset_name) {
  const unit = policy_id + asset_name;
  const res = await fetch(`${TAPTOOLS_BASE}/token/price?unit=${unit}`);
  if (!res.ok) return null;
  const data = await res.json();
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

    // If caller passes specific tickers, filter; otherwise return all known tokens
    const requestedTickers = body.tickers
      ? body.tickers.map(t => t.toUpperCase())
      : null;

    const tokensToFetch = requestedTickers
      ? KNOWN_CNTS.filter(t => requestedTickers.includes(t.ticker.toUpperCase()))
      : KNOWN_CNTS;

    const adaFiatRates = await getAdaFiatRates();

    // Fetch all CNT prices in parallel
    const priceResults = await Promise.all(
      tokensToFetch.map(async (token) => {
        let price_in_ada = null;

        if (token.is_stable_usd) {
          // 1 stablecoin = 1 USD → convert to ADA
          price_in_ada = 1 / adaFiatRates.ada_usd;
        } else {
          price_in_ada = await getCNTPriceInADA(token.policy_id, token.asset_name);
        }

        return {
          ticker: token.ticker,
          policy_id: token.policy_id,
          asset_name: token.asset_name,
          decimals: token.decimals,
          is_stable_usd: token.is_stable_usd ?? false,
          price_in_ada,
          price_in_usd: price_in_ada != null ? price_in_ada * adaFiatRates.ada_usd : null,
          price_in_eur: price_in_ada != null ? price_in_ada * adaFiatRates.ada_eur : null,
        };
      })
    );

    // Build tokens map keyed by ticker
    const tokens = {};
    for (const t of priceResults) {
      tokens[t.ticker] = t;
    }

    return Response.json({
      ada_usd: adaFiatRates.ada_usd,
      ada_eur: adaFiatRates.ada_eur,
      tokens,
      fetched_at: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});