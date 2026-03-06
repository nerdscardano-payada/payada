import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { QRCodeSVG } from "qrcode.react";
import { createPageUrl } from "@/utils";
import {
  Hexagon, CheckCircle2, Clock, Loader2,
  AlertCircle, RotateCcw, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const STATUS_COLORS = {
  idle: "text-slate-400",
  pending: "text-amber-400",
  detected: "text-blue-400",
  confirmed: "text-emerald-400",
  error: "text-red-400",
};

export default function POS() {
  const [amountAda, setAmountAda] = useState("");
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("idle");
  const [paymentId, setPaymentId] = useState(null);
  const pollRef = useRef(null);

  const checkoutUrl = session
    ? `${window.location.origin}${window.location.pathname.replace(/\/[^/]*$/, "")}/?page=Pay&slug=${session.slug}`
    : null;

  // Use window.location to build correct URL for QR
  const qrUrl = session
    ? `${window.location.origin.replace(/\/$/, "")}?page=Pay&slug=${session.slug}`
    : null;

  const handleGenerate = async () => {
    if (!amountAda || parseFloat(amountAda) <= 0) {
      toast.error("Voer een geldig bedrag in.");
      return;
    }
    setLoading(true);
    setPaymentStatus("idle");
    setSession(null);
    setPaymentId(null);
    clearInterval(pollRef.current);

    try {
      const res = await base44.functions.invoke("createPosSession", {
        amountAda: parseFloat(amountAda),
        label: label || "POS Payment",
      });
      setSession(res.data);
      setPaymentStatus("pending");
      startPolling(res.data.payment_link_id);
    } catch (err) {
      toast.error("Sessie aanmaken mislukt.");
      setPaymentStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (paymentLinkId) => {
    let attempts = 0;
    pollRef.current = setInterval(async () => {
      attempts++;
      try {
        const payments = await base44.entities.Payment.filter(
          { payment_link_id: paymentLinkId },
          "-created_date",
          1
        );
        if (payments.length > 0) {
          const p = payments[0];
          setPaymentId(p.id);
          if (p.status === "confirmed") {
            setPaymentStatus("confirmed");
            clearInterval(pollRef.current);
          } else if (p.status === "detected") {
            setPaymentStatus("detected");
          }
        }
      } catch {}
      if (attempts >= 60) clearInterval(pollRef.current); // stop after 10 min
    }, 10000);
  };

  const handleReset = () => {
    clearInterval(pollRef.current);
    setSession(null);
    setPaymentStatus("idle");
    setPaymentId(null);
    setAmountAda("");
    setLabel("");
  };

  useEffect(() => () => clearInterval(pollRef.current), []);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center mx-auto mb-3">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">PayADA POS</h1>
          <p className="text-xs text-slate-500 mt-1">Physical point of sale · Cardano ADA</p>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          {!session ? (
            /* Amount entry */
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <Label className="text-slate-400 text-xs">Amount (ADA)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">₳</span>
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    value={amountAda}
                    onChange={(e) => setAmountAda(e.target.value)}
                    placeholder="0.00"
                    className="bg-slate-800 border-slate-700 text-white text-2xl font-bold pl-8 h-14 placeholder:text-slate-600"
                    onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-400 text-xs">Description (optional)</Label>
                <Input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Coffee, Ticket, Beer..."
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-600"
                />
              </div>

              {/* Quick amount buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 20, 50].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setAmountAda(String(amt))}
                    className="py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors border border-slate-700"
                  >
                    ₳{amt}
                  </button>
                ))}
              </div>

              <Button
                onClick={handleGenerate}
                disabled={loading || !amountAda}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" />Please wait…</>
                ) : (
                  "Generate QR Code"
                )}
              </Button>
            </div>
          ) : (
            /* QR code + status */
            <div className="p-6 space-y-5">
              {/* Amount summary */}
              <div className="text-center">
                <p className="text-slate-400 text-xs mb-1">{session.label || label || "POS Payment"}</p>
                <p className="text-4xl font-bold text-white">₳ {parseFloat(amountAda).toFixed(2)}</p>
              </div>

              {/* QR Code */}
              {paymentStatus !== "confirmed" && (
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-xl">
                    <QRCodeSVG
                      value={qrUrl}
                      size={200}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                </div>
              )}

              {/* Status */}
              <div className={`flex items-center gap-3 p-3 rounded-lg bg-slate-800/60 ${STATUS_COLORS[paymentStatus]}`}>
                {paymentStatus === "pending" && <Clock className="w-5 h-5 flex-shrink-0" />}
                {paymentStatus === "detected" && <Loader2 className="w-5 h-5 flex-shrink-0 animate-spin" />}
                {paymentStatus === "confirmed" && <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
                {paymentStatus === "error" && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                <div>
                  <p className="text-sm font-semibold text-white">
                    {paymentStatus === "pending" && "Awaiting payment…"}
                    {paymentStatus === "detected" && "Transaction detected!"}
                    {paymentStatus === "confirmed" && "✅ Payment confirmed!"}
                    {paymentStatus === "error" && "An error occurred"}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {paymentStatus === "pending" && "Ask the customer to scan the QR code with a Cardano wallet."}
                    {paymentStatus === "detected" && "Waiting for network confirmation…"}
                    {paymentStatus === "confirmed" && "Payment successfully processed on the blockchain."}
                  </p>
                </div>
              </div>

              {/* Fee breakdown */}
              <div className="text-xs text-slate-500 space-y-1 border-t border-slate-800 pt-3">
                <div className="flex justify-between">
                  <span>Platform fee ({session.platform_fee_percent}%)</span>
                  <span>₳ {session.platform_fee_ada?.toFixed(3)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>U ontvangt</span>
                  <span className="text-emerald-400 font-semibold">₳ {session.merchant_amount_ada?.toFixed(3)}</span>
                </div>
              </div>

              <Button
                onClick={handleReset}
                variant="outline"
                className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Nieuwe betaling
              </Button>
            </div>
          )}
        </div>

        <p className="text-center text-[11px] text-slate-700 mt-5">
          Cardano ADA · PayADA.io
        </p>
      </div>
    </div>
  );
}