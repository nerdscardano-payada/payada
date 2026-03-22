import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import WalletAssetSelect from "@/components/nfts/WalletAssetSelect";

export default function ListingForm({ formData, setFormData, paymentLinks, walletAssets, selectedAssetUnit, onSelectAsset, onSubmit, editingListing, isSubmitting, onCancel }) {
  const update = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{editingListing ? "Bewerk listing" : "Nieuwe listing"}</h2>
          <p className="text-sm text-slate-500">Publiceer een afgewerkte storefront listing met metadata, media en directe checkout.</p>
        </div>
        {editingListing && <Button type="button" variant="outline" onClick={onCancel}>Annuleer</Button>}
      </div>

      {walletAssets?.length > 0 ? (
        <WalletAssetSelect
          assets={walletAssets}
          value={selectedAssetUnit}
          onValueChange={onSelectAsset}
          label="NFT uit verbonden wallet"
        />
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
          Verbind eerst je signer wallet om NFT-assets en metadata rechtstreeks uit je wallet te laden.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div><Label>Titel</Label><Input value={formData.title || ""} onChange={(e) => update("title", e.target.value)} placeholder="Genesis Pass" required /></div>
        <div><Label>Slug</Label><Input value={formData.slug || ""} onChange={(e) => update("slug", e.target.value)} placeholder="genesis-pass" required /></div>
        <div><Label>Asset label</Label><Input value={formData.asset_label || ""} onChange={(e) => update("asset_label", e.target.value)} placeholder="Wordt automatisch ingevuld vanuit de wallet" /></div>
        <div><Label>Prijs in ADA</Label><Input type="number" min="0" step="0.000001" value={formData.price_ada || ""} onChange={(e) => update("price_ada", Number(e.target.value) || 0)} placeholder="45" /></div>
        <div><Label>Policy ID</Label><Input value={formData.policy_id || ""} onChange={(e) => update("policy_id", e.target.value)} /></div>
        <div><Label>Asset name (hex)</Label><Input value={formData.asset_name_hex || ""} onChange={(e) => update("asset_name_hex", e.target.value)} /></div>
        <div><Label>Hoeveelheid</Label><Input type="number" min="1" value={formData.quantity || 1} onChange={(e) => update("quantity", Number(e.target.value) || 1)} /></div>
        <div><Label>Afbeelding URL</Label><Input value={formData.image_url || ""} onChange={(e) => update("image_url", e.target.value)} placeholder="https://..." /></div>
      </div>

      {formData.image_url && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Image preview</p>
          <img src={formData.image_url} alt={formData.title || "NFT preview"} className="mt-3 h-44 w-full rounded-2xl object-cover md:w-64" />
        </div>
      )}

      <div><Label>Beschrijving</Label><Textarea value={formData.description || ""} onChange={(e) => update("description", e.target.value)} rows={4} placeholder="Beschrijf utility, delivery en wat de koper ontvangt." /></div>
      <div><Label>Payment link</Label><Select value={formData.payment_link_id || ""} onValueChange={(value) => update("payment_link_id", value)}><SelectTrigger><SelectValue placeholder="Selecteer payment link" /></SelectTrigger><SelectContent>{paymentLinks.map((link) => <SelectItem key={link.id} value={link.id}>{link.title}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>Status</Label><Select value={formData.status || "draft"} onValueChange={(value) => update("status", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="disabled">Disabled</SelectItem></SelectContent></Select></div>

      <Button type="submit" disabled={isSubmitting || !formData.payment_link_id}>{isSubmitting ? "Opslaan..." : editingListing ? "Wijzig listing" : "Maak listing"}</Button>
    </form>
  );
}