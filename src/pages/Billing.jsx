import React from "react";
import PageHeader from "@/components/shared/PageHeader";
import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    price: "€0",
    period: "/month",
    fee: "1.5% tx fee",
    features: [
      "5 payment links",
      "Basic dashboard",
      "Payment detection",
      "1 webhook endpoint",
      "Community support",
    ],
    current: true,
  },
  {
    name: "Pro",
    price: "€15",
    period: "/month",
    fee: "0.8% tx fee",
    popular: true,
    features: [
      "Unlimited payment links",
      "Subscription plans",
      "Fiat pricing (EUR/USD)",
      "10 webhook endpoints",
      "API access",
      "CSV export",
      "Priority support",
    ],
  },
  {
    name: "Business",
    price: "€49",
    period: "/month",
    fee: "0.4% tx fee",
    features: [
      "Everything in Pro",
      "Unlimited webhooks",
      "Subscriber portal",
      "Advanced analytics",
      "Custom branding",
      "Dedicated support",
    ],
  },
];

export default function Billing() {
  return (
    <div>
      <PageHeader
        title="Billing"
        subtitle="Manage your PayADA subscription plan"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              "bg-white rounded-xl border p-6 flex flex-col relative",
              plan.popular
                ? "border-indigo-300 shadow-lg shadow-indigo-100/50 ring-1 ring-indigo-200"
                : "border-slate-200/60"
            )}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                  Popular
                </span>
              </div>
            )}

            <div className="mb-5">
              <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
                <span className="text-sm text-slate-500">{plan.period}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{plan.fee}</p>
            </div>

            <ul className="space-y-2.5 flex-1 mb-6">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>

            <Button
              className={cn(
                "w-full",
                plan.current
                  ? "bg-slate-100 text-slate-500 hover:bg-slate-100 cursor-default"
                  : plan.popular
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                  : "bg-slate-900 hover:bg-slate-800 text-white"
              )}
              disabled={plan.current}
            >
              {plan.current ? "Current Plan" : "Upgrade"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}