import React from "react";
import { ImagePlus } from "lucide-react";
import { normalizeIpfsUrl } from "@/utils";

export default function AssetGallery({ assets, selectedUnit, onSelectAsset }) {
  if (!assets?.length) {
    return null;
  }

  const handleDragStart = (event, unit) => {
    event.dataTransfer.setData("text/plain", unit);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Asset Gallery</h2>
          <p className="text-sm text-slate-500">Drag an NFT into the listing form or click one to auto-fill the listing.</p>
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {assets.length} assets
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {assets.map((asset) => {
          const unit = asset.unit;
          const isSelected = selectedUnit === unit;

          return (
            <button
              key={unit}
              type="button"
              draggable
              onDragStart={(event) => handleDragStart(event, unit)}
              onClick={() => onSelectAsset(unit)}
              className={`overflow-hidden rounded-2xl border text-left transition-all ${isSelected ? "border-indigo-500 ring-2 ring-indigo-100" : "border-slate-200 hover:border-slate-300"}`}
            >
              <div className="flex h-48 items-center justify-center bg-slate-50 p-4">
                {asset.image_url ? (
                  <img src={normalizeIpfsUrl(asset.image_url)} alt={asset.asset_label} className="max-h-full w-full object-contain" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <ImagePlus className="h-8 w-8" />
                    <span className="text-xs font-medium">No preview</span>
                  </div>
                )}
              </div>
              <div className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium text-slate-900 line-clamp-2">{asset.asset_label}</p>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">x{asset.quantity}</span>
                </div>
                {asset.description ? (
                  <p className="line-clamp-2 text-sm text-slate-500">{asset.description}</p>
                ) : (
                  <p className="text-sm text-slate-400">Ready to use for a listing.</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}