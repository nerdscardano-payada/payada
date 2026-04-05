import React, { useState } from "react";
import QRCodeDisplay from "@/components/shared/QRCodeDisplay";
import AdaRatePreview from "@/components/checkout/AdaRatePreview";
import { Copy, RotateCcw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function POS() {
  const [amountAda, setAmountAda] = useState("");
  const [label, setLabel] = useState("");
  const [built, setBuilt] = useState(false);

  const qrValue = amountAda && parseFloat(amountAda) > 0
    ? `web+cardano:${label ? `${encodeURIComponent(label)}:` : ""}?amount=${parseFloat(amountAda).toFixed(6)}`
    : "";

  const handleGenerate = () => {
    if (!amountAda || parseFloat(amountAda) <= 0) {
      toast.error("Voer een geldig bedrag in.");
      return;
    }
    setBuilt(true);
  };

  const handleCopy = async () => {
    if (!qrValue) return;
    await navigator.clipboard.writeText(qrValue);
    toast.success("Betaalstring gekopieerd.");
  };

  const handleReset = () => {
    setBuilt(false);
    setAmountAda("");
    setLabel("");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-start md:justify-center p-4">
      <div className="w-full max-w-sm md:mt-0">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center mx-auto mb-3">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">PayADA POS</h1>
          <p className="text-xs text-slate-500 mt-1">Physical point of sale · Cardano ADA</p>
        </div>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          {!built ? (
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
                {[20, 40, 60, 80].map((amt) => (
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
                disabled={!amountAda}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base"
              >
                Generate QR Code
              </Button>
            </div>
          ) : (
            <div className="p-6 space-y-5">
              <div className="text-center">
                <p className="text-slate-400 text-xs mb-1">{label || "One-time payment"}</p>
                <p className="text-4xl font-bold text-white">₳ {parseFloat(amountAda).toFixed(2)}</p>
              </div>
              <AdaRatePreview adaAmount={amountAda} />

              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-xl">
                  <QRCodeDisplay value={qrValue} size={220} />
                </div>
              </div>

              <div className="rounded-lg bg-slate-800/60 p-3">
                <p className="text-sm font-semibold text-white">One-time QR ready</p>
                <p className="text-[11px] text-slate-500 mt-1">Deze QR wordt niet opgeslagen en is bedoeld voor direct eenmalig gebruik.</p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy string
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  New Payment
                </Button>
              </div>
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