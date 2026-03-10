import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Link2, Mail, User, MapPin, Calendar, RefreshCw } from "lucide-react";

function Row({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-slate-50 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900 text-right max-w-[60%] break-all">{value}</span>
    </div>
  );
}

export default function StepSummary({ form }) {
  const amountDisplay =
    form.amount_mode === "fixed_ada"
      ? `₳ ${form.amount_ada || "—"}`
      : form.amount_mode === "fixed_fiat"
      ? `${form.fiat_currency} ${form.amount_fiat || "—"}`
      : `${form.cnt_amount || "—"} ${form.cnt_ticker || "CNT"}`;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-100">
        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
        <p className="text-sm text-green-800 font-medium">Alles ingevuld! Controleer de gegevens en publiceer je betaallink.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/60 p-5 space-y-1">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Basisgegevens</h4>
        <Row label="Titel" value={form.title} />
        <Row label="Slug" value={`/pay/${form.slug}`} />
        <Row label="Beschrijving" value={form.description} />
        <Row label="Bedrag" value={amountDisplay} />
        <Row label="Ontvangstadres" value={form.receive_address ? `${form.receive_address.slice(0, 16)}…` : null} />
      </div>

      <div className="bg-white rounded-xl border border-slate-200/60 p-5 space-y-1">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Aanvullende opties</h4>
        <Row label="Vervaldatum" value={form.expires_at ? new Date(form.expires_at).toLocaleString("nl-BE") : "Geen"} />
        <Row label="Bevestigingen" value={`${form.confirmations_required}`} />

        <div className="flex flex-wrap gap-2 pt-2">
          {form.collect_email && <Badge variant="secondary" className="gap-1"><Mail className="w-3 h-3" />E-mail</Badge>}
          {form.collect_name && <Badge variant="secondary" className="gap-1"><User className="w-3 h-3" />Naam</Badge>}
          {form.collect_shipping && <Badge variant="secondary" className="gap-1"><MapPin className="w-3 h-3" />Verzendadres</Badge>}
          {!form.collect_email && !form.collect_name && !form.collect_shipping && (
            <span className="text-sm text-slate-400">Geen extra gegevens verzameld</span>
          )}
        </div>

        {(form.success_redirect_url || form.cancel_redirect_url) && (
          <div className="pt-2 space-y-1">
            <Row label="Na betaling" value={form.success_redirect_url} />
            <Row label="Bij annulering" value={form.cancel_redirect_url} />
          </div>
        )}
      </div>
    </div>
  );
}