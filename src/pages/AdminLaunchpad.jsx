import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Rocket, Plus, Trash2, ExternalLink, Pencil, AlertTriangle, TrendingUp, Clock, CheckCircle, PauseCircle, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";

const KNOWN_CNTS = [
  { ticker: "$NIGHT",  policy_id: "0691b2fecca1ac4f53cb6dfb00b7013e561d1f34403b957cbb5af1fa", asset_name: "4e49474854", decimals: 0 },
  { ticker: "$IAG",    policy_id: "5d16cc1a177b5d9ba9cfa9793b07e60f1fb70fea1f8aef064415d114", asset_name: "494147", decimals: 6 },
  { ticker: "USDM",   policy_id: "c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad", asset_name: "0014df105553444d", decimals: 6 },
  { ticker: "USDCx",  policy_id: "1f3aec8bfe7ea4fe14c5f121e2a92e301afe414147860d557cac7e34", asset_name: "5553444378", decimals: 6 },
  { ticker: "$MIN",    policy_id: "29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6", asset_name: "4d494e", decimals: 6 },
  { ticker: "$INDY",   policy_id: "533bb94a8850ee3ccbe483106489399112b74c905342cb1792a797a0", asset_name: "494e4459", decimals: 6 },
];

const ACCEPTED_CURRENCY_OPTIONS = ["ADA", "$IAG", "$NIGHT", "USDM", "USDCx", "$MIN", "$INDY"];

const generateSlug = (title) => {
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const suffix = Math.random().toString(36).slice(2, 6);
  return `sale-${base}-${suffix}`;
};

function StatusBadge({ status }) {
  const map = {
    draft:   { color: "bg-slate-100 text-slate-600", icon: <PauseCircle className="w-3 h-3" />, label: "Draft" },
    active:  { color: "bg-emerald-100 text-emerald-700", icon: <CheckCircle className="w-3 h-3" />, label: "Active" },
    paused:  { color: "bg-amber-100 text-amber-700", icon: <PauseCircle className="w-3 h-3" />, label: "Paused" },
    ended:   { color: "bg-red-100 text-red-600", icon: <Clock className="w-3 h-3" />, label: "Ended" },
  };
  const s = map[status] || map.draft;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>
      {s.icon}{s.label}
    </span>
  );
}

function SaleForm({ onSuccess, merchantProfile, existingSale }) {
  const isEditing = !!existingSale;
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: existingSale?.title || "",
    slug: existingSale?.slug || "",
    description: existingSale?.description || "",
    website_url: existingSale?.website_url || "",
    token_ticker: existingSale?.token_ticker || "",
    token_policy_id: existingSale?.token_policy_id || "",
    token_asset_name: existingSale?.token_asset_name || "",
    token_decimals: existingSale?.token_decimals ?? 0,
    token_price_ada: existingSale?.token_price_ada || "",
    max_raise_ada: existingSale?.max_raise_ada || "",
    min_buy_ada: existingSale?.min_buy_ada || 50,
    max_buy_ada: existingSale?.max_buy_ada || "",
    receive_address: existingSale?.receive_address || merchantProfile?.default_receive_address || "",
    start_time: existingSale?.start_time ? existingSale.start_time.slice(0, 16) : "",
    end_time: existingSale?.end_time ? existingSale.end_time.slice(0, 16) : "",
    accepted_currencies: existingSale?.accepted_currencies || ["ADA"],
    fee_model: existingSale?.fee_model || "merchant_pays",
    status: existingSale?.status || "draft",
  });
  const [slugLocked, setSlugLocked] = useState(true);

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setForm(f => ({
      ...f,
      title,
      ...(!isEditing && slugLocked && title ? { slug: generateSlug(title) } : {}),
    }));
  };

  const toggleCurrency = (currency) => {
    setForm(f => ({
      ...f,
      accepted_currencies: f.accepted_currencies.includes(currency)
        ? f.accepted_currencies.filter(c => c !== currency)
        : [...f.accepted_currencies, currency],
    }));
  };

  const selectKnownToken = (cnt) => {
    setForm(f => ({ ...f, token_ticker: cnt.ticker, token_policy_id: cnt.policy_id, token_asset_name: cnt.asset_name, token_decimals: cnt.decimals }));
  };

  const mutation = useMutation({
    mutationFn: (data) => isEditing
      ? base44.entities.TokenSale.update(existingSale.id, data)
      : base44.entities.TokenSale.create(data),
    onSuccess: () => { queryClient.invalidateQueries(["token-sales"]); onSuccess(); },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...form,
      fee_model: form.fee_model || "merchant_pays",
      token_price_ada: parseFloat(form.token_price_ada),
      max_raise_ada: parseFloat(form.max_raise_ada),
      min_buy_ada: parseFloat(form.min_buy_ada),
      max_buy_ada: form.max_buy_ada ? parseFloat(form.max_buy_ada) : null,
      token_decimals: parseInt(form.token_decimals),
      is_admin_test: true,
      merchant_id: merchantProfile?.user_id,
    };
    if (!isEditing) {
      data.total_raised_ada = 0;
      data.tokens_sold = 0;
    }
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Basic Info */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">Sale Info</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Sale Title</Label>
            <Input value={form.title} onChange={handleTitleChange} placeholder="e.g. PayADA Token Sale" required />
          </div>
          <div className="space-y-1">
            <Label>Website URL</Label>
            <Input value={form.website_url} onChange={e => setForm(f => ({ ...f, website_url: e.target.value }))} placeholder="https://yourproject.io" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label>Slug (URL)</Label>
            {!isEditing && (
              <button type="button" onClick={() => setSlugLocked(l => !l)} className="text-xs text-indigo-500 hover:underline">
                {slugLocked ? "Override manually" : "Auto-generate"}
              </button>
            )}
          </div>
          <div className="flex items-center">
            <span className="text-xs text-slate-400 bg-slate-50 border border-r-0 border-slate-200 px-3 py-2.5 rounded-l-md whitespace-nowrap">/sale/</span>
            <Input
              value={form.slug}
              onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }))}
              className={`rounded-l-none font-mono text-xs ${slugLocked && !isEditing ? "bg-slate-50 text-slate-500" : ""}`}
              readOnly={slugLocked && !isEditing}
              placeholder="auto-generated"
              required
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label>Description</Label>
          <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the token and its utility..." rows={3} />
        </div>
      </div>

      {/* Token Config */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">Token Configuration</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Token Ticker</Label>
            <Input value={form.token_ticker} onChange={e => setForm(f => ({ ...f, token_ticker: e.target.value }))} placeholder="e.g. $ATLAS" required />
          </div>
          <div className="space-y-1">
            <Label>Decimals</Label>
            <Input type="number" value={form.token_decimals} onChange={e => setForm(f => ({ ...f, token_decimals: e.target.value }))} placeholder="0" />
          </div>
        </div>
        <div className="space-y-1">
          <Label>Policy ID</Label>
          <Input value={form.token_policy_id} onChange={e => setForm(f => ({ ...f, token_policy_id: e.target.value }))} placeholder="9ff9a1b456f074e03..." className="font-mono text-xs" required />
        </div>
        <div className="space-y-1">
          <Label>Asset Name (hex)</Label>
          <Input value={form.token_asset_name} onChange={e => setForm(f => ({ ...f, token_asset_name: e.target.value }))} placeholder="41544c4153..." className="font-mono text-xs" />
        </div>
      </div>

      {/* Sale Parameters */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">Sale Parameters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Token Price (ADA)</Label>
            <Input type="number" step="any" value={form.token_price_ada} onChange={e => setForm(f => ({ ...f, token_price_ada: e.target.value }))} placeholder="e.g. 0.167" required />
          </div>
          <div className="space-y-1">
            <Label>Max Raise (ADA)</Label>
            <Input type="number" value={form.max_raise_ada} onChange={e => setForm(f => ({ ...f, max_raise_ada: e.target.value }))} placeholder="e.g. 3000000" required />
          </div>
          <div className="space-y-1">
            <Label>Min Buy (ADA)</Label>
            <Input type="number" value={form.min_buy_ada} onChange={e => setForm(f => ({ ...f, min_buy_ada: e.target.value }))} placeholder="50" />
          </div>
          <div className="space-y-1">
            <Label>Max Buy (ADA) — optional</Label>
            <Input type="number" value={form.max_buy_ada} onChange={e => setForm(f => ({ ...f, max_buy_ada: e.target.value }))} placeholder="No limit" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Start Time</Label>
            <Input type="datetime-local" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <Label>End Time</Label>
            <Input type="datetime-local" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} />
          </div>
        </div>
        <div className="space-y-1">
          <Label>Receive Address</Label>
          <Input value={form.receive_address} onChange={e => setForm(f => ({ ...f, receive_address: e.target.value }))} placeholder="addr1..." required />
        </div>
      </div>

      {/* Accepted Currencies */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">Accepted Currencies</h3>
        <div className="flex gap-2 flex-wrap">
          {ACCEPTED_CURRENCY_OPTIONS.map(c => (
            <button type="button" key={c}
              onClick={() => toggleCurrency(c)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${form.accepted_currencies.includes(c) ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-700 border-slate-200 hover:border-emerald-400"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Fee Model */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-700 border-b border-slate-100 pb-2">Platform Fee (1.75%)</h3>
        <div className="flex gap-2 flex-wrap">
          {[
            { value: "merchant_pays", label: "Merchant pays", desc: "Fee deducted from received amount" },
            { value: "customer_pays", label: "Customer pays", desc: "Fee added on top of purchase amount" },
            { value: "split", label: "Split 50/50", desc: "Half from merchant, half from customer" },
          ].map(opt => (
            <button type="button" key={opt.value}
              onClick={() => setForm(f => ({ ...f, fee_model: opt.value }))}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all text-left ${form.fee_model === opt.value ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-700 border-slate-200 hover:border-indigo-400"}`}>
              <div>{opt.label}</div>
              <div className={`text-xs mt-0.5 ${form.fee_model === opt.value ? "text-indigo-200" : "text-slate-400"}`}>{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="space-y-1">
        <Label>Status</Label>
        <div className="flex gap-2">
          {["draft", "active", "paused", "ended"].map(s => (
            <button type="button" key={s}
              onClick={() => setForm(f => ({ ...f, status: s }))}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border capitalize transition-all ${form.status === s ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-700 border-slate-200 hover:border-indigo-400"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2 text-sm text-amber-800">
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>Admin-only feature. Token distribution logic (sending tokens after payment) requires additional backend integration.</span>
      </div>

      <Button type="submit" disabled={mutation.isPending} className="w-full">
        {mutation.isPending ? (isEditing ? "Saving..." : "Creating...") : (isEditing ? "Save Changes" : "Create Token Sale")}
      </Button>
    </form>
  );
}

// Fix: existingLink was undefined, should be existingSale
function SaleFormFixed({ onSuccess, merchantProfile, existingsale }) {
  return <SaleForm onSuccess={onSuccess} merchantProfile={merchantProfile} existingSale={existingsale} />;
}

export default function AdminLaunchpad() {
  const [showForm, setShowForm] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => base44.auth.me(),
  });

  const { data: merchantProfile } = useQuery({
    queryKey: ["merchant-profile"],
    queryFn: () => base44.entities.MerchantProfile.filter({ user_id: user?.email }),
    enabled: !!user,
    select: d => d[0],
  });

  const { data: sales = [], isLoading } = useQuery({
    queryKey: ["token-sales"],
    queryFn: () => base44.entities.TokenSale.list("-created_date"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.TokenSale.delete(id),
    onSuccess: () => queryClient.invalidateQueries(["token-sales"]),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.TokenSale.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries(["token-sales"]),
  });

  if (!user || user.role !== "admin") {
    return (
      <div className="p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-900">Access Denied</h2>
          <p className="text-red-800 mt-2">You need admin rights to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Launchpad Lab
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold ml-2">ADMIN ONLY</span>
            </h1>
            <p className="text-slate-500 text-sm">Token sale / presale page generator — prototype phase</p>
          </div>
        </div>
        <Button onClick={() => { setShowForm(!showForm); setEditingSale(null); }} className="gap-2">
          <Plus className="w-4 h-4" />
          New Token Sale
        </Button>
      </div>

      {/* Form */}
      {(showForm || editingSale) && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Rocket className="w-4 h-4 text-blue-500" />
              {editingSale ? "Edit Token Sale" : "Create Token Sale"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SaleForm
              key={editingSale?.id || "new"}
              existingSale={editingSale}
              onSuccess={() => { setShowForm(false); setEditingSale(null); }}
              merchantProfile={merchantProfile}
            />
          </CardContent>
        </Card>
      )}

      {/* Sales List */}
      <Tabs defaultValue="sales">
        <TabsList>
          <TabsTrigger value="sales">Token Sales ({sales.length})</TabsTrigger>
          <TabsTrigger value="info">About this Feature</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="mt-4 space-y-3">
          {isLoading ? (
            <div className="space-y-3">{[...Array(2)].map((_, i) => <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />)}</div>
          ) : sales.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-slate-400">
                <Rocket className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No token sales created yet.</p>
                <p className="text-sm mt-1">Click "New Token Sale" to get started.</p>
              </CardContent>
            </Card>
          ) : (
            sales.map(sale => {
              const progressPct = sale.max_raise_ada ? Math.min(100, ((sale.total_raised_ada || 0) / sale.max_raise_ada) * 100) : 0;
              return (
                <Card key={sale.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-semibold text-slate-900">{sale.title}</span>
                          <Badge className="bg-blue-100 text-blue-700 text-xs">{sale.token_ticker}</Badge>
                          <StatusBadge status={sale.status} />
                        </div>
                        <p className="text-xs text-slate-500 font-mono mb-2 truncate">Policy: {sale.token_policy_id}</p>
                        {/* Progress bar */}
                        <div className="w-full max-w-sm">
                          <div className="flex justify-between text-xs text-slate-500 mb-1">
                            <span>₳{(sale.total_raised_ada || 0).toLocaleString()} raised</span>
                            <span>Max ₳{(sale.max_raise_ada || 0).toLocaleString()}</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                          </div>
                        </div>
                        <div className="flex gap-3 mt-2 text-xs text-slate-400">
                          <span>Min buy: ₳{sale.min_buy_ada}</span>
                          <span>Price: ₳{sale.token_price_ada} / token</span>
                          {sale.accepted_currencies?.length > 0 && (
                            <span>Accepts: {sale.accepted_currencies.join(", ")}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {sale.status === "draft" && (
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs gap-1"
                            onClick={() => updateStatusMutation.mutate({ id: sale.id, status: "active" })}>
                            <TrendingUp className="w-3.5 h-3.5" /> Activate
                          </Button>
                        )}
                        {sale.status === "active" && (
                          <Button size="sm" variant="outline" className="text-xs gap-1"
                            onClick={() => updateStatusMutation.mutate({ id: sale.id, status: "paused" })}>
                            <PauseCircle className="w-3.5 h-3.5" /> Pause
                          </Button>
                        )}
                        <Link to={`/TokenSaleDashboard?id=${sale.id}`}>
                          <Button size="sm" variant="outline" className="gap-1 text-xs">
                            <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                          </Button>
                        </Link>
                        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 gap-1"
                          onClick={() => window.open(`/TokenSale?slug=${sale.slug}`, "_blank")}>
                          <ExternalLink className="w-3.5 h-3.5" /> Preview
                        </Button>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-700"
                          onClick={() => { setEditingSale(sale); setShowForm(false); window.scrollTo(0, 0); }}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600 hover:bg-red-50"
                          onClick={() => deleteMutation.mutate(sale.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="info" className="mt-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-blue-700">
                <Rocket className="w-5 h-5" />
                <h3 className="font-semibold text-lg">Launchpad — Prototype Phase</h3>
              </div>
              <div className="space-y-3 text-sm text-slate-600">
                <p>This is the admin prototype for a <strong>Token Sale / Presale Generator</strong> for Cardano projects.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  {[
                    { title: "✅ Implemented", items: ["Sale configuration (token, price, limits)", "Accepted currencies selection", "Progress tracking (raised/max)", "Status management (draft/active/paused/ended)", "Sale preview page"] },
                    { title: "🔜 Needs Backend", items: ["Wallet connect + payment processing", "Automatic token distribution after payment", "Countdown timer on public page", "Multi-currency conversion rates", "Whitelist / KYC gating"] },
                  ].map(section => (
                    <div key={section.title} className="p-4 bg-slate-50 rounded-lg">
                      <p className="font-semibold text-slate-700 mb-2">{section.title}</p>
                      <ul className="space-y-1">
                        {section.items.map(item => <li key={item} className="text-xs text-slate-500">{item}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}