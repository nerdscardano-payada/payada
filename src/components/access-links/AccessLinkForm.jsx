import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Users } from "lucide-react";
import { toast } from "sonner";

const PLATFORMS = [
  { value: "discord", label: "Discord" },
  { value: "telegram", label: "Telegram" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "website", label: "Private Website" },
  { value: "other", label: "Other" },
];

export default function AccessLinkForm({ link, onBack, user }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    payment_type: "ada",
    price_ada: "",
    cnt_policy_id: "",
    cnt_asset_name: "",
    cnt_ticker: "",
    cnt_decimals: 0,
    cnt_amount: "",
    platform: "discord",
    fee_model: "merchant_pays",
    invite_link: "",
    discord_guild_id: "",
    discord_role_id: "",
    discord_bot_token: "",
    welcome_message: "",
    logo_url: "",
    receive_address: "",
    ...link,
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (link?.id) return base44.entities.CommunityAccessLink.update(link.id, data);
      return base44.entities.CommunityAccessLink.create({ ...data, merchant_id: user.email, payment_count: 0, total_received_ada: 0 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accessLinks"] });
      toast.success(link ? "Access link updated" : "Access link created");
      onBack();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const isCnt = form.payment_type === "cnt";
    if (!form.title || !form.slug || !form.platform) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!isCnt && !form.price_ada) { toast.error("Please enter the ADA access fee"); return; }
    if (isCnt && (!form.cnt_policy_id || !form.cnt_amount || !form.cnt_ticker)) {
      toast.error("Please fill in all CNT fields");
      return;
    }
    saveMutation.mutate({
      ...form,
      price_ada: isCnt ? 0 : parseFloat(form.price_ada),
      cnt_amount: isCnt ? parseFloat(form.cnt_amount) : undefined,
      cnt_decimals: isCnt ? parseInt(form.cnt_decimals) || 0 : undefined,
    });
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-4 h-4" /></Button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">{link ? "Edit Access Link" : "New Access Link"}</h1>
          <p className="text-sm text-slate-500">Configure your community access payment</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h2 className="font-semibold text-slate-800 text-sm uppercase tracking-wider">Community Info</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Community Name *</Label>
              <Input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Crypto Trading Club" />
            </div>
            <div className="space-y-1.5">
              <Label>Slug *</Label>
              <Input value={form.slug} onChange={e => set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))} placeholder="tradingclub" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={e => set("description", e.target.value)} placeholder="Join our private trading community and get..." rows={3} />
          </div>

          <div className="space-y-1.5">
            <Label>Payment Currency *</Label>
            <Select value={form.payment_type || "ada"} onValueChange={v => set("payment_type", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ada">ADA</SelectItem>
                <SelectItem value="cnt">Cardano Native Token (CNT)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(form.payment_type || "ada") === "ada" ? (
            <div className="space-y-1.5">
              <Label>Access Fee (ADA) *</Label>
              <Input type="number" value={form.price_ada} onChange={e => set("price_ada", e.target.value)} placeholder="10" />
            </div>
          ) : (
            <div className="space-y-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">CNT Configuration</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Token Ticker *</Label>
                  <Input value={form.cnt_ticker} onChange={e => set("cnt_ticker", e.target.value)} placeholder="$SNEK" />
                </div>
                <div className="space-y-1.5">
                  <Label>Amount Required *</Label>
                  <Input type="number" value={form.cnt_amount} onChange={e => set("cnt_amount", e.target.value)} placeholder="1000" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Policy ID *</Label>
                <Input value={form.cnt_policy_id} onChange={e => set("cnt_policy_id", e.target.value)} placeholder="279c909f..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Asset Name (hex)</Label>
                  <Input value={form.cnt_asset_name} onChange={e => set("cnt_asset_name", e.target.value)} placeholder="534e454b (optional)" />
                </div>
                <div className="space-y-1.5">
                  <Label>Decimals</Label>
                  <Input type="number" value={form.cnt_decimals} onChange={e => set("cnt_decimals", e.target.value)} placeholder="0" />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Logo URL</Label>
              <Input value={form.logo_url} onChange={e => set("logo_url", e.target.value)} placeholder="https://..." />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Receive Address (Cardano Wallet)</Label>
            <Input value={form.receive_address} onChange={e => set("receive_address", e.target.value)} placeholder="addr1..." />
          </div>

          <div className="space-y-1.5">
            <Label>Fee model</Label>
            <Select value={form.fee_model || "merchant_pays"} onValueChange={v => set("fee_model", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="merchant_pays">Merchant pays fee (default)</SelectItem>
                <SelectItem value="customer_pays">Customer pays fee</SelectItem>
                <SelectItem value="split">Split fee 50/50</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-400">
              {(form.fee_model || "merchant_pays") === "merchant_pays" && "Fee is deducted from the amount you receive."}
              {form.fee_model === "customer_pays" && "Customer pays the base amount + fee on top. You receive the full amount."}
              {form.fee_model === "split" && "Customer pays half the fee on top, you absorb the other half."}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h2 className="font-semibold text-slate-800 text-sm uppercase tracking-wider">Platform & Access</h2>

          <div className="space-y-1.5">
            <Label>Platform *</Label>
            <Select value={form.platform} onValueChange={v => set("platform", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PLATFORMS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Invite Link {form.platform !== "discord" ? "*" : "(fallback)"}</Label>
            <Input value={form.invite_link} onChange={e => set("invite_link", e.target.value)} placeholder="https://t.me/... or https://discord.gg/..." />
            <p className="text-xs text-slate-400">Shown to user after payment. For Discord you can also use bot-based role assignment below.</p>
          </div>

          {form.platform === "discord" && (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide">Discord Bot Configuration (optional)</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Guild (Server) ID</Label>
                  <Input value={form.discord_guild_id} onChange={e => set("discord_guild_id", e.target.value)} placeholder="123456789..." />
                </div>
                <div className="space-y-1.5">
                  <Label>Role ID</Label>
                  <Input value={form.discord_role_id} onChange={e => set("discord_role_id", e.target.value)} placeholder="987654321..." />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Bot Token</Label>
                <Input type="password" value={form.discord_bot_token} onChange={e => set("discord_bot_token", e.target.value)} placeholder="MTEx..." />
              </div>
              <div className="space-y-1.5">
                <Label>Welcome Message (optional DM)</Label>
                <Textarea value={form.welcome_message} onChange={e => set("welcome_message", e.target.value)} placeholder="Welcome to the community! 🎉" rows={2} />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onBack}>Cancel</Button>
          <Button type="submit" disabled={saveMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            {saveMutation.isPending ? "Saving..." : link ? "Save Changes" : "Create Access Link"}
          </Button>
        </div>
      </form>
    </div>
  );
}