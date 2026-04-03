import React, { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const formatNumber = (value, decimals = 2) => {
  if (!Number.isFinite(value)) return "0.00";
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export default function AdaCurrencyConverter({ adaRateEur, adaRateUsd }) {
  const [amount, setAmount] = useState("1");
  const adaAmount = Number(amount) || 0;

  const converted = useMemo(() => ({
    eur: adaAmount * (Number(adaRateEur) || 0),
    usd: adaAmount * (Number(adaRateUsd) || 0),
  }), [adaAmount, adaRateEur, adaRateUsd]);

  return (
    <div className="mt-4 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-black/20">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Converter</p>
          <h3 className="mt-1 text-lg font-semibold text-white">ADA naar EUR & USD</h3>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <Label htmlFor="ada-converter" className="text-slate-300 text-xs">ADA bedrag</Label>
        <Input
          id="ada-converter"
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
          placeholder="Voer ADA in"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-800 px-4 py-3">
          <p className="text-xs uppercase tracking-wider text-slate-400">EUR</p>
          <p className="mt-1 text-2xl font-semibold text-white">€ {formatNumber(converted.eur)}</p>
        </div>
        <div className="rounded-2xl bg-slate-800 px-4 py-3">
          <p className="text-xs uppercase tracking-wider text-slate-400">USD</p>
          <p className="mt-1 text-2xl font-semibold text-white">$ {formatNumber(converted.usd)}</p>
        </div>
      </div>
    </div>
  );
}