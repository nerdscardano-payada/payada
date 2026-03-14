import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TokenSaleCountdown from "@/components/token-sale/TokenSaleCountdown";
import CurrencyConverter from "@/components/token-sale/CurrencyConverter";
import WhitelistGate from "@/components/token-sale/WhitelistGate";
import WalletConnectButton from "@/components/token-sale/WalletConnectButton";

export default function TokenSale() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  const [adaAmount, setAdaAmount] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletApi, setWalletApi] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState(null);
  const [purchaseError, setPurchaseError] = useState(null);

  const { data: sales = [], isLoading } = useQuery({
    queryKey: ["token-sale-public", slug],
    queryFn: () => base44.entities.TokenSale.filter({ slug }),
    enabled: !!slug,
  });

  const sale = sales[0];

  // Set default currency once sale loads
  useEffect(() => {
    if (sale && !selectedCurrency) {
      setSelectedCurrency((sale.accepted_currencies || ["ADA"])[0]);
    }
  }, [sale]);

  const handleConnect = (addr, api) => {
    setWalletAddress(addr);
    setWalletApi(api);
    setPurchaseResult(null);
    setPurchaseError(null);
  };

  const handleDisconnect = () => {
    setWalletAddress(null);
    setWalletApi(null);
    setPurchaseResult(null);
    setPurchaseError(null);
  };

  const handlePurchase = async () => {
    if (!walletApi || !sale || !adaAmount) return;
    setPurchasing(true);
    setPurchaseError(null);
    setPurchaseResult(null);

    try {
      // Build & submit a simple ADA tx using CIP-30 wallet API
      const lovelace = Math.floor(parseFloat(adaAmount) * 1_000_000).toString();
      const receiveAddress = sale.receive_address;

      if (!receiveAddress) throw new Error("Sale has no receive address configured.");

      // Build tx via walletApi
      const txBuilder = await walletApi.experimental?.signTx
        ? null
        : null; // CIP-30 doesn't have a built-in builder — we'll use buildPaymentTx backend

      // Call our backend to build the tx
      const buildRes = await base44.functions.invoke("buildPaymentTx", {
        receive_address: receiveAddress,
        amount_lovelace: parseInt(lovelace),
        sender_address: walletAddress,
      });

      if (!buildRes.data?.cbor) throw new Error("Failed to build transaction.");

      // Sign with wallet
      const signedTx = await walletApi.signTx(buildRes.data.cbor, true);

      // Submit
      const submitRes = await base44.functions.invoke("submitSignedTx", {
        signed_tx: signedTx,
      });

      if (!submitRes.data?.tx_hash) throw new Error("Transaction submission failed.");

      const txHash = submitRes.data.tx_hash;

      // Record purchase
      const recordRes = await base44.functions.invoke("processTokenSalePurchase", {
        token_sale_id: sale.id,
        wallet_address: walletAddress,
        ada_amount: parseFloat(adaAmount),
        tx_hash: txHash,
      });

      if (recordRes.data?.error) throw new Error(recordRes.data.error);

      setPurchaseResult({
        txHash,
        tokensAllocated: recordRes.data.tokens_allocated,
      });
      setAdaAmount("");
    } catch (e) {
      // Extract actual backend error message from Axios response
      const msg = e?.response?.data?.error || e?.response?.data?.message || e.message || "Purchase failed.";
      setPurchaseError(msg);
    } finally {
      setPurchasing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Sale not found</h1>
          <p className="text-white/50">This token sale does not exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const progressPct = sale.max_raise_ada
    ? Math.min(100, ((sale.total_raised_ada || 0) / sale.max_raise_ada) * 100)
    : 0;
  const isActive = sale.status === "active";
  const isWhitelisted = !sale.whitelist_enabled || (sale.whitelist_addresses || []).includes(walletAddress);
  const canPurchase = isActive && walletAddress && isWhitelisted && adaAmount && !purchasing;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero */}
      <div className="bg-gradient-to-b from-blue-950 to-slate-950 border-b border-white/5 py-12 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-sm text-white/70">
            <span className={`w-2 h-2 rounded-full ${isActive ? "bg-emerald-400 animate-pulse" : "bg-slate-400"}`} />
            {isActive ? "Sale Live" : sale.status === "ended" ? "Sale Ended" : sale.status === "paused" ? "Sale Paused" : "Coming Soon"}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold">{sale.title}</h1>
          {sale.description && (
            <p className="text-white/60 max-w-xl mx-auto leading-relaxed text-sm sm:text-base">{sale.description}</p>
          )}
          {sale.website_url && (
            <a href={sale.website_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 text-sm transition-colors">
              <ExternalLink className="w-3.5 h-3.5" /> Visit Website
            </a>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
            <p className="text-white/50 text-xs mb-1 uppercase tracking-widest">Max Raise</p>
            <p className="text-2xl font-bold">₳{(sale.max_raise_ada || 0).toLocaleString()}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
            <p className="text-white/50 text-xs mb-1 uppercase tracking-widest">Total Raised</p>
            <p className="text-2xl font-bold text-cyan-400">₳{(sale.total_raised_ada || 0).toLocaleString()}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
            <p className="text-white/50 text-xs mb-1 uppercase tracking-widest">Token Price</p>
            <p className="text-2xl font-bold">₳{sale.token_price_ada}</p>
            <p className="text-white/40 text-xs">per {sale.token_ticker}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
          <div className="flex justify-between text-sm text-white/60">
            <span>₳{(sale.total_raised_ada || 0).toLocaleString()} raised</span>
            <span>{progressPct.toFixed(1)}% of ₳{(sale.max_raise_ada || 0).toLocaleString()}</span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
          </div>
          {sale.accepted_currencies?.length > 1 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {sale.accepted_currencies.map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedCurrency(c)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    selectedCurrency === c
                      ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300"
                      : "bg-white/5 border-white/10 text-white/40 hover:text-white/70"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
          {sale.accepted_currencies?.length === 1 && (
            <p className="text-white/40 text-xs">Accepted: {sale.accepted_currencies[0]}</p>
          )}
        </div>

        {/* Countdown */}
        {sale.end_time && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-white/50 text-xs uppercase tracking-widest">
              <Clock className="w-3.5 h-3.5" /> Sale ends in
            </div>
            <TokenSaleCountdown endTime={sale.end_time} />
          </div>
        )}

        {/* Purchase box */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-lg">Purchase {sale.token_ticker}</h2>

          {/* Wallet connect */}
          <WalletConnectButton
            connectedAddress={walletAddress}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
          />

          {/* Whitelist gate */}
          <WhitelistGate sale={sale} walletAddress={walletAddress} />

          {/* KYC notice */}
          {sale.kyc_required && (
            <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 text-purple-300 text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              KYC verification required. Contact the project team to complete verification.
            </div>
          )}

          {/* Amount input */}
          {isActive && (!sale.whitelist_enabled || isWhitelisted) && (
            <>
              <div className="space-y-1.5">
                <label className="text-sm text-white/60">Amount ({selectedCurrency || "ADA"})</label>
                {sale.min_buy_ada && sale.max_buy_ada && selectedCurrency === "ADA" && (
                  <p className="text-white/30 text-xs">Min ₳{sale.min_buy_ada} — Max ₳{sale.max_buy_ada}</p>
                )}
                <Input
                  type="number"
                  value={adaAmount}
                  onChange={e => { setAdaAmount(e.target.value); setPurchaseError(null); setPurchaseResult(null); }}
                  placeholder={selectedCurrency === "ADA" ? `Min ₳${sale.min_buy_ada || 50}` : `Enter amount`}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 text-lg h-12"
                />
              </div>

              {/* Currency converter — only valid for ADA payments */}
              {adaAmount && (!selectedCurrency || selectedCurrency === "ADA") && (
                <CurrencyConverter
                  adaAmount={adaAmount}
                  tokenTicker={sale.token_ticker}
                  tokenPriceAda={sale.token_price_ada}
                />
              )}
            </>
          )}

          {/* Success */}
          {purchaseResult && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Purchase successful!
              </div>
              <p className="text-white/70 text-sm">
                You have been allocated <strong className="text-white">{purchaseResult.tokensAllocated?.toLocaleString()} {sale.token_ticker}</strong>.
                Tokens will be distributed automatically after the sale ends.
              </p>
              <a
                href={`https://cardanoscan.io/transaction/${purchaseResult.txHash}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 text-xs transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                View on CardanoScan
              </a>
            </div>
          )}

          {/* Error */}
          {purchaseError && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-300 text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {purchaseError}
            </div>
          )}

          {/* Purchase button */}
          {isActive ? (
            <Button
              onClick={handlePurchase}
              disabled={!canPurchase}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40"
            >
              {purchasing ? "Processing…" : `Purchase ${sale.token_ticker}`}
            </Button>
          ) : (
            <Button disabled className="w-full h-12 text-base font-semibold disabled:opacity-40">
              Sale {sale.status}
            </Button>
          )}

          <p className="text-xs text-white/20 text-center break-all">
            Policy: {sale.token_policy_id}
          </p>
        </div>
      </div>
    </div>
  );
}