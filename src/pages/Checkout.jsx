import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Hexagon, CheckCircle2, Clock, Loader2,
  ExternalLink, AlertCircle, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import WalletConnect from "@/components/checkout/WalletConnect";
import WalletPayButton from "@/components/checkout/WalletPayButton";

export default function Checkout() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  const [paymentLink, setPaymentLink] = useState(null);
  const [payerEmail, setPayerEmail] = useState("");
  const [payerName, setPayerName] = useState("");
  const [payerDiscord, setPayerDiscord] = useState("");
  const [shippingStreet, setShippingStreet] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingPostalCode, setShippingPostalCode] = useState("");
  const [shippingCountry, setShippingCountry] = useState("");
  const [sessionStarted, setSessionStarted] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState(null);
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [txHash, setTxHash] = useState(null);

  const { data: links = [] } = useQuery({
    queryKey: ["checkout-link", slug],
    queryFn: () => base44.entities.PaymentLink.filter({ slug, status: "active" }, "-created_date", 1),
    enabled: !!slug,
  });

  const merchantId = links[0]?.merchant_id;
  const { data: discordPlugins = [] } = useQuery({
    queryKey: ["discord-plugin-checkout", merchantId],
    queryFn: () => base44.entities.MerchantPlugin.filter({ merchant_id: merchantId, plugin_type: "discord_gate", enabled: true }),
    enabled: !!merchantId,
  });
  const hasDiscordPlugin = discordPlugins.length > 0;

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
      if (!response?.data?.success) {
        toast.error(response?.data?.error || "Could not start checkout");
        return;
      }
      setSessionData(response.data);
      setSessionStarted(true);
    } catch (err) {
      toast.error(err?.message || "Could not start checkout");
    }
  };

  const handleTxSuccess = useCallback(async (hash) => {
    setTxHash(hash);
    setPaymentStatus("detected");

    // Record the payment with retries to allow Blockfrost to index the tx
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
            payerName: payerName || null,
            payerAddress: connectedWallet?.address || null,
            payerDiscordUsername: payerDiscord || null,
            shippingStreet: shippingStreet || null,
            shippingCity: shippingCity || null,
            shippingPostalCode: shippingPostalCode || null,
            shippingCountry: shippingCountry || null
          });
          console.log(`Payment recorded on attempt ${attempt}`);
          break;
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
  }, [paymentLink, payerEmail, payerName, payerDiscord, connectedWallet]);

  if (!slug) return <ErrorScreen message="No payment link slug provided." />;
  if (loading) return <LoadingScreen />;
  if (!paymentLink) return <ErrorScreen message="This link may have expired or been disabled." title="Payment link not found" />;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center mx-auto mb-4">
            <Hexagon className="w-6 h-6 text-white" />
          </div>
          <p className="text-xs text-slate-500 uppercase tracking-widest">Powered by PayADA</p>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800">
          {/* Product info */}
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

          {/* Step 1: Details form */}
          {!sessionStarted ? (
            <div className="p-6 space-y-4">
              {paymentLink.collect_email && (
                <div className="space-y-2">
                  <Label className="text-slate-300 text-xs">Email</Label>
                  <Input value={payerEmail} onChange={(e) => setPayerEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
                </div>
              )}
              {paymentLink.collect_name && (
                <div className="space-y-2">
                  <Label className="text-slate-300 text-xs">Name</Label>
                  <Input value={payerName} onChange={(e) => setPayerName(e.target.value)}
                    placeholder="Your name"
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
                </div>
              )}
              {hasDiscordPlugin && (
                <div className="space-y-2">
                  <Label className="text-slate-300 text-xs flex items-center gap-1.5">
                    <span className="text-indigo-400">🎮</span> Discord Username
                  </Label>
                  <Input value={payerDiscord} onChange={(e) => setPayerDiscord(e.target.value)}
                    placeholder="yourname (without @)"
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
                  <p className="text-[11px] text-slate-500">Required to receive access to the Discord community after payment.</p>
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
              <div className="flex items-center gap-3 p-3 bg-slate-800/60 rounded-lg">
                {paymentStatus === "pending" && <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                {paymentStatus === "detected" && <Loader2 className="w-4 h-4 text-blue-400 animate-spin flex-shrink-0" />}
                <div>
                  <p className="text-xs font-semibold text-white">
                    {paymentStatus === "pending" ? "Awaiting payment" : "Confirming on-chain…"}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {paymentStatus === "pending" ? "Connect your Cardano wallet to pay" : "Your transaction was submitted."}
                  </p>
                </div>
              </div>

              {paymentStatus === "pending" && (
                <>
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
                      {sessionData.amount_total_ada < 60 && (
                        <div className="border-t border-slate-700 pt-1.5 flex items-start gap-1.5 text-amber-400/80">
                          <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span>For payments under ₳60, a minimum platform fee of ₳1 applies.</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-3">
                    <p className="text-[11px] text-slate-500 text-center">
                      Supported: Nami · Eternl · Flint · Lace · Typhon · GeroWallet · Yoroi
                    </p>
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
                          payerEmail={payerEmail}
                          payerName={payerName}
                          payerDiscordUsername={payerDiscord}
                          onSuccess={handleTxSuccess}
                        />
                        <p className="text-[11px] text-slate-500 text-center">
                          Your wallet will ask you to confirm and enter your password.
                        </p>
                      </>
                    )}
                  </div>
                </>
              )}

              {paymentStatus === "detected" && txHash && (
                <div className="text-center">
                  <a href={`https://cardanoscan.io/transaction/${txHash}`} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-indigo-400 text-xs hover:underline font-mono">
                    View on Cardanoscan <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
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

function ErrorScreen({ message, title = "Invalid checkout link" }) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <p className="text-slate-400 mt-2">{message}</p>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Loading checkout...</p>
      </div>
    </div>
  );
}