import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Shield, Lock, Eye, CheckCircle } from "lucide-react";

const securityFeatures = [
  {
    icon: Lock,
    title: "End-to-End Encryption",
    description: "All data in transit is encrypted with TLS 1.3. Sensitive data at rest is encrypted with AES-256."
  },
  {
    icon: Shield,
    title: "Blockchain Validation",
    description: "Every transaction is verified on the Cardano blockchain. Immutable audit trail for all payments."
  },
  {
    icon: Eye,
    title: "Compliance & Audits",
    description: "Regular security audits and penetration testing. GDPR compliant. SOC 2 Type II certified."
  },
  {
    icon: Lock,
    title: "API Security",
    description: "HMAC-SHA256 signatures for webhooks. Rate limiting. API key rotation. Comprehensive audit logs."
  },
  {
    icon: Shield,
    title: "Two-Factor Authentication",
    description: "Optional 2FA for merchant accounts. IP whitelisting available for enterprise customers."
  },
  {
    icon: Eye,
    title: "Data Privacy",
    description: "We never store sensitive payment data. PCI-DSS compliance standards. Zero-knowledge architecture."
  }
];

export default function SecurityPage() {
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
            <Link to={createPageUrl("Pricing")} className="text-sm text-slate-600 hover:text-slate-900">Pricing</Link>
            <Link to={createPageUrl("Documentation")} className="text-sm text-slate-600 hover:text-slate-900">Docs</Link>
          </div>
        </nav>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-20">
          <h1 className="text-5xl font-bold text-slate-900 mb-6">Security First</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">Your funds and data are protected with enterprise-grade security measures.</p>
        </div>

        {/* Security Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {securityFeatures.map((feature, idx) => (
            <div key={idx} className="border border-slate-200 rounded-lg p-6">
              <feature.icon className="w-12 h-12 text-indigo-600 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Detailed Sections */}
        <div className="space-y-12">
          <div className="border-t border-slate-200 pt-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Blockchain Security</h2>
            <p className="text-slate-600 mb-4">PayADA leverages the Cardano blockchain's security properties:</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <span className="text-slate-700">Immutable transaction records that cannot be altered or reversed without consensus</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <span className="text-slate-700">Proof-of-Stake validation ensuring network integrity without environmental waste</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <span className="text-slate-700">Decentralized consensus preventing single points of failure</span>
              </li>
            </ul>
          </div>

          <div className="border-t border-slate-200 pt-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">API & Webhook Security</h2>
            <p className="text-slate-600 mb-4">All API communications are secured with:</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <span className="text-slate-700">HTTPS/TLS 1.3 encryption for all traffic</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <span className="text-slate-700">HMAC-SHA256 signatures for webhook authentication</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <span className="text-slate-700">Rate limiting to prevent abuse</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <span className="text-slate-700">API key rotation and revocation capabilities</span>
              </li>
            </ul>
          </div>

          <div className="border-t border-slate-200 pt-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Compliance & Certifications</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <span className="text-slate-700"><strong>GDPR Compliant:</strong> Full data subject rights, privacy by design</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <span className="text-slate-700"><strong>SOC 2 Type II:</strong> Audited controls over security and availability</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <span className="text-slate-700"><strong>PCI-DSS Aligned:</strong> Best practices for payment security</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}