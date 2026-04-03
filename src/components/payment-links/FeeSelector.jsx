import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Circle, Store, Users } from "lucide-react";

const options = [
  {
    value: "customer_pays",
    title: "Customer pays fee",
    description: "You receive the full amount",
    icon: Users,
  },
  {
    value: "merchant_pays",
    title: "I pay the fee",
    description: "Customer pays the exact amount",
    icon: Store,
  },
  {
    value: "split",
    title: "Split the fee",
    description: "Fee is shared between you and the customer",
    icon: Circle,
  },
];

export default function FeeSelector({ form, update }) {
  const splitRatio = Number(form.fee_split_ratio ?? 0.5);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label className="uppercase tracking-[0.18em] text-xs text-muted-foreground">Who pays the fee?</Label>
      </div>

      <div className="grid gap-4">
        {options.map((option) => {
          const active = (form.fee_model || "customer_pays") === option.value;
          const Icon = option.icon;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => update("fee_model", option.value)}
              className={[
                "w-full rounded-[1.35rem] border text-left transition-all duration-200",
                "px-4 py-4 sm:px-5 sm:py-5",
                "bg-slate-900/90",
                active
                  ? "border-cyan-400/60 shadow-[0_0_0_1px_rgba(34,211,238,0.18),0_0_24px_rgba(34,211,238,0.12)]"
                  : "border-slate-700 hover:border-cyan-500/30 hover:bg-slate-900",
              ].join(" ")}
            >
              <div className="flex items-center gap-4">
                <div className={[
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border",
                  active
                    ? "border-cyan-400/20 bg-cyan-500/12 text-cyan-300"
                    : "border-slate-700 bg-slate-800 text-slate-300",
                ].join(" ")}>
                  <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-lg font-semibold leading-tight text-white">
                    {option.title}
                  </div>
                  <p className={[
                    "mt-1 text-sm leading-relaxed",
                    active ? "text-slate-300" : "text-slate-400",
                  ].join(" ")}>
                    {option.description}
                  </p>
                </div>

                <div className={[
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2",
                  active ? "border-blue-500" : "border-slate-500",
                ].join(" ")}>
                  <div className={[
                    "h-3 w-3 rounded-full transition-all",
                    active ? "bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.9)]" : "bg-transparent",
                  ].join(" ")} />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {(form.fee_model || "customer_pays") === "split" && (
        <div className="rounded-[1.35rem] border border-slate-700 bg-slate-900/90 p-4 space-y-3">
          <div className="space-y-1">
            <Label className="text-slate-200">Split ratio</Label>
            <p className="text-xs text-slate-400">How much of the fee is paid by the customer.</p>
          </div>
          <Input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={splitRatio}
            onChange={(e) => update("fee_split_ratio", Number(e.target.value))}
            className="h-10 border-slate-700 bg-slate-800 text-slate-200"
          />
          <p className="text-sm font-medium text-slate-200">
            Customer: {Math.round(splitRatio * 100)}% · Merchant: {Math.round((1 - splitRatio) * 100)}%
          </p>
        </div>
      )}
    </div>
  );
}