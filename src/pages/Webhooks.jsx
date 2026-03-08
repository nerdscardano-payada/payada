import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Copy } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const events = [
  {
    name: "payment.detected",
    description: "Triggered when a payment is detected on the blockchain but not yet confirmed",
    payload: `{
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
  const [expandedEvent, setExpandedEvent] = useState(0);
  const [copied, setCopied] = useState(null);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to={createPageUrl("Home")} className="text-2xl font-bold">
            Pay<span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">ADA</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to={createPageUrl("Documentation")} className="text-sm text-slate-600 hover:text-slate-900">Docs</Link>
            <Link to={createPageUrl("APIReference")} className="text-sm text-slate-600 hover:text-slate-900">API</Link>
            <Link to={createPageUrl("Security")} className="text-sm text-slate-600 hover:text-slate-900">Security</Link>
          </div>
        </nav>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="mb-16">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">Webhooks</h1>
          <p className="text-xl text-slate-600">Receive real-time payment notifications directly to your server.</p>
        </div>

        {/* Setup Instructions */}
        <div className="mb-20 border border-slate-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Getting Started</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">1. Configure Your Webhook URL</h3>
              <p className="text-slate-600 mb-4">
                Go to your Dashboard → Webhooks and add your endpoint URL where you want to receive events. You can use our{" "}
                <Link to={createPageUrl("WebhookSetupWizard")} className="text-blue-600 hover:underline font-medium">Webhook Setup Wizard</Link>{" "}
                to get started quickly. Your endpoint must:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2">
                <li>Be a valid HTTPS URL</li>
                <li>Accept POST requests</li>
                <li>Return a 200 status code to confirm receipt</li>
                <li>Respond within 30 seconds</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-3">2. Select Event Types</h3>
              <p className="text-slate-600">Choose which events you want to receive: payment.detected, payment.confirmed, payment.failed, subscription.due</p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-3">3. Verify Webhook Signature</h3>
              <p className="text-slate-600 mb-3">All webhooks are signed with HMAC-SHA256. Verify the signature in the X-PayADA-Signature header:</p>
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
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Webhook Events</h2>
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
                      <p className="font-semibold text-slate-900">Example Payload:</p>
                      <button
                        onClick={() => handleCopy(event.payload)}
                        className="text-slate-600 hover:text-slate-900 flex items-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        {copied ? 'Copied' : 'Copy'}
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
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Retry Logic</h2>
          <p className="text-slate-600 mb-4">If your endpoint doesn't respond with a 200 status code, we'll retry with exponential backoff:</p>
          <ul className="list-disc list-inside text-slate-600 space-y-2">
            <li>1st attempt: Immediately</li>
            <li>2nd attempt: 1 minute later</li>
            <li>3rd attempt: 5 minutes later</li>
            <li>4th attempt: 30 minutes later</li>
            <li>5th attempt: 2 hours later</li>
          </ul>
          <p className="text-slate-600 mt-4">After 5 failed attempts, the event is marked as failed and logged for review.</p>
        </div>

        {/* Best Practices */}
        <div className="border border-slate-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Best Practices</h2>
          <ul className="space-y-3">
            <li className="flex gap-3">
              <span className="font-semibold text-blue-600">✓</span>
              <span className="text-slate-600">Always verify webhook signatures before processing</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-blue-600">✓</span>
              <span className="text-slate-600">Use idempotency keys to prevent duplicate processing</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-blue-600">✓</span>
              <span className="text-slate-600">Respond immediately with 200 status, process asynchronously</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-blue-600">✓</span>
              <span className="text-slate-600">Log all webhook events for debugging</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-blue-600">✓</span>
              <span className="text-slate-600">Keep webhook endpoint timeout under 30 seconds</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}