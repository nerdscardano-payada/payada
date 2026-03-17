import React from "react";

const KNOWN_DECIMALS = {
  "5d16cc1a177b5d9ba9cfa9793b07e60f1fb70fea1f8aef064415d114": 6, // $IAG
  "29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6": 6, // $MIN
  "5dac8536653edc12f6f5e1045d8164b9f59998d3bdc300fc92843489": 6, // $NMKR
  "c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad": 6, // USDM
  "fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae456": 6, // USDA
  "8db269c3ec630e06ae29f74bc39edd1f87c819f1056206e879a1cd61": 6, // DJED
};

function getDecimals(policyId, stored) {
  if (stored && stored > 0) return stored;
  return KNOWN_DECIMALS[policyId] ?? 0;
}

export default function CntRevenueTable({ payments }) {
  // Calculate net revenue per CNT token from real payments only
  const cntRevenue = {};

  payments
    .filter(p => p.status === "confirmed" && p.payment_type === "cnt")
    .forEach(p => {
      const key = p.cnt_policy_id;
      if (!key) return;
      const KNOWN_TICKERS_TABLE = {
        "5d16cc1a177b5d9ba9cfa9793b07e60f1fb70fea1f8aef064415d114": "$IAG",
        "29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6": "$MIN",
        "279c909f348e533da5808898f87f9a14bb2c3dfbbacccd631d927a3": "$Snek",
        "5dac8536653edc12f6f5e1045d8164b9f59998d3bdc300fc92843489": "$NMKR",
        "c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad": "USDM",
        "fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae456": "USDA",
        "8db269c3ec630e06ae29f74bc39edd1f87c819f1056206e879a1cd61": "DJED",
        "533bb94a8850ee3ccbe483106489399112b74c905342cb1792a797a0": "$INDY",
        "9a9693a9a37912a5097918f97918d15240c92ab729a0b7c4aa144d77": "$SUNDAE",
        "a0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481ef0": "$HOSKY",
      };
      const ticker = p.cnt_ticker || KNOWN_TICKERS_TABLE[key] || key?.slice(0, 8) + "...";
      if (!cntRevenue[key]) {
        cntRevenue[key] = {
          ticker,
          decimals: getDecimals(key, p.cnt_decimals),
          netRevenue: 0,
          paymentCount: 0,
        };
      }
      cntRevenue[key].netRevenue += p.merchant_amount_cnt || p.received_amount_cnt || 0;
      cntRevenue[key].paymentCount += 1;
    });

  // Filter to show only tokens with transactions
  const activeTokens = Object.entries(cntRevenue)
    .filter(([, data]) => data.paymentCount > 0)
    .sort((a, b) => b[1].netRevenue - a[1].netRevenue);

  return (
    <div className="bg-white rounded-xl border border-slate-200/60 p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">Net Revenue per CNT Token</h3>
      
      {activeTokens.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-8">No CNT transactions yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                <th className="pb-3 font-semibold">Token</th>
                <th className="pb-3 font-semibold">Payments</th>
                <th className="pb-3 font-semibold text-right">Net Revenue</th>
              </tr>
            </thead>
            <tbody>
              {activeTokens.map(([policyId, data]) => (
                <tr key={policyId} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 font-medium text-slate-900">{data.ticker}</td>
                  <td className="py-3 text-slate-600">{data.paymentCount}</td>
                  <td className="py-3 text-right font-semibold text-green-600">
                    {Number(data.netRevenue).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: data.decimals })} {data.ticker}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}