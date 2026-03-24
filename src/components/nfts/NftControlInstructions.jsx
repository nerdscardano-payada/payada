import React from "react";
import { Clock3, Zap } from "lucide-react";

export default function NftControlInstructions({ fulfillmentMode = "manual", pendingTransfers = 0 }) {
  const isAutomatic = fulfillmentMode === "automatic";
  const steps = isAutomatic
    ? [
        "A confirmed payment creates a transfer job automatically.",
        "The hot wallet sends the NFT to the buyer wallet.",
        "Use the queue below only to review status or fix failures.",
      ]
    : [
        "A confirmed payment appears in the queue below.",
        "Copy the buyer wallet address shown in that order.",
        "Connect your saved signer wallet and click Sign & send.",
      ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 rounded-xl p-2 ${isAutomatic ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
          {isAutomatic ? <Zap className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-slate-900">What happens after a payment</h2>
          <p className="mt-1 text-sm text-slate-500">
            {isAutomatic
              ? "Automatic delivery is enabled. Paid orders are handled from the hot wallet."
              : "Manual delivery is enabled. Every paid NFT order should be handled here in NFT Control."}
          </p>
          <ol className="mt-4 space-y-2 text-sm text-slate-700">
            {steps.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">{index + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            {pendingTransfers > 0 ? `${pendingTransfers} order${pendingTransfers === 1 ? " is" : "s are"} currently waiting for action.` : "No paid NFT orders are waiting right now."}
          </div>
        </div>
      </div>
    </div>