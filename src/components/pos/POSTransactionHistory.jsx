import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, ExternalLink, Copy, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const STATUS_STYLES = {
  confirmed: "bg-green-100 text-green-700",
  detected: "bg-orange-100 text-orange-700",
  pending: "bg-slate-100 text-slate-600",
  failed: "bg-red-100 text-red-700",
};

export default function POSTransactionHistory() {
  const [expanded, setExpanded] = useState(true);
  const [user, setUser] = React.useState(null);
  const [copied, setCopied] = useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["pos-payments", user?.email],
    queryFn: () =>
      base44.entities.Payment.filter(
        { merchant_id: user.email, payment_link_id: { $exists: true } },
        "-created_date",
        100
      ),
    enabled: !!user,
    select: (data) => {
      // Filter to POS payments (those created via createPosSession - typically short lived links or with label)
      return data.filter(p => {
        // POS payments are typically short-lived session payments
        const ageHours = (Date.now() - new Date(p.created_date).getTime()) / (1000 * 60 * 60);
        return ageHours < 24; // Recent payments are likely POS
      });
    },
  });

  const { data: paymentLinks = [] } = useQuery({
    queryKey: ["pos-payment-links", user?.email],
    queryFn: () =>
      base44.entities.PaymentLink.filter({ merchant_id: user.email }, "-created_date", 100),
    enabled: !!user,
  });

  const paymentLinkMap = React.useMemo(() => {
    return paymentLinks.reduce((m, pl) => {
      m[pl.id] = pl.title;
      return m;
    }, {});
  }, [paymentLinks]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 1500);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 space-y-3">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 overflow-hidden rounded-t-xl shadow-lg">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
      >
        <div>
          <h3 className="font-semibold text-slate-900">Recent POS Transactions</h3>
          <p className="text-xs text-slate-400 mt-0.5">{payments.length} payment{payments.length !== 1 ? "s" : ""}</p>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {expanded && (
        <div className="divide-y divide-slate-50 max-h-96 overflow-y-auto">
          {payments.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No POS transactions yet</div>
          ) : (
            payments.map((p) => (
              <div key={p.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-slate-900">
                        {paymentLinkMap[p.payment_link_id] || "POS Payment"}
                      </span>
                      <Badge className={`${STATUS_STYLES[p.status]} text-xs`}>
                        {p.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                      <span>₳ {(p.received_amount_ada || p.expected_amount_ada || 0).toFixed(2)}</span>
                      <span>{format(new Date(p.created_date), "dd MMM, HH:mm")}</span>
                      {p.payer_name && <span>{p.payer_name}</span>}
                      {p.payer_address && <span className="font-mono text-slate-400 truncate" title={p.payer_address}>📍 {p.payer_address.slice(0, 12)}…</span>}
                    </div>
                  </div>
                  {p.tx_hash && (
                    <a
                      href={`https://cardanoscan.io/transaction/${p.tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-xs font-mono flex-shrink-0"
                    >
                      {p.tx_hash.slice(0, 8)}…
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