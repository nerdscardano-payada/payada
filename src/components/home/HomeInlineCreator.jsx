import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Coins, Link2, LockKeyhole, Wallet, Sparkles, ArrowRight, History, Copy, ExternalLink, Layers3, Rocket, UserPlus, QrCode, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import WalletConnect from "@/components/checkout/WalletConnect";
import FeeSelector from "@/components/payment-links/FeeSelector";
import { KNOWN_CNTS } from "@/components/payment-links/wizard/knownCNTs";
import QRCodeDisplay from "@/components/shared/QRCodeDisplay";
import HomeProgressIndicator from "@/components/home/HomeProgressIndicator";
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
  const [createdPaymentUrl, setCreatedPaymentUrl] = React.useState("");
  const [createdQrValue, setCreatedQrValue] = React.useState("");
  const [feeSlide, setFeeSlide] = React.useState(0);
  const copySectionRef = useRef(null);

  useEffect(() => {
    const syncStoredWallet = () => {
      const savedAddress = localStorage.getItem("payada_connected_wallet_address");
      if (savedAddress) {
        setForm((prev) => ({ ...prev, receive_address: prev.receive_address || savedAddress }));
      }
    };

    syncStoredWallet();
    window.addEventListener("payada-wallet-updated", syncStoredWallet);

    return () => {
      window.removeEventListener("payada-wallet-updated", syncStoredWallet);
    };
  }, []);

  const updateForm = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleCntSelect = (value) => {
    setSelectedCntKey(value);
  };

  const selectedCnt = KNOWN_CNTS.find((cnt) => `${cnt.policy_id}:${cnt.asset_name}` === selectedCntKey);

  const feeSlides = [
    {
      title: "Merchant pays",
      amount: "₳ 250",
      status: "Confirmed • Block #8,234,567",
      primaryLabel: "Net amount",
      primaryValue: "₳ 246.25",
      secondaryLabel: "Fee",
      secondaryValue: "₳ 3.75",
    },
    {
      title: "Customer pays",
      amount: "₳ 253.75",
      status: "Customer covers the fee",
      primaryLabel: "Merchant receives",
      primaryValue: "₳ 250",
      secondaryLabel: "Fee added",
      secondaryValue: "₳ 3.75",
    },
    {
      title: "Split fee",
      amount: "₳ 251.875",
      status: "Fee shared between both",
      primaryLabel: "Merchant receives",
      primaryValue: "₳ 248.125",
      secondaryLabel: "Shared fee",
      secondaryValue: "₳ 1.875",
    },
  ];

  const currentFeeSlide = feeSlides[feeSlide];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setFeeSlide((prev) => (prev === feeSlides.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => window.clearInterval(interval);
  }, [feeSlides.length]);

  const currentStep = createdPaymentUrl
    ? 4
    : form.title.trim() || form.amount || form.access_url.trim() || form.redirect_url.trim()
      ? 3
      : type !== "payment"
        ? 2
        : form.receive_address.trim()
          ? 2
          : 1;

  const normalizeSlug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  const buildUniqueSlug = () => {
    const base = normalizeSlug(form.title || (type === "payment" ? "payment-link" : "access-link")) || (type === "payment" ? "payment-link" : "access-link");
    return `${base}-${Date.now().toString().slice(-6)}`;
  };

  const handleCopyCreatedLink = async () => {
    if (!createdPaymentUrl) return;
    await navigator.clipboard.writeText(createdPaymentUrl);
    toast.success("Link copied");
  };

  const buildCardanoQrValue = () => {
    const amount = Number(form.amount || 0);
    if (!form.receive_address.trim() || amount <= 0) return "";

    const params = new URLSearchParams();
    params.set("amount", String(amount));
    if (form.title.trim()) {
      params.set("label", form.title.trim());
    }

    return `web+cardano:${form.receive_address.trim()}?${params.toString()}`;
  };

  const handleGenerate = async () => {
    setCreatedPaymentUrl("");
    setCreatedQrValue("");

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
    if (type === "qr_payment") {
      const qrValue = buildCardanoQrValue();
      if (!qrValue) {
        toast.error("Voer een geldig Cardano adres en bedrag in.");
        return;
      }
      setCreatedQrValue(qrValue);
      setTimeout(() => {
        copySectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
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
        const newPaymentUrl = `${window.location.origin}/Pay?slug=${encodeURIComponent(slug)}`;
        setCreatedPaymentUrl(newPaymentUrl);
        setTimeout(() => {
          copySectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 50);
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
      <HomeProgressIndicator currentStep={currentStep} />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,460px)] lg:items-center">
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

        <div className="rounded-[1.75rem] border border-primary/70 bg-slate-950 px-6 py-6 text-white shadow-[0_28px_70px_rgba(15,23,42,0.28)] sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">{currentFeeSlide.title}</p>
              <p className="mt-4 text-4xl font-semibold tracking-tight">{currentFeeSlide.amount}</p>
              <p className="mt-3 text-sm text-slate-400">{currentFeeSlide.status}</p>
            </div>
            <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-400/10 text-emerald-400">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setFeeSlide((prev) => (prev === 0 ? feeSlides.length - 1 : prev - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/5 bg-white/[0.03] text-slate-400 transition hover:bg-white/[0.06] hover:text-slate-200"
              aria-label="Previous fee option"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            <div className="flex items-center gap-1.5">
              {feeSlides.map((slide, index) => (
                <button
                  key={slide.title}
                  type="button"
                  onClick={() => setFeeSlide(index)}
                  className={`rounded-full transition-all ${index === feeSlide ? "h-1.5 w-5 bg-white/70" : "h-1.5 w-1.5 bg-white/20 hover:bg-white/35"}`}
                  aria-label={slide.title}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => setFeeSlide((prev) => (prev === feeSlides.length - 1 ? 0 : prev + 1))}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/5 bg-white/[0.03] text-slate-400 transition hover:bg-white/[0.06] hover:text-slate-200"
              aria-label="Next fee option"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-8 border-t border-white/10 pt-5">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{currentFeeSlide.primaryLabel}</p>
                <p className="mt-2 text-xl font-semibold">{currentFeeSlide.primaryValue}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{currentFeeSlide.secondaryLabel}</p>
                <p className="mt-2 text-xl font-semibold">{currentFeeSlide.secondaryValue}</p>
              </div>
            </div>
          </div>
        </div>
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

      <div>
        <div className="space-y-4 mb-6">
          <div className="rounded-2xl border border-sky-400/30 bg-card/60 p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-lg sm:text-xl font-semibold text-foreground">Step 1 · Connect wallet</p>
                <p className="text-sm text-muted-foreground">Use your Cardano wallet without logging in.</p>
              </div>
            </div>
            <div className="mt-5">
              <WalletConnect onConnected={({ address, ...walletData }) => {
                updateForm("receive_address", address || "");
                onWalletConnected?.({ address, ...walletData });
              }} />
            </div>
          </div>

          <div className="rounded-2xl border border-sky-400/30 bg-card/60 p-5 space-y-4">
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Layers3 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-lg sm:text-xl font-semibold text-foreground">Step 2 · Select type</p>
                <p className="text-sm text-muted-foreground">Choose the kind of flow you want to launch.</p>
              </div>
            </div>
            <div className="grid w-full grid-cols-1 sm:grid-cols-3 rounded-2xl border border-sky-400/30 bg-card/60 p-2 mb-4 gap-2 shadow-sm">
              <button
                type="button"
                onClick={() => setType("payment")}
                className={`flex min-h-[104px] flex-col items-start justify-between rounded-xl border px-4 py-4 text-left transition-all ${type === "payment" ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20 ring-2 ring-primary/20" : "border-transparent bg-background/80 text-foreground hover:border-sky-200 hover:bg-background"}`}
              >
                <span className="text-sm font-semibold">💳 Payment Link</span>
                <span className={`text-xs leading-5 ${type === "payment" ? "text-primary-foreground/85" : "text-muted-foreground"}`}>
                  Create a shareable checkout link for one-time payments.
                </span>
              </button>
              <button
                type="button"
                onClick={() => setType("access")}
                className={`flex min-h-[104px] flex-col items-start justify-between rounded-xl border px-4 py-4 text-left transition-all ${type === "access" ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20 ring-2 ring-primary/20" : "border-transparent bg-background/80 text-foreground hover:border-sky-200 hover:bg-background"}`}
              >
                <span className="text-sm font-semibold">🔐 Access Link</span>
                <span className={`text-xs leading-5 ${type === "access" ? "text-primary-foreground/85" : "text-muted-foreground"}`}>
                  Charge first, then send people to a locked page or community.
                </span>
              </button>
              <button
                type="button"
                onClick={() => setType("qr_payment")}
                className={`flex min-h-[104px] flex-col items-start justify-between rounded-xl border px-4 py-4 text-left transition-all ${type === "qr_payment" ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20 ring-2 ring-primary/20" : "border-transparent bg-background/80 text-foreground hover:border-sky-200 hover:bg-background"}`}
              >
                <span className="text-sm font-semibold">💰 QR Payments</span>
                <span className={`text-xs leading-5 ${type === "qr_payment" ? "text-primary-foreground/85" : "text-muted-foreground"}`}>
                  Generate a wallet-ready QR code for in-person or mobile payments.
                </span>
              </button>
            </div>
          </div>

        </div>

        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg sm:text-xl font-semibold text-foreground">Step 3 · Launch flow</p>
              <h2 className="text-2xl font-semibold text-foreground mt-1">
                {type === "payment" ? "Create a payment link" : type === "access" ? "Create an access link" : "Create a QR payment"}
              </h2>
            </div>
          </div>

          <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label>{type === "payment" ? "What is this payment for?" : type === "access" ? "What are people unlocking?" : "Description for this QR payment"}</Label>
                  <Input value={form.title} onChange={(e) => updateForm("title", e.target.value)} placeholder={type === "payment" ? "Premium membership" : type === "access" ? "Private Discord access" : "Table 4 · Coffee order"} className="h-12 rounded-xl" />
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
                {type !== "qr_payment" && (
                  <div className="space-y-2 md:col-span-2">
                    <Label>{type === "payment" ? "Redirect URL after payment (optional)" : "Redirect URL after unlock (optional)"}</Label>
                    <Input value={form.redirect_url} onChange={(e) => updateForm("redirect_url", e.target.value)} placeholder="https://your-site.com/thanks" className="h-12 rounded-xl" />
                  </div>
                )}
              </div>

              <div className="rounded-[1.5rem] border border-border bg-white dark:bg-slate-900 p-5">
                <FeeSelector form={feePreview} update={(field, value) => setFeePreview((prev) => ({ ...prev, [field]: value }))} />
              </div>

              <div className="flex flex-wrap gap-3">
                <Button size="lg" className="h-12 rounded-xl px-6" onClick={handleGenerate} disabled={submitting}>
                  {submitting ? "Creating..." : type === "payment" ? "Generate Payment Link" : type === "access" ? "Generate Access Link" : "Generate QR Payment"}
                </Button>
              </div>

              <div className="hidden sm:grid sm:grid-cols-3 gap-4">
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
            </>

          {(createdPaymentUrl || createdQrValue) && (
            <>
              {createdQrValue && (
                <div ref={copySectionRef} className="rounded-[1.5rem] border border-border bg-background p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-lg sm:text-xl font-semibold text-foreground">QR Payment ready</p>
                      <p className="text-sm text-muted-foreground mt-1">Scan this QR with a Cardano wallet app to open the payment request instantly.</p>
                    </div>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-start">
                    <div className="space-y-4">
                      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 space-y-2">
                        <p>Open wallet usually works only on mobile. Scan this QR code with your wallet app for the easiest experience.</p>
                        <p>For a better in-person payment experience, use POS after logging in.</p>
                      </div>
                      <div className="rounded-xl border border-border bg-white dark:bg-card px-4 py-3 text-sm text-foreground break-all">
                        {createdQrValue}
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Button type="button" onClick={async () => {
                          await navigator.clipboard.writeText(createdQrValue);
                          toast.success("QR payment copied");
                        }} className="h-11 rounded-xl px-5">
                          <Copy className="w-4 h-4 mr-2" />
                          Copy QR data
                        </Button>
                        <Button type="button" variant="outline" onClick={() => {
                          window.location.href = createdQrValue;
                        }} className="h-11 rounded-xl px-5">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Open wallet
                        </Button>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-border bg-white p-4 flex items-center justify-center">
                      <QRCodeDisplay value={createdQrValue} size={180} />
                    </div>
                  </div>
                </div>
              )}

              {createdPaymentUrl && (
              <div ref={copySectionRef} className="rounded-[1.5rem] border border-border bg-background p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Copy className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-lg sm:text-xl font-semibold text-foreground">Step 4 · Copy your link</p>
                    <p className="text-sm text-muted-foreground mt-1">Copy your new link, open it, or let someone scan the QR code.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="rounded-xl border border-border bg-white dark:bg-card px-4 py-3 text-sm text-foreground break-all">
                    {createdPaymentUrl}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button type="button" onClick={handleCopyCreatedLink} className="h-11 rounded-xl px-5">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy link
                    </Button>
                    <Button type="button" variant="outline" onClick={() => window.open(createdPaymentUrl, "_blank")} className="h-11 rounded-xl px-5">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open link
                    </Button>
                  </div>
                </div>
              </div>
              )}

              <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-lg sm:text-xl font-semibold text-foreground">Step 5 · Claim for more options</p>
                    <p className="mt-1 text-sm text-muted-foreground">Log in to manage links, see history, and unlock more controls.</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}