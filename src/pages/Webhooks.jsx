import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Copy } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { useTranslation } from "@/components/i18n/useTranslation";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const EVENT_KEYS = ["ev_detected", "ev_confirmed", "ev_failed", "ev_due"];

const EVENT_NAMES = ["payment.detected", "payment.confirmed", "payment.failed", "subscription.due"];

const EVENT_PAYLOADS = [`{
  "event": "payment.detected",
  "id": "evt_abc123",
  "timestamp": "2024-03-01T10:30:00Z",
  "data": {
    "payment_id": "pay_abc123",
    "amount_ada": 50,
    "status": "detected",
    "tx_hash": "abc123..."
  }
}`
  },
  {
    name: "payment.confirmed",
    description: "Triggered when a payment is confirmed with the required confirmations",
    payload: `{
  "event": "payment.confirmed",
  "id": "evt_def456",
  "timestamp": "2024-03-01T10:35:00Z",
  "data": {
    "payment_id": "pay_abc123",
    "amount_ada": 50,
    "status": "confirmed",
    "confirmations": 3,
    "tx_hash": "abc123...",
    "payer_email": "customer@example.com"
  }
}`
  },
  {
    name: "payment.failed",
    description: "Triggered when a payment validation fails",
    payload: `{
  "event": "payment.failed",
  "id": "evt_ghi789",
  "timestamp": "2024-03-01T10:40:00Z",
  "data": {
    "payment_id": "pay_abc123",
    "status": "failed",
    "reason": "Insufficient amount received",
    "tx_hash": "abc123..."
  }
}`
  },
  {
    name: "subscription.due",
    description: "Triggered when a subscription payment is due",
    payload: `{
  "event": "subscription.due",
  "id": "evt_jkl012",
  "timestamp": "2024-03-01T11:00:00Z",
  "data": {
    "subscription_id": "sub_xyz123",
    "customer_email": "customer@example.com",
    "amount_ada": 100,
    "due_date": "2024-03-01",
    "plan_name": "Pro Plan"
  }
}`
  }
];

export default function WebhooksPage() {
  const { t, lang, setLang } = useTranslation();
  const [expandedEvent, setExpandedEvent] = useState(0);
  const [copied, setCopied] = useState(null);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Webhooks — Real-Time Payment Events | PayADA"
        description="Set up PayADA webhooks to receive real-time payment events on your server. HMAC-SHA256 signed payloads, exponential backoff retry logic (up to 5 attempts), and full event reference for payment.detected, payment.confirmed, payment.failed and subscription.due."
        canonical="https://payada.io/webhooks"
      />
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to={createPageUrl("Home")} className="text-2xl font-bold">
            Pay<span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">ADA</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to={createPageUrl("Documentation")} className="text-sm text-slate-600 hover:text-slate-900">{t("nav.docs")}</Link>
            <Link to={createPageUrl("APIReference")} className="text-sm text-slate-600 hover:text-slate-900">API</Link>
            <Link to={createPageUrl("Security")} className="text-sm text-slate-600 hover:text-slate-900">{t("nav.security")}</Link>
          </div>
          <LanguageSwitcher lang={lang} setLang={setLang} />
        </nav>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="mb-16">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">{t("webhooks.hero_title")}</h1>
          <p className="text-xl text-slate-600">{t("webhooks.hero_sub")}</p>
        </div>

        {/* Setup Instructions */}
        <div className="mb-20 border border-slate-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">{t("webhooks.setup_title")}</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">{t("webhooks.setup_step1_title")}</h3>
              <p className="text-slate-600 mb-4">
                {t("webhooks.setup_step1_sub")}{" "}
                <Link to={createPageUrl("WebhookSetupWizard")} className="text-blue-600 hover:underline font-medium">Webhook Setup Wizard</Link>
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2">
                <li>{t("webhooks.setup_step1_b1")}</li>
                <li>{t("webhooks.setup_step1_b2")}</li>
                <li>{t("webhooks.setup_step1_b3")}</li>
                <li>{t("webhooks.setup_step1_b4")}</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-3">{t("webhooks.setup_step2_title")}</h3>
              <p className="text-slate-600">{t("webhooks.setup_step2_sub")}</p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-3">{t("webhooks.setup_step3_title")}</h3>
              <p className="text-slate-600 mb-3">{t("webhooks.setup_step3_sub")}</p>
              <div className="bg-slate-900 text-slate-100 p-4 rounded font-mono text-sm overflow-x-auto">
                {`const crypto = require('crypto');
const signature = req.headers['x-payada-signature'];
const hash = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(req.body)
  .digest('hex');
const isValid = hash === signature;`}
              </div>
            </div>
          </div>
        </div>

        {/* Events */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">{t("webhooks.events_title")}</h2>
          <div className="space-y-6">
            {events.map((event, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg">
                <button
                  onClick={() => setExpandedEvent(expandedEvent === idx ? -1 : idx)}
                  className="w-full p-6 text-left hover:bg-slate-50 transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-slate-900 text-lg mb-1">{event.name}</h3>
                      <p className="text-slate-600">{event.description}</p>
                    </div>
                    <span className={`text-slate-400 transition-transform ${expandedEvent === idx ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </div>
                </button>
                {expandedEvent === idx && (
                  <div className="border-t border-slate-200 p-6 bg-slate-50">
                    <div className="flex justify-between items-center mb-4">
                      <p className="font-semibold text-slate-900">{t("webhooks.payload_label")}</p>
                      <button
                        onClick={() => handleCopy(event.payload)}
                        className="text-slate-600 hover:text-slate-900 flex items-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        {copied ? t("webhooks.copied") : t("webhooks.copy")}
                      </button>
                    </div>
                    <pre className="bg-slate-900 text-slate-100 p-4 rounded font-mono text-sm overflow-x-auto">
                      {event.payload}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Retries */}
        <div className="border border-slate-200 rounded-lg p-8 mb-20">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">{t("webhooks.retry_title")}</h2>
          <p className="text-slate-600 mb-4">{t("webhooks.retry_sub")}</p>
          <ul className="list-disc list-inside text-slate-600 space-y-2">
            <li>{t("webhooks.retry_1")}</li>
            <li>{t("webhooks.retry_2")}</li>
            <li>{t("webhooks.retry_3")}</li>
            <li>{t("webhooks.retry_4")}</li>
            <li>{t("webhooks.retry_5")}</li>
          </ul>
          <p className="text-slate-600 mt-4">{t("webhooks.retry_note")}</p>
        </div>

        {/* Best Practices */}
        <div className="border border-slate-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">{t("webhooks.best_title")}</h2>
          <ul className="space-y-3">
            {["best_1","best_2","best_3","best_4","best_5"].map((k) => (
              <li key={k} className="flex gap-3">
                <span className="font-semibold text-blue-600">✓</span>
                <span className="text-slate-600">{t(`webhooks.${k}`)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}