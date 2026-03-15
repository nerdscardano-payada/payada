import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const STATUS_STYLES = {
  confirmed: "bg-green-100 text-green-700",
  detected: "bg-orange-100 text-orange-700",
  pending: "bg-slate-100 text-slate-600",
  failed: "bg-red-100 text-red-700",
};

export default function TerminalTransactionHistory({ terminal }) {
  const [expanded, setExpanded] = useState(true);

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["terminal-payments", terminal?.id],
    queryFn: async () => {
      if (!terminal) return [];
      
      // Get the payment link ID from terminal
      const paymentLinkId = terminal.payment_link_slug
        ? (await base44.entities.PaymentLink.filter({ slug: terminal.payment_link_slug }, "-created_date", 1))[0]?.id
        : null;

      if (!paymentLinkId) return [];
      
      // Get payments for this payment link
      return base44.entities.Payment.filter(
        { payment_link_id: paymentLinkId },
        "-created_date",
        50
      );
    },
    enabled: !!terminal,
  });

  if (!terminal) return null;

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 space-y-3">
          {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100"
      >
        <div>
          <h4 className="font-medium text-slate-900 text-sm">Transactions</h4>
          <p className="text-xs text-slate-400 mt-0.5">{payments.length} payment{payments.length !== 1 ? "s" : ""}</p>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {expanded && (
        <div className="divide-y divide-slate-50 max-h-64 overflow-y-auto">
          {payments.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">No transactions yet</div>
          ) : (
            payments.map((p) => (
              <div key={p.id} className="p-3 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="font-medium text-slate-900 truncate">₳ {(p.received_amount_ada || p.expected_amount_ada || 0).toFixed(2)}</span>
                      <Badge className={`${STATUS_STYLES[p.status]} text-[10px]`}>
                        {p.status}
                      </Badge>
                    </div>
                    <span className="text-slate-500">
                      {format(new Date(p.created_date), "dd MMM HH:mm")}
                      {p.payer_name && ` • ${p.payer_name}`}
                    </span>
                  </div>
                  {p.tx_hash && (
                    <a
                      href={`https://cardanoscan.io/transaction/${p.tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-0.5 text-indigo-600 hover:text-indigo-700 flex-shrink-0"
                    >
                      <ExternalLink className="w-2.5 h-2.5" />
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