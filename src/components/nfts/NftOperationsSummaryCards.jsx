import React from "react";

const cards = [
  {
    key: "activeListings",
    label: "Live listings",
    tone: "border-amber-200 bg-amber-50 text-amber-950",
    sub: "NFTs currently available in your store.",
  },
  {
    key: "confirmedSales",
    label: "Confirmed payments",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-950",
    sub: "Paid NFT orders that reached confirmation.",
  },
  {
    key: "pendingTransfers",
    label: "Awaiting action",
    tone: "border-blue-200 bg-blue-50 text-blue-950",
    sub: "Orders still waiting to be sent.",
  },
  {
    key: "successfulTransfers",
    label: "Sent transfers",
    tone: "border-slate-200 bg-white text-slate-950",
    sub: "Transfers already submitted on-chain.",
  },
];

export default function NftOperationsSummaryCards({ activeListings, confirmedSales, pendingTransfers, successfulTransfers }) {
  const values = {
    activeListings,
    confirmedSales,
    pendingTransfers,
    successfulTransfers,
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div key={card.key} className={`rounded-2xl border p-5 ${card.tone}`}>
          <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{card.label}</p>
          <p className="mt-2 text-3xl font-semibold">{values[card.key]}</p>
          <p className="mt-1 text-sm opacity-80">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}