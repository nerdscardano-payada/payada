import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ShieldCheck, Store, Activity } from "lucide-react";

const metricConfig = [
  {
    key: "transactions",
    title: "Total transactions processed",
    detail: "Confirmed payments recorded across PayADA checkouts.",
    icon: Activity,
  },
  {
    key: "merchants",
    title: "Merchants currently using PayADA",
    detail: "Merchant profiles currently active on the platform.",
    icon: Store,
  },
  {
    key: "volume",
    title: "Total volume secured",
    detail: "Confirmed ADA volume processed through PayADA.",
    icon: ShieldCheck,
  },
];

const formatCount = (value) => new Intl.NumberFormat("en-US").format(value || 0);
const formatAda = (value) => `₳ ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value || 0)}`;

export default function HomeTrustProofSection() {
  const { data } = useQuery({
    queryKey: ["home-trust-metrics"],
    queryFn: async () => {
      const [payments, merchants] = await Promise.all([
        base44.entities.Payment.list("-created_date", 5000),
        base44.entities.MerchantProfile.list("-created_date", 2000),
      ]);

      const confirmedPayments = payments.filter((payment) => payment.status === "confirmed");
      const totalTransactions = confirmedPayments.length;
      const totalVolume = confirmedPayments.reduce((sum, payment) => sum + (payment.received_amount_ada || payment.expected_amount_ada || 0), 0);
      const activeMerchants = merchants.filter((merchant) => merchant.status === "active").length;

      return {
        transactions: formatCount(totalTransactions),
        merchants: formatCount(activeMerchants),
        volume: formatAda(totalVolume),
      };
    },
    initialData: {
      transactions: "0",
      merchants: "0",
      volume: "₳ 0",
    },
  });

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-[2rem] border border-border bg-card p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              Real-time platform activity
            </div>
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Real usage, visible in real time.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                These numbers are pulled from live platform activity so new visitors can see that PayADA is already being used for real payments.
              </p>
            </div>
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground">
              These totals will keep growing as adoption increases and more merchants start using PayADA.
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {metricConfig.map((metric) => {
              const IconComponent = metric.icon;

              return (
                <div key={metric.title} className="rounded-2xl border border-border bg-background p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-3xl font-semibold tracking-tight text-foreground">{data[metric.key]}</p>
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