import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CreditCard, Users, Wallet } from "lucide-react";

const items = [
  {
    title: "💸 Get paid",
    description: "Create payment links and start accepting ADA + CNTs instantly.",
    icon: CreditCard,
    href: "#product-demo",
    cta: "See Demo"
  },
  {
    title: "💬 Monetize communities",
    description: "Sell Discord / Telegram access with automated role assignment.",
    icon: Users,
    href: "#product-demo",
    cta: "See Demo"
  },
  {
    title: "🎟️ Sell tickets",
    description: "Create events and manage check-ins with QR codes.",
    icon: Wallet,
    href: "#product-demo",
    cta: "See Demo"
  }
];

export default function SimplifiedHomeHero({ onPrimaryClick }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.14),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.10),transparent_35%)]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-700 mb-6">
            <span className="h-2 w-2 rounded-full bg-cyan-500"></span>
            Cardano-native payment infrastructure
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
            Accept Cardano payments effortlessly
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mb-8">
            PayADA.io makes it simple for merchants to accept ADA payments with payment links, a shop generator, pay terminals, and more — no technical knowledge required.
          </p>
          <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4 mb-4">
            <Button onClick={onPrimaryClick} size="lg" className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white gap-2 min-w-[240px]">
              Start accepting payments <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
            <Link to="/Demo">
              <Button size="lg" variant="outline" className="border-slate-200 bg-white/80 gap-2">
                ⚡ Try Demo
              </Button>
            </Link>
            <Link to="/Documentation">
              <Button size="lg" variant="outline" className="border-slate-200 bg-white/80 gap-2">
                📄 Docs
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