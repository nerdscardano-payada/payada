import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function StepOptions({ form, update }) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">Alle opties hieronder zijn optioneel.</p>

      {/* Expiry */}
      <div className="space-y-2">
        <Label>Vervaldatum</Label>
        <Input
          type="datetime-local"
          value={form.expires_at ? form.expires_at.slice(0, 16) : ""}
          onChange={(e) => update("expires_at", e.target.value ? new Date(e.target.value).toISOString() : "")}
        />
        <p className="text-xs text-slate-400">Laat leeg voor geen vervaldatum.</p>
      </div>

      {/* Confirmations */}
      <div className="space-y-2">
        <Label>Vereiste bevestigingen</Label>
        <Input
          type="number"
          min={1}
          max={30}
          value={form.confirmations_required}
          onChange={(e) => update("confirmations_required", e.target.value)}
        />
        <p className="text-xs text-slate-400">Standaard 2 bevestigingen op de blockchain.</p>
      </div>

      {/* Collect info */}
      <div className="space-y-4 border-t border-slate-100 pt-5">
        <h4 className="text-sm font-medium text-slate-700">Gegevens verzamelen van betaler</h4>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-700">E-mailadres</p>
            <p className="text-xs text-slate-400">Vraag betaler om e-mailadres</p>
          </div>
          <Switch checked={form.collect_email} onCheckedChange={(v) => update("collect_email", v)} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-700">Naam</p>
            <p className="text-xs text-slate-400">Vraag betaler om naam</p>
          </div>
          <Switch checked={form.collect_name} onCheckedChange={(v) => update("collect_name", v)} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-700">Verzendadres</p>
            <p className="text-xs text-slate-400">Vraag betaler om straat, stad, postcode & land</p>
          </div>
          <Switch checked={form.collect_shipping} onCheckedChange={(v) => update("collect_shipping", v)} />
        </div>
      </div>

      {/* Redirects */}
      <div className="space-y-4 border-t border-slate-100 pt-5">
        <h4 className="text-sm font-medium text-slate-700">Doorverwijzingen</h4>
        <div className="space-y-2">
          <Label>URL na geslaagde betaling</Label>
          <Input value={form.success_redirect_url} onChange={(e) => update("success_redirect_url", e.target.value)} placeholder="https://jousite.com/bedankt" />
        </div>

      </div>
    </div>
  );
}