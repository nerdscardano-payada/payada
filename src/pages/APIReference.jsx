import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";

const endpoints = [
  {
    method: "POST",
    path: "/payments",
    description: "Create a new payment request",
    params: "amount_ada, description, customer_email (optional)",
    example: `curl -X POST https://api.payada.io/v1/payments \\
  -H "Authorization: Bearer pk_live_..." \\
  -d amount_ada=50 \\
  -d description="Order #123"`
  },
  {
    method: "GET",
    path: "/payments/:id",
    description: "Get payment details",
    params: "id (payment ID)",
    example: `curl https://api.payada.io/v1/payments/pay_abc123 \\
  -H "Authorization: Bearer pk_live_..."`
  },
  {
    method: "GET",
    path: "/payments",
    description: "List all payments",
    params: "status (optional), limit (optional)",
    example: `curl https://api.payada.io/v1/payments \\
  -H "Authorization: Bearer pk_live_..."`
  },
  {
    method: "POST",
    path: "/subscriptions",
    description: "Create a subscription",
    params: "plan_id, customer_email, amount_ada, interval",
    example: `curl -X POST https://api.payada.io/v1/subscriptions \\
  -H "Authorization: Bearer pk_live_..." \\
  -d plan_id=plan_123 \\
  -d customer_email=user@example.com`
  },
  {
    method: "GET",
    path: "/subscriptions/:id",
    description: "Get subscription details",
    params: "id (subscription ID)",
    example: `curl https://api.payada.io/v1/subscriptions/sub_abc123 \\
  -H "Authorization: Bearer pk_live_..."`
  },
  {
    method: "POST",
    path: "/webhooks/endpoints",
    description: "Create webhook endpoint",
    params: "url, event_types (array)",
    example: `curl -X POST https://api.payada.io/v1/webhooks/endpoints \\
  -H "Authorization: Bearer pk_live_..." \\
  -d url=https://example.com/webhooks \\
  -d event_types=payment.confirmed`
  }
];

export default function APIReferencePage() {
  const [copied, setCopied] = useState(null);

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="API Reference — PayADA REST API for Cardano Payments"
        description="PayADA REST API reference: base URL, Bearer token authentication, endpoints to create and list payments, manage subscriptions, register webhook endpoints, and handle status codes — with cURL examples for every call."
        canonical="https://payada.io/api-reference"
      />
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to={createPageUrl("Home")} className="text-2xl font-bold">
            Pay<span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">ADA</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to={createPageUrl("Documentation")} className="text-sm text-slate-600 hover:text-slate-900">Docs</Link>
            <Link to={createPageUrl("Webhooks")} className="text-sm text-slate-600 hover:text-slate-900">Webhooks</Link>
            <Link to={createPageUrl("Security")} className="text-sm text-slate-600 hover:text-slate-900">Security</Link>
          </div>
        </nav>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="mb-16">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">API Reference</h1>
          <p className="text-xl text-slate-600">Complete API documentation for PayADA integration.</p>
        </div>

        {/* Pricing Notice */}
        <div className="mb-20 border border-blue-200 rounded-lg p-8 bg-blue-50">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Transparent Fee Structure</h2>
          <p className="text-slate-700 mb-3">All payments processed through the API incur a <span className="font-semibold text-blue-600">flat 1.75% platform fee</span>.</p>
          <p className="text-slate-600 text-sm"><span className="font-semibold">Example:</span> A ₳100 payment results in ₳98.25 received (fee: ₳1.75). Fee amounts are included in payment response objects.</p>
        </div>

        {/* Authentication */}
        <div className="mb-20 border border-slate-200 rounded-lg p-8 bg-slate-50">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Authentication</h2>
          <p className="text-slate-600 mb-4">All API requests require authentication using your API key.</p>
          <div className="bg-slate-900 text-slate-100 p-4 rounded font-mono text-sm mb-4">
            Authorization: Bearer YOUR_API_KEY
          </div>
          <p className="text-slate-600 text-sm">Find your API key in the Dashboard under API Keys. Keep it secret!</p>
        </div>

        {/* Base URL */}
        <div className="mb-20 border border-slate-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Base URL</h2>
          <div className="bg-slate-100 p-4 rounded font-mono text-sm text-slate-900">
            https://api.payada.io/v1
          </div>
        </div>

        {/* Endpoints */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Endpoints</h2>
          <div className="space-y-8">
            {endpoints.map((endpoint, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg p-8">
                <div className="flex items-start gap-4 mb-6">
                  <span className={`px-3 py-1 rounded text-white font-semibold text-sm ${
                    endpoint.method === 'GET' ? 'bg-blue-600' : 'bg-green-600'
                  }`}>
                    {endpoint.method}
                  </span>
                  <div>
                    <code className="font-mono text-lg text-slate-900">{endpoint.path}</code>
                    <p className="text-slate-600 text-sm mt-1">{endpoint.description}</p>
                  </div>
                </div>

                {endpoint.params && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-slate-900 mb-2">Parameters:</h4>
                    <p className="text-slate-600 text-sm">{endpoint.params}</p>
                  </div>
                )}

                <div className="mb-4">
                  <h4 className="font-semibold text-slate-900 mb-2">Example Request:</h4>
                  <div className="relative">
                    <pre className="bg-slate-900 text-slate-100 p-4 rounded font-mono text-sm overflow-x-auto">
                      {endpoint.example}
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 text-slate-400"
                      onClick={() => handleCopy(endpoint.example, idx)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Codes */}
        <div className="mt-20 border border-slate-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Status Codes</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <span className="font-mono font-semibold text-green-600">200</span>
              <div>
                <p className="font-semibold text-slate-900">OK</p>
                <p className="text-slate-600 text-sm">Request successful</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="font-mono font-semibold text-blue-600">201</span>
              <div>
                <p className="font-semibold text-slate-900">Created</p>
                <p className="text-slate-600 text-sm">Resource created successfully</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="font-mono font-semibold text-red-600">400</span>
              <div>
                <p className="font-semibold text-slate-900">Bad Request</p>
                <p className="text-slate-600 text-sm">Invalid parameters</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="font-mono font-semibold text-red-600">401</span>
              <div>
                <p className="font-semibold text-slate-900">Unauthorized</p>
                <p className="text-slate-600 text-sm">Invalid or missing API key</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="font-mono font-semibold text-red-600">429</span>
              <div>
                <p className="font-semibold text-slate-900">Too Many Requests</p>
                <p className="text-slate-600 text-sm">Rate limit exceeded</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}