import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

const toolOptions = [
  { value: "payment_link", label: "Payment link" },
  { value: "subscription", label: "Subscription" },
  { value: "access_link", label: "Access link" },
  { value: "terminal", label: "Terminal / POS" },
  { value: "custom", label: "Custom tool" },
];

export default function AIBuilderRequestForm() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    request_title: "",
    tool_type: "custom",
    use_case: "",
    target_customer: "",
    required_fields: "",
    pricing_details: "",
    design_preferences: "",
    special_requirements: "",
    delivery_deadline: "",
  });

  const { data: user } = useQuery({
    queryKey: ["ai-request-user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: merchantProfile } = useQuery({
    queryKey: ["ai-request-profile", user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.MerchantProfile.filter({ user_id: user?.email });
      return profiles[0] || null;
    },
    enabled: !!user?.email,
  });

  const prefilled = useMemo(() => ({
    merchant_id: user?.email || "",
    merchant_name: user?.full_name || "",
    business_name: merchantProfile?.business_name || "",
    contact_email: user?.email || "",
    website_url: merchantProfile?.website_url || "",
    connected_wallet_address: merchantProfile?.connected_wallet_address || merchantProfile?.default_receive_address || "",
  }), [user, merchantProfile]);

  const submitMutation = useMutation({
    mutationFn: () => base44.entities.AIBuilderRequest.create({
      ...prefilled,
      ...form,
      status: "submitted",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-builder-requests"] });
      setForm({
        request_title: "",
        tool_type: "custom",
        use_case: "",
        target_customer: "",
        required_fields: "",
        pricing_details: "",
        design_preferences: "",
        special_requirements: "",
        delivery_deadline: "",
      });
    },
  });

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    submitMutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-4 w-4 text-primary" />
          AI builder aanvraagformulier
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Contactpersoon</Label>
              <Input value={prefilled.merchant_name} disabled />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={prefilled.contact_email} disabled />
            </div>
            <div className="space-y-2">
              <Label>Bedrijfsnaam</Label>
              <Input value={prefilled.business_name} disabled />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input value={prefilled.website_url} disabled />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Wallet / ontvangstadres</Label>
            <Textarea value={prefilled.connected_wallet_address} disabled className="min-h-[88px] font-mono text-xs" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Titel van je aanvraag</Label>
              <Input value={form.request_title} onChange={(e) => setField("request_title", e.target.value)} placeholder="Bijv. Betaalflow voor coaching calls" required />
            </div>
            <div className="space-y-2">
              <Label>Type tool</Label>
              <Select value={form.tool_type} onValueChange={(value) => setField("tool_type", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {toolOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Wat wil je precies laten bouwen?</Label>
            <Textarea value={form.use_case} onChange={(e) => setField("use_case", e.target.value)} placeholder="Beschrijf hier de flow, wat de klant ziet en wat er moet gebeuren na betaling." className="min-h-[120px]" required />
          </div>

          <div className="space-y-2">
            <Label>Voor wie is dit bedoeld?</Label>
            <Textarea value={form.target_customer} onChange={(e) => setField("target_customer", e.target.value)} placeholder="Bijv. leden, klanten, eventbezoekers, communityleden..." className="min-h-[90px]" />
          </div>

          <div className="space-y-2">
            <Label>Welke gegevens moet het formulier of de checkout verzamelen?</Label>
            <Textarea value={form.required_fields} onChange={(e) => setField("required_fields", e.target.value)} placeholder="Bijv. naam, e-mail, wallet adres, Discord naam, verzendadres..." className="min-h-[90px]" />
          </div>

          <div className="space-y-2">
            <Label>Prijs- en betalingsdetails</Label>
            <Textarea value={form.pricing_details} onChange={(e) => setField("pricing_details", e.target.value)} placeholder="Bijv. vast bedrag, abonnement, meerdere opties, ADA of CNT..." className="min-h-[90px]" />
          </div>

          <div className="space-y-2">
            <Label>Designvoorkeuren</Label>
            <Textarea value={form.design_preferences} onChange={(e) => setField("design_preferences", e.target.value)} placeholder="Bijv. strak, luxe, donker, minimalistisch, met logo of merkkleuren..." className="min-h-[90px]" />
          </div>

          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
            <div className="space-y-2">
              <Label>Extra wensen of opmerkingen</Label>
              <Textarea value={form.special_requirements} onChange={(e) => setField("special_requirements", e.target.value)} placeholder="Alles wat belangrijk is voor de admin om te weten." className="min-h-[110px]" />
            </div>
            <div className="space-y-2">
              <Label>Gewenste deadline</Label>
              <Input type="date" value={form.delivery_deadline} onChange={(e) => setField("delivery_deadline", e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={submitMutation.isPending}>
              {submitMutation.isPending ? "Aanvraag verzenden..." : "Aanvraag verzenden"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}