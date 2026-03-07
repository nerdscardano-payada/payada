import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, DollarSign, Users, Activity } from "lucide-react";

function StatCard({ title, value, subtitle, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <p className={`text-2xl font-bold mt-1 ${color || "text-slate-900"}`}>{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-2.5 rounded-lg ${color === "text-green-600" ? "bg-green-50" : "bg-indigo-50"}`}>
          <Icon className={`w-5 h-5 ${color || "text-indigo-500"}`} />
        </div>
      </div>
    </div>
  );
}

// Mock data for testing CNT fees
const MOCK_CNT_PAYMENTS = [
  {
    id: "mock-1",
    merchant_id: "test-merchant",
    status: "confirmed",
    payment_type: "cnt",
    cnt_ticker: "$Snek",
    cnt_policy_id: "279c909f348e533da5808898f87f9a14bb2c3dfbbacccd631d927a3",
    cnt_decimals: 0,
    received_amount_cnt: 5000,
    confirmed_at: new Date().toISOString(),
    tx_hash: "0a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t",
    cnt_fees: [
      { ticker: "$Snek", policy_id: "279c909f348e533da5808898f87f9a14bb2c3dfbbacccd631d927a3", decimals: 0, amount: 50 },
      { ticker: "$NIGHT", policy_id: "0691b2fecca1ac4f53cb6dfb00b7013e561d1f34403b957cbb5af1fa", decimals: 0, amount: 75 }
    ]
  },
  {
    id: "mock-2",
    merchant_id: "test-merchant",
    status: "confirmed",
    payment_type: "cnt",
    cnt_ticker: "$MIN",
    cnt_policy_id: "29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6",
    cnt_decimals: 0,
    received_amount_cnt: 3000,
    confirmed_at: new Date(Date.now() - 86400000).toISOString(),
    tx_hash: "1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0",
    cnt_fees: [
      { ticker: "$MIN", policy_id: "29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6", decimals: 0, amount: 30 },
      { ticker: "$Snek", policy_id: "279c909f348e533da5808898f87f9a14bb2c3dfbbacccd631d927a3", decimals: 0, amount: 25 }
    ]
  }
];

const SIMULATE_CNT = true; // Toggle to enable/disable mock data

export default function FeeRevenueStats() {
  const [feeTypeTab, setFeeTypeTab] = useState("ada");

  const { data: confirmedPayments = [], isLoading } = useQuery({
    queryKey: ["admin-fee-stats"],
    queryFn: () => base44.entities.Payment.filter({ status: "confirmed" }, "-confirmed_at", 500),
  });

  const { data: merchants = [] } = useQuery({
    queryKey: ["admin-merchants"],
    queryFn: () => base44.entities.MerchantProfile.list("-created_date", 200),
  });

  // Combine real data with mock data if simulation is enabled
  const allPayments = SIMULATE_CNT ? [...confirmedPayments, ...MOCK_CNT_PAYMENTS] : confirmedPayments;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-slate-200 rounded-xl" />
        ))}
      </div>
    );
  }

  const adaPayments = allPayments.filter(p => p.payment_type === "ada" || !p.payment_type);
  const cntPayments = allPayments.filter(p => p.payment_type === "cnt");

  const totalFeeAda = adaPayments.reduce((sum, p) => sum + (p.fee_amount_ada || 0), 0);
  const totalVolumeAda = adaPayments.reduce((sum, p) => sum + (p.received_amount_ada || 0), 0);

  // CNT fee totals - aggregate from cnt_fees array in each payment
  const cntFeesByToken = {};
  allPayments.forEach(p => {
    if (p.cnt_fees && Array.isArray(p.cnt_fees)) {
      p.cnt_fees.forEach(fee => {
        const key = `${fee.policy_id}|${fee.ticker || "unknown"}`;
        if (!cntFeesByToken[key]) {
          cntFeesByToken[key] = { ticker: fee.ticker, policy_id: fee.policy_id, decimals: fee.decimals || 0, totalFees: 0 };
        }
        cntFeesByToken[key].totalFees += fee.amount || 0;
      });
    }
  });

  // CNT payment volume totals
  const cntByToken = {};
  cntPayments.forEach(p => {
    const key = `${p.cnt_policy_id}|${p.cnt_ticker || "unknown"}`;
    if (!cntByToken[key]) {
      cntByToken[key] = { ticker: p.cnt_ticker, policy_id: p.cnt_policy_id, decimals: p.cnt_decimals || 0, amount: 0 };
    }
    cntByToken[key].amount += p.received_amount_cnt || 0;
  });

  // Last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentPayments = adaPayments.filter(p => p.confirmed_at && new Date(p.confirmed_at) >= thirtyDaysAgo);
  const recentFeeAda = recentPayments.reduce((sum, p) => sum + (p.fee_amount_ada || 0), 0);

  // Per merchant breakdown
  const merchantFees = {};
  allPayments.forEach(p => {
    if (!merchantFees[p.merchant_id]) merchantFees[p.merchant_id] = 0;
    merchantFees[p.merchant_id] += p.fee_amount_ada || 0;
  });
  const topMerchants = Object.entries(merchantFees)
    .filter(([_, fees]) => fees > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Tabs for ADA/CNT Fees */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setFeeTypeTab("ada")}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
            feeTypeTab === "ada"
              ? "text-indigo-600 border-indigo-600"
              : "text-slate-600 border-transparent hover:text-slate-900"
          }`}
        >
          ADA Fees
        </button>
        {cntPayments.length > 0 && (
          <button
            onClick={() => setFeeTypeTab("cnt")}
            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
              feeTypeTab === "cnt"
                ? "text-indigo-600 border-indigo-600"
                : "text-slate-600 border-transparent hover:text-slate-900"
            }`}
          >
            CNT Fees
          </button>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {feeTypeTab === "ada" ? (
          <>
            <StatCard
              title="Totale Fee Inkomsten"
              value={`₳${totalFeeAda.toFixed(2)}`}
              subtitle="Alle tijden"
              icon={TrendingUp}
              color="text-green-600"
            />
            <StatCard
              title="Fee (30 dagen)"
              value={`₳${recentFeeAda.toFixed(2)}`}
              subtitle="Laatste 30 dagen"
              icon={DollarSign}
              color="text-green-600"
            />
            <StatCard
              title="Totaal Volume"
              value={`₳${totalVolumeAda.toFixed(2)}`}
              subtitle={`${adaPayments.length} betalingen`}
              icon={Activity}
            />
            <StatCard
              title="Actieve Merchants"
              value={merchants.length}
              subtitle="Geregistreerd"
              icon={Users}
            />
          </>
        ) : (
          <>
            <StatCard
              title="CNT Fee Tokens"
              value={Object.entries(cntFeesByToken).length}
              subtitle="Unieke tokens"
              icon={TrendingUp}
              color="text-green-600"
            />
            <StatCard
              title="CNT Betalingen"
              value={cntPayments.length}
              subtitle="Transacties"
              icon={Activity}
            />
            <StatCard
              title="Actieve Merchants"
              value={merchants.length}
              subtitle="Geregistreerd"
              icon={Users}
            />
            <div className="bg-white rounded-xl border border-slate-200 p-5"></div>
          </>
        )}
      </div>

      {/* Content based on tab */}
      {feeTypeTab === "ada" ? (
        <>
          {/* Top merchants by ADA fee */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Top Merchants op Fee-inkomsten (ADA)</h3>
            {topMerchants.length === 0 ? (
              <p className="text-slate-400 text-sm">Nog geen confirmed betalingen.</p>
            ) : (
              <div className="space-y-2">
                {topMerchants.map(([merchantId, feeAda], idx) => {
                  const merchant = merchants.find(m => m.merchant_id === merchantId);
                  return (
                    <div key={merchantId} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-400 w-5">#{idx + 1}</span>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{merchant?.business_name || merchantId}</p>
                          <p className="text-xs text-slate-400">{merchantId}</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-green-600">₳{feeAda.toFixed(4)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* CNT Fee Breakdown per Token */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
            <h3 className="text-sm font-semibold text-blue-900 mb-4">🧪 CNT Fee Inkomsten per Token</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-blue-700 border-b border-blue-200">
                    <th className="pb-3 font-semibold">Token</th>
                    <th className="pb-3 font-semibold">Betalingen</th>
                    <th className="pb-3 font-semibold text-right">Fee Inkomsten</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(cntFeesByToken)
                    .sort((a, b) => b[1].totalFees - a[1].totalFees)
                    .map(([key, data]) => (
                      <tr key={key} className="border-b border-blue-100 hover:bg-white/50 transition-colors">
                        <td className="py-3 font-medium text-blue-900">{data.ticker || "Unknown"}</td>
                        <td className="py-3 text-blue-700">
                          {allPayments.filter(p => p.cnt_fees?.some(f => f.policy_id === data.policy_id)).length}
                        </td>
                        <td className="py-3 text-right font-semibold text-green-600">
                          {(data.totalFees / Math.pow(10, data.decimals)).toFixed(4)} {data.ticker}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Recent payments table - shown for both tabs */}
      {feeTypeTab === "ada" && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Recente ADA Betalingen (met fee)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                  <th className="pb-2 font-medium">TX Hash</th>
                  <th className="pb-2 font-medium">Ontvangen</th>
                  <th className="pb-2 font-medium">Fee</th>
                  <th className="pb-2 font-medium">Datum</th>
                </tr>
              </thead>
              <tbody>
                {adaPayments.slice(0, 10).map(p => (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-2 font-mono text-xs text-slate-500">
                      {p.tx_hash ? `${p.tx_hash.slice(0, 12)}...` : "—"}
                    </td>
                    <td className="py-2 text-slate-800 font-medium">₳{(p.received_amount_ada || 0).toFixed(4)}</td>
                    <td className="py-2 text-green-600 font-medium">₳{(p.fee_amount_ada || 0).toFixed(4)}</td>
                    <td className="py-2 text-slate-400 text-xs">
                      {p.confirmed_at ? new Date(p.confirmed_at).toLocaleDateString("nl-BE") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {adaPayments.length === 0 && (
              <p className="text-slate-400 text-sm text-center py-4">Nog geen confirmed ADA betalingen.</p>
            )}
          </div>
        </div>
      )}

      {feeTypeTab === "cnt" && cntPayments.length > 0 && (
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
          <h3 className="text-sm font-semibold text-blue-900 mb-4">🧪 Recente CNT Betalingen</h3>
          <div className="space-y-4">
            {cntPayments.slice(0, 10).map(p => (
              <div key={p.id} className="p-3 bg-white rounded-lg border border-blue-100">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-blue-900">{p.cnt_ticker || "Unknown"}</p>
                    <p className="text-xs text-blue-600 font-mono">{p.tx_hash ? `${p.tx_hash.slice(0, 20)}...` : "—"}</p>
                  </div>
                  <p className="text-xs text-slate-500">
                    {p.confirmed_at ? new Date(p.confirmed_at).toLocaleDateString("nl-BE") : "—"}
                  </p>
                </div>
                <p className="text-sm text-blue-900 mb-2">
                  Ontvangen: {((p.received_amount_cnt || 0) / Math.pow(10, p.cnt_decimals || 0)).toFixed(4)} {p.cnt_ticker}
                </p>
                {p.cnt_fees && p.cnt_fees.length > 0 && (
                  <div className="text-xs space-y-1 pt-2 border-t border-blue-100">
                    <p className="font-medium text-green-700">Fees Earned:</p>
                    {p.cnt_fees.map((fee, idx) => (
                      <p key={idx} className="text-green-600">
                        {(fee.amount / Math.pow(10, fee.decimals || 0)).toFixed(4)} {fee.ticker}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}