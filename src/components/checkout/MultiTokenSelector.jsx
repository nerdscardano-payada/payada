import React from "react";

function formatAmount(value, decimals = 6) {
  if (value == null || Number.isNaN(value)) return "—";
  const maximumFractionDigits = Math.min(Math.max(decimals, 2), 8);
  return new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(value);
}

export default function MultiTokenSelector({ options, selectedKey, onSelect }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          onClick={() => !option.disabled && onSelect(option.key)}
          disabled={option.disabled}
          className={[
            "rounded-xl border p-4 text-left transition-all",
            selectedKey === option.key
              ? "border-indigo-500 bg-indigo-500/10"
              : "border-slate-700 bg-slate-900 hover:border-slate-500",
            option.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          ].join(" ")}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">{option.label}</p>
              <p className="text-xs text-slate-400 mt-1">{option.description}</p>
            </div>
            {selectedKey === option.key && (
              <span className="text-[10px] font-semibold uppercase tracking-wide text-indigo-300">Selected</span>
            )}
          </div>

          <div className="mt-4">
            <p className="text-lg font-bold text-white">{option.amountLabel}</p>
            {option.secondaryLabel && (
              <p className="text-xs text-slate-500 mt-1">{option.secondaryLabel}</p>
            )}
            {option.disabled && (
              <p className="text-xs text-amber-400 mt-2">Rate temporarily unavailable</p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

export { formatAmount };