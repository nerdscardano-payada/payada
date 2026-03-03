import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, RotateCcw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MerchantOverview() {
  const queryClient = useQueryClient();
  const [resetting, setResetting] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const { data: merchants = [], isLoading: loadingMerchants } = useQuery({
    queryKey: ["admin-merchants-overview"],
    queryFn: () => base44.entities.MerchantProfile.list("-created_date", 100),
  });

  const { data: payments = [], isLoading: loadingPayments } = useQuery({
    queryKey: ["admin-all-payments"],
    queryFn: () => base44.entities.Payment.list("-created_date", 500),
  });

  const { data: paymentLinks = [] } = useQuery({
    queryKey: ["admin-all-links"],
    queryFn: () => base44.entities.PaymentLink.list("-created_date", 500),
  });

  const handleResetStats = async () => {
    setResetting(true);
    try {
      // Delete all Payment records
      for (const p of payments) {
        await base44.entities.Payment.delete(p.id);
      }
      // Reset PaymentLink stats
      for (const link of paymentLinks) {
        await base44.entities.PaymentLink.update(link.id, {
          total_received_ada: 0,
          payment_count: 0,
        });
      }
      // Invalidate all relevant queries
      queryClient.invalidateQueries();
      setConfirmReset(false);
    } catch (e) {
      console.error(e);
    }
    setResetting(false);
  };

  const paymentsByMerchant = {};
  payments.forEach(p => {
    if (!paymentsByMerchant[p.merchant_id]) paymentsByMerchant[p.merchant_id] = [];
    paymentsByMerchant[p.merchant_id].push(p);
  });

  if (loadingMerchants || loadingPayments) {
    return <div className="h-40 bg-slate-100 rounded-xl animate-pulse" />;
  }

  return (
    <div className="space-y-4">
      {/* Reset button */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Statistieken Nulstellen
            </h3>
            <p className="text-xs text-red-600 mt-1">
              Verwijdert alle Payment records en reset PaymentLink statistieken (volume, aantal). Onomkeerbaar!
            </p>
          </div>
          {!confirmReset ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmReset(true)}
              className="flex-shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Nulstellen
            </Button>
          ) : (
            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="destructive"
                size="sm"
                disabled={resetting}
                onClick={handleResetStats}
              >
                {resetting ? "Bezig..." : "Ja, nulstellen"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmReset(false)}
              >
                Annuleer
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Merchants table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-700">Alle Merchants ({merchants.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-400 bg-slate-50 border-b border-slate-100">
                <th className="px-5 py-3 font-medium">Bedrijf</th>
                <th className="px-5 py-3 font-medium">Email (user_id)</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Fee %</th>
                <th className="px-5 py-3 font-medium">Betalingen</th>
                <th className="px-5 py-3 font-medium">Volume (ADA)</th>
                <th className="px-5 py-3 font-medium">Lid sinds</th>
              </tr>
            </thead>
            <tbody>
              {merchants.map(m => {
                const mPayments = paymentsByMerchant[m.user_id] || [];
                const confirmed = mPayments.filter(p => p.status === "confirmed");
                const volume = confirmed.reduce((s, p) => s + (p.received_amount_ada || 0), 0);
                return (
                  <tr key={m.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-800">{m.business_name}</td>
                    <td className="px-5 py-3 text-slate-500 text-xs font-mono">{m.user_id}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                        m.status === "active" ? "bg-green-100 text-green-700" :
                        m.status === "suspended" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {m.status || "active"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{m.platform_fee_percent || 1.75}%</td>
                    <td className="px-5 py-3 text-slate-600">{confirmed.length} / {mPayments.length}</td>
                    <td className="px-5 py-3 font-medium text-slate-800">₳{volume.toFixed(4)}</td>
                    <td className="px-5 py-3 text-slate-400 text-xs">
                      {m.created_date ? new Date(m.created_date).toLocaleDateString("nl-BE") : "—"}
                    </td>
                  </tr>
                );
              })}
              {merchants.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-400">Nog geen merchants.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}