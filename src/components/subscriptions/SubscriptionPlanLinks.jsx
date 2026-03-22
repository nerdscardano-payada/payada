import React from "react";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

const intervalLabel = (plan) => (plan.interval_type === "yearly" ? "Yearly" : "Monthly");

export default function SubscriptionPlanLinks({ plans }) {
  const origin = window.location.origin;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5">
        <h2 className="text-lg font-semibold text-slate-900">Checkout links</h2>
        <p className="mt-1 text-sm text-slate-500">Each plan gets a unique signup link automatically.</p>
      </div>

      <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
        {plans.map((plan) => {
          const checkoutUrl = `${origin}/SubscriberPortal?slug=${plan.slug}`;
          return (
            <div key={plan.id} className="col-span-full rounded-2xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{plan.name}</p>
                  <p className="mt-1 text-sm text-slate-500">₳ {plan.amount_ada?.toFixed(2) || "0.00"} · {intervalLabel(plan)}</p>
                </div>
                <LinkIcon className="h-4 w-4 text-slate-400" />
              </div>

              {plan.description && <p className="mt-3 text-sm text-slate-600">{plan.description}</p>}
              {(plan.trial_days || 0) > 0 && <p className="mt-2 text-xs font-medium text-emerald-600">{plan.trial_days} trial day(s)</p>}

              <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 break-all">{checkoutUrl}</div>

              <div className="mt-4 flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => {
                  navigator.clipboard.writeText(checkoutUrl);
                  toast.success("Checkout link copied");
                }}>
                  <Copy className="mr-2 h-4 w-4" /> Copy
                </Button>
                <Button type="button" variant="ghost" asChild>
                  <a href={checkoutUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" /> Open
                  </a>
                </Button>
              </div>
            </div>
          );
        })}

        {plans.length === 0 && <div className="text-sm text-slate-500">Create a subscription plan first.</div>}
      </div>
    </div>
  );
}