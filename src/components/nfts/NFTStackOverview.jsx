import React from "react";
import { CreditCard, Bot, Link2 } from "lucide-react";

const items = [
  {
    title: "Betalen met ADA of CNT",
    description: "We hebben al checkout-logica, fee-models en payment links als basis voor NFT-sales.",
    icon: CreditCard,
  },
  {
    title: "Community & gating",
    description: "Access Links en Discord Gate geven ons al een sterke basis voor utility rond NFT-holders.",
    icon: Bot,
  },
  {
    title: "Directe listings",
    description: "We kunnen eigen NFT-listings opbouwen bovenop onze bestaande link- en checkout-flow.",
    icon: Link2,
  },
];

export default function NFTStackOverview() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map((item) => (
        <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
            <item.icon className="h-5 w-5 text-slate-700" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
        </div>
      ))}
    </div>
  );
}