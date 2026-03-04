import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { CheckCircle, Zap, Shield, Globe, ArrowRight, MessageSquare, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

const SUPPORTED_WALLETS = [
  { name: "Nami", url: "https://namiwallet.io" },
  { name: "Eternl", url: "https://eternl.io" },
  { name: "Flint", url: "https://flint-wallet.com" },
  { name: "Lace", url: "https://www.lace.io" },
  { name: "Typhon", url: "https://typhonwallet.io" },
  { name: "GeroWallet", url: "https://gerowallet.io" },
  { name: "Yoroi", url: "https://yoroi-wallet.com" },
];

const features = [
  {
    icon: Zap,
    title: "Instant Settlements",
    description: "Receive payments directly to your wallet with blockchain confirmation. No intermediaries, no delays."
  },
  {
    icon: Shield,
    title: "Bank-Grade Security",
    description: "Military-grade encryption, secure API keys, and comprehensive audit logs protect your transactions."
  },
  {
    icon: Globe,
    title: "Global Reach",
    description: "Accept payments from anyone, anywhere in the world using the Cardano blockchain."
  },
  {
    icon: MessageSquare,
    title: "Webhooks & Integration",
    description: "Real-time event notifications and REST APIs for seamless integration with your systems."
  },
  {
    icon: CheckCircle,
    title: "Payment Links",
    description: "Generate shareable payment links in seconds. No technical knowledge required."
  },
  {
    icon: Zap,
    title: "Subscriptions",
    description: "Set up recurring billing and subscription plans with automatic payment collection."
  }
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to={createPageUrl("Home")} className="text-2xl font-bold">
            Pay<span className="text-indigo-600">ADA</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to={createPageUrl("Pricing")} className="text-sm text-slate-600 hover:text-slate-900">Pricing</Link>
            <Link to={createPageUrl("Security")} className="text-sm text-slate-600 hover:text-slate-900">Security</Link>
            <Link to={createPageUrl("Documentation")} className="text-sm text-slate-600 hover:text-slate-900">Docs</Link>
            <Link to={createPageUrl("Contact")} className="text-sm text-slate-600 hover:text-slate-900">Contact</Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-20">
          <h1 className="text-5xl font-bold text-slate-900 mb-6">Powerful Features for Modern Payments</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">Everything you need to accept Cardano payments with confidence and ease.</p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, idx) => (
            <div key={idx} className="border border-slate-200 rounded-lg p-6 hover:border-indigo-300 hover:shadow-lg transition">
              <feature.icon className="w-12 h-12 text-indigo-600 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Supported Wallets */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <Wallet className="w-10 h-10 text-indigo-600 mx-auto mb-3" />
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Compatible Wallets</h2>
            <p className="text-slate-600">PayADA works seamlessly with all major Cardano wallets. Your customers can pay in one click.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {SUPPORTED_WALLETS.map((w) => (
              <a key={w.name} href={w.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-3 border border-slate-200 rounded-full hover:border-indigo-400 hover:shadow-md transition bg-white text-slate-700 font-medium text-sm">
                <Wallet className="w-4 h-4 text-indigo-500" />
                {w.name}
              </a>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg mb-8 opacity-90">Start accepting Cardano payments today. Free to sign up, no credit card required.</p>
          <Link to={createPageUrl("Home")}>
            <Button className="bg-white text-indigo-600 hover:bg-slate-100">
              Create Account <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}