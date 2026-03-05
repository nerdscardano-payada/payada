import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Loader2, Upload, Link } from "lucide-react";
import { toast } from "sonner";

export default function TerminalForm({ terminal, onBack }) {
  const queryClient = useQueryClient();
  const isEditing = !!terminal?.id;

  const [logoMode, setLogoMode] = useState(terminal?.logo_url ? "url" : "upload");
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: terminal?.name || "",
    description: terminal?.description || "",
    mode: "one_time",
    payment_link_slug: terminal?.payment_link_slug || "",
    plan_ids: terminal?.plan_ids || [],
    collect_name: terminal?.collect_name ?? true,
    collect_email: terminal?.collect_email ?? true,
    accent_color: terminal?.accent_color || "#6366f1",
    button_label: terminal?.button_label || "Pay with ADA",
    logo_url: terminal?.logo_url || "",
    status: terminal?.status || "active",
  });

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: () => base44.auth.me(),
  });

  const { data: paymentLinks = [] } = useQuery({
    queryKey: ["payment-links-active", me?.email],
    queryFn: () => base44.entities.PaymentLink.filter({ status: "active", merchant_id: me.email }, "-created_date", 50),
    enabled: !!me?.email,
  });

  const plans = [];

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
    if (!form.name) { toast.error("Name is required"); return; }
    if (form.mode === "one_time" && !form.payment_link_slug) { toast.error("Please select a payment link"); return; }
    if (form.mode === "subscription" && form.plan_ids.length === 0) { toast.error("Please select at least one subscription plan"); return; }
    saveMutation.mutate(form);
  };

  return (
    <div className="max-w-xl">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <h2 className="text-lg font-bold text-slate-900 mb-6">{isEditing ? "Edit Terminal" : "New Terminal"}</h2>

      <div className="space-y-5">
        {/* Basic */}
        <div className="space-y-2">
          <Label>Name *</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Webshop Checkout" />
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional description" />
        </div>

        {/* One-time: pick payment link */}
        <div className="space-y-2">
          <Label>Payment Link *</Label>
          <Select value={form.payment_link_slug} onValueChange={(v) => setForm({ ...form, payment_link_slug: v })}>
            <SelectTrigger><SelectValue placeholder="Select a payment link" /></SelectTrigger>
            <SelectContent>
              {paymentLinks.map((pl) => (
                <SelectItem key={pl.id} value={pl.slug}>{pl.title} (₳ {pl.amount_ada})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Collect fields */}
        <div className="space-y-3">
          <Label>Collect Customer Info</Label>
          <div className="flex items-center gap-3">
            <Switch checked={form.collect_email} onCheckedChange={(v) => setForm({ ...form, collect_email: v })} />
            <span className="text-sm text-slate-700">Email</span>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={form.collect_name} onCheckedChange={(v) => setForm({ ...form, collect_name: v })} />
            <span className="text-sm text-slate-700">Name</span>
          </div>
        </div>

        {/* Branding */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <p className="text-sm font-medium text-slate-700">Branding</p>
          <div className="flex gap-4">
            <div className="space-y-2 flex-1">
              <Label>Accent Color</Label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.accent_color}
                  onChange={(e) => setForm({ ...form, accent_color: e.target.value })}
                  className="w-10 h-10 rounded border border-slate-200 cursor-pointer" />
                <Input value={form.accent_color} onChange={(e) => setForm({ ...form, accent_color: e.target.value })}
                  className="font-mono text-sm" />
              </div>
            </div>
            <div className="space-y-2 flex-1">
              <Label>Button Label</Label>
              <Input value={form.button_label} onChange={(e) => setForm({ ...form, button_label: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Logo</Label>
            {/* Toggle */}
            <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit">
              <button
                type="button"
                onClick={() => setLogoMode("upload")}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md font-medium transition-all ${logoMode === "upload" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                <Upload className="w-3 h-3" /> Upload
              </button>
              <button
                type="button"
                onClick={() => setLogoMode("url")}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md font-medium transition-all ${logoMode === "url" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                <Link className="w-3 h-3" /> URL
              </button>
            </div>

            {logoMode === "url" ? (
              <Input value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} placeholder="https://..." />
            ) : (
              <div className="flex items-center gap-3">
                <label className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? "Uploading..." : "Choose image"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploading(true);
                      const { file_url } = await base44.integrations.Core.UploadFile({ file });
                      setForm((f) => ({ ...f, logo_url: file_url }));
                      setUploading(false);
                      toast.success("Logo uploaded");
                    }}
                  />
                </label>
                {form.logo_url && (
                  <img src={form.logo_url} alt="Logo preview" className="h-10 w-10 object-contain rounded border border-slate-200" />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-3 pt-2">
          <Switch checked={form.status === "active"} onCheckedChange={(v) => setForm({ ...form, status: v ? "active" : "disabled" })} />
          <span className="text-sm text-slate-700">Terminal active</span>
        </div>

        <div className="flex gap-3 pt-2">
          <Button onClick={handleSave} disabled={saveMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
          </Button>
          <Button variant="outline" onClick={onBack}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}