import React from "react";

const options = [
  {
    value: "manual",
    title: "Manueel met signer wallet",
    description: "Geen seed phrase opslag. Elke NFT-transfer wordt eerst door de merchant ondertekend.",
  },
  {
    value: "automatic",
    title: "Automatisch met hot wallet",
    description: "Versleutelde recovery phrase voor automatische NFT-transfers na bevestigde betaling.",
  },
];

export default function FulfillmentModeSelector({ value, onChange, isSaving }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Fulfillment methode</h2>
        <p className="text-sm text-slate-500">Kies per merchant of NFT’s manueel of automatisch verstuurd worden.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {options.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              disabled={isSaving}
              className={`rounded-2xl border p-4 text-left transition ${active ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
            >
              <p className="font-semibold text-slate-900">{option.title}</p>
              <p className="mt-2 text-sm text-slate-600">{option.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}