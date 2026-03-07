import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useMutation as useMut, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/shared/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, BookTemplate } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function PaymentLinkForm({ link, prefill, onBack, merchantId: merchantIdProp }) {
  const isEditing = !!link;
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
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

  const source = link || prefill || {};
  const [form, setForm] = useState({
    title: source.title || "",
    slug: link?.slug || "",
    description: source.description || "",
    amount_mode: source.amount_mode || "fixed_ada",
    amount_ada: source.amount_ada || "",
    amount_fiat: source.amount_fiat || "",
    fiat_currency: source.fiat_currency || "EUR",
    cnt_policy_id: source.cnt_policy_id || "",
    cnt_asset_name: source.cnt_asset_name || "",
    cnt_ticker: source.cnt_ticker || "",
    cnt_amount: source.cnt_amount || "",
    cnt_decimals: source.cnt_decimals ?? 0,
    confirmations_required: source.confirmations_required || 2,
    receive_address: link?.receive_address || "",
    success_redirect_url: source.success_redirect_url || "",
    cancel_redirect_url: link?.cancel_redirect_url || "",
    collect_email: source.collect_email || false,
    collect_name: source.collect_name || false,
    collect_shipping: source.collect_shipping || false,
    status: link?.status || "active",
  });

  const saveTemplateMutation = useMut({
    mutationFn: (data) => base44.entities.PaymentLinkTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentLinkTemplates"] });
      toast.success("Template saved!");
      setShowSaveTemplate(false);
      setTemplateName("");
    },
  });

  const handleSaveTemplate = () => {
    const mid = user?.email || merchantIdProp;
    saveTemplateMutation.mutate({
      merchant_id: mid,
      name: templateName,
      title: form.title,
      description: form.description,
      amount_mode: form.amount_mode,
      amount_ada: form.amount_mode === "fixed_ada" ? parseFloat(form.amount_ada) || 0 : null,
      amount_fiat: form.amount_mode === "fixed_fiat" ? parseFloat(form.amount_fiat) || 0 : null,
      fiat_currency: form.fiat_currency,
      confirmations_required: parseInt(form.confirmations_required) || 2,
      collect_email: form.collect_email,
      collect_name: form.collect_name,
      collect_shipping: form.collect_shipping,
      success_redirect_url: form.success_redirect_url,
    });
  };

  const generateMerchantPrefix = (email) => {
    if (!email) return "m";
    return email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8);
  };

  const generateSlug = (title) => {
    const base = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    if (isEditing) return base;
    const prefix = generateMerchantPrefix(user?.email);
    return `${prefix}-${base}`;
  };

  const mutation = useMutation({
    mutationFn: (data) => {
      if (isEditing) return base44.entities.PaymentLink.update(link.id, data);
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
      cnt_amount: form.amount_mode === "fixed_cnt" ? parseFloat(form.cnt_amount) || 0 : null,
      cnt_decimals: form.amount_mode === "fixed_cnt" ? parseInt(form.cnt_decimals) || 0 : null,
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
        {/* Basic Info */}
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

        {/* Pricing */}
        <div className="bg-white rounded-xl border border-slate-200/60 p-6 space-y-5">
          <h3 className="text-sm font-semibold text-slate-900">Pricing</h3>

          <div className="space-y-2">
            <Label>Amount Mode</Label>
            <Select value={form.amount_mode} onValueChange={(v) => update("amount_mode", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed_ada">Fixed ADA</SelectItem>
                <SelectItem value="fixed_fiat">Fixed Fiat (EUR/USD)</SelectItem>
                <SelectItem value="fixed_cnt">Cardano Native Token (CNT)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {form.amount_mode === "fixed_ada" && (
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
          )}

          {form.amount_mode === "fixed_fiat" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={form.fiat_currency} onValueChange={(v) => update("fiat_currency", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.amount_fiat}
                  onChange={(e) => update("amount_fiat", e.target.value)}
                  placeholder="e.g. 9.99"
                />
              </div>
            </div>
          )}

          {form.amount_mode === "fixed_cnt" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Token Amount</Label>
                  <Input
                    type="number"
                    value={form.cnt_amount}
                    onChange={(e) => update("cnt_amount", e.target.value)}
                    placeholder="e.g. 1000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ticker (e.g. $SNEK)</Label>
                  <Input
                    value={form.cnt_ticker}
                    onChange={(e) => update("cnt_ticker", e.target.value)}
                    placeholder="$SNEK"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Policy ID</Label>
                <Input
                  value={form.cnt_policy_id}
                  onChange={(e) => update("cnt_policy_id", e.target.value)}
                  placeholder="279c909f348e533da5808898f87f9a14bb2c3dfbbacccd631d927a3"
                  className="font-mono text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Asset Name (hex)</Label>
                  <Input
                    value={form.cnt_asset_name}
                    onChange={(e) => update("cnt_asset_name", e.target.value)}
                    placeholder="534e454b (optional)"
                    className="font-mono text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Decimals</Label>
                  <Input
                    type="number"
                    min={0}
                    max={18}
                    value={form.cnt_decimals}
                    onChange={(e) => update("cnt_decimals", e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Receive Address */}
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

        {/* Options */}
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

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">Collect shipping address</p>
              <p className="text-xs text-slate-400">Ask payer for street, city, postal code & country</p>
            </div>
            <Switch checked={form.collect_shipping} onCheckedChange={(v) => update("collect_shipping", v)} />
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

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button type="submit" disabled={mutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
            <Save className="w-4 h-4" />
            {isEditing ? "Update" : "Create"} Payment Link
          </Button>
          <Button type="button" variant="outline" className="gap-2" onClick={() => { setTemplateName(form.title || ""); setShowSaveTemplate(true); }}>
            <BookTemplate className="w-4 h-4" />
            Save as Template
          </Button>
          <Button type="button" variant="ghost" onClick={onBack}>
            Cancel
          </Button>
        </div>
      </form>

      <Dialog open={showSaveTemplate} onOpenChange={setShowSaveTemplate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500">Give this template a name so you can reuse it later with one click.</p>
          <Input
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="e.g. Monthly Membership"
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveTemplate(false)}>Cancel</Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={!templateName.trim() || saveTemplateMutation.isPending}
              onClick={handleSaveTemplate}
            >
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}