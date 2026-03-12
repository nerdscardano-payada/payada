import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function StepOptions({ form, update }) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">All options below are optional.</p>

      {/* Expiry */}
      <div className="space-y-2">
        <Label>Expiry Date</Label>
        <Input
          type="datetime-local"
          value={form.expires_at ? form.expires_at.slice(0, 16) : ""}
          onChange={(e) => update("expires_at", e.target.value ? new Date(e.target.value).toISOString() : "")}
        />
        <p className="text-xs text-slate-400">Leave empty for no expiry.</p>
      </div>

      {/* Confirmations */}
      <div className="space-y-2">
        <Label>Required Confirmations</Label>
        <Input
          type="number"
          min={1}
          max={30}
          value={form.confirmations_required}
          onChange={(e) => update("confirmations_required", e.target.value)}
        />
        <p className="text-xs text-slate-400">Default is 2 blockchain confirmations.</p>
      </div>

      {/* Collect info */}
      <div className="space-y-4 border-t border-slate-100 pt-5">
        <h4 className="text-sm font-medium text-slate-700">Collect payer information</h4>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-700">Email address</p>
            <p className="text-xs text-slate-400">Ask payer for email address</p>
          </div>
          <Switch checked={form.collect_email} onCheckedChange={(v) => update("collect_email", v)} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-700">Name</p>
            <p className="text-xs text-slate-400">Ask payer for full name</p>
          </div>
          <Switch checked={form.collect_name} onCheckedChange={(v) => update("collect_name", v)} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-700">Shipping address</p>
            <p className="text-xs text-slate-400">Ask payer for street, city, postal code & country</p>
          </div>
          <Switch checked={form.collect_shipping} onCheckedChange={(v) => update("collect_shipping", v)} />
        </div>
      </div>

      {/* Redirects */}
      <div className="space-y-4 border-t border-slate-100 pt-5">
        <h4 className="text-sm font-medium text-slate-700">Redirects</h4>
        <div className="space-y-2">
          <Label>URL after successful payment</Label>
          <Input value={form.success_redirect_url} onChange={(e) => update("success_redirect_url", e.target.value)} placeholder="https://yoursite.com/thank-you" />
        </div>
      </div>
    </div>
  );
}