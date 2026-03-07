import React from "react";
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

export default function FeeRevenueStats() {
  const { data: confirmedPayments = [], isLoading } = useQuery({
    queryKey: ["admin-fee-stats"],
    queryFn: () => base44.entities.Payment.filter({ status: "confirmed" }, "-confirmed_at", 500),
  });

  const { data: merchants = [] } = useQuery({
    queryKey: ["admin-merchants"],
    queryFn: () => base44.entities.MerchantProfile.list("-created_date", 200),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-slate-200 rounded-xl" />
        ))}
      </div>
    );
  }

  const adaPayments = confirmedPayments.filter(p => p.payment_type === "ada" || !p.payment_type);
  const cntPayments = confirmedPayments.filter(p => p.payment_type === "cnt");

  const totalFeeAda = adaPayments.reduce((sum, p) => sum + (p.fee_amount_ada || 0), 0);
  const totalVolumeAda = adaPayments.reduce((sum, p) => sum + (p.received_amount_ada || 0), 0);

  // CNT totals
  const cntByToken = {};
  cntPayments.forEach(p => {
    const key = `${p.cnt_policy_id}|${p.cnt_ticker || "unknown"}`;
    if (!cntByToken[key]) {
      cntByToken[key] = { ticker: p.cnt_ticker, policy_id: p.cnt_policy_id, decimals: p.cnt_decimals || 0, amount: 0, fees: 0 };
    }
    cntByToken[key].amount += p.received_amount_cnt || 0;
    cntByToken[key].fees += p.fee_amount_cnt || 0;
  });

  // Last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentPayments = adaPayments.filter(p => p.confirmed_at && new Date(p.confirmed_at) >= thirtyDaysAgo);
  const recentFeeAda = recentPayments.reduce((sum, p) => sum + (p.fee_amount_ada || 0), 0);

  // Per merchant breakdown
  const merchantFees = {};
  confirmedPayments.forEach(p => {
    if (!merchantFees[p.merchant_id]) merchantFees[p.merchant_id] = 0;
    merchantFees[p.merchant_id] += p.fee_amount_ada || 0;
  });
  const topMerchants = Object.entries(merchantFees)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
          subtitle={`${confirmedPayments.length} betalingen`}
          icon={Activity}
        />
        <StatCard
          title="Actieve Merchants"
          value={merchants.length}
          subtitle="Geregistreerd"
          icon={Users}
        />
      </div>

      {/* Top merchants by fee */}
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

      {/* CNT Fee Breakdown - Admin Only */}
      {cntPayments.length > 0 && (
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
          <h3 className="text-sm font-semibold text-blue-900 mb-4">🧪 CNT Fee Inkomsten (In Ontwikkeling)</h3>
          {Object.entries(cntByToken).length === 0 ? (
            <p className="text-blue-700 text-sm">Nog geen CNT betalingen.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(cntByToken).map(([key, data]) => (
                <div key={key} className="p-3 bg-white rounded-lg border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-900">{data.ticker || "Unknown Token"}</p>
                      <p className="text-xs text-blue-600 font-mono">{key.split("|")[0].slice(0, 20)}...</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-blue-900">{(data.amount / Math.pow(10, data.decimals)).toFixed(4)} {data.ticker}</p>
                      <p className="text-xs text-green-600 font-medium">Fee Earned: {(data.fees / Math.pow(10, data.decimals)).toFixed(4)} {data.ticker}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recent confirmed ADA payments table */}
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

      {/* Recent CNT payments - Admin Only */}
      {cntPayments.length > 0 && (
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
          <h3 className="text-sm font-semibold text-blue-900 mb-4">🧪 Recente CNT Betalingen (In Ontwikkeling)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-blue-600 border-b border-blue-100">
                  <th className="pb-2 font-medium">Token</th>
                  <th className="pb-2 font-medium">TX Hash</th>
                  <th className="pb-2 font-medium">Ontvangen</th>
                  <th className="pb-2 font-medium">Fee (ADA)</th>
                  <th className="pb-2 font-medium">Datum</th>
                </tr>
              </thead>
              <tbody>
                {cntPayments.slice(0, 10).map(p => (
                  <tr key={p.id} className="border-b border-blue-50 hover:bg-blue-100/30">
                    <td className="py-2 text-blue-900 font-medium">{p.cnt_ticker || "Unknown"}</td>
                    <td className="py-2 font-mono text-xs text-blue-600">
                      {p.tx_hash ? `${p.tx_hash.slice(0, 12)}...` : "—"}
                    </td>
                    <td className="py-2 text-blue-900 font-medium">{((p.received_amount_cnt || 0) / Math.pow(10, p.cnt_decimals || 0)).toFixed(4)} {p.cnt_ticker}</td>
                    <td className="py-2 text-green-600 font-medium">₳{(p.fee_amount_ada || 0).toFixed(4)}</td>
                    <td className="py-2 text-blue-600 text-xs">
                      {p.confirmed_at ? new Date(p.confirmed_at).toLocaleDateString("nl-BE") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}