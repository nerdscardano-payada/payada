import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function StepBasic({ form, update, isEditing, isAdmin }) {
  const generateSlug = (title, email) => {
    const base = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    if (isEditing) return base;
    const prefix = email?.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) || "m";
    return `${prefix}-${base}`;
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Titel *</Label>
        <Input
          value={form.title}
          onChange={(e) => {
            update("title", e.target.value);
            if (!isEditing) update("slug", generateSlug(e.target.value, form._userEmail));
          }}
          placeholder="bijv. Support ons project"
        />
      </div>

      <div className="space-y-2">
        <Label>URL Slug *</Label>
        <div className="flex items-center">
          <span className="text-xs text-slate-400 bg-slate-50 border border-r-0 border-slate-200 px-3 py-2.5 rounded-l-md">/pay/</span>
          <Input
            value={form.slug}
            onChange={(e) => update("slug", e.target.value)}
            className="rounded-l-none"
            placeholder="mijn-betaling"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Beschrijving</Label>
        <Textarea
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Optionele beschrijving voor de betaler"
          rows={2}
        />
      </div>

      <div className="border-t border-slate-100 pt-5 space-y-4">
        <h4 className="text-sm font-medium text-slate-700">Bedrag</h4>

        <div className="space-y-2">
          <Label>Betaaltype</Label>
          <Select value={form.amount_mode} onValueChange={(v) => update("amount_mode", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed_ada">Vast bedrag in ADA</SelectItem>
              {isAdmin && <SelectItem value="fixed_cnt">Cardano Native Token (CNT)</SelectItem>}
            </SelectContent>
          </Select>
        </div>

        {form.amount_mode === "fixed_ada" && (
          <div className="space-y-2">
            <Label>Bedrag (ADA)</Label>
            <Input type="number" step="0.01" value={form.amount_ada} onChange={(e) => update("amount_ada", e.target.value)} placeholder="bijv. 25" />
          </div>
        )}

        {form.amount_mode === "fixed_fiat" && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Valuta</Label>
              <Select value={form.fiat_currency} onValueChange={(v) => update("fiat_currency", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Bedrag</Label>
              <Input type="number" step="0.01" value={form.amount_fiat} onChange={(e) => update("amount_fiat", e.target.value)} placeholder="bijv. 9.99" />
            </div>
          </div>
        )}

        {form.amount_mode === "fixed_cnt" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Token aantal</Label>
                <Input type="number" value={form.cnt_amount} onChange={(e) => update("cnt_amount", e.target.value)} placeholder="bijv. 1000" />
              </div>
              <div className="space-y-2">
                <Label>Ticker (bijv. $SNEK)</Label>
                <Input value={form.cnt_ticker} onChange={(e) => update("cnt_ticker", e.target.value)} placeholder="$SNEK" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Policy ID</Label>
              <Input value={form.cnt_policy_id} onChange={(e) => update("cnt_policy_id", e.target.value)} placeholder="279c909f348e533da5808898f87f9a14bb2c3dfbbacccd631d927a3" className="font-mono text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Asset Name (hex)</Label>
                <Input value={form.cnt_asset_name} onChange={(e) => update("cnt_asset_name", e.target.value)} placeholder="534e454b" className="font-mono text-xs" />
              </div>
              <div className="space-y-2">
                <Label>Decimalen</Label>
                <Input type="number" min={0} max={18} value={form.cnt_decimals} onChange={(e) => update("cnt_decimals", e.target.value)} placeholder="0" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 pt-5 space-y-3">
        <h4 className="text-sm font-medium text-slate-700">Ontvangstadres</h4>
        <div className="space-y-2">
          <Label>Cardano adres *</Label>
          <Input value={form.receive_address} onChange={(e) => update("receive_address", e.target.value)} placeholder="addr1q9..." className="font-mono text-xs" />
        </div>
      </div>
    </div>
  );
}