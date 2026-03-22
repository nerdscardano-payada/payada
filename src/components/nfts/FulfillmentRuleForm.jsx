import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import WalletAssetSelect from "@/components/nfts/WalletAssetSelect";

export default function FulfillmentRuleForm({ formData, setFormData, paymentLinks, walletAssets, selectedAssetUnit, onSelectAsset, onSubmit, editingRule, isSubmitting, onCancel }) {
  const update = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{editingRule ? "Bewerk distributieregel" : "Nieuwe distributieregel"}</h2>
          <p className="text-sm text-slate-500">Koppel een payment link aan de NFT die automatisch geleverd moet worden.</p>
        </div>
        {editingRule && <Button type="button" variant="outline" onClick={onCancel}>Annuleer</Button>}
      </div>

      <div><Label>Payment link</Label><Select value={formData.payment_link_id || ""} onValueChange={(value) => update("payment_link_id", value)}><SelectTrigger><SelectValue placeholder="Selecteer payment link" /></SelectTrigger><SelectContent>{paymentLinks.map((link) => <SelectItem key={link.id} value={link.id}>{link.title}</SelectItem>)}</SelectContent></Select></div>
      {walletAssets?.length > 0 && (
        <WalletAssetSelect
          assets={walletAssets}
          value={selectedAssetUnit}
          onValueChange={onSelectAsset}
          label="NFT uit verbonden wallet"
        />
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <div><Label>Asset label</Label><Input value={formData.asset_label || ""} onChange={(e) => update("asset_label", e.target.value)} /></div>
        <div><Label>Hoeveelheid</Label><Input type="number" min="1" value={formData.quantity || 1} onChange={(e) => update("quantity", Number(e.target.value) || 1)} /></div>
        <div><Label>Policy ID</Label><Input value={formData.policy_id || ""} onChange={(e) => update("policy_id", e.target.value)} required /></div>
        <div><Label>Asset name (hex)</Label><Input value={formData.asset_name_hex || ""} onChange={(e) => update("asset_name_hex", e.target.value)} required /></div>
      </div>
      <Button type="submit" disabled={isSubmitting || !formData.payment_link_id}>{isSubmitting ? "Opslaan..." : editingRule ? "Wijzig regel" : "Maak regel"}</Button>
    </form>
  );
}