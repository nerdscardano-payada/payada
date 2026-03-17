import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useProfileCheck } from "@/components/hooks/useProfileCheck";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { FlaskConical, Coins, CheckCircle, Clock, XCircle, AlertTriangle, Trash2, ExternalLink, Pencil, Shield, UserCheck, ChevronDown, ChevronUp } from "lucide-react";
import { Plus } from "lucide-react";

import { KNOWN_CNTS } from "@/components/payment-links/wizard/knownCNTs";

function StatusBadge({ status }) {
  const map = {
    confirmed: { color: "bg-emerald-100 text-emerald-700", icon: <CheckCircle className="w-3 h-3" />, label: "Confirmed" },
    detected:  { color: "bg-blue-100 text-blue-700",    icon: <Clock className="w-3 h-3" />,        label: "Detected" },
    pending:   { color: "bg-amber-100 text-amber-700",  icon: <Clock className="w-3 h-3" />,        label: "Pending" },
    expired:   { color: "bg-slate-100 text-slate-500",  icon: <XCircle className="w-3 h-3" />,      label: "Expired" },
    failed:    { color: "bg-red-100 text-red-700",      icon: <XCircle className="w-3 h-3" />,      label: "Failed" },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>
      {s.icon}{s.label}
    </span>
  );
}

const generateSlug = (title) => {
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const suffix = Math.random().toString(36).slice(2, 6);
  return `cnt-${base}-${suffix}`;
};

function CNTLinkForm({ onSuccess, merchantProfile, existingLink }) {
  const isEditing = !!existingLink;
  const queryClient = useQueryClient();
  const defaultToken = KNOWN_CNTS[0];
  const [slugLocked, setSlugLocked] = useState(true);
  const [form, setForm] = useState({
    title: existingLink?.title || "",
    slug: existingLink?.slug || "",
    cnt_ticker: existingLink?.cnt_ticker || defaultToken.ticker,
    cnt_policy_id: existingLink?.cnt_policy_id || defaultToken.policy_id,
    cnt_asset_name: existingLink?.cnt_asset_name || defaultToken.asset_name,
    cnt_decimals: existingLink?.cnt_decimals ?? 0,
    cnt_amount: existingLink?.cnt_amount || "",
    receive_address: existingLink?.receive_address || merchantProfile?.default_receive_address || "",
    confirmations_required: existingLink?.confirmations_required || 2,
    collect_email: existingLink?.collect_email || false,
    collect_name: existingLink?.collect_name || false,
    collect_shipping: existingLink?.collect_shipping || false,
  });

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setForm(f => ({
      ...f,
      title,
      // Auto-generate slug from title when creating (not editing) and slug is still locked
      ...(!isEditing && slugLocked && title ? { slug: generateSlug(title) } : {}),
    }));
  };

  const selectToken = (cnt) => {
    setForm(f => ({ ...f, cnt_ticker: cnt.ticker, cnt_policy_id: cnt.policy_id, cnt_asset_name: cnt.asset_name, cnt_decimals: cnt.decimals }));
  };

  const mutation = useMutation({
    mutationFn: (data) => isEditing
      ? base44.entities.PaymentLink.update(existingLink.id, data)
      : base44.entities.PaymentLink.create(data),
    onSuccess: () => { queryClient.invalidateQueries(["cnt-links"]); onSuccess(); },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...form,
      cnt_amount: parseFloat(form.cnt_amount),
      amount_mode: "fixed_cnt",
      is_cnt_test: true,
      status: "active",
    };
    if (!isEditing) {
      data.payment_count = 0;
      data.total_received_cnt = 0;
      data.merchant_id = merchantProfile?.user_id;
    }
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      <div className="space-y-1">
        <Label>Title</Label>
        <Input value={form.title} onChange={handleTitleChange} placeholder="e.g. CNT Ticket Test" required />
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label>Slug (URL)</Label>
          {!isEditing && (
            <button type="button" onClick={() => setSlugLocked(l => !l)}
              className="text-xs text-indigo-500 hover:underline">
              {slugLocked ? "Override manually" : "Auto-generate"}
            </button>
          )}
        </div>
        <div className="flex items-center gap-0">
          <span className="text-xs text-slate-400 bg-slate-50 border border-r-0 border-slate-200 px-3 py-2.5 rounded-l-md whitespace-nowrap">/pay/</span>
          <Input
            value={form.slug}
            onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") }))}
            className={`rounded-l-none font-mono text-xs ${slugLocked && !isEditing ? "bg-slate-50 text-slate-500" : ""}`}
            readOnly={slugLocked && !isEditing}
            placeholder="auto-generated"
            required
          />
        </div>
        {!isEditing && slugLocked && (
          <p className="text-xs text-slate-400">Slug is auto-generated with a unique suffix to prevent duplicates.</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Select Token</Label>
        <div className="flex gap-2 flex-wrap">
          {KNOWN_CNTS.map(cnt => (
            <button type="button" key={cnt.ticker}
              onClick={() => selectToken(cnt)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${form.cnt_ticker === cnt.ticker ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-700 border-slate-200 hover:border-indigo-400"}`}>
              {cnt.ticker}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Amount ({form.cnt_ticker})</Label>
          <Input type="number" value={form.cnt_amount} onChange={e => setForm(f => ({ ...f, cnt_amount: e.target.value }))} placeholder="e.g. 10000" required />
        </div>
        <div className="space-y-1">
          <Label>Receive Address</Label>
          <Input value={form.receive_address} onChange={e => setForm(f => ({ ...f, receive_address: e.target.value }))} placeholder="addr1..." required />
        </div>
      </div>

      <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
        <Label className="text-xs font-semibold text-slate-600">Collect Customer Info</Label>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-700">Email address</span>
          <Switch checked={form.collect_email} onCheckedChange={v => setForm(f => ({ ...f, collect_email: v }))} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-700">Name</span>
          <Switch checked={form.collect_name} onCheckedChange={v => setForm(f => ({ ...f, collect_name: v }))} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-700">Shipping address</span>
          <Switch checked={form.collect_shipping} onCheckedChange={v => setForm(f => ({ ...f, collect_shipping: v }))} />
        </div>
      </div>

      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2 text-sm text-amber-800">
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>This is an admin-only test link. Not visible to regular merchants.</span>
      </div>

      <Button type="submit" disabled={mutation.isPending} className="w-full">
        {mutation.isPending ? (isEditing ? "Saving..." : "Creating...") : (isEditing ? "Save Changes" : "Create CNT Test Link")}
      </Button>
    </form>
  );
}

export default function AdminCNTLab() {
  const { isProfileComplete } = useProfileCheck();
  const [showForm, setShowForm] = useState(false);
  const [editingLink, setEditingLink] = useState(null);

  if (!isProfileComplete) return null;

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

  const { data: cntLinks = [], isLoading: loadingLinks } = useQuery({
    queryKey: ["cnt-links"],
    queryFn: () => base44.entities.PaymentLink.filter({ is_cnt_test: true }),
  });

  const { data: cntPayments = [], isLoading: loadingPayments } = useQuery({
    queryKey: ["cnt-payments"],
    queryFn: () => base44.entities.Payment.filter({ payment_type: "cnt" }),
  });

  const { data: allMerchants = [], isLoading: loadingMerchants } = useQuery({
    queryKey: ["all-merchants"],
    queryFn: () => base44.entities.MerchantProfile.list(),
  });

  const [expandedMerchant, setExpandedMerchant] = useState(null);
  const [addingToken, setAddingToken] = useState({}); // merchantId -> selected ticker

  const updateMerchantWhitelistMutation = useMutation({
    mutationFn: ({ profileId, tokens }) => base44.entities.MerchantProfile.update(profileId, { whitelisted_cnt_tokens: tokens }),
    onSuccess: () => queryClient.invalidateQueries(["all-merchants"]),
  });

  const queryClient = useQueryClient();

  const deleteLinkMutation = useMutation({
    mutationFn: (id) => base44.entities.PaymentLink.delete(id),
    onSuccess: () => queryClient.invalidateQueries(["cnt-links"]),
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">CNT Lab <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold ml-2">ADMIN ONLY</span></h1>
            <p className="text-slate-500 text-sm">Test Cardano Native Token payments — not visible to users</p>
          </div>
        </div>
        <Button onClick={() => { setShowForm(!showForm); setEditingLink(null); }} className="gap-2">
          <Plus className="w-4 h-4" />
          New CNT Test Link
        </Button>
      </div>

      {/* New / Edit link form */}
      {(showForm || editingLink) && (
        <Card className="border-indigo-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Coins className="w-4 h-4 text-indigo-500" />
              {editingLink ? "Edit CNT Payment Link" : "Create New CNT Payment Link"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CNTLinkForm
              key={editingLink?.id || "new"}
              existingLink={editingLink}
              onSuccess={() => { setShowForm(false); setEditingLink(null); }}
              merchantProfile={merchantProfile}
            />
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="links">
        <TabsList>
          <TabsTrigger value="links">CNT Test Links ({cntLinks.length})</TabsTrigger>
          <TabsTrigger value="payments">CNT Payments ({cntPayments.length})</TabsTrigger>
          <TabsTrigger value="tokens">Token Whitelist</TabsTrigger>
        </TabsList>

        {/* CNT Links Tab */}
        <TabsContent value="links" className="mt-4 space-y-3">
          {loadingLinks ? (
            <div className="space-y-3">{[...Array(2)].map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />)}</div>
          ) : cntLinks.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-10 text-center text-slate-400">
                <FlaskConical className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>No CNT test links created yet.</p>
              </CardContent>
            </Card>
          ) : (
            cntLinks.map(link => (
              <Card key={link.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-900">{link.title}</span>
                      <Badge className="bg-purple-100 text-purple-700 text-xs">{link.cnt_ticker}</Badge>
                      <Badge className="bg-amber-100 text-amber-700 text-xs">TEST</Badge>
                    </div>
                    <p className="text-sm text-slate-500">
                      {link.cnt_amount?.toLocaleString()} {link.cnt_ticker} · slug: <code className="bg-slate-100 px-1 rounded">{link.slug}</code>
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono truncate">Policy: {link.cnt_policy_id}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right text-sm">
                      <p className="text-slate-500">{link.payment_count || 0} payments</p>
                      <p className="text-slate-400">{link.total_received_cnt || 0} {link.cnt_ticker} received</p>
                    </div>
                    <Button
                      size="sm"
                      className="gap-1.5 bg-indigo-600 hover:bg-indigo-700"
                      onClick={() => window.open(`/Pay?slug=${link.slug}`, "_blank")}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Test
                    </Button>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      onClick={() => { setEditingLink(link); setShowForm(false); window.scrollTo(0, 0); }}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => deleteLinkMutation.mutate(link.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* CNT Payments Tab */}
        <TabsContent value="payments" className="mt-4 space-y-3">
          {loadingPayments ? (
            <div className="space-y-3">{[...Array(2)].map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />)}</div>
          ) : cntPayments.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-10 text-center text-slate-400">
                <Coins className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>No CNT test payments received yet.</p>
              </CardContent>
            </Card>
          ) : (
            cntPayments.map(payment => (
              <Card key={payment.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={payment.status} />
                      <Badge className="bg-purple-100 text-purple-700 text-xs">{payment.cnt_ticker}</Badge>
                    </div>
                    <p className="text-sm text-slate-700">
                      Expected: <strong>{(payment.expected_amount_cnt / Math.pow(10, payment.cnt_decimals || 0))?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: payment.cnt_decimals || 0 })}</strong> ·
                      Received: <strong>{(payment.received_amount_cnt / Math.pow(10, payment.cnt_decimals || 0))?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: payment.cnt_decimals || 0 }) || "—"}</strong>
                    </p>
                    {payment.tx_hash && (
                      <a href={`https://cardanoscan.io/transaction/${payment.tx_hash}`} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-indigo-500 hover:underline font-mono">
                        {payment.tx_hash.slice(0, 20)}...
                      </a>
                    )}
                  </div>
                  <div className="text-right text-sm text-slate-500">
                    <p>{payment.confirmations || 0} confirmations</p>
                    {payment.payer_address && <p className="font-mono text-xs text-slate-400">{payment.payer_address.slice(0, 16)}...</p>}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Token Whitelist Tab */}
        <TabsContent value="tokens" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Known CNT Tokens</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {KNOWN_CNTS.map(cnt => (
                  <div key={cnt.ticker} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <span className="font-semibold text-slate-900">{cnt.ticker}</span>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{cnt.policy_id}</p>
                      <p className="text-xs text-slate-400 font-mono">Asset: {cnt.asset_name}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-4">More tokens can be added after the testing phase.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}