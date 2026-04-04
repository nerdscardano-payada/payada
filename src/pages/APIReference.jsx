import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";

const endpoints = [
  {
    method: "POST",
    path: "/payment-links",
    description: "Create a payment link for a hosted ADA or CNT checkout.",
    params: "title, slug, amount_mode, amount_ada or cnt_amount",
    example: `curl -X POST https://api.payada.io/v1/payment-links \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d title="Premium Access" \\
  -d slug="premium-access" \\
  -d amount_mode="fixed_ada" \\
  -d amount_ada=25`
  },
  {
    method: "GET",
    path: "/payment-links/:id",
    description: "Get details for one payment link.",
    params: "id (payment link ID)",
    example: `curl https://api.payada.io/v1/payment-links/pl_abc123 \\
  -H "Authorization: Bearer YOUR_API_KEY"`
  },
  {
    method: "GET",
    path: "/payments",
    description: "List payments created through your links and access flows.",
    params: "status (optional), limit (optional)",
    example: `curl https://api.payada.io/v1/payments \\
  -H "Authorization: Bearer YOUR_API_KEY"`
  },
  {
    method: "POST",
    path: "/access-links",
    description: "Create an access link for gated communities or content.",
    params: "title, slug, platform, price_ada or cnt_amount",
    example: `curl -X POST https://api.payada.io/v1/access-links \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d title="Trading Club" \\
  -d slug="trading-club" \\
  -d platform="discord" \\
  -d price_ada=15`
  },
  {
    method: "GET",
    path: "/access-links/:id",
    description: "Get details for one access link.",
    params: "id (access link ID)",
    example: `curl https://api.payada.io/v1/access-links/al_abc123 \\
  -H "Authorization: Bearer YOUR_API_KEY"`
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
        title="API Reference — PayADA"
        description="PayADA API reference for payment links, payments, access links, and focused hosted checkout flows."
        canonical="https://payada.io/api-reference"
      />

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to={createPageUrl("Home")} className="text-2xl font-bold">
            Pay<span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">ADA</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to={createPageUrl("Documentation")} className="text-sm text-slate-600 hover:text-slate-900">Documentation</Link>
            <Link to={createPageUrl("Security")} className="text-sm text-slate-600 hover:text-slate-900">Security</Link>
          </div>
        </nav>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="mb-16">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">API Reference</h1>
          <p className="text-xl text-slate-600 max-w-3xl">
            The PayADA API is being aligned with our tighter product focus: payment links, CNT payments, access links, and gating-related payment flows.
          </p>
        </div>

        <div className="mb-20 border border-slate-200 rounded-lg p-8 bg-slate-50">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Authentication</h2>
          <p className="text-slate-600 mb-4">Authenticate requests with a bearer token.</p>
          <div className="bg-slate-900 text-slate-100 p-4 rounded font-mono text-sm mb-4">
            Authorization: Bearer YOUR_API_KEY
          </div>
          <p className="text-slate-600 text-sm">Use server-side storage for API keys and never expose them in public frontend code.</p>
        </div>

        <div className="mb-20 border border-slate-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Base URL</h2>
          <div className="bg-slate-100 p-4 rounded font-mono text-sm text-slate-900">
            https://api.payada.io/v1
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Core endpoints</h2>
          <div className="space-y-8">
            {endpoints.map((endpoint, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg p-8">
                <div className="flex items-start gap-4 mb-6">
                  <span className={`px-3 py-1 rounded text-white font-semibold text-sm ${endpoint.method === "GET" ? "bg-blue-600" : "bg-green-600"}`}>
                    {endpoint.method}
                  </span>
                  <div>
                    <code className="font-mono text-lg text-slate-900">{endpoint.path}</code>
                    <p className="text-slate-600 text-sm mt-1">{endpoint.description}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-slate-900 mb-2">Parameters</h4>
                  <p className="text-slate-600 text-sm">{endpoint.params}</p>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-slate-900 mb-2">Example</h4>
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

        <div className="mt-20 border border-slate-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Status codes</h2>
          <div className="space-y-4">
            {[
              ["200", "OK", "Request successful"],
              ["201", "Created", "Resource created successfully"],
              ["400", "Bad Request", "Invalid parameters"],
              ["401", "Unauthorized", "Invalid or missing API key"],
              ["404", "Not Found", "Requested resource does not exist"],
              ["429", "Too Many Requests", "Rate limit exceeded"]
            ].map(([code, title, desc]) => (
              <div key={code} className="flex gap-4">
                <span className="font-mono font-semibold text-red-600 w-10">{code}</span>
                <div>
                  <p className="font-semibold text-slate-900">{title}</p>
                  <p className="text-slate-600 text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}