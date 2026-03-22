import React, { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Heart, Save } from "lucide-react";
import { toast } from "sonner";

export default function DonationPageForm({ onBack }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    suggested_amounts: "5, 10, 25",
    receive_address: "",
    collect_name: true,
    collect_email: false,
    embed_button_label: "Support with ADA",
  });

  useEffect(() => {
    base44.auth.me().then((currentUser) => {
      setUser(currentUser);
      if (currentUser?.email) {
        base44.entities.MerchantProfile.filter({ user_id: currentUser.email }, "-created_date", 1).then((profiles) => {
          const profile = profiles?.[0];
          if (profile?.default_receive_address) {
            setForm((prev) => ({ ...prev, receive_address: prev.receive_address || profile.default_receive_address }));
          }
        });
      }
    });
  }, []);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const createMutation = useMutation({
    mutationFn: async () => {
      const amounts = Array.from(
        new Set(
          form.suggested_amounts
            .split(",")
            .map((value) => Number(value.trim()))
            .filter((value) => Number.isFinite(value) && value > 0)
        )
      ).sort((a, b) => a - b);

      if (!form.title.trim()) throw new Error("Please enter a title");
      if (!form.slug.trim()) throw new Error("Please enter a slug");
      if (!form.receive_address.trim()) throw new Error("Please enter a Cardano receive address");
      if (amounts.length === 0) throw new Error("Please add at least one suggested amount");

      const prefix = user?.email?.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) || "payada";
      const baseSlug = form.slug.startsWith(`${prefix}-`) ? form.slug : `${prefix}-${form.slug}`;

      const createdLinks = await base44.entities.PaymentLink.bulkCreate(
        amounts.map((amount) => ({
          merchant_id: user?.email,
          slug: `${baseSlug}-${String(amount).replace(/\./g, "-")}`,
          title: `${form.title} • ${amount} ADA`,
          description: form.description || `Support ${form.title} with ADA`,
          amount_mode: "fixed_ada",
          amount_ada: amount,
          receive_address: form.receive_address,
          collect_name: form.collect_name,
          collect_email: form.collect_email,
          status: "active",
        }))
      );

      return base44.entities.DonationPage.create({
        merchant_id: user?.email,
        slug: baseSlug,
        title: form.title,
        description: form.description,
        receive_address: form.receive_address,
        suggested_amounts: amounts,
        payment_links: createdLinks.map((link) => ({
          payment_link_id: link.id,
          slug: link.slug,
          amount_ada: link.amount_ada,
        })),
        collect_name: form.collect_name,
        collect_email: form.collect_email,
        embed_button_label: form.embed_button_label,
        status: "active",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donationPages"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      toast.success("Donation page created");
      onBack();
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <div className="max-w-3xl">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to donation pages
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">New donation page</h1>
        <p className="text-sm text-slate-500 mt-1">We’ll create one hosted donation page plus one PayADA checkout link per suggested amount.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Support my work" />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Short bio</Label>
            <Textarea id="description" value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Help me keep building for the Cardano community." className="min-h-[110px]" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={form.slug}
              onChange={(e) => update("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
              placeholder="creator-support"
            />
            <p className="text-xs text-slate-500">Public URL: {window.location.origin}/Donate?slug={form.slug || "your-slug"}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amounts">Suggested ADA amounts</Label>
            <Input id="amounts" value={form.suggested_amounts} onChange={(e) => update("suggested_amounts", e.target.value)} placeholder="5, 10, 25" />
            <p className="text-xs text-slate-500">Comma-separated values.</p>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Receive address</Label>
            <Input id="address" value={form.receive_address} onChange={(e) => update("receive_address", e.target.value)} placeholder="addr1..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="buttonLabel">Embed button label</Label>
            <Input id="buttonLabel" value={form.embed_button_label} onChange={(e) => update("embed_button_label", e.target.value)} placeholder="Support with ADA" />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
              <Heart className="w-4 h-4 text-rose-500" /> Supporter details
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={form.collect_name} onChange={(e) => update("collect_name", e.target.checked)} />
              Collect supporter name
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={form.collect_email} onChange={(e) => update("collect_email", e.target.checked)} />
              Collect supporter email
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2" onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !user}>
          <Save className="w-4 h-4" />
          {createMutation.isPending ? "Creating..." : "Create donation page"}
        </Button>
      </div>
    </div>
  );
}