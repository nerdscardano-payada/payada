import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Rocket, Users, TrendingUp, Coins, ArrowLeft, Send,
  CheckCircle, Clock, AlertTriangle, Download, Copy
} from "lucide-react";
import { Link } from "react-router-dom";

const FEE_PERCENT = 1.75;

function StatCard({ icon, label, value, sub }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className="text-xl font-bold text-slate-900">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending:              { color: "bg-slate-100 text-slate-600", label: "Pending" },
    pending_distribution: { color: "bg-amber-100 text-amber-700", label: "Pending Distribution" },
    distributed:          { color: "bg-emerald-100 text-emerald-700", label: "Distributed" },
    confirmed:            { color: "bg-blue-100 text-blue-700", label: "Confirmed" },
    failed:               { color: "bg-red-100 text-red-600", label: "Failed" },
  };
  const s = map[status] || map.pending;
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>{s.label}</span>;
}

function truncate(addr) {
  if (!addr) return "-";
  return addr.slice(0, 10) + "..." + addr.slice(-8);
}

export default function TokenSaleDashboard() {
  const params = new URLSearchParams(window.location.search);
  const saleId = params.get("id");
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(null);
  const [distStep, setDistStep] = useState("idle"); // idle | enter_address | building | signing | submitting | done
  const [merchantAddress, setMerchantAddress] = useState("");
  const [txCbor, setTxCbor] = useState(null);
  const [txBodyCbor, setTxBodyCbor] = useState(null);
  const [pendingPurchaseIds, setPendingPurchaseIds] = useState([]);
  const [distSummary, setDistSummary] = useState(null);
  const [distError, setDistError] = useState(null);

  const { data: sale, isLoading: saleLoading } = useQuery({
    queryKey: ["token-sale", saleId],
    queryFn: async () => {
      const results = await base44.entities.TokenSale.filter({ id: saleId });
      return results[0];
    },
    enabled: !!saleId,
  });

  const { data: purchases = [], isLoading: purchasesLoading } = useQuery({
    queryKey: ["token-purchases", saleId],
    queryFn: () => base44.entities.TokenSalePurchase.filter({ token_sale_id: saleId }),
    enabled: !!saleId,
  });

  const buildTxMutation = useMutation({
    mutationFn: (merchantWalletAddress) =>
      base44.functions.invoke("buildDistributionTx", { token_sale_id: saleId, merchant_wallet_address: merchantWalletAddress }),
    onSuccess: (res) => {
      const { txCbor, txBodyCbor, summary, purchase_ids } = res.data;
      setTxCbor(txCbor);
      setTxBodyCbor(txBodyCbor);
      setDistSummary(summary);
      setPendingPurchaseIds(purchase_ids);
      setDistStep("signing");
    },
    onError: (e) => setDistError(e.message),
  });

  const markDistributedMutation = useMutation({
    mutationFn: ({ purchase_ids, tx_hash }) =>
      base44.functions.invoke("distributeTokens", { purchase_ids, tx_hash }),
    onSuccess: () => {
      queryClient.invalidateQueries(["token-purchases", saleId]);
      queryClient.invalidateQueries(["token-sale", saleId]);
      setDistStep("done");
    },
    onError: (e) => setDistError(e.message),
  });

  const handleSignAndSubmit = async () => {
    setDistError(null);
    setDistStep("submitting");
    try {
      // Find connected CIP-30 wallet
      const cardano = window.cardano;
      if (!cardano) throw new Error("No Cardano wallet extension found in browser");
      const walletKeys = Object.keys(cardano).filter(k => cardano[k]?.enable);
      if (walletKeys.length === 0) throw new Error("No Cardano wallet found");
      const api = await cardano[walletKeys[0]].enable();

      // Sign the tx body
      const witnessSetCbor = await api.signTx(txCbor, true);

      // Assemble signed tx: replace empty witness set with real one
      // txCbor = 84 [txBody] a0 f5 f6  → replace a0 with witnessSetCbor
      const submitRes = await base44.functions.invoke("submitSignedTx", { signedTxCbor: assembleTx(txBodyCbor, witnessSetCbor) });
      const { txHash } = submitRes.data;

      await markDistributedMutation.mutateAsync({ purchase_ids: pendingPurchaseIds, tx_hash: txHash });
    } catch (e) {
      setDistError(e.message || String(e));
      setDistStep("signing");
    }
  };

  function assembleTx(txBodyCbor, witnessSetCbor) {
    // Full tx: array of 4: [txBody, witnessSet, true, null]
    // We encode manually: 84 + txBody bytes + witnessSet bytes + f5 (true) + f6 (null)
    function hexToBytes(hex) {
      const r = new Uint8Array(hex.length / 2);
      for (let i = 0; i < hex.length; i += 2) r[i / 2] = parseInt(hex.substr(i, 2), 16);
      return r;
    }
    function bytesToHex(b) { return Array.from(b).map(x => x.toString(16).padStart(2, '0')).join(''); }
    const body = hexToBytes(txBodyCbor);
    const witness = hexToBytes(witnessSetCbor);
    const assembled = new Uint8Array([0x84, ...body, ...witness, 0xf5, 0xf6]);
    return bytesToHex(assembled);
  }

  const pendingPurchases = purchases.filter(p => p.status === "pending_distribution");
  const distributedPurchases = purchases.filter(p => p.status === "distributed");

  const totalTokensToDistribute = pendingPurchases.reduce((s, p) => s + (p.tokens_allocated || 0), 0);
  const feeTokens = Math.floor(totalTokensToDistribute * (FEE_PERCENT / 100));
  const netTokensToDistribute = totalTokensToDistribute - feeTokens;

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const downloadCSV = () => {
    const rows = [
      ["wallet_address", "ada_paid", "tokens_allocated", "net_tokens_after_fee", "tx_hash", "status"],
      ...purchases.map(p => [
        p.wallet_address,
        p.ada_amount,
        p.tokens_allocated,
        Math.floor((p.tokens_allocated || 0) * (1 - FEE_PERCENT / 100)),
        p.tx_hash || "",
        p.status,
      ])
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sale?.token_ticker || "token"}-distribution.csv`;
    a.click();
  };

  if (!saleId) return (
    <div className="p-8 text-slate-500 text-center">No sale ID provided.</div>
  );

  if (saleLoading || purchasesLoading) return (
    <div className="p-8 space-y-4">
      {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />)}
    </div>
  );

  if (!sale) return (
    <div className="p-8 text-slate-500 text-center">Sale not found.</div>
  );

  const progressPct = sale.max_raise_ada
    ? Math.min(100, ((sale.total_raised_ada || 0) / sale.max_raise_ada) * 100)
    : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link to="/AdminLaunchpad">
          <Button variant="ghost" size="sm" className="gap-1 text-slate-500">
            <ArrowLeft className="w-4 h-4" /> Launchpad
          </Button>
        </Link>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              {sale.title}
              <Badge className="bg-blue-100 text-blue-700 text-xs">{sale.token_ticker}</Badge>
            </h1>
            <p className="text-slate-400 text-xs font-mono">{sale.token_policy_id}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={downloadCSV} className="gap-1.5">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={<TrendingUp className="w-4 h-4 text-indigo-500" />}
          label="Total Raised"
          value={`₳${(sale.total_raised_ada || 0).toLocaleString()}`}
          sub={`Max ₳${(sale.max_raise_ada || 0).toLocaleString()}`}
        />
        <StatCard
          icon={<Coins className="w-4 h-4 text-indigo-500" />}
          label="Tokens Sold"
          value={(sale.tokens_sold || 0).toLocaleString()}
          sub={`${sale.token_ticker}`}
        />
        <StatCard
          icon={<Users className="w-4 h-4 text-indigo-500" />}
          label="Buyers"
          value={purchases.length}
          sub={`${distributedPurchases.length} distributed`}
        />
        <StatCard
          icon={<CheckCircle className="w-4 h-4 text-indigo-500" />}
          label="Progress"
          value={`${progressPct.toFixed(1)}%`}
          sub={`${pendingPurchases.length} pending dist.`}
        />
      </div>

      {/* Progress bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between text-xs text-slate-500 mb-2">
            <span>₳{(sale.total_raised_ada || 0).toLocaleString()} raised</span>
            <span>Goal: ₳{(sale.max_raise_ada || 0).toLocaleString()}</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Distribution Panel */}
      {pendingPurchases.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-amber-800">
              <Send className="w-4 h-4" /> Token Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="bg-white rounded-lg p-3 border border-amber-100">
                <p className="text-xs text-slate-500">Tokens to distribute</p>
                <p className="font-bold text-slate-900">{totalTokensToDistribute.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-amber-100">
                <p className="text-xs text-slate-500">Platform fee (1.75%)</p>
                <p className="font-bold text-amber-700">−{feeTokens.toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-emerald-100">
                <p className="text-xs text-slate-500">Net to buyers</p>
                <p className="font-bold text-emerald-700">{netTokensToDistribute.toLocaleString()}</p>
              </div>
            </div>
            <p className="text-xs text-amber-700">
              <AlertTriangle className="w-3 h-3 inline mr-1" />
              After clicking "Mark as Distributed", all {pendingPurchases.length} pending purchases will be marked distributed and {feeTokens.toLocaleString()} {sale.token_ticker} fee will be recorded.
            </p>
            {!distConfirm ? (
              <Button
                onClick={() => setDistConfirm(true)}
                className="bg-emerald-600 hover:bg-emerald-700 gap-1.5"
              >
                <Send className="w-4 h-4" /> Distribute Tokens
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-sm text-slate-700 font-medium">Are you sure? This cannot be undone.</p>
                <Button
                  onClick={() => distributeMutation.mutate()}
                  disabled={distributeMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 gap-1.5"
                  size="sm"
                >
                  {distributeMutation.isPending ? "Processing..." : "Confirm"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setDistConfirm(false)}>Cancel</Button>
              </div>
            )}
            {distributeMutation.isError && (
              <p className="text-xs text-red-600">{distributeMutation.error?.message}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Purchases Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>Purchases ({purchases.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {purchases.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No purchases yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500">Wallet Address</th>
                    <th className="text-right px-4 py-2.5 text-xs font-medium text-slate-500">ADA Paid</th>
                    <th className="text-right px-4 py-2.5 text-xs font-medium text-slate-500">Tokens</th>
                    <th className="text-right px-4 py-2.5 text-xs font-medium text-slate-500">Net Tokens (after fee)</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500">Tx Hash</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((p, i) => (
                    <tr key={p.id} className={`border-b border-slate-50 hover:bg-slate-50 ${i % 2 === 0 ? "" : "bg-slate-25"}`}>
                      <td className="px-4 py-2.5 font-mono text-xs text-slate-600">
                        <div className="flex items-center gap-1">
                          <span>{truncate(p.wallet_address)}</span>
                          <button
                            onClick={() => copyToClipboard(p.wallet_address, `addr-${p.id}`)}
                            className="text-slate-300 hover:text-slate-600"
                          >
                            {copied === `addr-${p.id}` ? <CheckCircle className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-right font-medium text-slate-900">
                        ₳{(p.ada_amount || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-700">
                        {(p.tokens_allocated || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 text-right text-emerald-700 font-medium">
                        {Math.floor((p.tokens_allocated || 0) * (1 - FEE_PERCENT / 100)).toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs text-slate-500">
                        {p.tx_hash ? (
                          <div className="flex items-center gap-1">
                            <span>{truncate(p.tx_hash)}</span>
                            <button onClick={() => copyToClipboard(p.tx_hash, `tx-${p.id}`)} className="text-slate-300 hover:text-slate-600">
                              {copied === `tx-${p.id}` ? <CheckCircle className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-2.5">
                        <StatusBadge status={p.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}