import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/shared/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

export default function SubscriptionPlanForm({ plan, onBack }) {
  const isEditing = !!plan;
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    name: plan?.name || "",
    slug: plan?.slug || "",
    description: plan?.description || "",
    amount_mode: plan?.amount_mode || "fixed_ada",
    amount_ada: plan?.amount_ada || "",
    amount_fiat: plan?.amount_fiat || "",
    fiat_currency: plan?.fiat_currency || "EUR",
    interval_type: plan?.interval_type || "monthly",
    interval_days: plan?.interval_days || 30,
    grace_days: plan?.grace_days || 5,
    trial_days: plan?.trial_days || 0,
    confirmations_required: plan?.confirmations_required || 2,
    status: plan?.status || "active",
  });

  const generateSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const mutation = useMutation({
    mutationFn: (data) => {
      if (isEditing) return base44.entities.SubscriptionPlan.update(plan.id, data);
      return base44.entities.SubscriptionPlan.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptionPlans"] });
      toast.success(isEditing ? "Plan updated" : "Plan created");
      onBack();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...form,
      amount_ada: form.amount_mode === "fixed_ada" ? parseFloat(form.amount_ada) || 0 : null,
      amount_fiat: form.amount_mode === "fixed_fiat" ? parseFloat(form.amount_fiat) || 0 : null,
      interval_days: parseInt(form.interval_days) || 30,
      grace_days: parseInt(form.grace_days) || 5,
      trial_days: parseInt(form.trial_days) || 0,
      confirmations_required: parseInt(form.confirmations_required) || 2,
    };
    mutation.mutate(data);
  };

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const intervalPresets = { weekly: 7, monthly: 30, yearly: 365 };

  return (
    <div>
      <div className="mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Plans
        </button>
      </div>

      <PageHeader title={isEditing ? "Edit Subscription Plan" : "Create Subscription Plan"} />

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="bg-white rounded-xl border border-slate-200/60 p-6 space-y-5">
          <h3 className="text-sm font-semibold text-slate-900">Plan Details</h3>
          <div className="space-y-2">
            <Label>Plan Name *</Label>
            <Input value={form.name} onChange={(e) => { update("name", e.target.value); if (!isEditing) update("slug", generateSlug(e.target.value)); }} placeholder="e.g. Premium Membership" />
          </div>
          <div className="space-y-2">
            <Label>URL Slug</Label>
            <div className="flex items-center gap-0">
              <span className="text-xs text-slate-400 bg-slate-50 border border-r-0 border-slate-200 px-3 py-2.5 rounded-l-md">/subscribe/</span>
              <Input value={form.slug} onChange={(e) => update("slug", e.target.value)} className="rounded-l-none" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={3} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/60 p-6 space-y-5">
          <h3 className="text-sm font-semibold text-slate-900">Pricing & Billing</h3>
          <div className="space-y-2">
            <Label>Amount Mode</Label>
            <Select value={form.amount_mode} onValueChange={(v) => update("amount_mode", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed_ada">Fixed ADA</SelectItem>
                <SelectItem value="fixed_fiat">Fixed Fiat</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {form.amount_mode === "fixed_ada" ? (
            <div className="space-y-2">
              <Label>Amount (ADA)</Label>
              <Input type="number" step="0.01" value={form.amount_ada} onChange={(e) => update("amount_ada", e.target.value)} />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Amount</Label><Input type="number" step="0.01" value={form.amount_fiat} onChange={(e) => update("amount_fiat", e.target.value)} /></div>
              <div className="space-y-2"><Label>Currency</Label><Select value={form.fiat_currency} onValueChange={(v) => update("fiat_currency", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="EUR">EUR</SelectItem><SelectItem value="USD">USD</SelectItem></SelectContent></Select></div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Billing Interval</Label>
              <Select value={form.interval_type} onValueChange={(v) => { update("interval_type", v); if (intervalPresets[v]) update("interval_days", intervalPresets[v]); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.interval_type === "custom" && (
              <div className="space-y-2"><Label>Custom Days</Label><Input type="number" value={form.interval_days} onChange={(e) => update("interval_days", e.target.value)} /></div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Grace Period (days)</Label><Input type="number" value={form.grace_days} onChange={(e) => update("grace_days", e.target.value)} /></div>
            <div className="space-y-2"><Label>Trial Period (days)</Label><Input type="number" value={form.trial_days} onChange={(e) => update("trial_days", e.target.value)} /></div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={mutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
            <Save className="w-4 h-4" />
            {isEditing ? "Update" : "Create"} Plan
          </Button>
          <Button type="button" variant="outline" onClick={onBack}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}