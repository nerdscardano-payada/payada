import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Save, BookTemplate, Check } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import StepBasic from "./wizard/StepBasic";
import StepOptions from "./wizard/StepOptions";
import StepSummary from "./wizard/StepSummary";

const STEPS = [
  { id: 1, label: "Basic info" },
  { id: 2, label: "Options" },
  { id: 3, label: "Summary" },
];

export default function PaymentLinkForm({ link, prefill, onBack, merchantId: merchantIdProp }) {
  const isEditing = !!link;
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");

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
    expires_at: link?.expires_at || "",
    status: link?.status || "active",
    _userEmail: "",
  });

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      setForm((prev) => ({ ...prev, _userEmail: u?.email || "" }));
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

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const saveTemplateMutation = useMutation({
    mutationFn: (data) => base44.entities.PaymentLinkTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentLinkTemplates"] });
      toast.success("Template saved!");
      setShowSaveTemplate(false);
      setTemplateName("");
    },
  });

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

  const validateStep1 = () => {
    if (!form.title.trim()) { toast.error("Please enter a title"); return false; }
    if (!form.slug.trim()) { toast.error("Please enter a slug"); return false; }
    if (form.amount_mode === "fixed_ada" && !form.amount_ada) { toast.error("Please enter an amount in ADA"); return false; }
    if (form.amount_mode === "fixed_fiat" && !form.amount_fiat) { toast.error("Please enter an amount"); return false; }
    if (form.amount_mode === "fixed_cnt" && !form.cnt_amount) { toast.error("Please enter a token amount"); return false; }
    if (!form.receive_address.trim()) { toast.error("Please enter a Cardano address"); return false; }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    setStep((s) => s + 1);
  };

  const handleSubmit = () => {
    const { _userEmail, ...rest } = form;
    const data = {
      ...rest,
      amount_ada: form.amount_mode === "fixed_ada" ? parseFloat(form.amount_ada) || 0 : null,
      amount_fiat: form.amount_mode === "fixed_fiat" ? parseFloat(form.amount_fiat) || 0 : null,
      cnt_amount: form.amount_mode === "fixed_cnt" ? parseFloat(form.cnt_amount) || 0 : null,
      cnt_decimals: form.amount_mode === "fixed_cnt" ? parseInt(form.cnt_decimals) || 0 : null,
      confirmations_required: parseInt(form.confirmations_required) || 2,
      expires_at: form.expires_at || null,
    };
    mutation.mutate(data);
  };

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

  return (
    <div className="max-w-2xl">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to payment links
      </button>

      <h1 className="text-xl font-bold text-slate-900 mb-6">
        {isEditing ? "Edit payment link" : "New payment link"}
      </h1>

      {/* Step indicators */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors",
                step > s.id ? "bg-indigo-600 text-white" :
                step === s.id ? "bg-indigo-600 text-white" :
                "bg-slate-100 text-slate-400"
              )}>
                {step > s.id ? <Check className="w-3.5 h-3.5" /> : s.id}
              </div>
              <span className={cn(
                "text-sm font-medium hidden sm:block",
                step === s.id ? "text-slate-900" : "text-slate-400"
              )}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn("flex-1 h-px mx-3", step > s.id ? "bg-indigo-600" : "bg-slate-200")} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-white rounded-xl border border-slate-200/60 p-6 mb-6">
        {step === 1 && <StepBasic form={form} update={update} isEditing={isEditing} isAdmin={user?.role === "admin"} />}
        {step === 2 && <StepOptions form={form} update={update} />}
        {step === 3 && <StepSummary form={form} />}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <div>
          {step === 3 && (
            <Button type="button" variant="outline" className="gap-2" onClick={() => { setTemplateName(form.title || ""); setShowSaveTemplate(true); }}>
              <BookTemplate className="w-4 h-4" />
              Save as template
            </Button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {step > 1 && (
            <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Previous
            </Button>
          )}
          {step < 3 ? (
            <Button type="button" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2" onClick={handleNext}>
              Next <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="button"
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
              disabled={mutation.isPending}
              onClick={handleSubmit}
            >
              <Save className="w-4 h-4" />
              {isEditing ? "Update" : "Publish"}
            </Button>
          )}
        </div>
      </div>

      <Dialog open={showSaveTemplate} onOpenChange={setShowSaveTemplate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as template</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500">Give this template a name to reuse it later with one click.</p>
          <Input value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="e.g. Monthly membership" autoFocus />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveTemplate(false)}>Cancel</Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={!templateName.trim() || saveTemplateMutation.isPending}
              onClick={handleSaveTemplate}
            >
              Save template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}