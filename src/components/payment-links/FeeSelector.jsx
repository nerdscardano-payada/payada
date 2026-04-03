import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const options = [
  { value: "customer_pays", title: "Customer pays", description: "Customer pays amount + fee. You receive the full amount." },
  { value: "merchant_pays", title: "I pay the fee", description: "Customer pays the base amount. Fee is deducted from what you receive." },
  { value: "split", title: "Split fee", description: "Customer and merchant each pay part of the fee." },
];

export default function FeeSelector({ form, update }) {
  const splitRatio = Number(form.fee_split_ratio ?? 0.5);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label>Who pays the fee?</Label>
        <p className="text-xs text-slate-500">Default is customer pays, for the simplest adoption flow.</p>
      </div>

      <div className="grid gap-3">
        {options.map((option) => {
          const active = (form.fee_model || "customer_pays") === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => update("fee_model", option.value)}
              className={`rounded-2xl border p-4 text-left transition ${active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-900 hover:border-slate-300"}`}
            >
              <div className="text-sm font-semibold">{option.title}</div>
              <p className={`mt-1 text-sm ${active ? "text-slate-300" : "text-slate-600"}`}>{option.description}</p>
            </button>
          );
        })}
      </div>

      {(form.fee_model || "customer_pays") === "split" && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
          <div className="space-y-1">
            <Label>Split ratio</Label>
            <p className="text-xs text-slate-500">How much of the fee is paid by the customer.</p>
          </div>
          <Input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={splitRatio}
            onChange={(e) => update("fee_split_ratio", Number(e.target.value))}
            className="h-10"
          />
          <p className="text-sm font-medium text-slate-700">
            Customer: {Math.round(splitRatio * 100)}% · Merchant: {Math.round((1 - splitRatio) * 100)}%
          </p>
        </div>
      )}
    </div>
  );
}