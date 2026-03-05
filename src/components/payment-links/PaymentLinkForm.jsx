import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/shared/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

export default function PaymentLinkForm({ link, onBack }) {
  const isEditing = !!link;
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      // Pre-fill receive_address with merchant default when creating a new link
      if (!isEditing && u?.email) {
        base44.entities.MerchantProfile.filter({ user_id: u.email }).then((profiles) => {
          const defaultAddress = profiles?.[0]?.default_receive_address;
          if (defaultAddress) {
            setForm((prev) => ({ ...prev, receive_address: prev.receive_address || defaultAddress }));
          }
        });
      }
    });
  }, []);

  const [form, setForm] = useState({
    title: link?.title || "",
    slug: link?.slug || "",
    description: link?.description || "",
    amount_mode: link?.amount_mode || "fixed_ada",
    amount_ada: link?.amount_ada || "",
    amount_fiat: link?.amount_fiat || "",
    fiat_currency: link?.fiat_currency || "EUR",
    confirmations_required: link?.confirmations_required || 2,
    receive_address: link?.receive_address || "",
    success_redirect_url: link?.success_redirect_url || "",
    cancel_redirect_url: link?.cancel_redirect_url || "",
    collect_email: link?.collect_email || false,
    collect_name: link?.collect_name || false,
    collect_shipping: link?.collect_shipping || false,
    status: link?.status || "active",
  });

  const generateMerchantPrefix = (email) => {
    if (!email) return "m";
    return email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8);
  };

  const generateSlug = (title) => {
    const base = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    if (isEditing) return base; // don't re-prefix when editing
    const prefix = generateMerchantPrefix(user?.email);
    return `${prefix}-${base}`;
  };

  const mutation = useMutation({
    mutationFn: (data) => {
      if (isEditing) return base44.entities.PaymentLink.update(link.id, data);
      // Ensure slug is prefixed with merchant prefix before saving
      const prefix = user?.email?.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) || "m";
      const slug = data.slug.startsWith(prefix + "-") ? data.slug : `${prefix}-${data.slug}`;
      return base44.entities.PaymentLink.create({ ...data, slug, merchant_id: user?.email });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentLinks"] });
      toast.success(isEditing ? "Payment link updated" : "Payment link created");
      onBack();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...form,
      amount_ada: form.amount_mode === "fixed_ada" ? parseFloat(form.amount_ada) || 0 : null,
      amount_fiat: form.amount_mode === "fixed_fiat" ? parseFloat(form.amount_fiat) || 0 : null,
      confirmations_required: parseInt(form.confirmations_required) || 2,
    };
    mutation.mutate(data);
  };

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div>
      <div className="mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Payment Links
        </button>
      </div>

      <PageHeader title={isEditing ? "Edit Payment Link" : "Create Payment Link"} />

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="bg-white rounded-xl border border-slate-200/60 p-6 space-y-5">
          <h3 className="text-sm font-semibold text-slate-900">Basic Information</h3>

          <div className="space-y-2">
            <Label>Title *</Label>
            <Input
              value={form.title}
              onChange={(e) => {
                update("title", e.target.value);
                if (!isEditing) update("slug", generateSlug(e.target.value));
              }}
              placeholder="e.g. Support our project"
            />
          </div>

          <div className="space-y-2">
            <Label>URL Slug *</Label>
            <div className="flex items-center gap-0">
              <span className="text-xs text-slate-400 bg-slate-50 border border-r-0 border-slate-200 px-3 py-2.5 rounded-l-md">/pay/</span>
              <Input
                value={form.slug}
                onChange={(e) => update("slug", e.target.value)}
                className="rounded-l-none"
                placeholder="my-payment"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Optional description shown to payer"
              rows={3}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/60 p-6 space-y-5">
          <h3 className="text-sm font-semibold text-slate-900">Pricing</h3>

          <div className="space-y-2">
            <Label>Amount (ADA)</Label>
            <Input
              type="number"
              step="0.01"
              value={form.amount_ada}
              onChange={(e) => update("amount_ada", e.target.value)}
              placeholder="e.g. 25"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/60 p-6 space-y-5">
          <h3 className="text-sm font-semibold text-slate-900">Receive Address</h3>
          <div className="space-y-2">
            <Label>Cardano Address *</Label>
            <Input
              value={form.receive_address}
              onChange={(e) => update("receive_address", e.target.value)}
              placeholder="addr1q9..."
              className="font-mono text-xs"
            />
          </div>
          <div className="space-y-2">
            <Label>Confirmations Required</Label>
            <Input
              type="number"
              value={form.confirmations_required}
              onChange={(e) => update("confirmations_required", e.target.value)}
              min={1}
              max={30}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/60 p-6 space-y-5">
          <h3 className="text-sm font-semibold text-slate-900">Options</h3>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">Collect email</p>
              <p className="text-xs text-slate-400">Ask payer for their email address</p>
            </div>
            <Switch checked={form.collect_email} onCheckedChange={(v) => update("collect_email", v)} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">Collect name</p>
              <p className="text-xs text-slate-400">Ask payer for their name</p>
            </div>
            <Switch checked={form.collect_name} onCheckedChange={(v) => update("collect_name", v)} />
          </div>

          <div className="space-y-2">
            <Label>Redirect URL after success</Label>
            <Input
              value={form.success_redirect_url}
              onChange={(e) => update("success_redirect_url", e.target.value)}
              placeholder="https://yoursite.com/thank-you"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={mutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
            <Save className="w-4 h-4" />
            {isEditing ? "Update" : "Create"} Payment Link
          </Button>
          <Button type="button" variant="outline" onClick={onBack}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}