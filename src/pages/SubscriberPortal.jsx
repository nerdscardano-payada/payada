import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Hexagon, CheckCircle2, Clock, Loader2, AlertCircle, Wallet, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import WalletConnect from "@/components/checkout/WalletConnect";

export default function SubscriberPortal() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  const [step, setStep] = useState("details"); // details | pay | confirmed
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [txLoading, setTxLoading] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [subscriptionId, setSubscriptionId] = useState(null);

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["sub-plan", slug],
    queryFn: () => base44.entities.SubscriptionPlan.filter({ slug, status: "active" }, "-created_date", 1),
    enabled: !!slug,
  });

  const plan = plans[0] || null;

  const handleStartSubscription = async () => {
    if (!email) { toast.error("Email is required"); return; }

    // Create a one-time payment link for first payment via backend
    const res = await base44.functions.invoke("createSubscriptionSignup", {
      planId: plan.id,
      customerEmail: email,
      customerName: name,
    });

    if (!res?.data?.success) {
      toast.error(res?.data?.error || "Something went wrong");
      return;
    }

    setSessionData(res.data);
    setSubscriptionId(res.data.subscription_id);
    setStep("pay");
  };

  const handleWalletPay = async () => {
    if (!connectedWallet || !sessionData) return;
    setTxLoading(true);
    try {
      const buildRes = await base44.functions.invoke("buildPaymentTx", {
        walletAddress: connectedWallet.address,
        merchantAddress: sessionData.merchant_address,
        merchantLovelace: String(sessionData.merchant_amount_lovelace),
        platformFeeLovelace: String(sessionData.platform_fee_lovelace),
      });

      if (!buildRes?.data?.success) throw new Error(buildRes?.data?.error || "Build failed");

      // Instruct user — wallet sends the amount
      toast.info(`Send ₳ ${sessionData.amount_total_ada?.toFixed(2)} from your wallet to the address below.`);
      setStep("awaiting");
    } catch (err) {
      toast.error(err?.message || "Transaction failed");
    } finally {
      setTxLoading(false);
    }
  };

  const intervalLabel = (plan) => {
    if (!plan) return "";
    if (plan.interval_type === "weekly") return "per week";
    if (plan.interval_type === "monthly") return "per month";
    if (plan.interval_type === "yearly") return "per year";
    return `every ${plan.interval_days} days`;
  };

  if (!slug) return <ErrorScreen message="No subscription link found." />;
  if (isLoading) return <LoadingScreen />;
  if (!plan) return <ErrorScreen title="Plan not found" message="This link has expired or is invalid." />;

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

        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          {/* Plan info */}
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-2 mb-1">
              <RefreshCw className="w-4 h-4 text-indigo-400" />
              <span className="text-xs text-indigo-400 font-medium uppercase tracking-wider">Subscription</span>
            </div>
            <h1 className="text-xl font-bold text-white">{plan.name}</h1>
            {plan.description && <p className="text-sm text-slate-400 mt-2">{plan.description}</p>}
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">
                {plan.amount_mode === "fixed_ada"
                  ? `₳ ${plan.amount_ada?.toFixed(2)}`
                  : `${plan.fiat_currency} ${plan.amount_fiat?.toFixed(2)}`}
              </span>
              <span className="text-sm text-slate-500">{intervalLabel(plan)}</span>
            </div>
            {plan.trial_days > 0 && (
              <p className="text-xs text-emerald-400 mt-2">✓ {plan.trial_days} free trial days</p>
            )}
          </div>

          {/* Step: Details */}
          {step === "details" && (
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300 text-xs">Email *</Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300 text-xs">Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
              <Button
                onClick={handleStartSubscription}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 text-base font-semibold"
              >
                Start subscription
              </Button>
              {plan.grace_days > 0 && (
                <p className="text-[11px] text-slate-500 text-center">
                  {plan.grace_days} grace days for late payment
                </p>
              )}
            </div>
          )}

          {/* Step: Pay */}
          {step === "pay" && (
            <div className="p-6 space-y-5">
              <div className="bg-slate-800/50 rounded-lg p-3 space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Base price</span>
                  <span className="text-white font-semibold">₳ {sessionData?.base_amount_ada?.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total (first payment)</span>
                  <span className="text-white font-semibold">₳ {sessionData?.amount_total_ada?.toFixed(3)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Platform fee ({sessionData?.platform_fee_percent}%)</span>
                  <span>₳ {sessionData?.platform_fee_ada?.toFixed(3)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Fee model</span>
                  <span>{sessionData?.fee_model === "customer_pays" ? "Customer pays" : sessionData?.fee_model === "split" ? "Split 50/50" : "Merchant pays"}</span>
                </div>
                <div className="border-t border-slate-700 pt-1.5 flex justify-between">
                  <span>Merchant receives</span>
                  <span className="text-emerald-400 font-semibold">₳ {sessionData?.merchant_amount_ada?.toFixed(3)}</span>
                </div>
                {sessionData?.base_amount_ada < 60 && (
                  <div className="border-t border-slate-700 pt-1.5 flex items-start gap-1.5 text-amber-400/80">
                    <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>For payments under ₳60, a minimum platform fee of ₳1 applies.</span>
                  </div>
                )}
              </div>

              <WalletConnect
                onConnected={(w) => setConnectedWallet(w)}
                onDisconnected={() => setConnectedWallet(null)}
              />

              {connectedWallet && (
                <Button
                  onClick={handleWalletPay}
                  disabled={txLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-base font-semibold gap-2"
                >
                  {txLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                  ) : (
                    <>Pay ₳ {sessionData?.amount_total_ada?.toFixed(2)} & Activate</>
                  )}
                </Button>
              )}

              {/* Manual fallback */}
              {!connectedWallet && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 text-center">— or send manually —</p>
                  <div className="bg-slate-800 rounded-lg p-3">
                    <p className="text-[11px] text-slate-400 mb-1">Send ₳ {sessionData?.amount_total_ada?.toFixed(3)} to:</p>
                    <code className="text-xs text-slate-300 font-mono break-all">{sessionData?.merchant_address}</code>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step: Awaiting */}
          {step === "awaiting" && (
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-white">Waiting for payment</p>
                  <p className="text-xs text-slate-400 mt-0.5">Your subscription will be activated once your transaction is confirmed. You will receive an email at {email}.</p>
                </div>
              </div>
            </div>
          )}

          {/* Step: Confirmed */}
          {step === "confirmed" && (
            <div className="p-6">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <p className="text-base font-semibold text-white">Subscription active!</p>
                <p className="text-sm text-slate-400 mt-1">
                  Your subscription to <strong>{plan.name}</strong> is active. You will receive a payment reminder for the next billing cycle by email.
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

function ErrorScreen({ message, title = "Invalid link" }) {
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