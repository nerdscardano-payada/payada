import React from "react";

const cards = [
  {
    key: "volume",
    label: "Total volume",
    description: "NFT units processed across all transfer requests.",
    className: "border-violet-200 bg-violet-50",
    valueClassName: "text-violet-950",
    labelClassName: "text-violet-700",
  },
  {
    key: "successful",
    label: "Successful",
    description: "Submitted or confirmed NFT deliveries.",
    className: "border-emerald-200 bg-emerald-50",
    valueClassName: "text-emerald-950",
    labelClassName: "text-emerald-700",
  },
  {
    key: "failed",
    label: "Failed",
    description: "Transfers that could not be completed.",
    className: "border-rose-200 bg-rose-50",
    valueClassName: "text-rose-950",
    labelClassName: "text-rose-700",
  },
];

export default function DistributionOverviewCards({ totalVolume, successfulCount, failedCount }) {
  const values = {
    volume: totalVolume,
    successful: successfulCount,
    failed: failedCount,
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <div key={card.key} className={`rounded-2xl border p-5 ${card.className}`}>
          <p className={`text-xs font-semibold uppercase tracking-wide ${card.labelClassName}`}>{card.label}</p>
          <p className={`mt-2 text-3xl font-semibold ${card.valueClassName}`}>{values[card.key]}</p>
          <p className="mt-1 text-sm text-slate-600">{card.description}</p>
        </div>
      ))}
    </div>
  );
}