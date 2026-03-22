import React from "react";

const cardBase = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";

export default function SubscriptionSummaryCards({ subscriptions }) {
  const activeCount = subscriptions.filter((sub) => ["active", "trial"].includes(sub.status)).length;
  const dueCount = subscriptions.filter((sub) => sub.status === "due").length;
  const lateCount = subscriptions.filter((sub) => sub.status === "late").length;
  const monthlyAda = subscriptions
    .filter((sub) => ["active", "trial"].includes(sub.status))
    .reduce((sum, sub) => sum + (sub.amount_ada || 0), 0);

  const cards = [
    { label: "Active subscribers", value: activeCount },
    { label: "Payment due", value: dueCount },
    { label: "Access at risk", value: lateCount },
    { label: "Active ADA revenue", value: `₳ ${monthlyAda.toFixed(2)}` },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className={cardBase}>
          <p className="text-sm text-slate-500">{card.label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</p>
        </div>
      ))}
    </div>
  );
}