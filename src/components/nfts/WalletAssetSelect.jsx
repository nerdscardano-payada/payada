import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function WalletAssetSelect({ assets, value, onValueChange, label = "NFT from wallet" }) {
  const selectedAsset = assets.find((asset) => asset.unit === value);

  return (
    <div className="space-y-3">
      <div>
        <Label>{label}</Label>
        <Select value={value || ""} onValueChange={onValueChange}>
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Select asset from connected wallet" />
          </SelectTrigger>
          <SelectContent>
            {assets.map((asset) => (
              <SelectItem key={asset.unit} value={asset.unit}>
                {asset.asset_label} · qty {asset.quantity}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedAsset && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex gap-4">
            {selectedAsset.image_url ? (
              <img src={selectedAsset.image_url} alt={selectedAsset.asset_label} className="h-20 w-20 rounded-2xl border border-slate-200 object-cover" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-200 bg-white text-xs font-semibold text-slate-400">
                NFT
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">{selectedAsset.asset_label}</p>
              <p className="mt-1 text-xs text-slate-500">Policy {selectedAsset.policy_id.slice(0, 16)}…</p>
              <p className="mt-2 text-sm text-slate-600">Available in wallet: {selectedAsset.quantity}</p>
              {selectedAsset.description && <p className="mt-2 text-sm leading-6 text-slate-600">{selectedAsset.description}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}