import React from "react";

const options = [
  {
    value: "manual",
    title: "Manual with signer wallet",
    description: "No seed phrase stored. Each NFT transfer is signed by the merchant first.",
  },
  {
    value: "automatic",
    title: "Automatic with hot wallet",
    description: "Encrypted recovery phrase for automatic NFT transfers after confirmed payment.",
  },
];

export default function FulfillmentModeSelector({ value, onChange, isSaving }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Fulfillment method</h2>
        <p className="text-sm text-slate-500">Choose per merchant whether NFTs are sent manually or automatically.</p>
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