import React from "react";

const CNT_TOKENS = [
  { ticker: "$NIGHT", policy_id: "0691b2fecca1ac4f53cb6dfb00b7013e561d1f34403b957cbb5af1fa", decimals: 0 },
  { ticker: "$Snek", policy_id: "279c909f348e533da5808898f87f9a14bb2c3dfbbacccd631d927a3", decimals: 0 },
  { ticker: "$MIN", policy_id: "29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6", decimals: 0 },
  { ticker: "$INDY", policy_id: "533bb94a8850ee3ccbe483106489399112b74c905342cb1792a797a0", decimals: 0 },
  { ticker: "$SUNDAE", policy_id: "9a9693a9a37912a5097918f97918d15240c92ab729a0b7c4aa144d77", decimals: 0 },
  { ticker: "$WMTX", policy_id: "e5a42a1a1d3d1da71b0449663c32798725888d2eb0843c4dabeca05a", decimals: 0 },
  { ticker: "$CSWAP", policy_id: "c863ceaa796d5429b526c336ab45016abd636859f331758e67204e5c", decimals: 0 },
  { ticker: "$IAG", policy_id: "5d16cc1a177b5d9ba9cfa9793b07e60f1fb70fea1f8aef064415d114", decimals: 0 },
  { ticker: "$STRIKE", policy_id: "f13ac4d66b3ee19a6aa0f2a22298737bd907cc95121662fc971b5275", decimals: 0 },
  { ticker: "$NMKR", policy_id: "5dac8536653edc12f6f5e1045d8164b9f59998d3bdc300fc92843489", decimals: 0 },
  { ticker: "$HOSKY", policy_id: "a0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481ef0", decimals: 0 },
  { ticker: "$TITAN", policy_id: "8483844875ce4d61c2aa459240f277d32081ee08fe0ad16899a0f581", decimals: 0 },
  { ticker: "USDM", policy_id: "c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad", decimals: 0 },
  { ticker: "USDA", policy_id: "fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae456", decimals: 0 },
  { ticker: "DJED", policy_id: "8db269c3ec630e06ae29f74bc39edd1f87c819f1056206e879a1cd61", decimals: 0 },
];

// Mock data for testing CNT transactions
const MOCK_CNT_PAYMENTS = [
  {
    id: "mock-cnt-1",
    status: "confirmed",
    payment_type: "cnt",
    cnt_policy_id: "279c909f348e533da5808898f87f9a14bb2c3dfbbacccd631d927a3",
    merchant_amount_cnt: 4500
  },
  {
    id: "mock-cnt-2",
    status: "confirmed",
    payment_type: "cnt",
    cnt_policy_id: "279c909f348e533da5808898f87f9a14bb2c3dfbbacccd631d927a3",
    merchant_amount_cnt: 2000
  },
  {
    id: "mock-cnt-3",
    status: "confirmed",
    payment_type: "cnt",
    cnt_policy_id: "29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6",
    merchant_amount_cnt: 3200
  }
];

const SIMULATE_CNT = true;

export default function CntRevenueTable({ payments }) {
  const allPayments = SIMULATE_CNT ? [...payments, ...MOCK_CNT_PAYMENTS] : payments;
  // Calculate net revenue per CNT token
  const cntRevenue = {};
  
  CNT_TOKENS.forEach(token => {
    cntRevenue[token.policy_id] = {
      ticker: token.ticker,
      decimals: token.decimals,
      netRevenue: 0,
      paymentCount: 0,
    };
  });

  // Sum up merchant amounts from CNT payments
  payments
    .filter(p => p.status === "confirmed" && p.payment_type === "cnt")
    .forEach(p => {
      if (cntRevenue[p.cnt_policy_id]) {
        cntRevenue[p.cnt_policy_id].netRevenue += p.merchant_amount_cnt || 0;
        cntRevenue[p.cnt_policy_id].paymentCount += 1;
      }
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
                    {(data.netRevenue / Math.pow(10, data.decimals)).toFixed(4)} {data.ticker}
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