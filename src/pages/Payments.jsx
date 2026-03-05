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

export default function Payments() {
  const [user, setUser] = React.useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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
      return matchesSearch && matchesStatus;
    });
  }, [payments, search, statusFilter]);

  const clearFilters = () => { setSearch(""); setStatusFilter("all"); };
  const hasFilters = search || statusFilter !== "all";

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
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Fee (1.75%)</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Net</th>
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
                      <span className="text-sm font-semibold text-emerald-600 tabular-nums">
                        ₳ {((p.merchant_amount_ada || p.received_amount_ada || p.expected_amount_ada) - (p.fee_amount_ada || 0))?.toFixed(3)}
                      </span>
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