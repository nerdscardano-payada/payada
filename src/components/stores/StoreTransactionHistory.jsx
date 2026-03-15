import React, { useState, useEffect, useMemo } from "react";
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

export default function StoreTransactionHistory({ store }) {
  const [expanded, setExpanded] = useState(true);
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["store-transactions", store?.id, user?.email],
    queryFn: async () => {
      if (!store || !user) return [];
      
      // Get all payment links for this store's products
      const storePaymentLinks = await base44.entities.PaymentLink.filter(
        { merchant_id: user.email },
        "-created_date",
        100
      );

      // Filter to links that match store products
      const productLinkIds = store.products?.map(p => p.linkId).filter(Boolean) || [];
      const relevantLinks = storePaymentLinks.filter(l => productLinkIds.includes(l.id));

      if (relevantLinks.length === 0) return [];

      // Get payments for these links
      const allPayments = await Promise.all(
        relevantLinks.map(link =>
          base44.entities.Payment.filter({ payment_link_id: link.id }, "-created_date", 50)
        )
      );

      return allPayments.flat().sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 50);
    },
    enabled: !!store && !!user,
  });

  const { data: paymentLinks = [] } = useQuery({
    queryKey: ["store-payment-links", user?.email],
    queryFn: () => base44.entities.PaymentLink.filter({ merchant_id: user.email }, "-created_date", 100),
    enabled: !!user,
  });

  const paymentLinkMap = React.useMemo(() => {
    return paymentLinks.reduce((m, pl) => {
      m[pl.id] = pl.title;
      return m;
    }, {});
  }, [paymentLinks]);

  if (!store) return null;

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 space-y-2">
          {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mt-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100"
      >
        <div>
          <h4 className="font-medium text-slate-900 text-sm">Store Sales</h4>
          <p className="text-xs text-slate-400 mt-0.5">{payments.length} sale{payments.length !== 1 ? "s" : ""}</p>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {expanded && (
        <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
          {payments.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">No sales yet</div>
          ) : (
            payments.map((p) => (
              <div key={p.id} className="p-3 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className="font-medium text-slate-900 text-sm">₳ {(p.received_amount_ada || p.expected_amount_ada || 0).toFixed(2)}</span>
                      <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {paymentLinkMap[p.payment_link_id] || "Unknown Product"}
                      </span>
                      <Badge className={`${STATUS_STYLES[p.status]} text-[10px]`}>
                        {p.status}
                      </Badge>
                    </div>
                    <span className="text-xs text-slate-500">
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