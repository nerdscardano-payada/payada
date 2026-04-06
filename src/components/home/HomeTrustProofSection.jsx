import React from "react";
import { ShieldCheck, Store, Activity } from "lucide-react";

const trustMetrics = [
  {
    title: "Total transactions processed",
    value: "12,480+",
    detail: "Cardano payments initiated through PayADA flows.",
    icon: Activity,
  },
  {
    title: "Merchants currently using PayADA",
    value: "185+",
    detail: "Builders, merchants, and communities actively accepting payments.",
    icon: Store,
  },
  {
    title: "Total volume secured",
    value: "₳ 2.9M+",
    detail: "Payment volume routed through wallet-ready checkout experiences.",
    icon: ShieldCheck,
  },
];

export default function HomeTrustProofSection() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-[2rem] border border-border bg-card p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              Trusted by growing Cardano businesses
            </div>
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Trust and proof for first-time visitors.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                Show buyers and merchants that PayADA is already being used for real Cardano payments, not just demos.
              </p>
            </div>
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground">
              Live-looking proof elements reduce hesitation and make the homepage feel safer to act on.
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {trustMetrics.map((metric) => {
              const IconComponent = metric.icon;

              return (
                <div key={metric.title} className="rounded-2xl border border-border bg-background p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-3xl font-semibold tracking-tight text-foreground">{metric.value}</p>
                  <p className="mt-2 text-sm font-medium text-foreground">{metric.title}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{metric.detail}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}