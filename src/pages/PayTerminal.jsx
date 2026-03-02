import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Hexagon, Loader2, AlertCircle, CheckCircle2, Clock, Copy, RefreshCw, Wallet, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import WalletConnect from "@/components/checkout/WalletConnect";

export default function PayTerminal() {
  const params = new URLSearchParams(window.location.search);
  const terminalId = params.get("id");

  const [step, setStep] = useState("select"); // select | details | pay | awaiting | confirmed
  const [selectedPlan, setSelectedPlan] = useState(null); // for subscription mode
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [sessionData, setSessionData] = useState(null);
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("manual");
  const [txLoading, setTxLoading] = useState(false);

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

  const handleOneTimeNext = () => {
    // For one_time: go straight to details if needed, else pay
    setStep("details");
  };

  const handleStartPayment = async () => {
    if (terminal.mode === "one_time") {
      if (!paymentLink) return;
      try {
        const res = await base44.functions.invoke("createPublicCheckoutSession", { paymentLinkId: paymentLink.id });
        if (!res?.data?.success) { toast.error(res?.data?.error || "Er ging iets mis"); return; }
        setSessionData(res.data);
        setStep("pay");
      } catch (err) {
        toast.error(err?.message || "Er ging iets mis bij het starten van de betaling");
      }
    } else {
      if (!email) { toast.error("E-mail is verplicht"); return; }
      try {
        const res = await base44.functions.invoke("createSubscriptionSignup", {
          planId: selectedPlan.id,
          customerEmail: email,
          customerName: name,
        });
        if (!res?.data?.success) { toast.error(res?.data?.error || "Er ging iets mis"); return; }
        setSessionData(res.data);
        setStep("pay");
      } catch (err) {
        toast.error(err?.message || "Er ging iets mis bij het starten van het abonnement");
      }
    }
  };

  const handleWalletPay = async () => {
    if (!connectedWallet || !sessionData) return;
    setTxLoading(true);
    try {
      const buildRes = await base44.functions.invoke("buildPaymentTx", {
        walletAddress: connectedWallet.address,
        merchantAddress: sessionData.merchant_address || sessionData.receive_address,
        merchantLovelace: String(Math.floor((sessionData.merchant_amount_ada || sessionData.merchant_amount_lovelace / 1e6) * 1e6)),
        platformFeeLovelace: String(Math.floor((sessionData.platform_fee_ada || sessionData.platform_fee_lovelace / 1e6) * 1e6)),
      });
      if (!buildRes?.data?.success) throw new Error(buildRes?.data?.error || "Build failed");
      toast.info(`Stuur ₳ ${sessionData.amount_total_ada?.toFixed(2)} vanuit je wallet naar het adres hieronder.`);
      setPaymentMethod("manual");
    } catch (err) {
      toast.error(err?.message || "Transactie mislukt");
    } finally {
      setTxLoading(false);
    }
  };

  const copyAddress = (addr) => {
    navigator.clipboard.writeText(addr);
    toast.success("Adres gekopieerd!");
  };

  const intervalLabel = (plan) => {
    if (!plan) return "";
    if (plan.interval_type === "weekly") return "/ week";
    if (plan.interval_type === "monthly") return "/ maand";
    if (plan.interval_type === "yearly") return "/ jaar";
    return `/ ${plan.interval_days} dagen`;
  };

  // ── Guards ──
  if (!terminalId) return <ErrorScreen message="Geen terminal ID opgegeven." />;
  if (isLoading) return <LoadingScreen />;
  if (!terminal) return <ErrorScreen title="Terminal niet gevonden" message="Deze terminal is onbekend of inactief." />;
  if (terminal.mode === "one_time" && !paymentLink) return <ErrorScreen title="Betaallink niet gevonden" message="De gekoppelde betaallink is niet actief." />;

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

        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">

          {/* ── STEP: SELECT PLAN (subscription meerkeuze) ── */}
          {step === "select" && terminal.mode === "subscription" && (
            <>
              <div className="p-6 border-b border-slate-800">
                <div className="flex items-center gap-2 mb-1">
                  <RefreshCw className="w-4 h-4" style={{ color: accentColor }} />
                  <span className="text-xs font-medium uppercase tracking-wider" style={{ color: accentColor }}>Kies je abonnement</span>
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
                          <p className="text-xs text-emerald-400 mt-1">✓ {plan.trial_days} dagen gratis</p>
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
                  {terminal.button_label || "Doorgaan"}
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
                    <button onClick={() => setStep("select")} className="text-xs text-slate-500 hover:text-slate-300 mb-2">← Terug</button>
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
                    <button onClick={() => setStep("select")} className="text-xs text-slate-500 hover:text-slate-300 mb-2">← Terug</button>
                    <p className="text-2xl font-bold text-white">₳ {paymentLink?.amount_ada?.toFixed(2)}</p>
                    <p className="text-sm text-slate-400">{paymentLink?.title}</p>
                  </div>
                )}
              </div>
              <div className="p-6 space-y-4">
                {terminal.collect_email && (
                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">E-mail {terminal.mode === "subscription" ? "*" : ""}</Label>
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jouw@email.com"
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
                  </div>
                )}
                {terminal.collect_name && (
                  <div className="space-y-2">
                    <Label className="text-slate-300 text-xs">Naam</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jouw naam"
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
                  </div>
                )}
                <Button onClick={handleStartPayment} className="w-full h-12 text-base font-semibold text-white"
                  style={{ backgroundColor: accentColor }}>
                  {terminal.mode === "subscription" ? "Abonnement starten" : (terminal.button_label || "Doorgaan naar betaling")}
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
                  <span>{terminal.mode === "subscription" ? "Eerste betaling" : "Totaal"}</span>
                  <span className="text-white font-semibold">₳ {sessionData?.amount_total_ada?.toFixed(3)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Platform fee ({sessionData?.platform_fee_percent}%)</span>
                  <span>₳ {sessionData?.platform_fee_ada?.toFixed(3)}</span>
                </div>
                <div className="border-t border-slate-700 pt-1.5 flex justify-between">
                  <span>Merchant ontvangt</span>
                  <span className="text-emerald-400 font-semibold">₳ {sessionData?.merchant_amount_ada?.toFixed(3)}</span>
                </div>
              </div>

              {/* Method toggle */}
              <div className="flex rounded-lg overflow-hidden border border-slate-700">
                <button
                  className={`flex-1 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${paymentMethod === "wallet" ? "text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}
                  style={paymentMethod === "wallet" ? { backgroundColor: accentColor } : {}}
                  onClick={() => setPaymentMethod("wallet")}
                >
                  <Wallet className="w-3.5 h-3.5" /> Wallet
                </button>
                <button
                  className={`flex-1 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${paymentMethod === "manual" ? "text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}
                  style={paymentMethod === "manual" ? { backgroundColor: accentColor } : {}}
                  onClick={() => setPaymentMethod("manual")}
                >
                  Handmatig
                </button>
              </div>

              {/* Wallet */}
              {paymentMethod === "wallet" && (
                <div className="space-y-3">
                  <WalletConnect
                    onConnected={(w) => setConnectedWallet(w)}
                    onDisconnected={() => setConnectedWallet(null)}
                  />
                  {connectedWallet && (
                    <Button onClick={handleWalletPay} disabled={txLoading}
                      className="w-full h-12 text-base font-semibold text-white gap-2"
                      style={{ backgroundColor: accentColor }}>
                      {txLoading
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Bezig…</>
                        : <>Betaal ₳ {sessionData?.amount_total_ada?.toFixed(2)}</>}
                    </Button>
                  )}
                  <p className="text-[11px] text-slate-500 text-center">
                    Sluit je Cardano wallet aan (Nami, Eternl, Flint, Lace, …)
                  </p>
                </div>
              )}

              {/* Manual */}
              {paymentMethod === "manual" && (
                <div className="space-y-3">
                  <div className="bg-white rounded-xl p-5 flex items-center justify-center">
                    <div className="w-36 h-36 bg-slate-100 rounded-lg flex items-center justify-center text-xs text-slate-400">QR Code</div>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Stuur exact ₳ {sessionData?.amount_total_ada?.toFixed(3)} naar:</Label>
                    <div className="flex items-center gap-2 mt-1.5">
                      <code className="flex-1 bg-slate-800 px-3 py-2.5 rounded-lg text-xs text-slate-300 font-mono break-all border border-slate-700">
                        {receiveAddress}
                      </code>
                      <Button variant="outline" size="icon" onClick={() => copyAddress(receiveAddress)}
                        className="border-slate-700 text-slate-400 hover:text-white flex-shrink-0">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Betaling wordt automatisch gedetecteerd na 2+ bevestigingen.
                  </p>
                  <Button onClick={() => setStep("awaiting")} className="w-full text-white"
                    style={{ backgroundColor: accentColor }}>
                    Ik heb betaald
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* ── STEP: AWAITING ── */}
          {step === "awaiting" && (
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-white">Wachten op bevestiging</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Je transactie wordt verwerkt op de Cardano blockchain.
                    {email && ` Je ontvangt een bevestiging op ${email}.`}
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
                <p className="text-base font-semibold text-white">Betaling bevestigd!</p>
                <p className="text-sm text-slate-400 mt-1">
                  {terminal.mode === "subscription"
                    ? `Je abonnement op ${selectedPlan?.name} is geactiveerd.`
                    : "Je transactie is bevestigd op de Cardano blockchain."}
                </p>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-[11px] text-slate-600 mt-6">
          Veilige Cardano ADA betaling · PayADA.io
        </p>
      </div>
    </div>
  );
}

function ErrorScreen({ message, title = "Terminal niet gevonden" }) {
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