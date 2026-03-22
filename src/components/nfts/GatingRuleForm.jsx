import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function GatingRuleForm({ formData, setFormData, onSubmit, isSubmitting, editingRule, onCancel }) {
  const update = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{editingRule ? "Bewerk NFT gate" : "Nieuwe NFT gate"}</h2>
          <p className="text-sm text-slate-500">Controleer walletbezit en geef daarna toegang tot een community of pagina.</p>
        </div>
        {editingRule && <Button type="button" variant="outline" onClick={onCancel}>Annuleer</Button>}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div><Label>Naam</Label><Input value={formData.name || ""} onChange={(e) => update("name", e.target.value)} required /></div>
        <div><Label>Slug</Label><Input value={formData.slug || ""} onChange={(e) => update("slug", e.target.value)} placeholder="vip-access" required /></div>
        <div><Label>Policy ID</Label><Input value={formData.policy_id || ""} onChange={(e) => update("policy_id", e.target.value)} required /></div>
        <div><Label>Asset name (hex)</Label><Input value={formData.asset_name_hex || ""} onChange={(e) => update("asset_name_hex", e.target.value)} required /></div>
        <div><Label>Minimum hoeveelheid</Label><Input type="number" min="1" value={formData.minimum_quantity || 1} onChange={(e) => update("minimum_quantity", Number(e.target.value) || 1)} /></div>
        <div><Label>Unlock URL</Label><Input value={formData.access_url || ""} onChange={(e) => update("access_url", e.target.value)} placeholder="https://discord.gg/..." /></div>
      </div>

      <div>
        <Label>Succesbericht</Label>
        <Textarea value={formData.success_message || ""} onChange={(e) => update("success_message", e.target.value)} rows={3} />
      </div>

      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Opslaan..." : editingRule ? "Wijzig gate" : "Maak gate"}</Button>
    </form>
  );
}