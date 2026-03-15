import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, ExternalLink, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
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
    <span className="flex items-center gap-1 group font-mono text-slate-400">
      <span className="truncate" title={address}>{address.slice(0, 14)}…</span>
      <button onClick={handleCopy} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-700">
        {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
      </button>
    </span>
  );
}

const STATUS_STYLES = {
  confirmed:            "bg-green-100 text-green-700",
  pending_distribution: "bg-yellow-100 text-yellow-700",
  distributed:          "bg-blue-100 text-blue-700",
  pending:              "bg-slate-100 text-slate-600",
  failed:               "bg-red-100 text-red-700",
  detected:             "bg-orange-100 text-orange-700",
};

function TxRow({ p, eventMap = {}, paymentLinkMap = {} }) {
  const isAda = p.payment_type !== "cnt";
  const ticker = p.cnt_ticker || "ADA";
  const amount = isAda
    ? `₳${(p.received_amount_ada || 0).toFixed(2)}`
    : `${(p.received_amount_cnt || 0).toLocaleString()} ${ticker}`;
  const fee = isAda
    ? `₳${(p.fee_amount_ada || 0).toFixed(4)}`
    : p.cnt_fees?.map(f => `${f.amount.toFixed ? f.amount.toFixed(0) : f.amount} ${f.ticker}`).join(", ") || "—";

  // Get product name from payment link or event
  const productName = p.payment_link_id 
    ? paymentLinkMap[p.payment_link_id] 
    : (p.event_id ? null : null); // will show separately in Bron

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors text-sm">
      <td className="py-2.5 px-3">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[p.status] || "bg-slate-100 text-slate-600"}`}>
          {p.status}
        </span>
      </td>
      <td className="py-2.5 px-3">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isAda ? "bg-indigo-50 text-indigo-700" : "bg-purple-50 text-purple-700"}`}>
          {isAda ? "ADA" : "CNT"}
        </span>
      </td>
      <td className="py-2.5 px-3 font-medium text-slate-800">{amount}</td>
      <td className="py-2.5 px-3 text-xs max-w-[140px]">
        {productName ? (
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium truncate" title={productName}>
            💳 {productName}
          </span>
        ) : (
          <span className="text-slate-300">—</span>
        )}
      </td>
      <td className="py-2.5 px-3 text-green-700 font-medium">{fee}</td>
      <td className="py-2.5 px-3">
        {p.tx_hash ? (
          <a
            href={`https://cardanoscan.io/transaction/${p.tx_hash}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-mono text-xs text-indigo-500 hover:text-indigo-700"
          >
            {p.tx_hash.slice(0, 10)}…
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : "—"}
      </td>
      <td className="py-2.5 px-3 text-slate-400 text-xs whitespace-nowrap">
        {p.confirmed_at
          ? new Date(p.confirmed_at).toLocaleString("nl-BE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
          : p.created_date
          ? new Date(p.created_date).toLocaleString("nl-BE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
          : "—"}
      </td>
      <td className="py-2.5 px-3 text-xs max-w-[160px]">
        {p.payer_address ? (
          <CopyAddress address={p.payer_address} />
        ) : p.payer_name ? (
          <span className="text-amber-600 truncate block" title={`Name only — no wallet address recorded. payer_name: ${p.payer_name}`}>
            👤 {p.payer_name}
          </span>
        ) : (
          <span className="text-slate-300">—</span>
        )}
      </td>
      <td className="py-2.5 px-3 text-xs max-w-[140px]">
        {p.event_id ? (
          <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium truncate" title={eventMap[p.event_id]}>
            🎟 {eventMap[p.event_id] || "Event"}
          </span>
        ) : (
          <span className="text-slate-300">—</span>
        )}
      </td>
    </tr>
  );
}

function PurchaseRow({ p }) {
  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors text-sm">
      <td className="py-2.5 px-3">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[p.status] || "bg-slate-100 text-slate-600"}`}>
          {p.status}
        </span>
      </td>
      <td className="py-2.5 px-3 font-medium text-slate-800">
        {(p.tokens_allocated || 0).toLocaleString()} {p.token_ticker}
      </td>
      <td className="py-2.5 px-3 text-slate-600">₳{(p.ada_amount || 0).toFixed(2)}</td>
      <td className="py-2.5 px-3">
        {p.tx_hash ? (
          <a
            href={`https://cardanoscan.io/transaction/${p.tx_hash}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-mono text-xs text-indigo-500 hover:text-indigo-700"
          >
            {p.tx_hash.slice(0, 10)}…
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : "—"}
      </td>
      {p.distribution_tx_hash ? (
        <td className="py-2.5 px-3">
          <a
            href={`https://cardanoscan.io/transaction/${p.distribution_tx_hash}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-mono text-xs text-green-600 hover:text-green-800"
          >
            {p.distribution_tx_hash.slice(0, 10)}…
            <ExternalLink className="w-3 h-3" />
          </a>
        </td>
      ) : (
        <td className="py-2.5 px-3 text-slate-300 text-xs">Niet gedistribueerd</td>
      )}
      <td className="py-2.5 px-3 text-slate-400 text-xs whitespace-nowrap">
        {p.created_date
          ? new Date(p.created_date).toLocaleString("nl-BE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
          : "—"}
      </td>
      <td className="py-2.5 px-3 text-xs max-w-[140px]">
        {p.wallet_address ? <CopyAddress address={p.wallet_address} /> : <span className="text-slate-300">—</span>}
      </td>
    </tr>
  );
}

export default function RecentTransactions() {
  const [activeTab, setActiveTab] = useState("payments");
  const [showAll, setShowAll] = useState(false);

  const { data: payments = [], isLoading: loadingPayments, refetch: refetchPayments } = useQuery({
    queryKey: ["admin-recent-payments"],
    queryFn: () => base44.entities.Payment.list("-created_date", 100),
    refetchInterval: 30000,
  });

  const { data: events = [] } = useQuery({
    queryKey: ["admin-events-map"],
    queryFn: () => base44.entities.Event.list("-created_date", 200),
  });
  const eventMap = useMemo(() => events.reduce((m, e) => { m[e.id] = e.title; return m; }, {}), [events]);

  const { data: paymentLinks = [] } = useQuery({
    queryKey: ["admin-payment-links-map"],
    queryFn: () => base44.entities.PaymentLink.list("-created_date", 500),
  });
  const paymentLinkMap = useMemo(() => paymentLinks.reduce((m, pl) => { m[pl.id] = pl.title; return m; }, {}), [paymentLinks]);

  const { data: purchases = [], isLoading: loadingPurchases, refetch: refetchPurchases } = useQuery({
    queryKey: ["admin-recent-purchases"],
    queryFn: () => base44.entities.TokenSalePurchase.list("-created_date", 100),
    refetchInterval: 30000,
  });

  const isLoading = loadingPayments || loadingPurchases;

  const displayedPayments = showAll ? payments : payments.slice(0, 20);
  const displayedPurchases = showAll ? purchases : purchases.slice(0, 20);

  const pendingDistribution = purchases.filter(p => p.status === "pending_distribution").length;
  const pendingPayments = payments.filter(p => p.status === "pending").length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-semibold text-slate-800">Laatste Transacties</h3>
          <div className="flex gap-2">
            {pendingPayments > 0 && (
              <span className="bg-orange-100 text-orange-700 text-xs font-medium px-2 py-0.5 rounded-full">
                {pendingPayments} pending
              </span>
            )}
            {pendingDistribution > 0 && (
              <span className="bg-yellow-100 text-yellow-700 text-xs font-medium px-2 py-0.5 rounded-full">
                {pendingDistribution} niet gedistribueerd
              </span>
            )}
          </div>
        </div>
        <Button
          variant="ghost" size="sm"
          onClick={() => { refetchPayments(); refetchPurchases(); }}
          className="text-slate-500 h-8 px-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100">
        {[
          { key: "payments", label: `Betalingen (${payments.length})` },
          { key: "purchases", label: `Presale Aankopen (${purchases.length})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {activeTab === "payments" ? (
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-slate-400 border-b border-slate-100 bg-slate-50">
                <th className="py-2.5 px-3 font-medium">Status</th>
                <th className="py-2.5 px-3 font-medium">Type</th>
                <th className="py-2.5 px-3 font-medium">Bedrag</th>
                <th className="py-2.5 px-3 font-medium">Product</th>
                <th className="py-2.5 px-3 font-medium">Fee</th>
                <th className="py-2.5 px-3 font-medium">TX Hash</th>
                <th className="py-2.5 px-3 font-medium">Datum</th>
                <th className="py-2.5 px-3 font-medium">Wallet</th>
                <th className="py-2.5 px-3 font-medium">Bron</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="py-8 text-center text-slate-400 text-sm">Laden…</td></tr>
              ) : displayedPayments.length === 0 ? (
                <tr><td colSpan={8} className="py-8 text-center text-slate-400 text-sm">Geen betalingen gevonden.</td></tr>
              ) : (
                displayedPayments.map(p => <TxRow key={p.id} p={p} eventMap={eventMap} />)
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-slate-400 border-b border-slate-100 bg-slate-50">
                <th className="py-2.5 px-3 font-medium">Status</th>
                <th className="py-2.5 px-3 font-medium">Tokens</th>
                <th className="py-2.5 px-3 font-medium">ADA Bedrag</th>
                <th className="py-2.5 px-3 font-medium">Purchase TX</th>
                <th className="py-2.5 px-3 font-medium">Distribution TX</th>
                <th className="py-2.5 px-3 font-medium">Datum</th>
                <th className="py-2.5 px-3 font-medium">Wallet</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="py-8 text-center text-slate-400 text-sm">Laden…</td></tr>
              ) : displayedPurchases.length === 0 ?  (
                <tr><td colSpan={7} className="py-8 text-center text-slate-400 text-sm">Geen presale aankopen gevonden.</td></tr>
              ) : (
                displayedPurchases.map(p => <PurchaseRow key={p.id} p={p} />)
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Show more */}
      {((activeTab === "payments" && payments.length > 20) || (activeTab === "purchases" && purchases.length > 20)) && (
        <div className="border-t border-slate-100 px-5 py-3 flex justify-center">
          <button
            onClick={() => setShowAll(v => !v)}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            {showAll ? <><ChevronUp className="w-4 h-4" /> Minder tonen</> : <><ChevronDown className="w-4 h-4" /> Alles tonen</>}
          </button>
        </div>
      )}
    </div>
  );
}