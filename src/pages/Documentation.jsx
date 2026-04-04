import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Zap,
  CreditCard,
  Package,
  Shield,
  Users,
  ArrowRight,
  Wallet,
  Lock,
  CheckCircle2,
  Code
} from "lucide-react";
import SEOHead from "@/components/SEOHead";

const SUPPORTED_WALLETS = [
  { name: "Nami", url: "https://namiwallet.io" },
  { name: "Eternl", url: "https://eternl.io" },
  { name: "Lace", url: "https://www.lace.io" },
  { name: "Typhon", url: "https://typhonwallet.io" },
  { name: "Yoroi", url: "https://yoroi-wallet.com" },
  { name: "Vespr", url: "https://vespr.xyz" },
];

const sections = [
  { id: "quickstart", label: "Quickstart", icon: Zap },
  { id: "payment-links", label: "Payment links", icon: CreditCard },
  { id: "cnt-payments", label: "CNT payments", icon: Package },
  { id: "access-links", label: "Access links", icon: Lock },
  { id: "gating", label: "Gating", icon: Users },
  { id: "security", label: "Security", icon: Shield },
  { id: "wallets", label: "Wallets", icon: Wallet },
  { id: "api", label: "API", icon: Code },
];

function Section({ id, title, icon: SectionIcon, children }) {
  return (
    <section id={id} className="scroll-mt-24 mb-16 pb-16 border-b border-slate-200 last:border-0">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
          <SectionIcon className="w-5 h-5 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function CodeBlock({ code }) {
  return (
    <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm overflow-x-auto leading-relaxed my-4">
      {code}
    </pre>
  );
}

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Documentation — PayADA"
        description="PayADA documentation for payment links, CNT payments, access links, and gated access flows."
        canonical="https://payada.io/documentation"
      />

      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to={createPageUrl("Home")} className="text-2xl font-bold">
            Pay<span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">ADA</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link to={createPageUrl("Security")} className="text-sm text-slate-600 hover:text-slate-900">Security</Link>
          </div>
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3">Documentation</h1>
          <p className="text-xl text-slate-600 max-w-3xl">
            Everything you need to use PayADA’s focused product set: payment links, CNT payments, access links, and gating.
          </p>
        </div>

        <div className="flex gap-10">
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-24 space-y-1">
              {sections.map(({ id, label, icon: Icon }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </a>
              ))}
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="mb-16 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Start here</h2>
              <p className="text-slate-600 text-sm mb-6">
                PayADA is now centered on a smaller, clearer set of products. The documentation below reflects that simplified direction.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  "Create a payment link for ADA or CNT.",
                  "Share a checkout link with your customer.",
                  "Use access links for private communities or content.",
                  "Connect payment outcomes to gated access flows."
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 bg-white rounded-xl p-4 border border-blue-100">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <Section id="quickstart" title="Quickstart" icon={Zap}>
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                {[
                  {
                    title: "Create",
                    description: "Create a payment link or access link from your dashboard."
                  },
                  {
                    title: "Share",
                    description: "Send the hosted checkout URL directly to your customer or audience."
                  },
                  {
                    title: "Confirm",
                    description: "Track payment status and grant access once the payment is confirmed."
                  }
                ].map((item) => (
                  <div key={item.title} className="border border-slate-200 rounded-xl p-5">
                    <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-slate-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="payment-links" title="Payment links" icon={CreditCard}>
              <p className="text-slate-600 mb-4">
                Payment links let you create a hosted checkout for one-time payments. They are the fastest way to accept ADA, and they also support selected CNT payment flows.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-slate-900 border-b">Mode</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-900 border-b">Description</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-900 border-b">Best for</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="px-4 py-3 font-mono text-xs text-blue-600">fixed_ada</td>
                      <td className="px-4 py-3 text-slate-600">Charge a fixed ADA amount.</td>
                      <td className="px-4 py-3 text-slate-600">Products, services, donations, invoices.</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-xs text-blue-600">fixed_cnt</td>
                      <td className="px-4 py-3 text-slate-600">Charge a fixed Cardano Native Token amount.</td>
                      <td className="px-4 py-3 text-slate-600">Token-native offers and community payments.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-6 bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-600">
                Each link gets a shareable slug such as <code className="font-mono text-blue-600">/pay/your-offer</code>.
              </div>
            </Section>

            <Section id="cnt-payments" title="CNT payments" icon={Package}>
              <p className="text-slate-600 mb-4">
                CNT payments are part of the core PayADA direction. Merchants can configure accepted tokens and use dedicated token payment flows where supported.
              </p>
              <ol className="space-y-2 text-sm text-slate-600">
                <li className="flex gap-3"><span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">1</span>Select the token you want to accept.</li>
                <li className="flex gap-3"><span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">2</span>Set the amount, ticker, and token metadata.</li>
                <li className="flex gap-3"><span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">3</span>Share the hosted checkout page with your customer.</li>
                <li className="flex gap-3"><span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">4</span>Use the confirmed payment to unlock access or deliver the next step.</li>
              </ol>
            </Section>

            <Section id="access-links" title="Access links" icon={Lock}>
              <p className="text-slate-600 mb-4">
                Access links are designed for community memberships, premium content, and private experiences. You can charge in ADA or CNT and then route the payer into the gated destination.
              </p>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                {[
                  "Discord communities",
                  "Telegram groups",
                  "Private websites",
                  "Members-only content"
                ].map((item) => (
                  <div key={item} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-slate-700">
                    {item}
                  </div>
                ))}
              </div>
            </Section>

            <Section id="gating" title="Gating" icon={Users}>
              <p className="text-slate-600 mb-4">
                Gating connects payment confirmation to access delivery. This is one of the main product areas PayADA is prioritizing now.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                Typical flow: create the offer → collect payment → confirm on-chain payment → unlock access.
              </div>
            </Section>

            <Section id="security" title="Security" icon={Shield}>
              <p className="text-slate-600 mb-6">
                PayADA uses secure hosted flows, wallet-based payments, and platform-level validation to support reliable merchant checkouts.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  "Hosted checkout pages",
                  "Payment validation",
                  "Audit-friendly records",
                  "Merchant-configured destinations"
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="wallets" title="Wallets" icon={Wallet}>
              <p className="text-slate-600 mb-6">
                Customers can pay with popular Cardano wallets that support the required checkout flow.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {SUPPORTED_WALLETS.map((wallet) => (
                  <a
                    key={wallet.name}
                    href={wallet.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-medium hover:border-cyan-300 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    <Wallet className="w-4 h-4 flex-shrink-0" />
                    {wallet.name}
                  </a>
                ))}
              </div>
            </Section>

            <Section id="api" title="API" icon={Code}>
              <p className="text-slate-600 mb-4">
                The API reference is also being simplified to match the narrower product scope.
              </p>
              <CodeBlock code={`curl https://api.payada.io/v1/payment-links \\
  -H "Authorization: Bearer YOUR_API_KEY"`} />
            </Section>
          </main>
        </div>
      </div>
    </div>
  );
}