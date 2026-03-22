import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function MarketplaceSettingsForm({ value, onChange, onSave, isSaving, publicUrl }) {
  const update = (field, nextValue) => onChange((prev) => ({ ...prev, [field]: nextValue }));

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Marketplace settings</h2>
        <p className="mt-1 text-sm text-slate-500">Choose your public store name, slug, and intro text.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Store name</Label>
          <Input value={value.nft_store_name || ""} onChange={(e) => update("nft_store_name", e.target.value)} placeholder="Tour Rewards" />
        </div>
        <div>
          <Label>Store slug</Label>
          <Input value={value.nft_store_slug || ""} onChange={(e) => update("nft_store_slug", e.target.value)} placeholder="tour-rewards" />
        </div>
      </div>

      <div>
        <Label>Intro text</Label>
        <Textarea value={value.nft_store_description || ""} onChange={(e) => update("nft_store_description", e.target.value)} rows={4} placeholder="Tell visitors what makes this collection special." />
      </div>

      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Public link</p>
        <p className="mt-2 break-all text-sm text-slate-700">{publicUrl}</p>
      </div>

      <Button type="button" onClick={onSave} disabled={isSaving}>
        {isSaving ? "Saving..." : "Save marketplace settings"}
      </Button>
    </div>
  );
}