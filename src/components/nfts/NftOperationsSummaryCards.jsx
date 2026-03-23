import React from "react";

const cards = [
  {
    key: "activeListings",
    label: "Active listings",
    tone: "border-amber-200 bg-amber-50 text-amber-950",
    sub: "NFT's die live staan in je marketplace.",
  },
  {
    key: "confirmedSales",
    label: "Confirmed sales",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-950",
    sub: "Bevestigde betalingen voor NFT-verkoop.",
  },
  {
    key: "totalSalesAda",
    label: "ADA omzet",
    tone: "border-blue-200 bg-blue-50 text-blue-950",
    sub: "Ontvangen ADA uit bevestigde NFT-betalingen.",
  },
  {
    key: "pendingTransfers",
    label: "Pending transfers",
    tone: "border-slate-200 bg-white text-slate-950",
    sub: "Leveringen die nog wachten op verwerking.",
  },
];

export default function NftOperationsSummaryCards({ activeListings, confirmedSales, totalSalesAda, pendingTransfers }) {
  const values = {
    activeListings,
    confirmedSales,
    totalSalesAda: `${Number(totalSalesAda || 0).toFixed(2)} ADA`,
    pendingTransfers,
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