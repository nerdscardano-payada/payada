import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import { CreditCard, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function Payments() {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["payments", user?.email],
    queryFn: () => base44.entities.Payment.filter({ merchant_id: user.email }, "-created_date", 200),
    enabled: !!user,
  });

  return (
    <div>
      <PageHeader
        title="Payments"
        subtitle="Track all incoming ADA payments"
      />

      <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
        {isLoading ? (
          <div className="p-5 space-y-3">
            {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : payments.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No payments yet"
            description="Payments will appear here once customers pay through your links."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Payer</th>
                      <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Amount</th>
                      <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Fee (1.75%)</th>
                      <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Net</th>
                      <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                      <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Confirmations</th>
                      <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Tx Hash</th>
                      <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{p.payer_email || "Anonymous"}</p>
                        {p.payer_name && <p className="text-xs text-slate-400">{p.payer_name}</p>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                       <div>
                         <span className="text-sm font-semibold text-slate-900 tabular-nums">
                           ₳ {(p.received_amount_ada || p.expected_amount_ada)?.toFixed(3)}
                         </span>
                         {p.fiat_value_snapshot && (
                           <p className="text-xs text-slate-400">{p.fiat_currency} {p.fiat_value_snapshot.toFixed(2)}</p>
                         )}
                       </div>
                     </td>
                     <td className="px-5 py-3.5">
                       <span className="text-sm text-slate-600 tabular-nums">₳ {(p.fee_amount_ada || 0).toFixed(3)}</span>
                     </td>
                     <td className="px-5 py-3.5">
                       <span className="text-sm font-semibold text-emerald-600 tabular-nums">₳ {((p.merchant_amount_ada || p.received_amount_ada || p.expected_amount_ada) - (p.fee_amount_ada || 0))?.toFixed(3)}</span>
                     </td>
                     <td className="px-5 py-3.5">
                       <StatusBadge status={p.status} />
                     </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="text-sm text-slate-600 tabular-nums">{p.confirmations || 0}</span>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      {p.tx_hash ? (
                        <a
                          href={`https://cardanoscan.io/transaction/${p.tx_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-600 hover:text-indigo-700 font-mono flex items-center gap-1"
                        >
                          {p.tx_hash.slice(0, 12)}...
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-slate-500">
                        {format(new Date(p.created_date), "MMM d, HH:mm")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}