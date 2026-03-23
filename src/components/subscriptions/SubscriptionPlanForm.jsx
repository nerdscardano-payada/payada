import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";

const initialForm = {
  name: "",
  description: "",
  amount_ada: "",
  interval_type: "monthly",
  trial_days: "0",
  fee_model: "merchant_pays",
  receive_address_override: "",
};

export default function SubscriptionPlanForm({ isSubmitting, onSubmit }) {
  const [form, setForm] = useState(initialForm);
  const [defaultReceiveAddress, setDefaultReceiveAddress] = useState("");
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const user = await base44.auth.me();
        if (user) {
          const rows = await base44.entities.MerchantProfile.filter({ user_id: user.id });
          if (mounted && Array.isArray(rows) && rows.length) {
            setDefaultReceiveAddress(rows[0]?.default_receive_address || "");
          }
        }
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  const intervalDays = useMemo(() => (form.interval_type === "yearly" ? 365 : 30), [form.interval_type]);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      name: form.name.trim(),
      description: form.description.trim(),
      amount_ada: Number(form.amount_ada || 0),
      interval_type: form.interval_type,
      interval_days: intervalDays,
      trial_days: Number(form.trial_days || 0),
      fee_model: form.fee_model,
      receive_address_override: (form.receive_address_override || "").trim(),
    });
    setForm(initialForm);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900">Create subscription plan</h2>
        <p className="mt-1 text-sm text-slate-500">Create a plan and get a unique checkout link instantly.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label>Plan name</Label>
          <Input value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} placeholder="Premium Membership" required />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Description</Label>
          <Textarea value={form.description} onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))} placeholder="What members get with this subscription" />
        </div>

        <div className="space-y-2">
          <Label>Price in ADA</Label>
          <Input type="number" min="0" step="0.01" value={form.amount_ada} onChange={(e) => setForm((current) => ({ ...current, amount_ada: e.target.value }))} placeholder="25" required />
        </div>

        <div className="space-y-2">
          <Label>Billing interval</Label>
          <Select value={form.interval_type} onValueChange={(value) => setForm((current) => ({ ...current, interval_type: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Choose interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Trial period (days)</Label>
          <Input type="number" min="0" step="1" value={form.trial_days} onChange={(e) => setForm((current) => ({ ...current, trial_days: e.target.value }))} />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Fee model</Label>
          <Select value={form.fee_model} onValueChange={(value) => setForm((current) => ({ ...current, fee_model: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Choose fee model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="merchant_pays">Merchant pays fee</SelectItem>
              <SelectItem value="customer_pays">Customer pays fee</SelectItem>
              <SelectItem value="split">Split fee 50/50</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Receive address */}
        <div className="space-y-2 md:col-span-2">
          <Label>Default receive address (from Merchant profile)</Label>
          <Input value={defaultReceiveAddress} readOnly disabled placeholder="Not set in Merchant Profile" />
          <p className="text-xs text-slate-500">By default, this address is used; enter an override below to use a different address for this plan only.</p>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Receive address override (optional)</Label>
          <Input
            value={form.receive_address_override || ""}
            onChange={(e) => setForm((c) => ({ ...c, receive_address_override: e.target.value }))}
            placeholder="addr1q..."
          />
        </div>

        <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600 md:col-span-2">
          This plan renews every <span className="font-semibold text-slate-900">{intervalDays} days</span> and uses the same fee logic as payment links, including the minimum fee rule on low-value payments.
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <Button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700">
          {isSubmitting ? "Creating..." : "Create plan"}
        </Button>
      </div>
    </form>
  );
}