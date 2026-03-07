import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlaskConical, Coins, Plus, CheckCircle, Clock, XCircle, AlertTriangle, Trash2 } from "lucide-react";

const KNOWN_CNTS = [
  { ticker: "$Snek", policy_id: "279c909f348e533da5808898f87f9a14bb2c3dfbbacccd631d927a3", asset_name: "534e454b", decimals: 0 },
  { ticker: "$NIGHT", policy_id: "9b426921a21f54600711da0be1a12b026703a9bd8eb9848d08c9d921", asset_name: "4e49474854", decimals: 0 },
  { ticker: "$HOSKY", policy_id: "a0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481ef0", asset_name: "484f534b59", decimals: 0 },
];

function StatusBadge({ status }) {
  const map = {
    confirmed: { color: "bg-emerald-100 text-emerald-700", icon: <CheckCircle className="w-3 h-3" />, label: "Bevestigd" },
    detected:  { color: "bg-blue-100 text-blue-700",    icon: <Clock className="w-3 h-3" />,        label: "Gedetecteerd" },
    pending:   { color: "bg-amber-100 text-amber-700",  icon: <Clock className="w-3 h-3" />,        label: "In afwachting" },
    expired:   { color: "bg-slate-100 text-slate-500",  icon: <XCircle className="w-3 h-3" />,      label: "Verlopen" },
    failed:    { color: "bg-red-100 text-red-700",      icon: <XCircle className="w-3 h-3" />,      label: "Mislukt" },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>
      {s.icon}{s.label}
    </span>
  );
}

function NewCNTLinkForm({ onSuccess, merchantProfile }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: "",
    slug: "",
    cnt_ticker: "$Snek",
    cnt_policy_id: KNOWN_CNTS[0].policy_id,
    cnt_asset_name: KNOWN_CNTS[0].asset_name,
    cnt_decimals: 0,
    cnt_amount: "",
    receive_address: merchantProfile?.default_receive_address || "",
    confirmations_required: 2,
  });

  const selectToken = (cnt) => {
    setForm(f => ({ ...f, cnt_ticker: cnt.ticker, cnt_policy_id: cnt.policy_id, cnt_asset_name: cnt.asset_name, cnt_decimals: cnt.decimals }));
  };

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.PaymentLink.create(data),
    onSuccess: () => { queryClient.invalidateQueries(["cnt-links"]); onSuccess(); },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      ...form,
      cnt_amount: parseFloat(form.cnt_amount),
      amount_mode: "fixed_cnt",
      is_cnt_test: true,
      status: "active",
      payment_count: 0,
      total_received_cnt: 0,
      merchant_id: merchantProfile?.user_id,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Titel</Label>
          <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="bv. CNT Ticket Test" required />
        </div>
        <div className="space-y-1">
          <Label>Slug (URL)</Label>
          <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }))} placeholder="bv. cnt-ticket-test" required />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Token selecteren</Label>
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
          <Label>Bedrag ({form.cnt_ticker})</Label>
          <Input type="number" value={form.cnt_amount} onChange={e => setForm(f => ({ ...f, cnt_amount: e.target.value }))} placeholder="bv. 10000" required />
        </div>
        <div className="space-y-1">
          <Label>Ontvangstadres</Label>
          <Input value={form.receive_address} onChange={e => setForm(f => ({ ...f, receive_address: e.target.value }))} placeholder="addr1..." required />
        </div>
      </div>

      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2 text-sm text-amber-800">
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>Dit is een admin-only testlink. Niet zichtbaar voor gewone merchants.</span>
      </div>

      <Button type="submit" disabled={mutation.isPending} className="w-full">
        {mutation.isPending ? "Aanmaken..." : "CNT Testlink aanmaken"}
      </Button>
    </form>
  );
}

export default function AdminCNTLab() {
  const [showForm, setShowForm] = useState(false);

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
    queryFn: () => base44.entities.Payment.filter({ is_cnt_test: true }),
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
          <h2 className="text-lg font-semibold text-red-900">Toegang geweigerd</h2>
          <p className="text-red-800 mt-2">Je hebt adminrechten nodig voor deze pagina.</p>
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
            <p className="text-slate-500 text-sm">Test Cardano Native Token betalingen — niet zichtbaar voor gebruikers</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          Nieuwe CNT Testlink
        </Button>
      </div>

      {/* New link form */}
      {showForm && (
        <Card className="border-indigo-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Coins className="w-4 h-4 text-indigo-500" />
              Nieuwe CNT Betaallink aanmaken
            </CardTitle>
          </CardHeader>
          <CardContent>
            <NewCNTLinkForm onSuccess={() => setShowForm(false)} merchantProfile={merchantProfile} />
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="links">
        <TabsList>
          <TabsTrigger value="links">CNT Testlinks ({cntLinks.length})</TabsTrigger>
          <TabsTrigger value="payments">CNT Betalingen ({cntPayments.length})</TabsTrigger>
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
                <p>Nog geen CNT testlinks aangemaakt.</p>
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
                      <p className="text-slate-500">{link.payment_count || 0} betalingen</p>
                      <p className="text-slate-400">{link.total_received_cnt || 0} {link.cnt_ticker} ontvangen</p>
                    </div>
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
                <p>Nog geen CNT testbetalingen ontvangen.</p>
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
                      Verwacht: <strong>{payment.expected_amount_cnt?.toLocaleString()}</strong> ·
                      Ontvangen: <strong>{payment.received_amount_cnt?.toLocaleString() || "—"}</strong>
                    </p>
                    {payment.tx_hash && (
                      <a href={`https://cardanoscan.io/transaction/${payment.tx_hash}`} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-indigo-500 hover:underline font-mono">
                        {payment.tx_hash.slice(0, 20)}...
                      </a>
                    )}
                  </div>
                  <div className="text-right text-sm text-slate-500">
                    <p>{payment.confirmations || 0} bevestigingen</p>
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
              <CardTitle className="text-base">Gekende CNT Tokens</CardTitle>
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
                    <Badge className="bg-green-100 text-green-700">Actief</Badge>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-4">Meer tokens kunnen worden toegevoegd na testfase.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}