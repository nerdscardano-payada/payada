import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Hexagon, Loader2, AlertCircle, CheckCircle2, Clock, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import WalletConnect from "@/components/checkout/WalletConnect";
import WalletPayButton from "@/components/checkout/WalletPayButton";

export default function PayTerminal() {
  const params = new URLSearchParams(window.location.search);
  const terminalId = params.get("id");

  const [step, setStep] = useState("select"); // select | details | pay | awaiting | confirmed
  const [selectedPlan, setSelectedPlan] = useState(null); // for subscription mode
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [sessionData, setSessionData] = useState(null);
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [txHash, setTxHash] = useState(null);

  const { data: terminals = [], isLoading: loadingTerminal } = useQuery({
    queryKey: ["pay-terminal", terminalId],
    queryFn: () => base44.entities.PayTerminal.filter({ id: terminalId, status: "active" }, "-created_date", 1),
    enabled: !!terminalId,
  });
  const terminal = terminals[0] || null;

  // Fetch payment link (one_time mode)
  const { data: paymentLinks = [], isLoading: loadingLink } = useQuery({
    queryKey: ["terminal-paymentlink", terminal?.payment_link_slug],
    queryFn: () => base44.entities.PaymentLink.filter({ slug: terminal.payment_link_slug, status: "active" }, "-created_date", 1),
    enabled: !!terminal && terminal.mode === "one_time" && !!terminal.payment_link_slug,
  });
  const paymentLink = paymentLinks[0] || null;

  // Fetch subscription plans (subscription mode)
  const { data: allPlans = [], isLoading: loadingPlans } = useQuery({
    queryKey: ["terminal-plans", terminal?.plan_ids],
    queryFn: async () => {
      if (!terminal?.plan_ids?.length) return [];
      const results = await Promise.all(
        terminal.plan_ids.map((id) => base44.entities.SubscriptionPlan.filter({ id, status: "active" }, "-created_date", 1))
      );
      return results.flat();
    },
    enabled: !!terminal && terminal.mode === "subscription" && !!terminal?.plan_ids?.length,
  });

  const accentColor = terminal?.accent_color || "#6366f1";
  const isLoading = loadingTerminal || loadingLink || loadingPlans;

  // ── Handlers ──

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setStep("details");
  };

  const handleOneTimeNext = async () => {
    const needsDetails = terminal.collect_email || terminal.collect_name;
    if (needsDetails) {
      setStep("details");
    } else {
      // Skip details step, go straight to payment
      await handleStartPaymentDirect();
    }
  };

  const handleStartPaymentDirect = async () => {
    if (!paymentLink) return;
    try {
      const res = await base44.functions.invoke("createPublicCheckoutSession", { paymentLinkId: paymentLink.id });
      if (!res?.data?.success) { toast.error(res?.data?.error || "Something went wrong"); return; }
      setSessionData(res.data);
      setStep("pay");
    } catch (err) {
      toast.error(err?.message || "Something went wrong while starting the payment");
    }
  };

  const handleStartPayment = async () => {
    if (terminal.mode === "one_time") {
      if (!paymentLink) return;
      try {
        const res = await base44.functions.invoke("createPublicCheckoutSession", { paymentLinkId: paymentLink.id });
        if (!res?.data?.success) { toast.error(res?.data?.error || "Something went wrong"); return; }
        setSessionData(res.data);
        setStep("pay");
      } catch (err) {
        toast.error(err?.message || "Something went wrong while starting the payment");
      }
    } else {
      if (!email) { toast.error("Email is required"); return; }
      try {
        const res = await base44.functions.invoke("createSubscriptionSignup", {
          planId: selectedPlan.id,
          customerEmail: email,
          customerName: name,
        });
        if (!res?.data?.success) { toast.error(res?.data?.error || "Something went wrong"); return; }
        setSessionData(res.data);
        setStep("pay");
      } catch (err) {
        toast.error(err?.message || "Something went wrong while starting the subscription");
      }
    }
  };



  const copyAddress = (addr) => {
    navigator.clipboard.writeText(addr);
    toast.success("Address copied!");
  };

  const handleTxSuccess = async (hash) => {
    setTxHash(hash);
    setStep("awaiting");

    if (terminal.mode === "one_time" && paymentLink) {
      const maxAttempts = 5;
      const delayMs = 15000;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          await base44.functions.invoke("recordWalletPayment", {
            txHash: hash,
            paymentLinkId: paymentLink.id,
            merchantId: paymentLink.merchant_id,
            payerEmail: email || null,
            payerName: name || null,
            payerAddress: connectedWallet?.address || null,
          });
          break;
        } catch (err) {
          if (attempt < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, delayMs));
          }
        }
      }
    }

    // Poll for confirmation
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await base44.functions.invoke("checkTxConfirmation", { txHash: hash });
        if (res?.data?.confirmed) {
          clearInterval(interval);
          setStep("confirmed");
        }
      } catch {}
      if (attempts >= 30) clearInterval(interval);
    }, 10000);
  };

  const intervalLabel = (plan) => {
    if (!plan) return "";
    if (plan.interval_type === "weekly") return "/ week";
    if (plan.interval_type === "monthly") return "/ month";
    if (plan.interval_type === "yearly") return "/ year";
    return `/ ${plan.interval_days} days`;
  };

  // ── Guards ──
  if (!terminalId) return <ErrorScreen message="No terminal ID provided." />;
  if (isLoading) return <LoadingScreen />;
  if (!terminal) return <ErrorScreen title="Terminal not found" message="This terminal is unknown or inactive." />;
  if (terminal.mode === "one_time" && !paymentLink) return <ErrorScreen title="Payment link not found" message="The linked payment link is not active." />;

  const receiveAddress = sessionData?.receive_address || sessionData?.merchant_address || paymentLink?.receive_address;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          {terminal.logo_url ? (
            <img src={terminal.logo_url} alt="logo" className="w-14 h-14 object-contain mx-auto mb-3 rounded-xl" />
          ) : (
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
              style={{ background: `linear-gradient(135deg, ${accentColor}, #22d3ee)` }}>
              <Hexagon className="w-6 h-6 text-white" />
            </div>
          )}
          <p className="text-xs text-slate-500 uppercase tracking-widest">Powered by PayADA</p>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800">

          {/* ── STEP: SELECT PLAN (subscription meerkeuze) ── */}
          {step === "select" && terminal.mode === "subscription" && (
            <>
              <div className="p-6 border-b border-slate-800">
                <div className="flex items-center gap-2 mb-1">
                  <RefreshCw className="w-4 h-4" style={{ color: accentColor }} />
                  <span className="text-xs font-medium uppercase tracking-wider" style={{ color: accentColor }}>Choose your plan</span>
                </div>
                <h1 className="text-xl font-bold text-white">{terminal.name}</h1>
                {terminal.description && <p className="text-sm text-slate-400 mt-1">{terminal.description}</p>}
              </div>
              <div className="p-4 space-y-3">
                {allPlans.map((plan) => (
                  <button key={plan.id} onClick={() => handleSelectPlan(plan)}
                    className="w-full text-left p-4 rounded-xl border border-slate-700 hover:border-indigo-500 bg-slate-800/50 hover:bg-slate-800 transition-all group">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white group-hover:text-indigo-300 transition-colors">{plan.name}</p>
                        {plan.description && <p className="text-xs text-slate-400 mt-0.5">{plan.description}</p>}
                        {plan.trial_days > 0 && (
                          <p className="text-xs text-emerald-400 mt-1">✓ {plan.trial_days} days free</p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <p className="text-xl font-bold text-white">
                          {plan.amount_mode === "fixed_ada"
                            ? `₳ ${plan.amount_ada?.toFixed(2)}`
                            : `${plan.fiat_currency} ${plan.amount_fiat?.toFixed(2)}`}
                        </p>
                        <p className="text-xs text-slate-400">{intervalLabel(plan)}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ── STEP: SELECT (one_time) → show product info ── */}
          {step === "select" && terminal.mode === "one_time" && (
            <>
              <div className="p-6 border-b border-slate-800">
                <h1 className="text-xl font-bold text-white">{paymentLink.title}</h1>
                {paymentLink.description && <p className="text-sm text-slate-400 mt-2">{paymentLink.description}</p>}
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">₳ {paymentLink.amount_ada?.toFixed(2)}</span>
                  <span className="text-sm text-slate-500">ADA</span>
                </div>
              </div>
              <div className="p-6">
                <Button onClick={handleOneTimeNext} className="w-full h-12 text-base font-semibold text-white"
                  style={{ backgroundColor: accentColor }}>
                  {terminal.button_label || "Continue"}
                </Button>
              </div>
            </>
          )}

          {/* ── STEP: DETAILS ── */}
          {step === "details" && (
            <>
              <div className="p-6 border-b border-slate-800">
                {terminal.mode === "subscription" && selectedPlan && (
                  <div>
                    <button onClick={() => setStep("select")} className="text-xs text-slate-500 hover:text-slate-300 mb-2">← Back</button>
                    <p className="text-slate-400 text-sm">{selectedPlan.name}</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {selectedPlan.amount_mode === "fixed_ada"
                        ? `₳ ${selectedPlan.amount_ada?.toFixed(2)}`
                        : `${selectedPlan.fiat_currency} ${selectedPlan.amount_fiat?.toFixed(2)}`}
                      <span className="text-sm text-slate-500 font-normal ml-2">{intervalLabel(selectedPlan)}</span>
                    </p>
                  </div>
                )}
                {terminal.mode === "one_time" && (
                  <div>
                    <button onClick={() => setStep("select")} className="text-xs text-slate-500 hover:text-slate-300 mb-2">← Back</button>
                    <p className="text-2xl font-bold text-white">₳ {paymentLink?.amount_ada?.toFixed(2)}</p>
                    <p className="text-sm text-slate-400">{paymentLink?.title}</p>
                  </div>
                )}
              </div>
              <div className="p-6 space-y-4">
                {terminal.collect_email && (
                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">Email {terminal.mode === "subscription" ? "*" : ""}</Label>
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com"
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
                  </div>
                )}
                {terminal.collect_name && (
                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">Name</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
                  </div>
                )}
                <Button onClick={handleStartPayment} className="w-full h-12 text-base font-semibold text-white"
                  style={{ backgroundColor: accentColor }}>
                  {terminal.mode === "subscription" ? "Start Subscription" : (terminal.button_label || "Continue to Payment")}
                </Button>
              </div>
            </>
          )}

          {/* ── STEP: PAY ── */}
          {step === "pay" && (
            <div className="p-6 space-y-5">
              {/* Summary */}
              <div className="bg-slate-800/50 rounded-lg p-3 space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>{terminal.mode === "subscription" ? "First payment" : "Total"}</span>
                  <span className="text-white font-semibold">₳ {sessionData?.amount_total_ada?.toFixed(3)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Platform fee ({sessionData?.platform_fee_percent}%)</span>
                  <span>₳ {sessionData?.platform_fee_ada?.toFixed(3)}</span>
                </div>
                <div className="border-t border-slate-700 pt-1.5 flex justify-between">
                  <span>Merchant receives</span>
                  <span className="text-emerald-400 font-semibold">₳ {sessionData?.merchant_amount_ada?.toFixed(3)}</span>
                </div>
                {sessionData?.amount_total_ada < 60 && (
                  <div className="border-t border-slate-700 pt-1.5 flex items-start gap-1.5 text-amber-400/80">
                    <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>For payments under ₳60, a minimum platform fee of ₳1 applies, resulting in a higher effective fee percentage.</span>
                  </div>
                )}
              </div>

              {/* Wallet only */}
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
                     onSuccess={handleTxSuccess}
                    />
                    <p className="text-[11px] text-slate-500 text-center">
                      Your wallet will ask you to confirm and enter your password.
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ── STEP: AWAITING ── */}
          {step === "awaiting" && (
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-white">Waiting for confirmation</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Your transaction is being processed on the Cardano blockchain.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP: CONFIRMED ── */}
          {step === "confirmed" && (
            <div className="p-6">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <p className="text-base font-semibold text-white">Payment confirmed!</p>
                <p className="text-sm text-slate-400 mt-1">
                  {terminal.mode === "subscription"
                    ? `Your subscription to ${selectedPlan?.name} has been activated.`
                    : "Your transaction has been confirmed on the Cardano blockchain."}
                </p>
              </div>
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

function ErrorScreen({ message, title = "Terminal not found" }) {
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
      <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
    </div>
  );
}