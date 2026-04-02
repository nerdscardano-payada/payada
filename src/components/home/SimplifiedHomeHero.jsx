import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CreditCard, Users, Wallet } from "lucide-react";

const items = [
  {
    title: "Accept payments",
    description: "Create real mainnet payment links directly from the homepage.",
    icon: CreditCard,
    href: "#mainnet-links",
    cta: "Open payment flow"
  },
  {
    title: "Sell access",
    description: "Launch mainnet access links for communities, memberships or private offers.",
    icon: Users,
    href: "#mainnet-links",
    cta: "Open access flow"
  },
  {
    title: "Wallet-first setup",
    description: "Connect wallet first, and only ask for login when users want tracking.",
    icon: Wallet,
    href: "#mainnet-links",
    cta: "See mainnet flow"
  }
];

export default function SimplifiedHomeHero({ onPrimaryClick }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.14),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.10),transparent_35%)]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-700 mb-6">
            Payments + Access
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
            Turn payments into access.
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mb-8">
            PayADA should feel simple: accept Cardano payments, unlock access, and guide merchants straight to the actions that matter.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <a href="#mainnet-links">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white gap-2 min-w-[220px]">
                Start on mainnet <ArrowRight className="w-5 h-5" />
              </Button>
            </a>
            <Link to="/Demo">
              <Button size="lg" variant="outline" className="border-slate-200 bg-white/80">
                See live demo
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-cyan-300" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 mb-5">{item.description}</p>
                {item.href.startsWith("#") ? (
                  <a href={item.href}>
                    <Button variant="outline" size="sm" className="border-slate-200 bg-white gap-2">
                      {item.cta}
                    </Button>
                  </a>
                ) : (
                  <Link to={item.href}>
                    <Button variant="outline" size="sm" className="border-slate-200 bg-white gap-2">
                      {item.cta}
                    </Button>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}