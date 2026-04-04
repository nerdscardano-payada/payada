import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  ArrowRight,
  Wallet,
  CreditCard,
  Package,
  Lock,
  Users,
  Shield,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";

const SUPPORTED_WALLETS = [
  { name: "Nami", url: "https://namiwallet.io" },
  { name: "Eternl", url: "https://eternl.io" },
  { name: "Lace", url: "https://www.lace.io" },
  { name: "Typhon", url: "https://typhonwallet.io" },
  { name: "Yoroi", url: "https://yoroi-wallet.com" },
  { name: "Vespr", url: "https://vespr.xyz" },
];

const features = [
  {
    title: "Payment links",
    desc: "Create hosted checkout links for simple ADA payments and share them anywhere.",
    icon: CreditCard,
  },
  {
    title: "CNT payments",
    desc: "Accept selected Cardano Native Tokens as part of your focused payment flow.",
    icon: Package,
  },
  {
    title: "Access links",
    desc: "Charge for community entry, premium content, or private destinations with a hosted link.",
    icon: Lock,
  },
  {
    title: "Gated experiences",
    desc: "Connect confirmed payments to access delivery for communities and members-only products.",
    icon: Users,
  },
  {
    title: "Secure hosted flow",
    desc: "Use reliable hosted checkout pages designed around Cardano wallet payments.",
    icon: Shield,
  },
  {
    title: "Merchant simplicity",
    desc: "Keep the setup lean with a smaller product surface and clearer customer journeys.",
    icon: CheckCircle,
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Features — PayADA"
        description="PayADA features focused on payment links, CNT payments, access links, and gated payment experiences on Cardano."
        canonical="https://payada.io/features"
      />

      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to={createPageUrl("Home")} className="text-2xl font-bold">
            Pay<span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">ADA</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to={createPageUrl("Pricing")} className="text-sm text-slate-600 hover:text-slate-900">Pricing</Link>
            <Link to={createPageUrl("Security")} className="text-sm text-slate-600 hover:text-slate-900">Security</Link>
            <Link to={createPageUrl("Documentation")} className="text-sm text-slate-600 hover:text-slate-900">Documentation</Link>
            <Link to={createPageUrl("Contact")} className="text-sm text-slate-600 hover:text-slate-900">Contact</Link>
          </div>
        </nav>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-20">
          <h1 className="text-5xl font-bold text-slate-900 mb-6">Focused features for modern Cardano payments</h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            PayADA is now centered on a tighter set of products: payment links, CNT payments, access links, and gated payment experiences.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="border border-slate-200 rounded-lg p-6 hover:border-cyan-300 hover:shadow-lg transition bg-white">
                <Icon className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="mb-20">
          <div className="text-center mb-10">
            <Wallet className="w-10 h-10 text-blue-600 mx-auto mb-3" />
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Supported wallets</h2>
            <p className="text-slate-600">Customers can complete checkout with popular Cardano wallets.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {SUPPORTED_WALLETS.map((wallet) => (
              <a
                key={wallet.name}
                href={wallet.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-3 border border-slate-200 rounded-full hover:border-cyan-400 hover:shadow-md transition bg-white text-slate-700 font-medium text-sm"
              >
                <Wallet className="w-4 h-4 text-blue-600" />
                {wallet.name}
              </a>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Build with the essentials</h2>
          <p className="text-lg mb-8 opacity-90">
            Start with a hosted payment or access link and grow from there.
          </p>
          <Link to={createPageUrl("Home")}>
            <Button className="bg-white text-blue-600 hover:bg-blue-50">
              Go to home <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}