import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

function formatPaymentAmount(payment) {
  if (payment.payment_type === "cnt") {
    const decimals = payment.cnt_decimals || 0;
    const amount = payment.merchant_amount_cnt ?? payment.received_amount_cnt ?? payment.expected_amount_cnt ?? 0;
    return `${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: decimals })} ${payment.cnt_ticker || "CNT"}`;
  }

  return `₳ ${(payment.received_amount_ada || payment.expected_amount_ada || 0).toFixed(2)}`;
}

export default function ButtonTransactionView({ selectedLink }) {
  const [expanded, setExpanded] = useState(false);

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["button-link-payments", selectedLink?.id],
    queryFn: () =>
      base44.entities.Payment.filter(
        { payment_link_id: selectedLink.id },
        "-created_date",
        20
      ),
    enabled: !!selectedLink,
  });

  if (!selectedLink || payments.length === 0) return null;

  const confirmed = payments.filter(p => p.status === "confirmed");
  const volumeLabel = selectedLink?.amount_mode === "fixed_cnt"
    ? (() => {
        const amount = confirmed.reduce((sum, p) => sum + (p.merchant_amount_cnt ?? p.received_amount_cnt ?? 0), 0);
        const decimals = selectedLink?.cnt_decimals || 0;
        return `${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: decimals })} ${selectedLink?.cnt_ticker || "CNT"}`;
      })()
    : `₳ ${confirmed.reduce((sum, p) => sum + (p.received_amount_ada || 0), 0).toFixed(2)}`;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mt-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors border-b border-slate-100"
      >
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">"{selectedLink.title}" Transactions</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {confirmed.length} confirmed • {volumeLabel} volume
          </p>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {expanded && (
        <div className="divide-y divide-slate-50 max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 space-y-2">
              {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
            </div>
          ) : payments.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">No transactions yet</div>
          ) : (
            payments.map((p) => (
              <div key={p.id} className="p-3 hover:bg-slate-50/50 transition-colors text-xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-slate-900">{formatPaymentAmount(p)}</span>
                      <Badge className={p.status === "confirmed" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}>
                        {p.status}
                      </Badge>
                    </div>
                    <span className="text-slate-500">
                      {format(new Date(p.created_date), "dd MMM HH:mm")}
                      {p.payer_name && ` • ${p.payer_name}`}
                      {p.payer_address && ` • ${p.payer_address.slice(0, 10)}…`}
                    </span>
                  </div>
                  {p.tx_hash && (
                    <a
                      href={`https://cardanoscan.io/transaction/${p.tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-0.5 text-indigo-600 hover:text-indigo-700 flex-shrink-0"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}