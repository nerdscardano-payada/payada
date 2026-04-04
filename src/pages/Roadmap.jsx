import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { CheckCircle2, Clock, Rocket, ArrowRight, Link2, Coins, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import SEOHead from "@/components/SEOHead";

const launched = [
  {
    title: "Payment Links",
    description: "Create simple Cardano payment links for products, services, invoices, and direct payments."
  },
  {
    title: "CNT Payments",
    description: "Accept selected Cardano Native Tokens with dedicated checkout flows and token-based payment support."
  },
  {
    title: "Access Links & Gating",
    description: "Sell access to communities, premium content, and gated experiences with ADA or CNT payments."
  }
];

const upcoming = [
  {
    title: "Focus and refinement",
    badge: "NOW",
    description: "We are simplifying the platform around the core flows that matter most: payment links, CNT payments, access links, and gating."
  },
  {
    title: "Better merchant experience",
    badge: "NEXT",
    description: "Expect cleaner setup, better conversion, and easier day-to-day management for these focused payment products."
  },
  {
    title: "More tools later",
    badge: "LATER",
    description: "Other tools are not gone, but they are being held back until the core payment and access products are stronger."
  }
];

const launchedIcons = [Link2, Coins, Lock];
const upcomingIcons = [Rocket, CheckCircle2, Clock];

export default function RoadmapPage() {
  const handleSignUp = () => base44.auth.redirectToLogin(createPageUrl("Dashboard"));

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Roadmap — PayADA Product Focus"
        description="PayADA is now focused on payment links, CNT payments, access links, and gating. Other tools may return later after the core experience is stronger."
        canonical="https://payada.io/roadmap"
      />
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to={createPageUrl("Home")} className="flex items-center gap-2">
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69999e4306b9e4632bd7d454/1b4bc7fb6_be2b2b99e_1000069668.jpg" alt="PayADA Logo" className="w-8 h-8 rounded-lg" />
            <span className="text-lg font-bold text-slate-900">Pay<span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">ADA</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to={createPageUrl("Features")} className="text-sm text-slate-600 hover:text-slate-900">Features</Link>
            <Link to={createPageUrl("Pricing")} className="text-sm text-slate-600 hover:text-slate-900">Pricing</Link>
            <Link to={createPageUrl("Roadmap")} className="text-sm text-blue-600 font-medium">Roadmap</Link>
            <Link to={createPageUrl("Documentation")} className="text-sm text-slate-600 hover:text-slate-900">Documentation</Link>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleSignUp} className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500">
              Get started
            </Button>
          </div>
        </div>
      </nav>

      <section className="bg-gradient-to-br from-blue-50 to-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Rocket className="w-4 h-4" />
            Product Direction
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">A more focused PayADA roadmap</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">We are narrowing the platform around the products we want to do best first: payment links, CNT payments, access links, and gating.</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Available now</h2>
          <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">LIVE</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(launched) && launched.map((item, i) => {
            const Icon = launchedIcons[i] || Link2;
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t border-dashed border-slate-200" />
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">What comes next</h2>
          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">ROADMAP</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(upcoming) && upcoming.map((item, i) => {
            const Icon = upcomingIcons[i] || Coins;
            return (
              <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-6 hover:border-cyan-300 hover:shadow-sm transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-slate-900">{item.title}</h3>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">{item.badge}</span>
                    </div>
                    <p className="text-sm text-slate-600">{item.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Built around simpler merchant flows</h2>
          <p className="text-blue-100 text-lg mb-8">Our near-term focus is depth over breadth, so merchants can launch faster with fewer distractions.</p>
          <Button size="lg" onClick={handleSignUp} className="bg-white text-blue-600 hover:bg-blue-50 gap-2">
            Get started <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>

      <footer className="bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm">
            <p>© 2026 PayADA. All rights reserved.</p>
            <div className="flex gap-6 mt-4 sm:mt-0">
              <Link to={createPageUrl("PrivacyPolicy")} className="hover:text-white transition">Privacy</Link>
              <Link to={createPageUrl("TermsOfService")} className="hover:text-white transition">Terms</Link>
              <Link to={createPageUrl("Contact")} className="hover:text-white transition">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}