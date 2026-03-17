import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, ExternalLink, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

function CopyAddress({ address }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button 
      onClick={handleCopy} 
      className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-700 transition-colors"
      title={address}
    >
      <span className="font-mono text-xs">{address.slice(0, 10)}…</span>
      {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

const STATUS_ICONS = {
  confirmed: "✓",
  pending: "⏱",
  detected: "🔍",
  failed: "✗",
  pending_distribution: "📦",
  distributed: "✓",
};

const STATUS_COLORS = {
  confirmed: "text-green-600",
  pending: "text-slate-400",
  detected: "text-orange-500",
  failed: "text-red-600",
  pending_distribution: "text-yellow-500",
  distributed: "text-blue-600",
};

export default function TransactionTimeline() {
  const [showAll, setShowAll] = useState(false);

  const { data: payments = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-recent-payments"],
    queryFn: () => base44.entities.Payment.list("-created_date", 300),
    refetchInterval: 30000,
  });

  const { data: events = [] } = useQuery({
    queryKey: ["admin-events-map"],
    queryFn: () => base44.entities.Event.list("-created_date", 500),
  });
  const eventMap = useMemo(() => events.reduce((m, e) => { m[e.id] = e.title; return m; }, {}), [events]);

  const { data: paymentLinks = [] } = useQuery({
    queryKey: ["admin-payment-links-map"],
    queryFn: () => base44.entities.PaymentLink.list("-created_date", 1000),
  });
  const paymentLinkMap = useMemo(() => paymentLinks.reduce((m, pl) => { m[pl.id] = pl.title; return m; }, {}), [paymentLinks]);

  const displayedPayments = showAll ? payments : payments.slice(0, 15);
  const pendingCount = payments.filter(p => p.status === "pending").length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-slate-800">Transactiestroom</h3>
          {pendingCount > 0 && (
            <span className="bg-orange-100 text-orange-700 text-xs font-medium px-2 py-0.5 rounded-full">
              {pendingCount} in afwachting
            </span>
          )}
        </div>
        <Button
          variant="ghost" size="sm"
          onClick={() => refetch()}
          className="text-slate-500 h-8 px-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Timeline */}
      <div className="p-5 space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-slate-400 text-sm">Laden…</div>
        ) : displayedPayments.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">Geen transacties gevonden.</div>
        ) : (
          <div className="space-y-3">
            {displayedPayments.map((p, idx) => {
              const isAda = p.payment_type !== "cnt";
               const ticker = p.cnt_ticker || "ADA";
               const amount = isAda
                 ? `₳${(p.merchant_amount_ada || p.received_amount_ada || 0).toFixed(2)}`
                 : `${(p.merchant_amount_cnt || p.received_amount_cnt || 0).toLocaleString()} ${ticker}`;
              const fee = isAda ? `₳${(p.fee_amount_ada || 0).toFixed(4)}` : "—";
              const productName = p.payment_link_id 
                ? paymentLinkMap[p.payment_link_id]
                : (p.event_id ? eventMap[p.event_id] : null);
              const isEvent = !!p.event_id;
              const date = p.confirmed_at || p.created_date;
              const timeStr = date ? new Date(date).toLocaleString("nl-BE", { hour: "2-digit", minute: "2-digit" }) : "—";

              return (
                <div key={p.id} className="flex gap-3 pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center pt-0.5">
                    <div className={`w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold ${STATUS_COLORS[p.status]} flex-shrink-0`}>
                      {STATUS_ICONS[p.status]}
                    </div>
                    {idx !== displayedPayments.length - 1 && (
                      <div className="w-0.5 h-8 bg-slate-100 my-1"></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 py-0.5">
                    <div className="flex items-center gap-4 flex-wrap">
                      {/* Product & Amount */}
                      <span className="font-semibold text-slate-900">{amount}</span>
                      {productName && (
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full truncate">
                          {isEvent ? "🎟" : "💳"} {productName}
                        </span>
                      )}
                      {/* Details */}
                      <span className="text-xs text-slate-500 capitalize">{p.status}</span>
                      <span className="text-xs text-slate-500">Fee: {fee}</span>
                      <span className="text-xs text-slate-500">{timeStr}</span>
                      {p.payer_address && <CopyAddress address={p.payer_address} />}
                      {p.tx_hash && (
                        <a
                          href={`https://cardanoscan.io/transaction/${p.tx_hash}`}
                          target="_blank" rel="noopener noreferrer"
                          className="text-indigo-500 hover:text-indigo-700 inline-flex items-center gap-1 text-xs"
                        >
                          TX <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Show more button */}
        {payments.length > 15 && (
          <div className="flex justify-center pt-2 border-t border-slate-100">
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-sm text-slate-500 hover:text-slate-800 transition-colors"
            >
              {showAll ? "Minder tonen" : `Alle ${payments.length} tonen`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}