import React, { useState, useEffect, Fragment } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Toaster } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  ArrowRight, TrendingUp, Link2, Users, CreditCard, Plus, Copy,
  Trash2, Clock, CheckCircle2, LayoutDashboard, ShoppingBag, Zap,
  Code2, ArrowLeft, ExternalLink
} from "lucide-react";
import { format, addHours } from "date-fns";
import { createPageUrl } from "@/utils";

// Button generator imports
import StepSelectLink from "@/components/button-generator/StepSelectLink";
import StepCustomize from "@/components/button-generator/StepCustomize";
import StepGetCode from "@/components/button-generator/StepGetCode";

// Shop generator imports
import StepShopInfo, { THEMES, FONTS } from "@/components/shopping-page-generator/StepShopInfo";
import StepManageProducts, { emptyProduct } from "@/components/shopping-page-generator/StepManageProducts";
import StepPublish from "@/components/shopping-page-generator/StepPublish";

const DEMO_MERCHANT_ID = "demo@payada.io";

const DEMO_PAYMENTS = [
  { id: "d1", payer_email: "alice@example.com", received_amount_ada: 50, status: "confirmed", created_date: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: "d2", payer_email: "bob@example.com", received_amount_ada: 120, status: "confirmed", created_date: new Date(Date.now() - 3600000 * 5).toISOString() },
  { id: "d3", payer_email: "carol@example.com", received_amount_ada: 250, status: "confirmed", created_date: new Date(Date.now() - 3600000 * 12).toISOString() },
  { id: "d4", payer_email: "dave@example.com", received_amount_ada: 75, status: "confirmed", created_date: new Date(Date.now() - 3600000 * 24).toISOString() },
  { id: "d5", payer_email: "eve@example.com", received_amount_ada: 200, status: "confirmed", created_date: new Date(Date.now() - 3600000 * 36).toISOString() },
];

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "payment-links", label: "Payment Links", icon: Link2 },
  { id: "access-links", label: "Access Links", icon: Users },
  { id: "button-generator", label: "Button Generator", icon: Code2 },
  { id: "shop-generator", label: "Shop Generator", icon: ShoppingBag },
];

function ExpiresInBadge({ expiresAt }) {
  const [, forceUpdate] = useState(0);
  React.useEffect(() => {
    const interval = setInterval(() => forceUpdate(n => n + 1), 30000);
    return () => clearInterval(interval);
  }, []);
  const msLeft = new Date(expiresAt) - new Date();
  if (msLeft <= 0) return <Badge variant="secondary" className="text-xs">Expired</Badge>;
  const minutesLeft = Math.floor(msLeft / 60000);
  const label = minutesLeft < 1 ? "< 1 min" : minutesLeft < 60 ? `${minutesLeft}m` : `${Math.floor(minutesLeft / 60)}h ${minutesLeft % 60}m`;
  return (
    <Badge className="text-xs bg-amber-100 text-amber-700 border-0 gap-1">
      <Clock className="w-3 h-3" /> {label}
    </Badge>
  );
}

function DemoBanner() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-2.5 text-center text-sm font-medium flex items-center justify-center gap-3 flex-wrap">
      <Zap className="w-4 h-4 flex-shrink-0" />
      <span>You're in Demo Mode — Links expire after 1 hour. No account needed.</span>
      <Button size="sm" onClick={() => base44.auth.redirectToLogin(createPageUrl("Dashboard"))} className="bg-white text-blue-700 hover:bg-blue-50 h-7 text-xs font-semibold ml-2">
        Get Started — Free <ArrowRight className="w-3 h-3 ml-1" />
      </Button>
    </div>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
function DemoDashboard({ demoLinks, demoAccessLinks }) {
  const totalAda = DEMO_PAYMENTS.reduce((s, p) => s + p.received_amount_ada, 0) +
    demoLinks.reduce((s, l) => s + (l.total_received_ada || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Volume", value: `₳ ${totalAda.toFixed(2)}`, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
          { label: "Payments", value: DEMO_PAYMENTS.length + demoLinks.reduce((s, l) => s + (l.payment_count || 0), 0), icon: CreditCard, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Payment Links", value: 4 + demoLinks.length, icon: Link2, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Access Links", value: 2 + demoAccessLinks.length, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="p-5">
            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Recent Payments</h2>
        </div>
        <div className="divide-y divide-slate-50">
          {DEMO_PAYMENTS.map(p => (
            <div key={p.id} className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{p.payer_email}</p>
                  <p className="text-xs text-slate-400">{format(new Date(p.created_date), "MMM d, HH:mm")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">confirmed</Badge>
                <span className="text-sm font-semibold text-slate-900">₳ {p.received_amount_ada.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Payment Links ────────────────────────────────────────────────────────────
const PRESET_PAYMENT_LINKS_DATA = [
  { title: "Event Ticket", amount_ada: 20, slug: "demo-event-ticket", status: "active", payment_count: 14, amount_mode: "fixed_ada", confirmations_required: 2, collect_email: true },
  { title: "Donation", amount_ada: 10, slug: "demo-donation", status: "active", payment_count: 8, amount_mode: "fixed_ada", confirmations_required: 2 },
  { title: "Premium Community", amount_ada: 50, slug: "demo-premium-community", status: "active", payment_count: 6, amount_mode: "fixed_ada", confirmations_required: 2 },
  { title: "Product Purchase", amount_ada: 35, slug: "demo-product-purchase", status: "active", payment_count: 4, amount_mode: "fixed_ada", confirmations_required: 2 },
];

const EMPTY_PAYMENT_FORM = {
  title: "", slug: "", description: "", amount_mode: "fixed_ada", amount_ada: "",
  receive_address: "", fee_model: "merchant_pays", confirmations_required: 2,
  collect_email: false, collect_name: false, collect_shipping: false, success_redirect_url: "",
};

function DemoPaymentLinks({ links, onCreate, onDelete, creating }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_PAYMENT_FORM);

  const allLinks = links;
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = () => {
    if (!form.title || !form.amount_ada) return toast.error("Please fill in title and amount");
    const slug = form.slug || form.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    onCreate({ ...form, amount_ada: parseFloat(form.amount_ada), slug });
    setForm(EMPTY_PAYMENT_FORM);
    setShowForm(false);
  };

  return (
    <div className="space-y-5">
      {!showForm ? (
        <div className="flex justify-end">
          <Button onClick={() => setShowForm(true)} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
            <Plus className="w-4 h-4" /> New Payment Link
          </Button>
        </div>
      ) : (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><ArrowLeft className="w-4 h-4" /></Button>
            <div>
              <h3 className="font-semibold text-slate-900">New Payment Link</h3>
              <p className="text-xs text-slate-500">Demo links expire after 1 hour</p>
            </div>
          </div>

          <div className="space-y-5 max-w-2xl">
            {/* Basic Info */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-4">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Basic Info</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Title *</Label>
                  <Input placeholder="e.g. Event Ticket" value={form.title} onChange={e => { set("title", e.target.value); if (!form.slug) set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")); }} />
                </div>
                <div className="space-y-1.5">
                  <Label>URL Slug *</Label>
                  <div className="flex items-center">
                    <span className="text-xs text-slate-400 bg-white border border-r-0 border-slate-200 px-2 py-2.5 rounded-l-md whitespace-nowrap">/pay/</span>
                    <Input value={form.slug} onChange={e => set("slug", e.target.value)} className="rounded-l-none" placeholder="my-payment" />
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={e => set("description", e.target.value)} placeholder="Optional description for the payer" rows={2} />
              </div>
            </div>

            {/* Amount */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-4">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Payment Type</Label>
                  <Select value={form.amount_mode} onValueChange={v => set("amount_mode", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed_ada">Fixed amount in ADA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Amount (ADA) *</Label>
                  <Input type="number" step="0.01" placeholder="e.g. 25" value={form.amount_ada} onChange={e => set("amount_ada", e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Cardano Receive Address</Label>
                <Input className="font-mono text-xs" value={form.receive_address} onChange={e => set("receive_address", e.target.value)} placeholder="addr1q9..." />
                <p className="text-xs text-slate-400">Leave empty in demo — not required for testing.</p>
              </div>
            </div>

            {/* Options */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-4">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Options</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Fee Model</Label>
                  <Select value={form.fee_model} onValueChange={v => set("fee_model", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="merchant_pays">Merchant pays fee</SelectItem>
                      <SelectItem value="customer_pays">Customer pays fee</SelectItem>
                      <SelectItem value="split">Split 50/50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Required Confirmations</Label>
                  <Input type="number" min={1} max={30} value={form.confirmations_required} onChange={e => set("confirmations_required", parseInt(e.target.value))} />
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-200">
                <p className="text-xs font-medium text-slate-600">Collect payer info</p>
                {[
                  { key: "collect_email", label: "Email address" },
                  { key: "collect_name", label: "Full name" },
                  { key: "collect_shipping", label: "Shipping address" },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-slate-700">{label}</span>
                    <Switch checked={form[key]} onCheckedChange={v => set(key, v)} />
                  </div>
                ))}
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <Label>Success Redirect URL</Label>
                <Input value={form.success_redirect_url} onChange={e => set("success_redirect_url", e.target.value)} placeholder="https://yoursite.com/thank-you" />
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button disabled={creating} onClick={handleCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {creating ? "Creating..." : "Create Payment Link"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Title</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Amount</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Payments</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {allLinks.map(link => (
                <tr key={link.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-medium text-slate-900">{link.title}</p>
                    <p className="text-xs text-slate-400">/{link.slug}</p>
                  </td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-slate-900">₳ {link.amount_ada?.toFixed(2)}</td>
                  <td className="px-5 py-3.5 hidden sm:table-cell text-sm text-slate-600">{link.payment_count || 0}</td>
                  <td className="px-5 py-3.5">
                    {link.expires_at ? <ExpiresInBadge expiresAt={link.expires_at} /> : <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">active</Badge>}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <a href={`/Pay?slug=${link.slug}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Open checkout">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </a>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/Pay?slug=${link.slug}`); toast.success("URL copied!"); }}>
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                      {link.expires_at && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => onDelete(link.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── Access Links ─────────────────────────────────────────────────────────────
const PRESET_ACCESS_LINKS_DATA = [
  { title: "VIP Trading Club", price_ada: 99, platform: "discord", slug: "demo-vip-trading-club", status: "active", payment_count: 23, fee_model: "merchant_pays" },
  { title: "NFT Alpha Group", price_ada: 50, platform: "telegram", slug: "demo-nft-alpha", status: "active", payment_count: 11, fee_model: "merchant_pays" },
];

const EMPTY_ACCESS_FORM = {
  title: "", slug: "", description: "", payment_type: "ada", price_ada: "",
  platform: "discord", fee_model: "merchant_pays", invite_link: "",
  discord_guild_id: "", discord_role_id: "", discord_bot_token: "",
  welcome_message: "", logo_url: "", receive_address: "",
};

const PLATFORM_COLORS = { discord: "bg-indigo-100 text-indigo-700", telegram: "bg-sky-100 text-sky-700", whatsapp: "bg-green-100 text-green-700", website: "bg-slate-100 text-slate-700", other: "bg-slate-100 text-slate-600" };

function DemoAccessLinks({ links, onCreate, onDelete, creating }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_ACCESS_FORM);

  const allLinks = links;
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = () => {
    if (!form.title || !form.price_ada) return toast.error("Please fill in title and price");
    const slug = form.slug || form.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    onCreate({ ...form, price_ada: parseFloat(form.price_ada), slug });
    setForm(EMPTY_ACCESS_FORM);
    setShowForm(false);
  };

  return (
    <div className="space-y-5">
      {!showForm ? (
        <div className="flex justify-end">
          <Button onClick={() => setShowForm(true)} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
            <Plus className="w-4 h-4" /> New Access Link
          </Button>
        </div>
      ) : (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><ArrowLeft className="w-4 h-4" /></Button>
            <div>
              <h3 className="font-semibold text-slate-900">New Access Link</h3>
              <p className="text-xs text-slate-500">Demo links expire after 1 hour</p>
            </div>
          </div>

          <div className="space-y-5 max-w-2xl">
            {/* Community Info */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
              <h4 className="font-semibold text-slate-800 text-sm uppercase tracking-wider">Community Info</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Community Name *</Label>
                  <Input value={form.title} onChange={e => { set("title", e.target.value); if (!form.slug) set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")); }} placeholder="Crypto Trading Club" />
                </div>
                <div className="space-y-1.5">
                  <Label>Slug *</Label>
                  <Input value={form.slug} onChange={e => set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))} placeholder="tradingclub" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={e => set("description", e.target.value)} placeholder="Join our private trading community..." rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Access Fee (ADA) *</Label>
                  <Input type="number" value={form.price_ada} onChange={e => set("price_ada", e.target.value)} placeholder="50" />
                </div>
                <div className="space-y-1.5">
                  <Label>Fee Model</Label>
                  <Select value={form.fee_model} onValueChange={v => set("fee_model", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="merchant_pays">Merchant pays fee</SelectItem>
                      <SelectItem value="customer_pays">Customer pays fee</SelectItem>
                      <SelectItem value="split">Split 50/50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Receive Address (Cardano Wallet)</Label>
                <Input value={form.receive_address} onChange={e => set("receive_address", e.target.value)} placeholder="addr1..." />
              </div>
            </div>

            {/* Platform & Access */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
              <h4 className="font-semibold text-slate-800 text-sm uppercase tracking-wider">Platform & Access</h4>
              <div className="space-y-1.5">
                <Label>Platform *</Label>
                <Select value={form.platform} onValueChange={v => set("platform", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discord">Discord</SelectItem>
                    <SelectItem value="telegram">Telegram</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="website">Private Website</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Invite Link {form.platform !== "discord" ? "*" : "(fallback)"}</Label>
                <Input value={form.invite_link} onChange={e => set("invite_link", e.target.value)} placeholder="https://t.me/... or https://discord.gg/..." />
                <p className="text-xs text-slate-400">Shown to user after payment.</p>
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
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button disabled={creating} onClick={handleCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {creating ? "Creating..." : "Create Access Link"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Community</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Platform</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Price</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Members</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {allLinks.map(link => (
                <tr key={link.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-medium text-slate-900">{link.title}</p>
                    <p className="text-xs text-slate-400">/access/{link.slug}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${PLATFORM_COLORS[link.platform] || PLATFORM_COLORS.other}`}>{link.platform}</span>
                  </td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-slate-900">₳ {link.price_ada?.toFixed(2)}</td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    {link.expires_at ? <ExpiresInBadge expiresAt={link.expires_at} /> : <span className="text-sm text-slate-600">{link.payment_count || 0}</span>}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <a href={`/Access?slug=${link.slug}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Open checkout">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      </a>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/Access?slug=${link.slug}`); toast.success("URL copied!"); }}>
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                      {link.expires_at && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => onDelete(link.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── Button Generator (reuses real components) ────────────────────────────────
const DEFAULT_BUTTON_CONFIG = {
  buttonText: "Pay with ADA", colorOption: "#6366f1", customColor: "#6366f1",
  rounded: "lg", size: "md", showAmount: true, showPoweredBy: true,
  showIcon: true, selectedIcon: "gift", hoverEffect: true, shadow: true,
};

function DemoButtonGenerator({ links }) {
  const [step, setStep] = useState(1);
  const [selectedLinkId, setSelectedLinkId] = useState("");
  const [config, setConfig] = useState(DEFAULT_BUTTON_CONFIG);

  const selectedLink = links.find(l => l.id === selectedLinkId);

  const STEPS = [{ number: 1, label: "Choose Link" }, { number: 2, label: "Customize" }, { number: 3, label: "Get Code" }];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step indicators */}
      <div className="flex items-center justify-center gap-0 mb-8">
        {STEPS.map((s, i) => (
          <Fragment key={s.number}>
            <div className="flex flex-col items-center gap-1.5">
              <div className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300",
                step > s.number ? "bg-indigo-500 text-white shadow-md shadow-indigo-200"
                  : step === s.number ? "bg-indigo-500 text-white shadow-lg shadow-indigo-300 ring-4 ring-indigo-100"
                  : "bg-slate-100 text-slate-400"
              )}>
                {step > s.number ? <CheckCircle2 className="w-4 h-4" /> : s.number}
              </div>
              <span className={cn("text-xs font-medium", step === s.number ? "text-indigo-600" : "text-slate-400")}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn("h-0.5 w-16 mx-2 mb-5 rounded-full transition-all duration-500", step > s.number ? "bg-indigo-400" : "bg-slate-200")} />
            )}
          </Fragment>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-7">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              {links.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <Link2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p>No payment links yet.</p>
                  <p className="text-sm mt-1">Create one in the Payment Links tab first.</p>
                </div>
              ) : (
                <StepSelectLink links={links} selectedLinkId={selectedLinkId} onSelect={setSelectedLinkId} onNext={() => setStep(2)} />
              )}
            </motion.div>
          )}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <StepCustomize config={config} onChange={setConfig} onBack={() => setStep(1)} onNext={() => setStep(3)} />
            </motion.div>
          )}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <StepGetCode config={config} selectedLink={selectedLink} onBack={() => setStep(2)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Shop Generator (reuses real components) ─────────────────────────────────
const DEFAULT_SHOP_CONFIG = {
  shopTitle: "My ADA Shop", shopSubtitle: "Accept payments in Cardano ADA",
  logoText: "🛒 MyShop", logoImageUrl: "", footerText: "© 2025 MyShop. Powered by PayADA.",
  theme: THEMES[0], customAccent: "#6366f1", useCustomAccent: false,
  font: FONTS[0].value, showPoweredBy: true, enableCart: true,
  enableCategories: true, enableSearch: true, heroEffect: "none",
  gradientColor2: "#38bdf8", heroAnimation: "none", heroImageUrl: "", heroImageOverlay: 0.5,
};

function DemoShopGenerator({ links }) {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState(DEFAULT_SHOP_CONFIG);
  const [products, setProducts] = useState([
    { ...emptyProduct(), id: 1, name: "My Product", description: "", price: "", badge: "", category: "uncategorized" },
  ]);

  const accent = config.useCustomAccent ? config.customAccent : config.theme.accent;
  const categories = [...new Set(products.map(p => p.category || "uncategorized"))];
  const baseUrl = window.location.origin;
  const cardBorder = config.theme.cardBorder || "rgba(255,255,255,0.07)";

  const generatePage = () => {
    const { theme, font, shopTitle, shopSubtitle, logoText, logoImageUrl, footerText, showPoweredBy, enableCart, enableCategories, enableSearch, heroEffect, gradientColor2, heroAnimation, heroImageUrl: heroImg, heroImageOverlay } = config;
    const logoHtml = logoImageUrl
      ? `<div style="display:flex;align-items:center;gap:10px;"><img src="${logoImageUrl}" alt="${logoText}" style="height:36px;width:auto;object-fit:contain;border-radius:6px;" /><span style="font-size:18px;font-weight:800;">${logoText}</span></div>`
      : `<span style="font-size:18px;font-weight:800;">${logoText}</span>`;
    const fontImport = font.includes("Inter")
      ? `<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">`
      : "";

    let titleStyle = `font-size:clamp(32px,6vw,60px);font-weight:900;letter-spacing:-0.04em;margin-bottom:16px;line-height:1.05;`;
    if (heroEffect === "gradient") {
      titleStyle += `background:linear-gradient(135deg,${accent} 0%,${gradientColor2} 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;`;
    } else if (heroEffect === "neon") {
      titleStyle += `color:${accent};text-shadow:0 0 20px ${accent}99,0 0 60px ${accent}55;`;
    } else {
      titleStyle += `background:linear-gradient(135deg,${theme.text} 40%,${accent} 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;`;
    }

    const heroBgStyle = heroImg ? `background:linear-gradient(rgba(0,0,0,${heroImageOverlay}),rgba(0,0,0,${heroImageOverlay})),url('${heroImg}') center/cover no-repeat;` : "";
    const categoriesHtml = enableCategories ? `<div class="category-filters" style="display:flex;gap:8px;margin-bottom:24px;overflow-x:auto;padding-bottom:8px;"><button class="category-filter active" data-category="all" style="padding:8px 16px;border-radius:999px;border:2px solid ${accent};background:${accent};color:#fff;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;">${categories.map(cat => `<button class="category-filter" data-category="${cat}" style="padding:8px 16px;border-radius:999px;border:2px solid ${accent}40;background:transparent;color:${theme.text};font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;text-transform:capitalize;">${cat}</button>`).join("")}</button></div>` : "";
    const searchHtml = enableSearch ? `<div style="margin-bottom:24px;position:relative;"><input type="text" class="search-input" placeholder="Search products..." style="width:100%;padding:12px 16px 12px 40px;border-radius:12px;border:1px solid ${accent}30;background:${theme.card};color:${theme.text};font-size:14px;" /><span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:${accent};">🔍</span></div>` : "";

    const productCards = products.map(p => {
      const link = links.find(l => l.id === p.linkId);
      const slug = link?.slug || "";
      const featList = p.features ? p.features.split("\n").filter(Boolean).map(f => `<li style="padding:4px 0;display:flex;align-items:center;gap:8px;font-size:13px;"><span style="color:${accent};">✦</span> ${f}</li>`).join("") : "";
      return `<div class="product-card" data-category="${p.category || "uncategorized"}" style="background:${theme.card};border:1px solid ${cardBorder};border-radius:20px;overflow:hidden;display:flex;flex-direction:column;">
        ${p.imageUrl ? `<img src="${p.imageUrl}" alt="${p.name}" style="width:100%;height:220px;object-fit:cover;" />` : ""}
        <div style="padding:24px;flex:1;display:flex;flex-direction:column;">
          <h2 style="font-size:18px;font-weight:800;margin:0 0 4px;color:${theme.text};">${p.name || "Product"}</h2>
          <p style="color:${theme.text};opacity:0.6;margin:0 0 16px;font-size:13px;flex:1;">${p.description || ""}</p>
          ${featList ? `<ul style="list-style:none;margin:0 0 16px;padding:0;">${featList}</ul>` : ""}
          <div style="font-size:28px;font-weight:900;color:${accent};margin-bottom:20px;">₳ ${p.price || "0"}</div>
          ${slug ? `<a href="${baseUrl}/Pay?slug=${slug}" style="display:flex;align-items:center;justify-content:center;background:${accent};color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 20px;border-radius:12px;">🛒 Buy Now</a>` : `<div style="color:${theme.text};opacity:0.3;font-size:13px;text-align:center;">No payment link</div>`}
        </div>
      </div>`;
    }).join("");

    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>${shopTitle}</title>${fontImport}<style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:${font};background:${theme.bg};color:${theme.text};min-height:100vh;}.container{max-width:1100px;margin:0 auto;padding:0 28px;}.product-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:28px;}@media(max-width:900px){.product-grid{grid-template-columns:repeat(2,1fr);}}@media(max-width:600px){.product-grid{grid-template-columns:1fr;}}</style></head><body><header style="background:${theme.card}cc;border-bottom:1px solid ${cardBorder};padding:16px 0;position:sticky;top:0;z-index:100;backdrop-filter:blur(24px);"><div class="container" style="display:flex;align-items:center;justify-content:space-between;">${logoHtml}<span style="font-size:12px;background:${accent}15;color:${accent};border:1px solid ${accent}30;padding:5px 12px;border-radius:999px;font-weight:600;">✦ Cardano ADA</span></div></header><section style="padding:80px 0 48px;text-align:center;${heroBgStyle}"><div class="container"><h1 style="${titleStyle}">${shopTitle}</h1><p style="font-size:17px;opacity:0.5;">${shopSubtitle}</p></div></section><main style="padding:16px 0 100px;"><div class="container">${searchHtml}${categoriesHtml}<div class="product-grid">${productCards}</div></div></main><footer style="border-top:1px solid ${cardBorder};padding:40px 0;text-align:center;"><div style="font-size:13px;opacity:0.3;">${footerText}</div>${showPoweredBy ? `<a href="https://payada.io" style="color:${accent};text-decoration:none;font-size:12px;font-weight:600;margin-top:10px;display:inline-block;opacity:0.6;">✦ Powered by PayADA</a>` : ""}</footer></body></html>`;
  };

  const STEPS = [{ number: 1, label: "Shop Info" }, { number: 2, label: "Products" }, { number: 3, label: "Publish" }];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-center gap-0 mb-8">
        {STEPS.map((s, i) => (
          <Fragment key={s.number}>
            <div className="flex flex-col items-center gap-1.5">
              <div className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300",
                step > s.number ? "bg-indigo-500 text-white shadow-md shadow-indigo-200"
                  : step === s.number ? "bg-indigo-500 text-white shadow-lg shadow-indigo-300 ring-4 ring-indigo-100"
                  : "bg-slate-100 text-slate-400"
              )}>
                {step > s.number ? <CheckCircle2 className="w-4 h-4" /> : s.number}
              </div>
              <span className={cn("text-xs font-medium", step === s.number ? "text-indigo-600" : "text-slate-400")}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn("h-0.5 w-16 mx-2 mb-5 rounded-full transition-all duration-500", step > s.number ? "bg-indigo-400" : "bg-slate-200")} />
            )}
          </Fragment>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-7">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <StepShopInfo config={config} onChange={setConfig} onNext={() => setStep(2)} />
            </motion.div>
          )}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <StepManageProducts products={products} setProducts={setProducts} links={links} onBack={() => setStep(1)} onNext={() => setStep(3)} />
            </motion.div>
          )}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <StepPublish generatePage={generatePage} shopTitle={config.shopTitle} theme={config.theme} font={config.font} logoText={config.logoText} enableCategories={config.enableCategories} enableCart={config.enableCart} products={products} onBack={() => setStep(2)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Main Demo Page ───────────────────────────────────────────────────────────
export default function Demo() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const queryClient = useQueryClient();

  const { data: demoPaymentLinks = [] } = useQuery({
    queryKey: ["demoPaymentLinks"],
    queryFn: async () => {
      const existing = await base44.entities.PaymentLink.filter({ merchant_id: DEMO_MERCHANT_ID }, "-created_date", 100);
      // Ensure preset links exist in DB (slugs prefixed with "demo-")
      for (const preset of PRESET_PAYMENT_LINKS_DATA) {
        const found = existing.find(l => l.slug === preset.slug);
        if (!found) {
          await base44.entities.PaymentLink.create({
            ...preset,
            merchant_id: DEMO_MERCHANT_ID,
            receive_address: "addr1demo_payada_demo_address",
          });
        }
      }
      return base44.entities.PaymentLink.filter({ merchant_id: DEMO_MERCHANT_ID }, "-created_date", 100);
    },
    refetchInterval: 30000,
    select: data => data.filter(l => !l.expires_at || new Date(l.expires_at) > new Date()),
  });

  const { data: demoAccessLinks = [] } = useQuery({
    queryKey: ["demoAccessLinks"],
    queryFn: async () => {
      const existing = await base44.entities.CommunityAccessLink.filter({ merchant_id: DEMO_MERCHANT_ID }, "-created_date", 100);
      for (const preset of PRESET_ACCESS_LINKS_DATA) {
        const found = existing.find(l => l.slug === preset.slug);
        if (!found) {
          await base44.entities.CommunityAccessLink.create({
            ...preset,
            merchant_id: DEMO_MERCHANT_ID,
          });
        }
      }
      return base44.entities.CommunityAccessLink.filter({ merchant_id: DEMO_MERCHANT_ID }, "-created_date", 100);
    },
    refetchInterval: 30000,
    select: data => data.filter(l => !l.expires_at || new Date(l.expires_at) > new Date()),
  });

  const createPaymentLinkMutation = useMutation({
    mutationFn: async (data) => base44.entities.PaymentLink.create({
      ...data, merchant_id: DEMO_MERCHANT_ID,
      expires_at: addHours(new Date(), 1).toISOString(),
      status: "active",
      receive_address: data.receive_address || "addr1demo_payada_demo_address",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demoPaymentLinks"] });
      toast.success("Payment link created! Expires in 1 hour.");
    },
  });

  const createAccessLinkMutation = useMutation({
    mutationFn: async (data) => base44.entities.CommunityAccessLink.create({
      ...data, merchant_id: DEMO_MERCHANT_ID,
      expires_at: addHours(new Date(), 1).toISOString(),
      status: "active",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demoAccessLinks"] });
      toast.success("Access link created! Expires in 1 hour.");
    },
  });

  const deletePaymentLinkMutation = useMutation({
    mutationFn: (id) => base44.entities.PaymentLink.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["demoPaymentLinks"] }); toast.success("Link deleted"); },
  });

  const deleteAccessLinkMutation = useMutation({
    mutationFn: (id) => base44.entities.CommunityAccessLink.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["demoAccessLinks"] }); toast.success("Link deleted"); },
  });

  // All links come from DB now (presets are seeded on load)
  const allPaymentLinks = demoPaymentLinks;

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-right" />
      <DemoBanner />

      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69999e4306b9e4632bd7d454/1b4bc7fb6_be2b2b99e_1000069668.jpg" alt="PayADA" className="w-7 h-7 rounded-lg" />
            <span className="font-bold text-slate-900">Pay<span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">ADA</span></span>
            <Badge className="bg-amber-100 text-amber-700 border-0 text-xs ml-1">DEMO</Badge>
          </Link>
          <Button size="sm" onClick={() => base44.auth.redirectToLogin(createPageUrl("Dashboard"))} className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white">
            Create Free Account
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white border border-slate-200 rounded-xl p-1.5 w-fit overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === id ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"}`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {activeTab === "dashboard" && <DemoDashboard demoLinks={demoPaymentLinks} demoAccessLinks={demoAccessLinks} />}
        {activeTab === "payment-links" && (
          <DemoPaymentLinks
            links={demoPaymentLinks}
            onCreate={data => createPaymentLinkMutation.mutate(data)}
            onDelete={id => deletePaymentLinkMutation.mutate(id)}
            creating={createPaymentLinkMutation.isPending}
          />
        )}
        {activeTab === "access-links" && (
          <DemoAccessLinks
            links={demoAccessLinks}
            onCreate={data => createAccessLinkMutation.mutate(data)}
            onDelete={id => deleteAccessLinkMutation.mutate(id)}
            creating={createAccessLinkMutation.isPending}
          />
        )}
        {activeTab === "button-generator" && <DemoButtonGenerator links={allPaymentLinks} />}
        {activeTab === "shop-generator" && <DemoShopGenerator links={allPaymentLinks} />}

        <div className="mt-10 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Ready to accept real ADA payments?</h2>
          <p className="text-blue-100 mb-5">Create your free PayADA account and start accepting payments in minutes.</p>
          <Button size="lg" onClick={() => base44.auth.redirectToLogin(createPageUrl("Dashboard"))} className="bg-white text-blue-700 hover:bg-blue-50 gap-2">
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}