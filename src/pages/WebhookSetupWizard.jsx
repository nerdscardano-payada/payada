import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ChevronRight, ChevronLeft, Webhook, Globe, Bell, Check } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const EVENT_TYPES = [
  { value: "payment_detected", label: "Payment Detected", description: "When a payment is detected on-chain", category: "Payment" },
  { value: "payment_confirmed", label: "Payment Confirmed", description: "When a payment reaches required confirmations", category: "Payment" },
  { value: "payment_refunded", label: "Payment Refunded", description: "When a payment is refunded", category: "Payment" },
  { value: "subscription_payment_failed", label: "Subscription Payment Failed", description: "When a subscription renewal fails", category: "Subscription" },
  { value: "dispute_initiated", label: "Dispute Initiated", description: "When a dispute is opened", category: "Dispute" },
  { value: "webhook_failed", label: "Webhook Delivery Failed", description: "When a webhook delivery fails", category: "System" },
];

const STEPS = [
  { id: 1, label: "Endpoint URL", icon: Globe },
  { id: 2, label: "Events", icon: Bell },
  { id: 3, label: "Confirm", icon: Check },
];

export default function WebhookSetupWizard() {
  const [step, setStep] = useState(1);
  const [merchantId, setMerchantId] = useState(null);
  const [done, setDone] = useState(false);
  const [formData, setFormData] = useState({ url: "", name: "", event_types: [] });
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then((user) => {
      if (user) setMerchantId(user.email);
    });
  }, []);

  const createMutation = useMutation({
    mutationFn: (data) =>
      base44.entities.WebhookEndpoint.create({ merchant_id: merchantId, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhook-endpoints", merchantId] });
      setDone(true);
    },
  });

  const toggleEvent = (value) => {
    setFormData((prev) => ({
      ...prev,
      event_types: prev.event_types.includes(value)
        ? prev.event_types.filter((e) => e !== value)
        : [...prev.event_types, value],
    }));
  };

  const selectAll = () => {
    setFormData((prev) => ({ ...prev, event_types: EVENT_TYPES.map((e) => e.value) }));
  };

  const canNext = () => {
    if (step === 1) return formData.url.startsWith("https://");
    if (step === 2) return formData.event_types.length > 0;
    return true;
  };

  if (done) {
    return (
      <div className="max-w-lg mx-auto mt-20 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Webhook created!</h2>
        <p className="text-slate-600 mb-8">Your endpoint <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded">{formData.url}</span> will now receive events.</p>
        <div className="flex gap-3 justify-center">
          <Link to={createPageUrl("Settings")}>
            <Button variant="outline">Back to Webhooks</Button>
          </Link>
          <Button onClick={() => { setDone(false); setStep(1); setFormData({ url: "", name: "", event_types: [] }); }}>
            Add another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Webhook className="w-5 h-5 text-indigo-500" />
          <span className="text-sm font-medium text-indigo-600">Developers</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Webhook Setup Wizard</h1>
        <p className="text-slate-500 text-sm mt-1">Configure a new webhook endpoint in 3 steps.</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center mb-10">
        {STEPS.map((s, idx) => {
          const Icon = s.icon;
          const isActive = step === s.id;
          const isDone = step > s.id;
          return (
            <React.Fragment key={s.id}>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all",
                  isDone ? "bg-indigo-600 border-indigo-600 text-white" :
                  isActive ? "border-indigo-600 text-indigo-600 bg-indigo-50" :
                  "border-slate-200 text-slate-400 bg-white"
                )}>
                  {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className={cn(
                  "text-sm font-medium hidden sm:block",
                  isActive ? "text-slate-900" : isDone ? "text-indigo-600" : "text-slate-400"
                )}>{s.label}</span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={cn("flex-1 h-0.5 mx-3", step > s.id ? "bg-indigo-500" : "bg-slate-200")} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step content */}
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-1">Your Endpoint URL</h2>
              <p className="text-slate-500 text-sm">Enter the HTTPS URL where your webhook events will be sent.</p>
            </div>
            <div>
              <Label htmlFor="name">Naam (optioneel)</Label>
              <Input
                id="name"
                className="mt-1"
                placeholder="bijv. Order Processing System"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="url">Endpoint URL <span className="text-red-500">*</span></Label>
              <Input
                id="url"
                type="url"
                className="mt-1 font-mono"
                placeholder="https://jouwserver.com/webhooks"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              />
              {formData.url && !formData.url.startsWith("https://") && (
                <p className="text-red-500 text-xs mt-1">URL moet beginnen met https://</p>
              )}
            </div>
            <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600">
              <strong className="block mb-1">Vereisten voor je endpoint:</strong>
              <ul className="space-y-1 list-disc list-inside">
                <li>Accepteert POST-verzoeken</li>
                <li>Reageert met HTTP 200</li>
                <li>Reageert binnen 30 seconden</li>
              </ul>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-1">Kies Events</h2>
                <p className="text-slate-500 text-sm">Selecteer welke events je wilt ontvangen.</p>
              </div>
              <Button variant="outline" size="sm" onClick={selectAll}>Alles selecteren</Button>
            </div>
            {["Payment", "Subscription", "Dispute", "System"].map((cat) => {
              const catEvents = EVENT_TYPES.filter((e) => e.category === cat);
              if (!catEvents.length) return null;
              return (
                <div key={cat}>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{cat}</p>
                  <div className="space-y-2">
                    {catEvents.map((event) => (
                      <label key={event.value} className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                        formData.event_types.includes(event.value)
                          ? "border-indigo-300 bg-indigo-50"
                          : "border-slate-200 hover:bg-slate-50"
                      )}>
                        <Checkbox
                          checked={formData.event_types.includes(event.value)}
                          onCheckedChange={() => toggleEvent(event.value)}
                          className="mt-0.5"
                        />
                        <div>
                          <p className="text-sm font-medium text-slate-900">{event.label}</p>
                          <p className="text-xs text-slate-500">{event.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-1">Overzicht</h2>
              <p className="text-slate-500 text-sm">Controleer je instellingen en klik op Aanmaken.</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-xs text-slate-500">Naam</p>
                <p className="text-sm font-medium text-slate-900">{formData.name || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Endpoint URL</p>
                <p className="text-sm font-mono text-slate-900 break-all">{formData.url}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-2">Events ({formData.event_types.length})</p>
                <div className="flex flex-wrap gap-1.5">
                  {formData.event_types.map((e) => (
                    <Badge key={e} variant="outline" className="text-xs">{e.replace(/_/g, " ")}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => step > 1 ? setStep(step - 1) : null}
          disabled={step === 1}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" /> Vorige
        </Button>
        {step < 3 ? (
          <Button onClick={() => setStep(step + 1)} disabled={!canNext()} className="gap-2">
            Volgende <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={() => createMutation.mutate(formData)}
            disabled={createMutation.isPending}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700"
          >
            {createMutation.isPending ? "Aanmaken..." : "Endpoint aanmaken"}
            <CheckCircle className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}