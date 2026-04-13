import React, { useEffect, useState } from "react";
import QRCodeDisplay from "@/components/shared/QRCodeDisplay";
import AdaRatePreview from "@/components/checkout/AdaRatePreview";
import { Copy, RotateCcw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function POS() {
  const [amountAda, setAmountAda] = useState("");
  const [label, setLabel] = useState("");
  const [receiveAddress, setReceiveAddress] = useState("");
  const [feeModel, setFeeModel] = useState("merchant_pays");
  const [built, setBuilt] = useState(false);

  useEffect(() => {
    const savedAddress = localStorage.getItem("payada_manual_wallet_address") || localStorage.getItem("payada_connected_wallet_address") || "";
    if (savedAddress) {
      setReceiveAddress(savedAddress);
    }
  }, []);

  const qrValue = receiveAddress && amountAda && parseFloat(amountAda) > 0
    ? `web+cardano:${receiveAddress}?amount=${parseFloat(amountAda).toFixed(6)}${label ? `&label=${encodeURIComponent(label)}` : ""}`
    : "";

  const handleGenerate = () => {
    if (!receiveAddress.trim()) {
      toast.error("Voer een geldig Cardano walletadres in.");
      return;
    }
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
    setFeeModel("merchant_pays");
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
                <Label className="text-slate-400 text-xs">Receive address</Label>
                <Input
                  value={receiveAddress}
                  onChange={(e) => setReceiveAddress(e.target.value)}
                  placeholder="addr1..."
                  className="bg-slate-800 border-slate-700 text-white h-12 placeholder:text-slate-600"
                />
              </div>

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

              <div className="space-y-2">
                <Label className="text-slate-400 text-xs">Who pays the fee? (1.75%)</Label>
                <Select value={feeModel} onValueChange={setFeeModel}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer_pays">Customer pays fee</SelectItem>
                    <SelectItem value="merchant_pays">I pay the fee</SelectItem>
                    <SelectItem value="split">Split the fee</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-slate-500">
                  {(feeModel || "merchant_pays") === "customer_pays" && "You receive the full amount."}
                  {feeModel === "merchant_pays" && "Customer pays the exact amount."}
                  {feeModel === "split" && "Fee is shared between you and the customer."}
                </p>
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
                disabled={!amountAda || !receiveAddress.trim()}
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
                <p className="text-[11px] text-slate-500 mt-1">Deze QR bevat nu een echt mainnet Cardano walletadres en exact bedrag voor direct gebruik.</p>
                <p className="text-[11px] text-slate-400 mt-1 break-all">{receiveAddress}</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {(feeModel || "merchant_pays") === "customer_pays" && "Fee model: customer pays the 1.75% fee."}
                  {feeModel === "merchant_pays" && "Fee model: you pay the 1.75% fee."}
                  {feeModel === "split" && "Fee model: the 1.75% fee is split."}
                </p>
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