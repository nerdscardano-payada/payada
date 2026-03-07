import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { CheckCircle2, Clock, Rocket, Zap, Link2, ShoppingCart, Monitor, Bot, Coins, RefreshCw, Code2, Globe, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

const launched = [
  {
    icon: Link2,
    title: "Payment Links",
    description: "Maak betaallinks en deel ze met klanten. Geschikt voor eenmalige betalingen in ADA of fiat-gebaseerde bedragen.",
  },
  {
    icon: Monitor,
    title: "Pay Terminals",
    description: "Embedbare betaalterminals voor op je website of webshop, volledig aanpasbaar.",
  },
  {
    icon: ShoppingCart,
    title: "Shop Generator",
    description: "Genereer automatisch een eenvoudige webshop die Cardano-betalingen accepteert.",
  },
  {
    icon: Zap,
    title: "POS Terminal",
    description: "Point-of-sale interface voor in-person betalingen in ADA.",
  },
  {
    icon: Code2,
    title: "Button Generator",
    description: "Embedbare betaalknop voor elke website, gegenereerd met één klik.",
  },
  {
    icon: Bot,
    title: "Discord Gate",
    description: "Geef klanten toegang tot een Discord-server of rol na een geslaagde betaling.",
  },
  {
    icon: Globe,
    title: "Access Links",
    description: "Verkooptool voor community-toegang via Discord, Telegram of andere platforms.",
  },
  {
    icon: RefreshCw,
    title: "Abonnementen",
    description: "Terugkerende betalingen met configureerbare intervallen (wekelijks, maandelijks, jaarlijks).",
  },
  {
    icon: Lock,
    title: "Webhooks & API",
    description: "Volledige REST API + webhook-notificaties voor betalingsevents, inclusief HMAC-beveiliging.",
  },
];

const upcoming = [
  {
    icon: Coins,
    title: "CNT Betalingen (Cardano Native Tokens)",
    description: "Accepteer betalingen in Cardano Native Tokens zoals $SNEK, $MIN, $AGIX en meer — naast ADA.",
    badge: "In ontwikkeling",
    badgeColor: "bg-purple-100 text-purple-700",
  },
  {
    icon: ShoppingCart,
    title: "WooCommerce & Shopify plugins",
    description: "Kant-en-klare plugins voor populaire e-commerceplatformen.",
    badge: "Gepland",
    badgeColor: "bg-blue-100 text-blue-700",
  },
  {
    icon: RefreshCw,
    title: "Automatische fiat-omzetting",
    description: "Ontvang ADA en laat het automatisch omzetten naar EUR via een geïntegreerde DEX.",
    badge: "Onderzoek",
    badgeColor: "bg-amber-100 text-amber-700",
  },
  {
    icon: Bot,
    title: "Telegram Gate",
    description: "Geef klanten toegang tot een Telegram-groep of -kanaal na betaling — vergelijkbaar met Discord Gate.",
    badge: "Gepland",
    badgeColor: "bg-blue-100 text-blue-700",
  },
];

export default function RoadmapPage() {
  const handleSignUp = () => {
    base44.auth.redirectToLogin(createPageUrl("Dashboard"));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to={createPageUrl("Home")} className="flex items-center gap-2">
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69999e4306b9e4632bd7d454/1b4bc7fb6_be2b2b99e_1000069668.jpg" alt="PayADA Logo" className="w-8 h-8 rounded-lg" />
            <span className="text-lg font-bold text-slate-900">
              Pay<span className="text-indigo-600">ADA</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to={createPageUrl("Features")} className="text-sm text-slate-600 hover:text-slate-900">Features</Link>
            <Link to={createPageUrl("Pricing")} className="text-sm text-slate-600 hover:text-slate-900">Pricing</Link>
            <Link to={createPageUrl("Roadmap")} className="text-sm text-indigo-600 font-medium">Roadmap</Link>
            <Link to={createPageUrl("Documentation")} className="text-sm text-slate-600 hover:text-slate-900">Docs</Link>
          </div>
          <Button onClick={handleSignUp} className="bg-indigo-600 hover:bg-indigo-700">
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-50 to-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Rocket className="w-4 h-4" />
            Product Roadmap
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Wat we bouwen voor de toekomst
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Bekijk wat er al live staat en wat er in de pijplijn zit. We bouwen PayADA stap voor stap uit tot het meest complete Cardano betaalplatform.
          </p>
        </div>
      </section>

      {/* Launched */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Beschikbaar nu</h2>
          <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">LIVE</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {launched.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-6 hover:border-green-300 hover:shadow-sm transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900">{item.title}</h3>
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    </div>
                    <p className="text-sm text-slate-600">{item.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t border-dashed border-slate-200" />
      </div>

      {/* Upcoming */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <Clock className="w-5 h-5 text-indigo-600" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Binnenkort</h2>
          <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">ROADMAP</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcoming.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-6 hover:border-indigo-300 hover:shadow-sm transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-slate-900">{item.title}</h3>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{item.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Klaar om te starten?</h2>
          <p className="text-indigo-100 text-lg mb-8">
            Sluit je aan bij merchants die vandaag al Cardano-betalingen accepteren via PayADA.
          </p>
          <Button size="lg" onClick={handleSignUp} className="bg-white text-indigo-600 hover:bg-slate-100 gap-2">
            Maak gratis account <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm">
            <p>&copy; 2026 PayADA.io. All rights reserved.</p>
            <div className="flex gap-6 mt-4 sm:mt-0">
              <Link to={createPageUrl("PrivacyPolicy")} className="hover:text-white transition">Privacy Policy</Link>
              <Link to={createPageUrl("TermsOfService")} className="hover:text-white transition">Terms of Service</Link>
              <Link to={createPageUrl("Contact")} className="hover:text-white transition">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}