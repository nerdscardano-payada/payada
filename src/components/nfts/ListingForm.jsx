import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ListingForm({ formData, setFormData, paymentLinks, onSubmit, editingListing, isSubmitting, onCancel }) {
  const update = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{editingListing ? "Bewerk listing" : "Nieuwe listing"}</h2>
          <p className="text-sm text-slate-500">Bouw je eigen directe NFT-verkoopervaring bovenop PayADA checkout.</p>
        </div>
        {editingListing && <Button type="button" variant="outline" onClick={onCancel}>Annuleer</Button>}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div><Label>Titel</Label><Input value={formData.title || ""} onChange={(e) => update("title", e.target.value)} required /></div>
        <div><Label>Slug</Label><Input value={formData.slug || ""} onChange={(e) => update("slug", e.target.value)} required /></div>
        <div><Label>Asset label</Label><Input value={formData.asset_label || ""} onChange={(e) => update("asset_label", e.target.value)} /></div>
        <div><Label>Prijs in ADA</Label><Input type="number" min="0" step="0.000001" value={formData.price_ada || ""} onChange={(e) => update("price_ada", Number(e.target.value) || 0)} /></div>
        <div><Label>Policy ID</Label><Input value={formData.policy_id || ""} onChange={(e) => update("policy_id", e.target.value)} /></div>
        <div><Label>Asset name (hex)</Label><Input value={formData.asset_name_hex || ""} onChange={(e) => update("asset_name_hex", e.target.value)} /></div>
        <div><Label>Hoeveelheid</Label><Input type="number" min="1" value={formData.quantity || 1} onChange={(e) => update("quantity", Number(e.target.value) || 1)} /></div>
        <div><Label>Afbeelding URL</Label><Input value={formData.image_url || ""} onChange={(e) => update("image_url", e.target.value)} /></div>
      </div>

      <div><Label>Beschrijving</Label><Textarea value={formData.description || ""} onChange={(e) => update("description", e.target.value)} rows={4} /></div>
      <div><Label>Payment link</Label><Select value={formData.payment_link_id || ""} onValueChange={(value) => update("payment_link_id", value)}><SelectTrigger><SelectValue placeholder="Selecteer payment link" /></SelectTrigger><SelectContent>{paymentLinks.map((link) => <SelectItem key={link.id} value={link.id}>{link.title}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>Status</Label><Select value={formData.status || "draft"} onValueChange={(value) => update("status", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="disabled">Disabled</SelectItem></SelectContent></Select></div>

      <Button type="submit" disabled={isSubmitting || !formData.payment_link_id}>{isSubmitting ? "Opslaan..." : editingListing ? "Wijzig listing" : "Maak listing"}</Button>
    </form>
  );
}