import React from "react";

export default function NFTRaritySection({ rarity }) {
  if (!rarity?.traits?.length) return null;

  const topTraits = rarity.traits.slice(0, 6);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Rarity score</h2>
          <p className="mt-1 text-sm text-slate-500">
            Automatisch berekend op basis van metadata-traits binnen {rarity.scope_label || "deze collectie"}.
          </p>
        </div>
        <div className="rounded-2xl bg-slate-950 px-5 py-4 text-white">
          <p className="text-3xl font-semibold">{Number(rarity.score || 0).toFixed(1)}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-slate-300">Trait score</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Rang</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">#{rarity.rank}</p>
          <p className="mt-1 text-sm text-slate-600">van {rarity.total_items} vergeleken items</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Percentiel</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{Number(rarity.percentile || 0).toFixed(0)}%</p>
          <p className="mt-1 text-sm text-slate-600">hogere score dan vergelijkbare items</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Traits</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{rarity.traits.length}</p>
          <p className="mt-1 text-sm text-slate-600">metadata-kenmerken meegenomen</p>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Trait breakdown</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {topTraits.map((trait) => (
            <div key={`${trait.trait_type}-${trait.value}`} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{trait.trait_type}</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{trait.value}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">{Number(trait.score || 0).toFixed(1)}</p>
                  <p className="text-xs text-slate-500">score</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-600">
                Komt voor bij {trait.occurrence} van {rarity.total_items} items ({Number(trait.percentage || 0).toFixed(1)}%).
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}