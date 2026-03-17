import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/shared/PageHeader";
import { Search, Tag, Zap, ShoppingBag, Ticket, Users, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const SOURCE_COLORS = {
  payment_link: "bg-blue-100 text-blue-700",
  access_link: "bg-purple-100 text-purple-700",
  event: "bg-pink-100 text-pink-700",
  store: "bg-amber-100 text-amber-700",
  terminal: "bg-cyan-100 text-cyan-700",
  pos: "bg-indigo-100 text-indigo-700",
};

const SOURCE_ICONS = {
  payment_link: Tag,
  access_link: Users,
  event: Ticket,
  store: ShoppingBag,
  terminal: Zap,
  pos: Zap,
};

const KNOWN_DECIMALS = {
  "5d16cc1a177b5d9ba9cfa9793b07e60f1fb70fea1f8aef064415d114": 6,
  "29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6": 6,
  "5dac8536653edc12f6f5e1045d8164b9f59998d3bdc300fc92843489": 6,
  "c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad": 6,
  "fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae456": 6,
  "8db269c3ec630e06ae29f74bc39edd1f87c819f1056206e879a1cd61": 6,
};

function getCntDecimals(policyId, storedDecimals) {
  if (storedDecimals && storedDecimals > 0) return storedDecimals;
  return KNOWN_DECIMALS[policyId] ?? 0;
}

export default function TransactionAudit() {
  const [user, setUser] = React.useState(null);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");

  React.useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["audit-payments", user?.email],
    queryFn: () => base44.entities.Payment.filter({ merchant_id: user.email }, "-created_date", 500),
    enabled: !!user,
  });

  const { data: paymentLinks = [] } = useQuery({
    queryKey: ["audit-payment-links", user?.email],
    queryFn: () => base44.entities.PaymentLink.filter({ merchant_id: user.email }, "-created_date", 200),
    enabled: !!user,
  });

  const { data: accessLinks = [] } = useQuery({
    queryKey: ["audit-access-links", user?.email],
    queryFn: () => base44.entities.CommunityAccessLink.filter({ merchant_id: user.email }, "-created_date", 100),
    enabled: !!user,
  });

  const { data: events = [] } = useQuery({
    queryKey: ["audit-events", user?.email],
    queryFn: () => base44.entities.Event.filter({ merchant_id: user.email }, "-created_date", 100),
    enabled: !!user,
  });

  const { data: stores = [] } = useQuery({
    queryKey: ["audit-stores", user?.email],
    queryFn: () => base44.entities.Store.filter({ merchant_id: user.email }, "-created_date", 100),
    enabled: !!user,
  });

  const maps = useMemo(() => {
    const linkMap = paymentLinks.reduce((m, l) => { m[l.id] = { title: l.title, source: "payment_link" }; return m; }, {});
    const accessMap = accessLinks.reduce((m, l) => { m[l.id] = { title: l.title, source: "access_link" }; return m; }, {});
    const eventMap = events.reduce((m, e) => { m[e.id] = { title: e.title, source: "event" }; return m; }, {});

    // Store source from products
    stores.forEach(store => {
      store.products?.forEach(prod => {
        if (prod.linkId) {
          linkMap[prod.linkId] = { ...linkMap[prod.linkId], source: "store", store: store.name };
        }
      });
    });

    return { linkMap, accessMap, eventMap };
  }, [paymentLinks, accessLinks, events, stores]);

  const annotatedPayments = useMemo(() => {
    return payments.map(p => {
      let source = null;
      let sourceTitle = null;
      let storeName = null;

      if (p.payment_link_id) {
        const info = maps.linkMap[p.payment_link_id];
        source = info?.source || "payment_link";
        sourceTitle = info?.title || "Unknown Link";
        storeName = info?.store;
      } else if (p.access_link_id) {
        const info = maps.accessMap[p.access_link_id];
        source = "access_link";
        sourceTitle = info?.title || "Unknown Access";
      } else if (p.event_id) {
        const info = maps.eventMap[p.event_id];
        source = "event";
        sourceTitle = info?.title || "Unknown Event";
      }

      // POS detection: recent short-lived payments
      if (!source) {
        const ageHours = (Date.now() - new Date(p.created_date).getTime()) / (1000 * 60 * 60);
        if (ageHours < 24) source = "pos";
      }

      return { ...p, source, sourceTitle, storeName };
    });
  }, [payments, maps]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return annotatedPayments.filter(p => {
      const matchesSearch = !q || 
        p.payer_email?.toLowerCase().includes(q) ||
        p.payer_name?.toLowerCase().includes(q) ||
        p.tx_hash?.toLowerCase().includes(q) ||
        p.sourceTitle?.toLowerCase().includes(q);
      const matchesSource = sourceFilter === "all" || (p.source === sourceFilter);
      return matchesSearch && matchesSource;
    });
  }, [annotatedPayments, search, sourceFilter]);

  const sources = ["all", "payment_link", "access_link", "event", "store", "pos", "terminal"];
  const stats = {
    total: annotatedPayments.length,
    confirmed: annotatedPayments.filter(p => p.status === "confirmed").length,
    volume: annotatedPayments.filter(p => p.status === "confirmed").reduce((sum, p) => sum + (p.merchant_amount_ada || p.received_amount_ada || 0), 0),
  };

  if (!user) return null;

  return (
    <div>
      <PageHeader
        title="Transaction Audit"
        subtitle="Complete transaction history across all sources with full product tracking"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 font-medium mb-1">Total Transactions</p>
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 font-medium mb-1">Confirmed</p>
          <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 font-medium mb-1">Total Volume</p>
          <p className="text-2xl font-bold text-indigo-600">₳ {stats.volume.toFixed(2)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by email, name, product, tx hash…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sources.map(src => (
              <SelectItem key={src} value={src}>
                {src === "all" ? "All Sources" : src.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-5 space-y-3">
            {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-400 text-sm">No transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Product / Source</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Amount</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Payer</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Date</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">TX</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(p => {
                  const Icon = SOURCE_ICONS[p.source] || Tag;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <Icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900 truncate text-sm">{p.sourceTitle || "—"}</p>
                            {p.storeName && <p className="text-xs text-slate-400">Store: {p.storeName}</p>}
                            <Badge className={`${SOURCE_COLORS[p.source] || "bg-slate-100 text-slate-700"} text-[10px] mt-1`}>
                              {p.source?.replace(/_/g, " ")}
                            </Badge>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-slate-900">
                        {p.payment_type === "cnt"
                          ? `${Number(p.merchant_amount_cnt ?? p.received_amount_cnt ?? p.expected_amount_cnt ?? 0).toLocaleString(undefined, {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: getCntDecimals(p.cnt_policy_id, p.cnt_decimals),
                            })} ${p.cnt_ticker || "CNT"}`
                          : `₳ ${(p.merchant_amount_ada || p.received_amount_ada || p.expected_amount_ada || 0).toFixed(2)}`}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-600 hidden sm:table-cell max-w-xs truncate">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span>{p.payer_name || p.payer_email || "—"}</span>
                          {p.payer_address && <span className="font-mono text-slate-400 text-xs truncate" title={p.payer_address}>📍 {p.payer_address.slice(0, 8)}…</span>}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge className={p.status === "confirmed" ? "bg-green-100 text-green-700" : p.status === "detected" ? "bg-orange-100 text-orange-700" : "bg-slate-100 text-slate-600"}>
                          {p.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-500 hidden lg:table-cell whitespace-nowrap">
                        {format(new Date(p.created_date), "dd MMM, HH:mm")}
                      </td>
                      <td className="px-5 py-3.5">
                        {p.tx_hash ? (
                          <a
                            href={`https://cardanoscan.io/transaction/${p.tx_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-xs font-mono"
                          >
                            {p.tx_hash.slice(0, 8)}…
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}