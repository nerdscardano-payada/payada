import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Hexagon, Copy, CheckCircle2, Clock, Loader2,
  ExternalLink, AlertCircle, Wallet, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import WalletConnect from "@/components/checkout/WalletConnect";
import WalletPayButton from "@/components/checkout/WalletPayButton";

export default function Pay() {
  const [slug, setSlug] = useState("");
  const [paymentLink, setPaymentLink] = useState(null);
  const [payerEmail, setPayerEmail] = useState("");
  const [payerName, setPayerName] = useState("");
  const [sessionStarted, setSessionStarted] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState(null);

  // Wallet state
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [txHash, setTxHash] = useState(null);
  const [txLoading, setTxLoading] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const [txSubmitted, setTxSubmitted] = useState(false);

  // Extract slug from URL query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paySlug = params.get("slug");
    if (paySlug) {
      setSlug(paySlug);
    } else {
      setLoading(false);
    }
  }, []);

  // Load payment link by slug
  const { data: links = [] } = useQuery({
    queryKey: ["checkout-link", slug],
    queryFn: () => base44.entities.PaymentLink.filter({ slug, status: "active" }, "-created_date", 1),
    enabled: !!slug,
  });

  useEffect(() => {
    if (links.length > 0) {
      setPaymentLink(links[0]);
      setLoading(false);
    } else if (links.length === 0 && slug) {
      setTimeout(() => setLoading(false), 1500);
    }
  }, [links, slug]);

  const handleStartCheckout = async () => {
    try {
      const response = await base44.functions.invoke('createPublicCheckoutSession', {
        paymentLinkId: paymentLink.id
      });
      setSessionData(response.data);
      setSessionStarted(true);
    } catch (err) {
      toast.error("Failed to start checkout");
    }
  };

  const copyAddress = (addr) => {
    navigator.clipboard.writeText(addr || paymentLink?.receive_address);
    toast.success("Address copied!");
  };

  const handleTxSuccess = useCallback(async (hash) => {
    setTxHash(hash);
    setTxSubmitted(true);
    setPaymentStatus("detected");

    // Record the payment in the database, with retries to allow Blockfrost to index the tx
    if (paymentLink) {
      const maxAttempts = 5;
      const delayMs = 15000;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          await base44.functions.invoke('recordWalletPayment', {
            txHash: hash,
            paymentLinkId: paymentLink.id,
            merchantId: paymentLink.merchant_id,
            payerEmail: payerEmail || null,
            payerName: payerName || null
          });
          console.log(`Payment recorded on attempt ${attempt}`);
          break; // success
        } catch (err) {
          console.warn(`recordWalletPayment attempt ${attempt} failed:`, err?.message);
          if (attempt < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
          } else {
            console.error("All attempts to record payment failed:", err);
          }
        }
      }
    }

    // Poll for confirmation
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await base44.functions.invoke('checkTxConfirmation', { txHash: hash });
        if (res?.data?.confirmed) {
          clearInterval(interval);
          setPaymentStatus("confirmed");
        }
      } catch {}
      if (attempts >= 30) clearInterval(interval);
    }, 10000);
  }, [paymentLink, payerEmail, payerName]);

  if (!slug) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white">Invalid checkout link</h2>
          <p className="text-slate-400 mt-2">No payment link slug provided.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!paymentLink) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white">Payment link not found</h2>
          <p className="text-slate-400 mt-2">This link may have expired or been disabled.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center mx-auto mb-4">
            <Hexagon className="w-6 h-6 text-white" />
          </div>
          <p className="text-xs text-slate-500 uppercase tracking-widest">Powered by PayADA</p>
        </div>

        {/* Checkout Card */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h1 className="text-xl font-bold text-white">{paymentLink.title}</h1>
            {paymentLink.description && (
              <p className="text-sm text-slate-400 mt-2">{paymentLink.description}</p>
            )}
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">₳ {paymentLink.amount_ada?.toFixed(2)}</span>
              <span className="text-sm text-slate-500">ADA</span>
            </div>
          </div>

          {!sessionStarted ? (
            <div className="p-6 space-y-4">
              {paymentLink.collect_email && (
                <div className="space-y-2">
                  <Label htmlFor="payer-email" className="text-slate-300 text-xs">Email</Label>
                  <Input id="payer-email" name="payer-email" value={payerEmail} onChange={(e) => setPayerEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
                </div>
              )}
              {paymentLink.collect_name && (
                <div className="space-y-2">
                  <Label htmlFor="payer-name" className="text-slate-300 text-xs">Name</Label>
                  <Input id="payer-name" name="payer-name" value={payerName} onChange={(e) => setPayerName(e.target.value)}
                    placeholder="Your name"
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
                </div>
              )}
              <Button onClick={handleStartCheckout}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 text-base font-semibold">
                Continue to Payment
              </Button>
            </div>

          ) : paymentStatus === "confirmed" ? (
            <div className="p-6">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <p className="text-base font-semibold text-white">Payment Complete</p>
                <p className="text-sm text-slate-400 mt-1">Your transaction has been confirmed on the Cardano blockchain.</p>
                {txHash && (
                  <a href={`https://cardanoscan.io/transaction/${txHash}`} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-indigo-400 text-xs mt-3 hover:underline font-mono">
                    {txHash.slice(0, 16)}…{txHash.slice(-8)} <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {paymentLink.success_redirect_url && (
                  <div className="mt-4">
                    <a href={paymentLink.success_redirect_url}
                      className="inline-flex items-center gap-1 text-indigo-400 text-sm hover:underline">
                      Continue <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>

          ) : (
            <div className="p-6 space-y-5">
              {/* Status bar */}
              <div className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-lg">
                {paymentStatus === "pending" && <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                {paymentStatus === "detected" && <Loader2 className="w-4 h-4 text-blue-400 animate-spin flex-shrink-0" />}
                <div>
                  <p className="text-xs font-semibold text-white">
                    {paymentStatus === "pending" ? "Awaiting payment" : `Confirming on-chain…`}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {paymentStatus === "pending" ? "Choose how you'd like to pay below" : "Your transaction was submitted."}
                  </p>
                </div>
              </div>

              {paymentStatus === "pending" && (
                <>
                  {/* Fee breakdown */}
                  {sessionData && (
                    <div className="bg-slate-800/50 rounded-lg p-3 space-y-1.5 text-xs text-slate-300">
                      <div className="flex justify-between">
                        <span>Total</span>
                        <span className="text-white font-semibold">₳ {sessionData.amount_total_ada?.toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Platform fee ({sessionData.platform_fee_percent}%)</span>
                        <span>₳ {sessionData.platform_fee_ada?.toFixed(3)}</span>
                      </div>
                      <div className="border-t border-slate-700 pt-1.5 flex justify-between">
                        <span>Merchant receives</span>
                        <span className="text-emerald-400 font-semibold">₳ {sessionData.merchant_amount_ada?.toFixed(3)}</span>
                      </div>
                    </div>
                  )}

                  {/* Payment method toggle */}
                  <div className="flex rounded-lg overflow-hidden border border-slate-700">
                    <button
                      className={`flex-1 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${paymentMethod === "wallet" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}
                      onClick={() => setPaymentMethod("wallet")}
                    >
                      <Wallet className="w-3.5 h-3.5" /> Wallet
                    </button>
                    <button
                      className={`flex-1 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${paymentMethod === "manual" ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}
                      onClick={() => setPaymentMethod("manual")}
                    >
                      Manual Transfer
                    </button>
                  </div>

                  {/* Wallet flow */}
                  {paymentMethod === "wallet" && (
                    <div className="space-y-3">
                      <WalletConnect
                        onConnected={(w) => setConnectedWallet(w)}
                        onDisconnected={() => setConnectedWallet(null)}
                      />
                      {connectedWallet && (
                        <>
                          <WalletPayButton
                            connectedWallet={connectedWallet}
                            sessionData={sessionData}
                            paymentLink={paymentLink}
                            onSuccess={handleTxSuccess}
                          />
                          <p className="text-[11px] text-slate-500 text-center">
                            Your wallet will ask you to confirm and enter your password.
                          </p>
                        </>
                      )}
                    </div>
                  )}

                  {/* Manual flow */}
                  {paymentMethod === "manual" && (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="receive-address" className="text-xs text-slate-500">Send exactly ₳ {sessionData?.amount_total_ada?.toFixed(3)} to:</Label>
                        <div className="flex items-center gap-2 mt-1.5">
                          <code id="receive-address" className="flex-1 bg-slate-800 px-3 py-2.5 rounded-lg text-xs text-slate-300 font-mono break-all border border-slate-700">
                           {sessionData?.receive_address || paymentLink.receive_address}
                          </code>
                          <Button variant="outline" size="icon"
                            onClick={() => copyAddress(sessionData?.receive_address || paymentLink.receive_address)}
                            className="border-slate-700 text-slate-400 hover:text-white flex-shrink-0">
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Send from any Cardano wallet. Payment is auto-detected after 2+ block confirmations.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <p className="text-center text-[11px] text-slate-600 mt-6">
          Secure Cardano ADA payment · PayADA.io
        </p>
      </div>
    </div>
  );
}