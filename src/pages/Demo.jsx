import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Toaster } from "sonner";
import {
  ArrowRight, TrendingUp, Link2, Users, CreditCard, Plus, Copy,
  Trash2, Clock, CheckCircle2, LayoutDashboard, ShoppingBag, Zap, X
} from "lucide-react";
import { format, addHours } from "date-fns";
import { createPageUrl } from "@/utils";

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
    <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-2.5 text-center text-sm font-medium flex items-center justify-center gap-3">
      <Zap className="w-4 h-4 flex-shrink-0" />
      <span>You're in Demo Mode — Links expire after 1 hour. No account needed.</span>
      <Button size="sm" onClick={() => base44.auth.redirectToLogin(createPageUrl("Dashboard"))} className="bg-white text-blue-700 hover:bg-blue-50 h-7 text-xs font-semibold ml-2">
        Create Free Account <ArrowRight className="w-3 h-3 ml-1" />
      </Button>
    </div>
  );
}

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
              <Icon className={`w-4.5 h-4.5 ${color}`} />
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

function DemoPaymentLinks({ links, onCreate, onDelete, creating }) {
  const [form, setForm] = useState({ title: "", amount_ada: "", slug: "" });

  const PRESET_LINKS = [
    { id: "p1", title: "Event Ticket", amount_ada: 20, slug: "event-ticket", status: "active", payment_count: 14 },
    { id: "p2", title: "Donation", amount_ada: 10, slug: "donation", status: "active", payment_count: 8 },
    { id: "p3", title: "Premium Community", amount_ada: 50, slug: "premium-community", status: "active", payment_count: 6 },
    { id: "p4", title: "Product Purchase", amount_ada: 35, slug: "product-purchase", status: "active", payment_count: 4 },
  ];

  const allLinks = [...PRESET_LINKS, ...links];

  const handleCreate = () => {
    if (!form.title || !form.amount_ada) return toast.error("Please fill in title and amount");
    const slug = form.slug || form.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    onCreate({ ...form, amount_ada: parseFloat(form.amount_ada), slug, amount_mode: "fixed_ada" });
    setForm({ title: "", amount_ada: "", slug: "" });
  };

  return (
    <div className="space-y-5">
      {/* Create form */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2"><Plus className="w-4 h-4" /> Create a Payment Link</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Label className="text-xs text-slate-600 mb-1.5 block">Title</Label>
            <Input placeholder="e.g. Event Ticket" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <Label className="text-xs text-slate-600 mb-1.5 block">Amount (ADA)</Label>
            <Input type="number" placeholder="25" value={form.amount_ada} onChange={e => setForm(f => ({ ...f, amount_ada: e.target.value }))} />
          </div>
          <div className="flex items-end">
            <Button onClick={handleCreate} disabled={creating} className="w-full bg-indigo-600 hover:bg-indigo-700">
              {creating ? "Creating..." : "Create Link"}
            </Button>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-3 flex items-center gap-1"><Clock className="w-3 h-3" /> Your demo links auto-expire after 1 hour.</p>
      </Card>

      {/* Links table */}
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
                      {link.expires_at ? (
                        <>
                          <a href={`/Pay?slug=${link.slug}`} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="Open checkout">
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                          </a>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/Pay?slug=${link.slug}`); toast.success("URL copied!"); }}>
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => onDelete(link.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 italic pr-2">demo preset</span>
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

function DemoAccessLinks({ links, onCreate, onDelete, creating }) {
  const [form, setForm] = useState({ title: "", price_ada: "", platform: "discord", slug: "" });

  const PRESET_LINKS = [
    { id: "a1", title: "VIP Trading Club", price_ada: 99, platform: "discord", slug: "vip-trading-club", status: "active", payment_count: 23 },
    { id: "a2", title: "NFT Alpha Group", price_ada: 50, platform: "telegram", slug: "nft-alpha", status: "active", payment_count: 11 },
  ];

  const allLinks = [...PRESET_LINKS, ...links];

  const PLATFORM_COLORS = { discord: "bg-indigo-100 text-indigo-700", telegram: "bg-sky-100 text-sky-700", whatsapp: "bg-green-100 text-green-700", website: "bg-slate-100 text-slate-700", other: "bg-slate-100 text-slate-600" };

  const handleCreate = () => {
    if (!form.title || !form.price_ada) return toast.error("Please fill in title and price");
    const slug = form.slug || form.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    onCreate({ ...form, price_ada: parseFloat(form.price_ada), slug });
    setForm({ title: "", price_ada: "", platform: "discord", slug: "" });
  };

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2"><Plus className="w-4 h-4" /> Create an Access Link</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <Label className="text-xs text-slate-600 mb-1.5 block">Community Name</Label>
            <Input placeholder="e.g. VIP Club" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <Label className="text-xs text-slate-600 mb-1.5 block">Price (ADA)</Label>
            <Input type="number" placeholder="50" value={form.price_ada} onChange={e => setForm(f => ({ ...f, price_ada: e.target.value }))} />
          </div>
          <div>
            <Label className="text-xs text-slate-600 mb-1.5 block">Platform</Label>
            <Select value={form.platform} onValueChange={v => setForm(f => ({ ...f, platform: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="discord">Discord</SelectItem>
                <SelectItem value="telegram">Telegram</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="website">Website</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={handleCreate} disabled={creating} className="w-full bg-indigo-600 hover:bg-indigo-700">
              {creating ? "Creating..." : "Create Link"}
            </Button>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-3 flex items-center gap-1"><Clock className="w-3 h-3" /> Your demo links auto-expire after 1 hour.</p>
      </Card>

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
                    {link.expires_at ? (
                      <>
                        <a href={`/Access?slug=${link.slug}`} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Open checkout">
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </a>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/Access?slug=${link.slug}`); toast.success("URL copied!"); }}>
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => onDelete(link.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </>
                    ) : (
                      <span className="text-xs text-slate-400 italic pr-2">demo preset</span>
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

export default function Demo() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const queryClient = useQueryClient();

  // Fetch live demo payment links
  const { data: demoPaymentLinks = [] } = useQuery({
    queryKey: ["demoPaymentLinks"],
    queryFn: () => base44.entities.PaymentLink.filter({ merchant_id: DEMO_MERCHANT_ID }, "-created_date", 50),
    refetchInterval: 30000,
    select: data => data.filter(l => !l.expires_at || new Date(l.expires_at) > new Date()),
  });

  const { data: demoAccessLinks = [] } = useQuery({
    queryKey: ["demoAccessLinks"],
    queryFn: () => base44.entities.CommunityAccessLink.filter({ merchant_id: DEMO_MERCHANT_ID }, "-created_date", 50),
    refetchInterval: 30000,
    select: data => data.filter(l => !l.expires_at || new Date(l.expires_at) > new Date()),
  });

  const createPaymentLinkMutation = useMutation({
    mutationFn: async (data) => {
      const expiresAt = addHours(new Date(), 1).toISOString();
      return base44.entities.PaymentLink.create({
        ...data,
        merchant_id: DEMO_MERCHANT_ID,
        expires_at: expiresAt,
        status: "active",
        receive_address: "addr1demo_payada_demo_address",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demoPaymentLinks"] });
      queryClient.invalidateQueries({ queryKey: ["demoAccessLinks"] });
      toast.success("Payment link created! It will expire in 1 hour.");
    },
  });

  const createAccessLinkMutation = useMutation({
    mutationFn: async (data) => {
      const expiresAt = addHours(new Date(), 1).toISOString();
      return base44.entities.CommunityAccessLink.create({
        ...data,
        merchant_id: DEMO_MERCHANT_ID,
        expires_at: expiresAt,
        status: "active",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["demoPaymentLinks"] });
      queryClient.invalidateQueries({ queryKey: ["demoAccessLinks"] });
      toast.success("Access link created! It will expire in 1 hour.");
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

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-right" />
      <DemoBanner />

      {/* Nav */}
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
        <div className="flex gap-1 mb-6 bg-white border border-slate-200 rounded-xl p-1.5 w-fit">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === id ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"}`}
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

        {/* CTA Footer */}
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