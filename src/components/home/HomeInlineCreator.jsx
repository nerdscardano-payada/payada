import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Coins, Link2, LockKeyhole, Wallet, Sparkles, ArrowRight, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import WalletConnect from "@/components/checkout/WalletConnect";
import FeeSelector from "@/components/payment-links/FeeSelector";
import { KNOWN_CNTS } from "@/components/payment-links/wizard/knownCNTs";
import { toast } from "sonner";

export default function HomeInlineCreator({ onWalletConnected }) {
  const navigate = useNavigate();
  const [type, setType] = React.useState("payment");
  const [currency, setCurrency] = React.useState("ADA");
  const [submitting, setSubmitting] = React.useState(false);
  const [form, setForm] = React.useState({
    title: "",
    amount: "",
    receive_address: "",
    access_url: "",
    redirect_url: "",
  });
  const [feePreview, setFeePreview] = React.useState({ fee_model: "customer_pays", fee_split_ratio: 0.5 });
  const [selectedCntKey, setSelectedCntKey] = React.useState("");

  useEffect(() => {
    const savedAddress = localStorage.getItem("payada_connected_wallet_address");
    if (savedAddress) {
      setForm((prev) => ({ ...prev, receive_address: prev.receive_address || savedAddress }));
    }
  }, []);

  const updateForm = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleCntSelect = (value) => {
    setSelectedCntKey(value);
  };

  const selectedCnt = KNOWN_CNTS.find((cnt) => `${cnt.policy_id}:${cnt.asset_name}` === selectedCntKey);

  const normalizeSlug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  const buildUniqueSlug = () => {
    const base = normalizeSlug(form.title || (type === "payment" ? "payment-link" : "access-link")) || (type === "payment" ? "payment-link" : "access-link");
    return `${base}-${Date.now().toString().slice(-6)}`;
  };

  const handleGenerate = async () => {
    if (!form.title.trim()) {
      toast.error(type === "payment" ? "Voer in waarvoor de betaling is." : "Voer in wat mensen ontgrendelen.");
      return;
    }
    if (!form.amount || Number(form.amount) <= 0) {
      toast.error("Voer een geldig bedrag in.");
      return;
    }
    if (currency === "CNT" && !selectedCntKey) {
      toast.error("Kies een CNT uit de lijst.");
      return;
    }
    if (!form.receive_address.trim()) {
      toast.error("Voer een Cardano adres in.");
      return;
    }
    if (type === "access" && !form.access_url.trim()) {
      toast.error("Voer een access URL in.");
      return;
    }

    setSubmitting(true);
    try {
      const slug = buildUniqueSlug();

      if (type === "payment") {
        await base44.entities.PaymentLink.create({
          merchant_id: "public_homepage",
          slug,
          title: form.title,
          description: "Created from public homepage flow",
          amount_mode: currency === "ADA" ? "fixed_ada" : "fixed_cnt",
          amount_ada: currency === "ADA" ? Number(form.amount) : null,
          cnt_amount: currency === "CNT" ? Number(form.amount) : null,
          cnt_ticker: currency === "CNT" ? selectedCnt?.ticker || null : null,
          cnt_policy_id: currency === "CNT" ? selectedCnt?.policy_id || null : null,
          cnt_asset_name: currency === "CNT" ? selectedCnt?.asset_name || null : null,
          cnt_decimals: currency === "CNT" ? selectedCnt?.decimals ?? null : null,
          fee_model: feePreview.fee_model,
          fee_split_ratio: feePreview.fee_split_ratio,
          success_redirect_url: form.redirect_url || null,
          receive_address: form.receive_address,
          status: "active",
          collect_email: false,
          collect_name: false,
          collect_shipping: false,
        });
        navigate(`/Pay?slug=${encodeURIComponent(slug)}`);
        return;
      }

      await base44.entities.CommunityAccessLink.create({
        merchant_id: "public_homepage",
        slug,
        title: form.title,
        description: "Created from public homepage flow",
        payment_type: currency === "ADA" ? "ada" : "cnt",
        price_ada: currency === "ADA" ? Number(form.amount) : 0,
        cnt_amount: currency === "CNT" ? Number(form.amount) : null,
        cnt_ticker: currency === "CNT" ? selectedCnt?.ticker || null : null,
        cnt_policy_id: currency === "CNT" ? selectedCnt?.policy_id || null : null,
        cnt_asset_name: currency === "CNT" ? selectedCnt?.asset_name || null : null,
        cnt_decimals: currency === "CNT" ? selectedCnt?.decimals ?? null : null,
        fee_model: feePreview.fee_model,
        platform: "website",
        invite_link: form.access_url,
        receive_address: form.receive_address,
        status: "active",
      });
      navigate(`/Access?slug=${encodeURIComponent(slug)}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="max-w-3xl space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-background/80 text-muted-foreground text-xs sm:text-sm">
          <Sparkles className="w-3.5 h-3.5" />
          Cardano payment links and access flows
        </div>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.02] text-left text-foreground">
          Simple Cardano payments,<br />
          built to feel clear and trustworthy.
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed text-left">
          Create payment links for ADA and native tokens, share access links, and give people a cleaner way to pay or unlock content.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-4xl">
        <div className="rounded-2xl border border-border bg-background/70 px-4 py-3 text-left backdrop-blur-sm">
          <div className="flex items-center gap-2 text-foreground font-medium text-sm"><Coins className="w-4 h-4 text-primary" /> ADA + native tokens</div>
          <p className="text-sm text-muted-foreground mt-1">Made for Cardano wallets, shareable links, and straightforward payments.</p>
        </div>
        <div className="rounded-2xl border border-border bg-background/70 px-4 py-3 text-left backdrop-blur-sm">
          <div className="flex items-center gap-2 text-foreground font-medium text-sm"><LockKeyhole className="w-4 h-4 text-primary" /> Access when needed</div>
          <p className="text-sm text-muted-foreground mt-1">Protect pages or resources and send people exactly where they need to go.</p>
        </div>
        <div className="rounded-2xl border border-border bg-background/70 px-4 py-3 text-left backdrop-blur-sm">
          <div className="flex items-center gap-2 text-foreground font-medium text-sm"><ArrowRight className="w-4 h-4 text-primary" /> Easy to launch</div>
          <p className="text-sm text-muted-foreground mt-1">Start from the homepage without adding extra steps for visitors.</p>
        </div>
      </div>

      <div className="max-w-4xl">
        <div className="flex rounded-xl border border-sky-400/30 bg-card/50 p-1 mb-4">
          <button
            type="button"
            onClick={() => setType("payment")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${type === "payment" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
          >
            💳 Payment Link
          </button>
          <button
            type="button"
            onClick={() => setType("access")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${type === "access" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
          >
            🔐 Access Link
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="rounded-2xl border border-sky-400/30 bg-card/60 p-5 space-y-4">
            <div>
              <p className="text-sm font-semibold">Wallet connect</p>
              <p className="text-sm text-muted-foreground">Use your Cardano wallet without logging in.</p>
            </div>
            <div className="mt-5">
              <WalletConnect onConnected={({ address, ...walletData }) => {
                updateForm("receive_address", address || "");
                onWalletConnected?.({ address, ...walletData });
              }} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-border bg-background/70 p-4 space-y-3 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Wallet className="w-5 h-5 text-primary" /></div>
              <div>
                <h3 className="font-medium">Autofill wallet</h3>
                <p className="text-sm text-muted-foreground mt-1">Use your connected wallet address directly in your links.</p>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-background/70 p-4 space-y-3 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><History className="w-5 h-5 text-primary" /></div>
              <div>
                <h3 className="font-medium">Recent links</h3>
                <p className="text-sm text-muted-foreground mt-1">See the latest links created in this browser right away.</p>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-background/70 p-4 space-y-3 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Link2 className="w-5 h-5 text-primary" /></div>
              <div>
                <h3 className="font-medium">Frictionless flow</h3>
                <p className="text-sm text-muted-foreground mt-1">Create links on the homepage, and only log in for the dashboard and tracking.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-5 shadow-sm">
          <div>
            <p className="text-sm text-muted-foreground">Launch flow</p>
            <h2 className="text-2xl font-semibold text-foreground mt-1">
              {type === "payment" ? "Create a payment link" : "Create an access link"}
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>{type === "payment" ? "What's this payment for?" : "What are people unlocking?"}</Label>
              <Input value={form.title} onChange={(e) => updateForm("title", e.target.value)} placeholder={type === "payment" ? "Premium membership" : "Private Discord access"} className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>{currency === "ADA" ? "Amount (ADA)" : `Amount (${selectedCnt?.ticker || "Token"})`}</Label>
              <Input type="number" value={form.amount} onChange={(e) => updateForm("amount", e.target.value)} placeholder={currency === "ADA" ? "10" : "50"} className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Your Cardano address</Label>
              <Input value={form.receive_address} onChange={(e) => updateForm("receive_address", e.target.value)} placeholder="addr1..." className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Payment token</Label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setCurrency("ADA")} className={`h-12 rounded-xl border text-sm font-medium ${currency === "ADA" ? "border-foreground bg-foreground text-background" : "border-border bg-card text-foreground"}`}>ADA · Cardano</button>
                <button type="button" onClick={() => setCurrency("CNT")} className={`h-12 rounded-xl border text-sm font-medium ${currency === "CNT" ? "border-foreground bg-foreground text-background" : "border-border bg-card text-foreground"}`}>Custom token</button>
              </div>
            </div>
            {currency === "CNT" && (
              <div className="space-y-2">
                <Label>Select CNT</Label>
                <Select value={selectedCntKey} onValueChange={handleCntSelect}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Kies een CNT" />
                  </SelectTrigger>
                  <SelectContent>
                    {KNOWN_CNTS.map((cnt) => (
                      <SelectItem key={`${cnt.policy_id}:${cnt.asset_name}`} value={`${cnt.policy_id}:${cnt.asset_name}`}>
                        {cnt.ticker}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {type === "access" && (
              <div className="space-y-2">
                <Label>Access URL</Label>
                <Input value={form.access_url} onChange={(e) => updateForm("access_url", e.target.value)} placeholder="https://your-community-link.com" className="h-12 rounded-xl" />
              </div>
            )}
            <div className="space-y-2 md:col-span-2">
              <Label>{type === "payment" ? "Redirect URL after payment (optional)" : "Redirect URL after unlock (optional)"}</Label>
              <Input value={form.redirect_url} onChange={(e) => updateForm("redirect_url", e.target.value)} placeholder="https://your-site.com/thanks" className="h-12 rounded-xl" />
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-border bg-muted p-5">
            <FeeSelector form={feePreview} update={(field, value) => setFeePreview((prev) => ({ ...prev, [field]: value }))} />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button size="lg" className="h-12 rounded-xl px-6" onClick={handleGenerate} disabled={submitting}>
              {submitting ? "Creating..." : type === "payment" ? "Generate Payment Link" : "Generate Access Link"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}