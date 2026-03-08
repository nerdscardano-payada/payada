import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Zap, BookOpen, Code, GitBranch, Wallet, CheckCircle2,
  Copy, Check, Shield, CreditCard,
  Users, ArrowRight, ExternalLink, Terminal, Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import { useTranslation } from "@/components/i18n/useTranslation";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const SUPPORTED_WALLETS = [
  { name: "Nami", url: "https://namiwallet.io" },
  { name: "Eternl", url: "https://eternl.io" },
  { name: "Lace", url: "https://www.lace.io" },
  { name: "Typhon", url: "https://typhonwallet.io" },
  { name: "GeroWallet", url: "https://gerowallet.io" },
  { name: "Yoroi", url: "https://yoroi-wallet.com" },
];

const SIDEBAR_SECTION_IDS = [
  { id: "quickstart", key: "qs_title", icon: Zap },
  { id: "payment-links", key: "pl_title", icon: CreditCard },
  { id: "cnt-tokens", key: "cnt_sidebar", icon: Package },
  { id: "webhooks", key: "webhooks_sidebar", icon: GitBranch },
  { id: "api", key: "api_sidebar", icon: Code },
  { id: "checkout-embed", key: "tools_title", icon: Terminal },
  { id: "wallets", key: "wallets_title", icon: Wallet },
  { id: "security", key: "security_title", icon: Shield },
  { id: "discord-gate", key: "discord_title", icon: Users },
];

const ONBOARDING_STEP_KEYS = [1, 2, 3, 4];

function CodeBlock({ code, language = "bash" }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group my-4">
      <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm overflow-x-auto leading-relaxed">
        {code}
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-1.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

function Section({ id, title, icon: Icon, children }) {
  return (
    <div id={id} className="scroll-mt-24 mb-16 pb-16 border-b border-slate-200 last:border-0">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
           <Icon className="w-5 h-5 bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function DocumentationPage() {
  const { t, lang, setLang } = useTranslation();
  const [activeSection, setActiveSection] = useState("quickstart");
  const [checkedSteps, setCheckedSteps] = useState({});

  const toggleStep = (id) => {
    setCheckedSteps(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = Object.values(checkedSteps).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Documentation — PayADA Cardano Payment Integration"
        description="Get started with PayADA in under 5 minutes: create a payment link, make a test payment, set up webhooks, and explore the REST API. Includes guides for CNT tokens, Discord Gate, POS terminal, shop generator and button embedding."
        canonical="https://payada.io/documentation"
      />
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to={createPageUrl("Home")} className="text-2xl font-bold">
            Pay<span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">ADA</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link to={createPageUrl("APIReference")} className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1">
              API Reference <ExternalLink className="w-3 h-3" />
            </Link>
            <Link to={createPageUrl("Webhooks")} className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1">
              Webhooks <ExternalLink className="w-3 h-3" />
            </Link>
            <Link to={createPageUrl("Security")} className="text-sm text-slate-600 hover:text-slate-900">{t("nav.security")}</Link>
          </div>
          <LanguageSwitcher lang={lang} setLang={setLang} />
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Hero */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3">{t("docs.hero_title")}</h1>
          <p className="text-xl text-slate-600 max-w-3xl">{t("docs.hero_sub")}</p>
        </div>

        <div className="flex gap-10">
          {/* Sidebar */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-24 space-y-1">
              {SIDEBAR_SECTION_IDS.map(({ id, key, icon: Icon }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={() => setActiveSection(id)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeSection === id
                      ? "bg-blue-50 text-blue-700"
                           : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {t(`docs.${key}`)}
                </a>
              ))}
              <div className="pt-4 border-t border-slate-200 mt-4">
                <p className="text-xs text-slate-400 px-3 mb-2 font-semibold uppercase tracking-wide">More</p>
                <Link to={createPageUrl("APIReference")} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-50">
                   <Code className="w-4 h-4" /> {t("docs.full_api_ref")}
                 </Link>
                 <Link to={createPageUrl("Webhooks")} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-50">
                  <GitBranch className="w-4 h-4" /> {t("docs.webhook_guide")}
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">

            {/* Onboarding Checklist */}
            <div className="mb-16 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{t("docs.checklist_title")}</h2>
                  <p className="text-slate-600 text-sm mt-1">{t("docs.checklist_sub")}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{completedCount}/{ONBOARDING_STEPS.length}</div>
                  <div className="text-xs text-slate-500">{t("docs.checklist_completed")}</div>
                </div>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2 mb-6">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(completedCount / ONBOARDING_STEPS.length) * 100}%` }}
                />
              </div>
              <div className="space-y-3">
                {ONBOARDING_STEP_KEYS.map((id) => (
                  <div
                    key={id}
                    onClick={() => toggleStep(id)}
                    className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all ${
                      checkedSteps[id] ? "bg-white/60 opacity-60" : "bg-white hover:shadow-sm"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                      checkedSteps[id] ? "bg-green-500 border-green-500" : "border-slate-300"
                    }`}>
                      {checkedSteps[id] && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div>
                      <p className={`font-semibold text-sm ${checkedSteps[id] ? "line-through text-slate-400" : "text-slate-900"}`}>
                        {t(`docs.step${id}_title`)}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{t(`docs.step${id}_desc`)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Start */}
            <Section id="quickstart" title={t("docs.qs_title")} icon={Zap}>
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                {[
                  { icon: "🔗", titleKey: "qs_nocode", descKey: "qs_nocode_desc" },
                  { icon: "🔌", titleKey: "qs_api", descKey: "qs_api_desc" },
                  { icon: "📦", titleKey: "qs_embed", descKey: "qs_embed_desc" },
                ].map((item, i) => (
                  <div key={i} className="border border-slate-200 rounded-xl p-5 hover:border-indigo-300 transition-colors">
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <h3 className="font-semibold text-slate-900 mb-1">{t(`docs.${item.titleKey}`)}</h3>
                    <p className="text-sm text-slate-600">{t(`docs.${item.descKey}`)}</p>
                  </div>
                ))}
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
                {t("docs.qs_fee_note")}
              </div>
            </Section>

            {/* Payment Links */}
            <Section id="payment-links" title={t("docs.pl_title")} icon={CreditCard}>
              <p className="text-slate-600 mb-4">{t("docs.pl_sub")}</p>
              <h3 className="font-semibold text-slate-900 mb-3">{t("docs.pl_create_title")}</h3>
              <ol className="space-y-3 mb-6">
                {["pl_step1","pl_step2","pl_step3","pl_step4"].map((key, i) => (
                  <li key={key} className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                    <span className="text-slate-600 text-sm">{t(`docs.${key}`)}</span>
                  </li>
                ))}
              </ol>
              <h3 className="font-semibold text-slate-900 mb-3">{t("docs.pl_modes_title")}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-slate-900 border-b">Mode</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-900 border-b">Description</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-900 border-b">Use Case</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr><td className="px-4 py-3 font-mono text-xs text-blue-600">fixed_ada</td><td className="px-4 py-3 text-slate-600">Fixed amount in ADA</td><td className="px-4 py-3 text-slate-600">Products and services priced in ADA</td></tr>
                    <tr><td className="px-4 py-3 font-mono text-xs text-blue-600">fixed_cnt</td><td className="px-4 py-3 text-slate-600">Fixed amount in a Cardano Native Token</td><td className="px-4 py-3 text-slate-500 italic">Coming soon — Token-gated content, NFT communities</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-6 bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-600">
                <strong>Slug:</strong> Each payment link gets a unique URL slug (e.g. <code className="font-mono text-blue-600">/pay/your-product</code>). Slugs are auto-generated but can be customized.
              </div>
            </Section>

            {/* CNT Tokens */}
            <Section id="cnt-tokens" title={t("docs.cnt_title")} icon={Package}>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-sm text-amber-800">
                {t("docs.cnt_wip")}
              </div>
              <p className="text-slate-600 mb-4">{t("docs.cnt_sub")}</p>
              <h3 className="font-semibold text-slate-900 mb-3">{t("docs.cnt_whitelist_title")}</h3>
              <p className="text-slate-600 text-sm mb-4">{t("docs.cnt_whitelist_sub")}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {["$NIGHT", "$Snek", "$MIN", "$INDY", "$SUNDAE", "$WMTX", "$CSWAP", "$IAG", "$STRIKE", "$NMKR", "$HOSKY", "$TITAN", "USDM", "USDA", "DJED"].map((t) => (
                  <div key={t} className="px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg text-center text-sm font-semibold text-blue-700">{t}</div>
                ))}
              </div>
              <h3 className="font-semibold text-slate-900 mb-3">{t("docs.cnt_how_title")}</h3>
              <ol className="space-y-2 text-sm text-slate-600">
                {["cnt_s1","cnt_s2","cnt_s3","cnt_s4","cnt_s5"].map((key, i) => (
                  <li key={key} className="flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                    {t(`docs.${key}`)}
                  </li>
                ))}
              </ol>
            </Section>



            {/* Webhooks */}
            <Section id="webhooks" title={t("docs.webhooks_sidebar")} icon={GitBranch}>
              <p className="text-slate-600 mb-4">{t("docs.webhooks_sub")}</p>
              <h3 className="font-semibold text-slate-900 mb-3">{t("docs.webhooks_events_title")}</h3>
              <div className="space-y-2 mb-6">
                {[
                  { event: "payment.detected", descKey: "wh_ev1" },
                  { event: "payment.confirmed", descKey: "wh_ev2" },
                  { event: "payment.failed", descKey: "wh_ev3" },
                  { event: "subscription.due", descKey: "wh_ev4" },
                ].map((e) => (
                  <div key={e.event} className="flex items-start gap-3 p-3 border border-slate-100 rounded-lg bg-slate-50">
                    <code className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded flex-shrink-0">{e.event}</code>
                    <span className="text-sm text-slate-600">{t(`docs.${e.descKey}`)}</span>
                  </div>
                ))}
              </div>
              <h3 className="font-semibold text-slate-900 mb-3">{t("docs.webhooks_sig_title")}</h3>
              <p className="text-sm text-slate-600 mb-2">{t("docs.webhooks_sig_sub")}</p>
              <CodeBlock code={`const crypto = require('crypto');

const signature = req.headers['x-payada-signature'];
const hash = crypto
  .createHmac('sha256', process.env.WEBHOOK_SECRET)
  .update(JSON.stringify(req.body))
  .digest('hex');

if (hash !== signature) {
  return res.status(401).send('Invalid signature');
}

// Safe to process the event
res.status(200).send('OK');`} />
              <Link to={createPageUrl("Webhooks")} className="inline-flex items-center gap-2 text-blue-600 text-sm font-medium hover:underline mt-2">
                {t("docs.webhook_guide")} <ArrowRight className="w-4 h-4" />
              </Link>
            </Section>

            {/* REST API */}
            <Section id="api" title={t("docs.api_sidebar")} icon={Code}>
              <p className="text-slate-600 mb-4">{t("docs.api_sub")}</p>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">{t("api.base_url_title")}</p>
                <code className="font-mono text-slate-900 text-sm">https://api.payada.io/v1</code>
              </div>
              <h3 className="font-semibold text-slate-900 mb-3">{t("api.auth_title")}</h3>
              <CodeBlock code={`curl https://api.payada.io/v1/payments \\
  -H "Authorization: Bearer YOUR_API_KEY"`} />
              <h3 className="font-semibold text-slate-900 mb-3 mt-6">{t("docs.api_quick_ref")}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left px-4 py-2 font-semibold text-slate-900 border-b w-16">Method</th>
                      <th className="text-left px-4 py-2 font-semibold text-slate-900 border-b">Endpoint</th>
                      <th className="text-left px-4 py-2 font-semibold text-slate-900 border-b">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      ["POST", "/payments", "Create a payment request"],
                      ["GET", "/payments/:id", "Get payment details"],
                      ["GET", "/payments", "List all payments"],
                      ["POST", "/subscriptions", "Create a subscription"],
                      ["GET", "/subscriptions/:id", "Get subscription details"],
                      ["POST", "/webhooks/endpoints", "Register webhook endpoint"],
                    ].map(([method, path, desc], i) => (
                      <tr key={i}>
                        <td className="px-4 py-2.5">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${method === "GET" ? "bg-blue-500" : "bg-green-500"}`}>{method}</span>
                        </td>
                        <td className="px-4 py-2.5 font-mono text-xs text-blue-600">{path}</td>
                        <td className="px-4 py-2.5 text-slate-600">{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Link to={createPageUrl("APIReference")} className="inline-flex items-center gap-2 text-blue-600 text-sm font-medium hover:underline mt-4">
                {t("docs.full_api_ref")} <ArrowRight className="w-4 h-4" />
              </Link>
            </Section>

            {/* Payment Tools */}
            <Section id="checkout-embed" title={t("docs.tools_title")} icon={Terminal}>
              <p className="text-slate-600 mb-8">
                PayADA offers a full suite of no-code and low-code tools to accept payments in every context — online, in a store, or embedded on your website.
              </p>

              <div className="space-y-8">

                {/* Pay Button Generator */}
                <div className="border border-slate-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">🔘</span>
                    <h3 className="text-lg font-semibold text-slate-900">Payment Button Generator</h3>
                  </div>
                  <p className="text-slate-600 text-sm mb-4">
                    Generate a branded "Pay with ADA" button that you can embed on any website, landing page, or blog — no backend needed.
                    The button opens a hosted PayADA checkout in a popup modal.
                  </p>
                  <ol className="space-y-1 text-sm text-slate-600 mb-4">
                    {[
                      "Go to Dashboard → Button Generator",
                      "Choose your payment link, button label, and color",
                      "Copy the generated HTML snippet and paste it anywhere on your site",
                    ].map((s, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                        {s}
                      </li>
                    ))}
                  </ol>
                  <CodeBlock code={`<!-- Generated by PayADA Button Generator -->
<a href="https://payada.io/pay/your-product" target="_blank"
   style="background:#4f46e5;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">
  Pay with ADA ₳
</a>`} />
                </div>

                {/* Shop / Store Generator */}
                <div className="border border-slate-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">🛍️</span>
                    <h3 className="text-lg font-semibold text-slate-900">Shop Generator</h3>
                  </div>
                  <p className="text-slate-600 text-sm mb-4">
                    Create a hosted storefront with multiple products — each with its own payment link — in minutes.
                    No website, no hosting, no code required. Share one URL and let customers browse and buy.
                  </p>
                  <ol className="space-y-1 text-sm text-slate-600">
                    {[
                      "Go to Dashboard → Shop Generator",
                      "Add products with names, descriptions, images, and ADA prices",
                      "Publish your shop and share the link",
                      "Each product has its own PayADA checkout — payments go directly to your wallet",
                    ].map((s, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                        {s}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Access Links */}
                <div className="border border-slate-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">🔐</span>
                    <h3 className="text-lg font-semibold text-slate-900">Access Links (Community Gate)</h3>
                  </div>
                  <p className="text-slate-600 text-sm mb-4">
                    Sell access to exclusive communities or content — Discord servers, Telegram groups, or private websites.
                    After payment is confirmed, the customer automatically receives an invite link or Discord role.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    {[
                      { platform: "Discord", desc: "Auto-assign a Discord role via bot after payment" },
                      { platform: "Telegram / WhatsApp", desc: "Show a static invite link after payment confirmation" },
                      { platform: "Website", desc: "Redirect to any private URL after confirmed payment" },
                      { platform: "Custom", desc: "Display a custom welcome message with access instructions" },
                    ].map((item, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="font-semibold text-slate-900 text-xs mb-1">{item.platform}</p>
                        <p className="text-slate-600 text-xs">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pay Terminal */}
                <div className="border border-slate-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">🖥️</span>
                    <h3 className="text-lg font-semibold text-slate-900">Pay Terminal</h3>
                  </div>
                  <p className="text-slate-600 text-sm mb-4">
                    A customisable hosted checkout page — ideal for embedding in your own website or sharing as a branded payment page.
                    Configure colors, logo, button label, and which payment link to use.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {[
                      "Custom accent color and branding",
                      "Collect name and email at checkout",
                      "Supports one-time payment links",
                      "Embeddable via iframe on any website",
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* POS Terminal */}
                <div className="border border-slate-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">🏪</span>
                    <h3 className="text-lg font-semibold text-slate-900">POS Terminal (Point of Sale)</h3>
                  </div>
                  <p className="text-slate-600 text-sm mb-4">
                    A full-screen point-of-sale interface designed for physical stores, markets, and events.
                    Enter an amount, generate a QR code, and the customer scans it to pay from their Cardano wallet — no card machine needed.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {[
                      "Enter any ADA amount on the spot — no pre-configured link needed",
                      "QR code displayed for customer to scan with their mobile wallet",
                      "Live payment confirmation display — you see the ✓ the moment it's confirmed",
                      "Full transaction history per terminal session",
                      "Works on tablet, laptop, or any screen",
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </Section>

            {/* Supported Wallets */}
            <Section id="wallets" title={t("docs.wallets_title")} icon={Wallet}>
              <p className="text-slate-600 mb-6">
                PayADA auto-detects installed Cardano browser wallets via the CIP-30 standard. Customers can pay with one click using any of the following:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {SUPPORTED_WALLETS.map((w) => (
                  <a key={w.name} href={w.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-medium hover:border-cyan-300 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                    <Wallet className="w-4 h-4 flex-shrink-0" />
                    {w.name}
                  </a>
                ))}
              </div>
              <p className="text-sm text-slate-500 mt-4">Any CIP-30 compatible wallet is supported, even if not listed above.</p>
            </Section>

            {/* Security */}
            <Section id="security" title={t("docs.security_title")} icon={Shield}>
              <p className="text-slate-600 mb-6">PayADA is built with security-first principles.</p>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {[
                  { title: "TLS 1.3", desc: "All traffic encrypted in transit" },
                  { title: "HMAC-SHA256", desc: "Signed webhooks prevent spoofing" },
                  { title: "Hashed API Keys", desc: "Keys stored as bcrypt hashes, never in plaintext" },
                  { title: "GDPR & MiCA", desc: "EU crypto-asset regulation compliant" },
                  { title: "AML Controls", desc: "Anti-money laundering monitoring" },
                  { title: "Audit Logs", desc: "Every sensitive action is logged with timestamps" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{item.title}</p>
                      <p className="text-xs text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to={createPageUrl("Security")} className="inline-flex items-center gap-2 text-blue-600 text-sm font-medium hover:underline">
                Full Security & Compliance page <ArrowRight className="w-4 h-4" />
              </Link>
            </Section>

            {/* Discord Gate */}
            <Section id="discord-gate" title={t("docs.discord_title")} icon={Users}>
              <p className="text-slate-600 mb-4">
                The Discord Gate plugin automatically grants a Discord role to customers after a confirmed payment.
                Perfect for token-gated communities, premium channels, and membership groups.
              </p>
              <h3 className="font-semibold text-slate-900 mb-3">Setup Steps</h3>
              <ol className="space-y-3 text-sm text-slate-600 mb-6">
                {[
                  "Create a Discord Bot and get your bot token from the Discord Developer Portal",
                  "Invite the bot to your server with the 'Manage Roles' permission",
                  "Go to Dashboard → Plugins → Discord Gate and paste your bot token, Guild ID, and Role ID",
                  "Link the plugin to one or more Payment Links",
                  "After payment confirmation, the bot automatically assigns the role to the payer",
                ].map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <strong>Note:</strong> The payer must enter their Discord username at checkout for role assignment to work.
              </div>
            </Section>

          </main>
        </div>
      </div>
    </div>
  );
}