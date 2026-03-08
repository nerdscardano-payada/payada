import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Shield, Lock, Eye, CheckCircle, AlertTriangle, Key } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const securityFeatures = [
  {
    icon: Lock,
    title: "End-to-End Encryption",
    description: "All data in transit is encrypted with TLS 1.3. Sensitive data at rest is encrypted with AES-256. No plaintext storage of credentials."
  },
  {
    icon: Shield,
    title: "Cardano Blockchain Validation",
    description: "Every transaction is verified on the immutable Cardano blockchain. Cryptographic proof of payment. No central point of failure."
  },
  {
    icon: Eye,
    title: "GDPR & MiCA Compliance",
    description: "Privacy by design, data minimisation, full data subject rights. Compliance with EU Markets in Crypto-Assets Regulation (MiCA)."
  },
  {
    icon: Key,
    title: "API Key Security",
    description: "API keys are bcrypt-hashed and never stored in plaintext. HMAC-SHA256 webhook signatures. Rate limiting and key revocation."
  },
  {
    icon: Shield,
    title: "AML / KYC Controls",
    description: "Anti-Money Laundering and Know-Your-Customer procedures in place as required by AMLD5/AMLD6 and MiCA regulations."
  },
  {
    icon: AlertTriangle,
    title: "Incident Response",
    description: "Breach notification within 72 hours per GDPR Art. 33. Dedicated incident response procedures. Continuous security monitoring."
  }
];

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Security & Compliance — PayADA"
        description="PayADA uses TLS 1.3, AES-256 encryption, bcrypt API key hashing, HMAC-SHA256 webhook signatures, and on-chain Cardano validation. Fully compliant with GDPR, MiCA, AMLD5/6, and the FATF Travel Rule."
        canonical="https://payada.io/security"
      />
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to={createPageUrl("Home")} className="text-2xl font-bold">
            Pay<span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">ADA</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to={createPageUrl("Features")} className="text-sm text-slate-600 hover:text-slate-900">Features</Link>
            <Link to={createPageUrl("PrivacyPolicy")} className="text-sm text-slate-600 hover:text-slate-900">Privacy</Link>
            <Link to={createPageUrl("TermsOfService")} className="text-sm text-slate-600 hover:text-slate-900">Terms</Link>
          </div>
        </nav>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-20">
          <h1 className="text-5xl font-bold text-slate-900 mb-6">Security & Compliance</h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            PayADA is built with security-first engineering and full compliance with EU crypto-asset regulations.
            Your funds, data, and transactions are protected at every layer.
          </p>
        </div>

        {/* Security Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {securityFeatures.map((feature, idx) => (
            <div key={idx} className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
              <feature.icon className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-slate-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="space-y-16">

          {/* Technical Security */}
          <div className="border-t border-slate-200 pt-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Technical Security Measures</h2>
            <p className="text-slate-600 mb-6">PayADA implements technical security controls aligned with GDPR Article 32 and industry best practices:</p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "TLS 1.3 encryption for all data in transit",
                "AES-256 encryption for sensitive data at rest",
                "API keys stored as bcrypt hashes — never in plaintext",
                "HMAC-SHA256 signatures for all webhook deliveries",
                "Rate limiting and brute-force protection on all endpoints",
                "Role-based access control (RBAC) and least-privilege architecture",
                "Comprehensive audit logs for all sensitive operations",
                "No storage of private keys or seed phrases — ever",
                "Idempotency controls to prevent duplicate transaction processing",
                "Automatic session expiration and token invalidation"
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Blockchain Security */}
          <div className="border-t border-slate-200 pt-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Cardano Blockchain Security</h2>
            <p className="text-slate-600 mb-6">
              PayADA leverages the Cardano blockchain's cryptographic security properties. All payments are validated on-chain
              with cryptographic proof and are immutable once confirmed.
            </p>
            <div className="space-y-3">
              {[
                "Immutable, cryptographically signed transaction records on-chain",
                "Proof-of-Stake (Ouroboros) consensus — no mining, no 51% attack vector",
                "Decentralized validation across thousands of stake pool operators",
                "Transaction confirmations verified via Blockfrost Cardano API",
                "Native multi-asset support with on-chain policy enforcement",
                "No custody of funds — direct wallet-to-wallet peer transfers"
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Regulatory Compliance */}
          <div className="border-t border-slate-200 pt-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Regulatory Compliance</h2>
            <p className="text-slate-600 mb-6">PayADA operates in full compliance with applicable EU regulations:</p>
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-2">MiCA — Markets in Crypto-Assets Regulation (EU 2023/1114)</h3>
                <p className="text-slate-600 text-sm">
                  PayADA aligns with MiCA requirements governing crypto-asset service providers in the EU. This includes disclosure obligations,
                  consumer protection standards, and anti-market-abuse provisions.
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-2">GDPR — General Data Protection Regulation (EU 2016/679)</h3>
                <p className="text-slate-600 text-sm">
                  Full compliance with GDPR including lawful bases for processing, data subject rights, breach notification within 72 hours,
                  data minimisation, and privacy by design. See our <Link to={createPageUrl("PrivacyPolicy")} className="text-indigo-600 hover:underline">Privacy Policy</Link> for details.
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-2">AML/CFT — Anti-Money Laundering & Counter-Terrorism Financing (AMLD5/AMLD6)</h3>
                <p className="text-slate-600 text-sm">
                  PayADA enforces AML controls including suspicious transaction monitoring, KYC procedures where required,
                  and mandatory reporting obligations to competent authorities.
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-2">FATF Travel Rule</h3>
                <p className="text-slate-600 text-sm">
                  Where applicable, PayADA complies with FATF Recommendation 16 (Travel Rule) requiring transmission of originator
                  and beneficiary information for qualifying crypto-asset transfers.
                </p>
              </div>
            </div>
          </div>

          {/* Cookie Policy */}
          <div className="border-t border-slate-200 pt-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Cookie Policy</h2>
            <p className="text-slate-600 mb-6">
              PayADA uses cookies strictly necessary for platform operation and, where you provide consent, for analytics purposes.
              We do not use advertising cookies or third-party tracking technologies.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-slate-900 border-b border-slate-200">Category</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-900 border-b border-slate-200">Purpose</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-900 border-b border-slate-200">Consent Required</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-900">Strictly Necessary</td>
                    <td className="px-4 py-3 text-slate-600">Authentication, session management, security tokens</td>
                    <td className="px-4 py-3"><span className="text-red-600 font-medium">No — required for operation</span></td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-900">Functional</td>
                    <td className="px-4 py-3 text-slate-600">User preferences, language settings</td>
                    <td className="px-4 py-3"><span className="text-amber-600 font-medium">Yes — opt-in required</span></td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-900">Analytics</td>
                    <td className="px-4 py-3 text-slate-600">Anonymised usage statistics to improve the platform</td>
                    <td className="px-4 py-3"><span className="text-amber-600 font-medium">Yes — opt-in required</span></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-slate-900">Advertising / Tracking</td>
                    <td className="px-4 py-3 text-slate-600">Third-party advertising</td>
                    <td className="px-4 py-3"><span className="text-green-700 font-medium">Not used</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-slate-500 text-sm mt-4">
              You may manage cookie preferences via your browser settings at any time. Withdrawing consent for non-essential cookies
              will not affect the legality of processing carried out prior to withdrawal.
            </p>
          </div>

          {/* Responsible Disclosure */}
          <div className="border-t border-slate-200 pt-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Responsible Disclosure</h2>
            <p className="text-slate-600">
              If you discover a security vulnerability in the PayADA platform, we encourage responsible disclosure.
              Please report findings to <a href="mailto:security@payada.io" className="text-blue-600 hover:underline">security@payada.io</a>.
              We commit to acknowledging reports within 48 hours and keeping researchers informed of remediation progress.
              We do not pursue legal action against researchers acting in good faith.
            </p>
          </div>

        </div>
      </section>
    </div>
  );
}