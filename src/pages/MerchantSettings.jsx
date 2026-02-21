import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/shared/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Upload } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function MerchantSettings() {
  const queryClient = useQueryClient();

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["merchantProfile"],
    queryFn: () => base44.entities.MerchantProfile.list("-created_date", 1),
  });

  const profile = profiles[0] || null;

  const [form, setForm] = useState({
    business_name: "",
    website_url: "",
    logo_url: "",
    timezone: "UTC",
    default_fiat_currency: "EUR",
    default_receive_address: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        business_name: profile.business_name || "",
        website_url: profile.website_url || "",
        logo_url: profile.logo_url || "",
        timezone: profile.timezone || "UTC",
        default_fiat_currency: profile.default_fiat_currency || "EUR",
        default_receive_address: profile.default_receive_address || "",
      });
    }
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (profile) return base44.entities.MerchantProfile.update(profile.id, data);
      return base44.entities.MerchantProfile.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchantProfile"] });
      toast.success("Settings saved");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(form);
  };

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    update("logo_url", file_url);
    toast.success("Logo uploaded");
  };

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Settings" />
        <div className="max-w-2xl space-y-6">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200/60 p-6">
              <Skeleton className="h-5 w-32 mb-4" />
              <Skeleton className="h-10 w-full mb-3" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your merchant profile and preferences" />

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="bg-white rounded-xl border border-slate-200/60 p-6 space-y-5">
          <h3 className="text-sm font-semibold text-slate-900">Business Profile</h3>
          
          <div className="space-y-2">
            <Label>Business Name *</Label>
            <Input value={form.business_name} onChange={(e) => update("business_name", e.target.value)} placeholder="Your business name" />
          </div>

          <div className="space-y-2">
            <Label>Website</Label>
            <Input value={form.website_url} onChange={(e) => update("website_url", e.target.value)} placeholder="https://yoursite.com" />
          </div>

          <div className="space-y-2">
            <Label>Logo</Label>
            <div className="flex items-center gap-4">
              {form.logo_url && (
                <img src={form.logo_url} alt="Logo" className="w-12 h-12 rounded-lg object-cover border border-slate-200" />
              )}
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition-colors">
                <Upload className="w-4 h-4 text-slate-500" />
                Upload Logo
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/60 p-6 space-y-5">
          <h3 className="text-sm font-semibold text-slate-900">Payment Defaults</h3>

          <div className="space-y-2">
            <Label>Default Receive Address (ADA) *</Label>
            <Input
              value={form.default_receive_address}
              onChange={(e) => update("default_receive_address", e.target.value)}
              placeholder="addr1q9..."
              className="font-mono text-xs"
            />
            <p className="text-xs text-slate-400">Your Cardano wallet address for receiving payments</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Default Fiat Currency</Label>
              <Select value={form.default_fiat_currency} onValueChange={(v) => update("default_fiat_currency", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select value={form.timezone} onValueChange={(v) => update("timezone", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="Europe/Brussels">Europe/Brussels</SelectItem>
                  <SelectItem value="Europe/London">Europe/London</SelectItem>
                  <SelectItem value="America/New_York">America/New York</SelectItem>
                  <SelectItem value="America/Los_Angeles">America/Los Angeles</SelectItem>
                  <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Button type="submit" disabled={saveMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
          <Save className="w-4 h-4" />
          Save Settings
        </Button>
      </form>
    </div>
  );
}