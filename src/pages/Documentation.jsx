import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Code, BookOpen, Zap, GitBranch } from "lucide-react";

const sections = [
  {
    title: "Getting Started",
    icon: Zap,
    content: `Sign up for a PayADA account and get your API keys. No credit card required.

1. Create your merchant profile
2. Generate your first API key
3. Configure webhook endpoints
4. Start accepting payments

It takes less than 5 minutes to get started.`
  },
  {
    title: "Payment Links",
    icon: BookOpen,
    content: `Payment links are the easiest way to accept Cardano payments without any code.

Create a payment link from your dashboard and share it with customers. They'll see a checkout page with the payment amount and your receive address.

No technical setup required. Just generate, share, and receive payments.`
  },
  {
    title: "REST API",
    icon: Code,
    content: `Integrate PayADA with your application using our REST API.

Base URL: https://api.payada.io/v1

All endpoints require authentication with your API key.
Authentication: Bearer \${API_KEY} in Authorization header

Common endpoints:
- POST /payments - Create a payment
- GET /payments/:id - Get payment details
- GET /subscriptions - List subscriptions
- POST /subscriptions - Create subscription`
  },
  {
    title: "Webhooks",
    icon: GitBranch,
    content: `Receive real-time notifications when payments are confirmed.

Configure your webhook URL in the dashboard. PayADA will send POST requests with payment updates.

Event types:
- payment.detected - Payment detected on blockchain
- payment.confirmed - Payment confirmed with required confirmations
- payment.failed - Payment validation failed
- subscription.due - Subscription payment due

All webhook payloads are signed with HMAC-SHA256 for security verification.`
  }
];

export default function DocumentationPage() {
  const [expanded, setExpanded] = useState(0);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to={createPageUrl("Home")} className="text-2xl font-bold">
            Pay<span className="text-indigo-600">ADA</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to={createPageUrl("Features")} className="text-sm text-slate-600 hover:text-slate-900">Features</Link>
            <Link to={createPageUrl("Security")} className="text-sm text-slate-600 hover:text-slate-900">Security</Link>
            <Link to={createPageUrl("Pricing")} className="text-sm text-slate-600 hover:text-slate-900">Pricing</Link>
            <Link to={createPageUrl("APIReference")} className="text-sm text-slate-600 hover:text-slate-900">API Reference</Link>
          </div>
        </nav>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">Documentation</h1>
          <p className="text-xl text-slate-600">Everything you need to integrate PayADA into your application.</p>
        </div>

        {/* Documentation Sections */}
        <div className="max-w-3xl mx-auto space-y-4">
          {sections.map((section, idx) => (
            <div key={idx} className="border border-slate-200 rounded-lg">
              <button
                onClick={() => setExpanded(expanded === idx ? -1 : idx)}
                className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-4">
                  <section.icon className="w-6 h-6 text-indigo-600" />
                  <h3 className="text-lg font-semibold text-slate-900">{section.title}</h3>
                </div>
                <span className={`text-slate-400 transition-transform ${expanded === idx ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              {expanded === idx && (
                <div className="border-t border-slate-200 p-6 bg-slate-50">
                  <pre className="bg-slate-900 text-slate-100 p-4 rounded text-sm overflow-x-auto whitespace-pre-wrap font-mono">
                    {section.content}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Additional Resources</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Link to={createPageUrl("APIReference")} className="border border-slate-200 rounded-lg p-6 hover:border-indigo-300 hover:shadow-lg transition">
              <Code className="w-8 h-8 text-indigo-600 mb-2" />
              <h3 className="font-semibold text-slate-900">Full API Reference</h3>
              <p className="text-sm text-slate-600 mt-1">Detailed API endpoint documentation</p>
            </Link>
            <Link to={createPageUrl("Webhooks")} className="border border-slate-200 rounded-lg p-6 hover:border-indigo-300 hover:shadow-lg transition">
              <GitBranch className="w-8 h-8 text-indigo-600 mb-2" />
              <h3 className="font-semibold text-slate-900">Webhook Guide</h3>
              <p className="text-sm text-slate-600 mt-1">Configure and test webhooks</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}