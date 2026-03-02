import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function TerminalForm({ terminal, onBack }) {
  const queryClient = useQueryClient();
  const isEditing = !!terminal?.id;

  const [form, setForm] = useState({
    name: terminal?.name || "",
    description: terminal?.description || "",
    mode: terminal?.mode || "one_time",
    payment_link_slug: terminal?.payment_link_slug || "",
    plan_ids: terminal?.plan_ids || [],
    collect_name: terminal?.collect_name ?? true,
    collect_email: terminal?.collect_email ?? true,
    accent_color: terminal?.accent_color || "#6366f1",
    button_label: terminal?.button_label || "Pay with ADA",
    logo_url: terminal?.logo_url || "",
    status: terminal?.status || "active",
  });

  const { data: paymentLinks = [] } = useQuery({
    queryKey: ["payment-links-active"],
    queryFn: () => base44.entities.PaymentLink.filter({ status: "active" }, "-created_date", 50),
  });

  const { data: plans = [] } = useQuery({
    queryKey: ["subscription-plans-active"],
    queryFn: () => base44.entities.SubscriptionPlan.filter({ status: "active" }, "-created_date", 50),
  });

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: () => base44.auth.me(),
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (isEditing) return base44.entities.PayTerminal.update(terminal.id, data);
      return base44.entities.PayTerminal.create({ ...data, merchant_id: me?.email });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pay-terminals"] });
      toast.success(isEditing ? "Terminal updated" : "Terminal created");
      onBack();
    },
  });

  const togglePlan = (planId) => {
    setForm((f) => ({
      ...f,
      plan_ids: f.plan_ids.includes(planId)
        ? f.plan_ids.filter((id) => id !== planId)
        : [...f.plan_ids, planId],
    }));
  };

  const handleSave = () => {
    if (!form.name) { toast.error("Naam is verplicht"); return; }
    if (form.mode === "one_time" && !form.payment_link_slug) { toast.error("Selecteer een betaallink"); return; }
    if (form.mode === "subscription" && form.plan_ids.length === 0) { toast.error("Selecteer minimaal één abonnement"); return; }
    saveMutation.mutate(form);
  };

  return (
    <div className="max-w-xl">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-6">
        <ArrowLeft className="w-4 h-4" /> Terug
      </button>

      <h2 className="text-lg font-bold text-slate-900 mb-6">{isEditing ? "Terminal bewerken" : "Nieuwe terminal"}</h2>

      <div className="space-y-5">
        {/* Basic */}
        <div className="space-y-2">
          <Label>Naam *</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Bijv. Webshop Checkout" />
        </div>

        <div className="space-y-2">
          <Label>Beschrijving</Label>
          <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optionele beschrijving" />
        </div>

        {/* Mode */}
        <div className="space-y-2">
          <Label>Type terminal *</Label>
          <Select value={form.mode} onValueChange={(v) => setForm({ ...form, mode: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="one_time">Eenmalige betaling</SelectItem>
              <SelectItem value="subscription">Abonnement (meerkeuze)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* One-time: pick payment link */}
        {form.mode === "one_time" && (
          <div className="space-y-2">
            <Label>Betaallink *</Label>
            <Select value={form.payment_link_slug} onValueChange={(v) => setForm({ ...form, payment_link_slug: v })}>
              <SelectTrigger><SelectValue placeholder="Selecteer een betaallink" /></SelectTrigger>
              <SelectContent>
                {paymentLinks.map((pl) => (
                  <SelectItem key={pl.id} value={pl.slug}>{pl.title} (₳ {pl.amount_ada})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Subscription: pick plans */}
        {form.mode === "subscription" && (
          <div className="space-y-2">
            <Label>Selecteer abonnementen *</Label>
            <div className="border border-slate-200 rounded-lg divide-y divide-slate-100">
              {plans.length === 0 && (
                <p className="text-sm text-slate-400 p-3">Geen actieve plannen gevonden</p>
              )}
              {plans.map((plan) => (
                <label key={plan.id} className="flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-50">
                  <Checkbox
                    checked={form.plan_ids.includes(plan.id)}
                    onCheckedChange={() => togglePlan(plan.id)}
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{plan.name}</p>
                    <p className="text-xs text-slate-400">
                      {plan.amount_mode === "fixed_ada" ? `₳ ${plan.amount_ada}` : `${plan.fiat_currency} ${plan.amount_fiat}`} · {plan.interval_type}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Collect fields */}
        <div className="space-y-3">
          <Label>Klantgegevens verzamelen</Label>
          <div className="flex items-center gap-3">
            <Switch checked={form.collect_email} onCheckedChange={(v) => setForm({ ...form, collect_email: v })} />
            <span className="text-sm text-slate-700">E-mail</span>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={form.collect_name} onCheckedChange={(v) => setForm({ ...form, collect_name: v })} />
            <span className="text-sm text-slate-700">Naam</span>
          </div>
        </div>

        {/* Branding */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <p className="text-sm font-medium text-slate-700">Uitstraling</p>
          <div className="flex gap-4">
            <div className="space-y-2 flex-1">
              <Label>Accentkleur</Label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.accent_color}
                  onChange={(e) => setForm({ ...form, accent_color: e.target.value })}
                  className="w-10 h-10 rounded border border-slate-200 cursor-pointer" />
                <Input value={form.accent_color} onChange={(e) => setForm({ ...form, accent_color: e.target.value })}
                  className="font-mono text-sm" />
              </div>
            </div>
            <div className="space-y-2 flex-1">
              <Label>Knoptekst</Label>
              <Input value={form.button_label} onChange={(e) => setForm({ ...form, button_label: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Logo URL</Label>
            <Input value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} placeholder="https://..." />
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-3 pt-2">
          <Switch checked={form.status === "active"} onCheckedChange={(v) => setForm({ ...form, status: v ? "active" : "disabled" })} />
          <span className="text-sm text-slate-700">Terminal actief</span>
        </div>

        <div className="flex gap-3 pt-2">
          <Button onClick={handleSave} disabled={saveMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Opslaan"}
          </Button>
          <Button variant="outline" onClick={onBack}>Annuleren</Button>
        </div>
      </div>
    </div>
  );
}