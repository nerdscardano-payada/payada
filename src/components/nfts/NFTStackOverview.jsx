import React from "react";
import { CreditCard, ShieldCheck, Store } from "lucide-react";

const items = [
  {
    title: "Checkout-native sales",
    description: "NFT listings draaien bovenop bestaande PayADA payment links, waardoor prijs, checkout en conversie in dezelfde flow blijven.",
    icon: CreditCard,
    iconClass: "bg-blue-50 text-blue-700",
  },
  {
    title: "Secure holder access",
    description: "Wallet-based gating maakt utility bruikbaar voor memberships, communities en premium pages zonder handmatige verificatie.",
    icon: ShieldCheck,
    iconClass: "bg-emerald-50 text-emerald-700",
  },
  {
    title: "Merchant-owned storefronts",
    description: "Met eigen storefronts, metadata en custodyless delivery verkoop je NFTs volledig binnen je eigen merkervaring.",
    icon: Store,
    iconClass: "bg-amber-50 text-amber-700",
  },
];

export default function NFTStackOverview() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map((item) => (
        <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${item.iconClass}`}>
            <item.icon className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
        </div>
      ))}
    </div>
  );
}