import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import { CreditCard, ExternalLink, Search, X, MapPin } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const KNOWN_DECIMALS = {
  "5d16cc1a177b5d9ba9cfa9793b07e60f1fb70fea1f8aef064415d114": 6, // $IAG
  "29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6": 6, // $MIN
  "5dac8536653edc12f6f5e1045d8164b9f59998d3bdc300fc92843489": 6, // $NMKR
  "c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad": 6, // USDM
  "fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae456": 6, // USDA
  "8db269c3ec630e06ae29f74bc39edd1f87c819f1056206e879a1cd61": 6, // DJED
};

function getCntDecimals(policyId, storedDecimals) {
  if (storedDecimals && storedDecimals > 0) return storedDecimals;
  return KNOWN_DECIMALS[policyId] ?? 0;
}

export default function Payments() {
  const [user, setUser] = React.useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState("all");

  React.useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["payments", user?.email],
    queryFn: () => base44.entities.Payment.filter({ merchant_id: user.email }, "-created_date", 200),
    enabled: !!user,
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return payments.filter(p => {
      const matchesSearch = !q ||
        p.payer_email?.toLowerCase().includes(q) ||
        p.payer_name?.toLowerCase().includes(q) ||
        p.payer_address?.toLowerCase().includes(q) ||
        p.tx_hash?.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      const matchesType = paymentTypeFilter === "all" || (p.payment_type || "ada") === paymentTypeFilter || (paymentTypeFilter === "ada" && !p.payment_type);
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [payments, search, statusFilter, paymentTypeFilter]);

  const clearFilters = () => { setSearch(""); setStatusFilter("all"); setPaymentTypeFilter("all"); };
  const hasFilters = search || statusFilter !== "all" || paymentTypeFilter !== "all";
  const hasCntPayments = payments.some(p => p.payment_type === "cnt");

  return (
    <div>
      <PageHeader
        title="Payments"
        subtitle="Track all incoming ADA payments"
      />

      {/* Filters */}
       <div className="flex flex-wrap gap-3 mb-4">
         <div className="relative flex-1 min-w-[200px]">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
           <Input
             placeholder="Search by email, name, address or tx hash…"
             value={search}
             onChange={e => setSearch(e.target.value)}
             className="pl-9"
           />
         </div>
         <Select value={statusFilter} onValueChange={setStatusFilter}>
           <SelectTrigger className="w-40">
             <SelectValue placeholder="All statuses" />
           </SelectTrigger>
           <SelectContent>
             <SelectItem value="all">All statuses</SelectItem>
             <SelectItem value="pending">Pending</SelectItem>
             <SelectItem value="detected">Detected</SelectItem>
             <SelectItem value="confirmed">Confirmed</SelectItem>
             <SelectItem value="expired">Expired</SelectItem>
             <SelectItem value="failed">Failed</SelectItem>
           </SelectContent>
         </Select>
         {hasCntPayments && (
           <Select value={paymentTypeFilter} onValueChange={setPaymentTypeFilter}>
             <SelectTrigger className="w-40">
               <SelectValue placeholder="Payment type" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="all">All types</SelectItem>
               <SelectItem value="ada">ADA</SelectItem>
               <SelectItem value="cnt">CNT</SelectItem>
             </SelectContent>
           </Select>
         )}
         {hasFilters && (
           <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-slate-500">
             <X className="w-3.5 h-3.5" /> Clear
           </Button>
         )}
       </div>

      <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
        {isLoading ? (
          <div className="p-5 space-y-3">
            {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title={hasFilters ? "No payments match your filters" : "No payments yet"}
            description={hasFilters ? "Try adjusting your search or filters." : "Payments will appear here once customers pay through your links."}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Payer</th>

                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Amount</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Confirmations</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Tx Hash</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {p.payer_name || p.payer_email || "Anonymous"}
                        </p>
                        {p.payer_name && p.payer_email && (
                          <p className="text-xs text-slate-400">{p.payer_email}</p>
                        )}
                        {p.payer_address ? (
                          <a
                            href={`https://cardanoscan.io/address/${p.payer_address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-indigo-600 hover:text-indigo-700 font-mono flex items-center gap-1 mt-0.5"
                            title={p.payer_address}
                          >
                            {p.payer_address.slice(0, 14)}…{p.payer_address.slice(-6)}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400 font-mono">No wallet</span>
                        )}
                        {p.shipping_street && (
                          <div className="flex items-start gap-1 mt-1">
                            <MapPin className="w-3 h-3 text-slate-400 mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-slate-500">
                              {p.shipping_street}, {p.shipping_postal_code} {p.shipping_city}{p.shipping_country ? `, ${p.shipping_country}` : ""}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                        <div>
                          {p.payment_type === "cnt" ? (
                            <>
                              <span className="text-sm font-semibold text-slate-900 tabular-nums">
                                {(() => { const dec = getCntDecimals(p.cnt_policy_id, p.cnt_decimals); return ((p.received_amount_cnt || p.expected_amount_cnt) / Math.pow(10, dec)).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: dec }); })()} {p.cnt_ticker}
                              </span>
                              {p.fiat_value_snapshot && (
                                <p className="text-xs text-slate-400">{p.fiat_currency} {p.fiat_value_snapshot.toFixed(2)}</p>
                              )}
                            </>
                          ) : (
                            <>
                              <span className="text-sm font-semibold text-slate-900 tabular-nums">
                                ₳ {(p.received_amount_ada || p.expected_amount_ada)?.toFixed(3)}
                              </span>
                              {p.fiat_value_snapshot && (
                                <p className="text-xs text-slate-400">{p.fiat_currency} {p.fiat_value_snapshot.toFixed(2)}</p>
                              )}
                            </>
                          )}
                        </div>
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