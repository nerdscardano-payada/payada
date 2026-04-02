import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { createPageUrl } from "@/utils";
import SEOHead from "@/components/SEOHead";
import { useTranslation } from "@/components/i18n/useTranslation";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { Toaster } from "sonner";
import HomeWalletHero from "@/components/home/HomeWalletHero";
import HomeActionGrid from "@/components/home/HomeActionGrid";
import HomeHighlights from "@/components/home/HomeHighlights";
import { homeHighlights, homePrimaryActions, homeWorkspaceSections } from "@/components/home/homeData";

export default function HomePage() {
  const { t } = useTranslation();
  const [connectedWallet, setConnectedWallet] = useState(null);

  useEffect(() => {
    const hasSeenLaunchCelebration = localStorage.getItem("payada_launch_2026");
    if (!hasSeenLaunchCelebration) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      toast.success(t("home.launch_title"), {
        description: t("home.launch_desc"),
        duration: 5000
      });

      localStorage.setItem("payada_launch_2026", "true");
    }
  }, [t]);

  const handleSignUp = () => base44.auth.redirectToLogin(createPageUrl("Dashboard"));
  const handleLogin = () => base44.auth.redirectToLogin(createPageUrl("Dashboard"));

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "PayADA",
    "url": "https://payada.io",
    "description": "The easiest way for merchants to accept Cardano (ADA) payments.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://payada.io/?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-right" />
      <SEOHead
        title="PayADA — Accept Cardano (ADA) Payments Easily"
        description="Accept Cardano (ADA) payments effortlessly with PayADA. Instant blockchain settlement, advanced analytics, global reach, and 1.75% flat fee. Set up in under 5 minutes — no credit card required."
        canonical="https://payada.io/"
        structuredData={structuredData}
      />
      <HomeWalletHero onLogin={handleLogin} onWalletConnected={setConnectedWallet} />

      <HomeHighlights items={homeHighlights} />

      <HomeActionGrid
        title="Start here"
        description="The homepage now surfaces the main actions merchants normally discover in the sidebar, so new visitors can understand the product immediately."
        items={homePrimaryActions}
      />

      <section id="workspace-overview" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="rounded-[2rem] bg-slate-950 text-white p-8 md:p-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">Workspace overview</p>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold">Everything from the sidebar, now explained on the homepage.</h2>
              <p className="mt-4 max-w-3xl text-slate-300 text-lg">
                From payment flows to customer tracking, merchant profile, webhooks, API keys and billing, this homepage now introduces the same core areas before users enter the dashboard.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-200">
              {connectedWallet?.address ? `Connected wallet: ${connectedWallet.address.slice(0, 12)}…${connectedWallet.address.slice(-8)}` : "No wallet connected yet"}
            </div>
          </div>
        </div>
      </section>

      <HomeActionGrid
        title="Merchant workspace sections"
        description="Each section below matches the tools merchants use most once they enter PayADA."
        items={homeWorkspaceSections}
      />

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to move from homepage to dashboard?</h2>
          <p className="text-xl text-blue-50 mb-8 max-w-2xl mx-auto">Login, connect your wallet, and continue with payment links, access links, customers, webhooks and billing.</p>
          <Button size="lg" onClick={handleSignUp} className="bg-white text-blue-600 hover:bg-blue-50 gap-2">
            Go to dashboard <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69999e4306b9e4632bd7d454/1b4bc7fb6_be2b2b99e_1000069668.jpg" alt="PayADA Logo" className="w-8 h-8 rounded-lg" />
                <span className="text-white font-bold">PayADA</span>
              </div>
              <p className="text-sm">{t("home.footer_tagline")}</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t("home.footer_product")}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to={createPageUrl("Features")} className="hover:text-white transition">{t("nav.features")}</Link></li>
                <li><Link to={createPageUrl("Pricing")} className="hover:text-white transition">{t("nav.pricing")}</Link></li>
                <li><Link to={createPageUrl("Security")} className="hover:text-white transition">{t("nav.security")}</Link></li>
                <li><Link to={createPageUrl("Roadmap")} className="hover:text-white transition">{t("nav.roadmap")}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t("home.footer_developers")}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to={createPageUrl("Documentation")} className="hover:text-white transition">Documentation</Link></li>
                <li><Link to="/Tutorials" className="hover:text-white transition">Tutorials</Link></li>
                <li><Link to={createPageUrl("APIReference")} className="hover:text-white transition">API Reference</Link></li>
                <li><Link to={createPageUrl("Webhooks")} className="hover:text-white transition">Webhooks</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t("home.footer_company")}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to={createPageUrl("About")} className="hover:text-white transition">About</Link></li>
                <li><Link to={createPageUrl("Contact")} className="hover:text-white transition">{t("nav.contact")}</Link></li>
                <li>
                  <a href="https://x.com/PayAdaIO/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.73-8.835L1.254 2.25H8.08l4.259 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    X (Twitter)
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t("home.footer_resources")}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to={createPageUrl("Litepaper")} className="hover:text-white transition">Litepaper</Link></li>
                <li><Link to={createPageUrl("Documentation")} className="hover:text-white transition">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t("home.footer_legal")}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to={createPageUrl("TermsOfService")} className="hover:text-white transition">Terms</Link></li>
                <li><Link to={createPageUrl("PrivacyPolicy")} className="hover:text-white transition">Privacy</Link></li>
                <li><Link to={createPageUrl("AcceptableUsePolicy")} className="hover:text-white transition">Acceptable Use</Link></li>
                <li><Link to={createPageUrl("MerchantAgreement")} className="hover:text-white transition">Merchant Agreement</Link></li>
                <li><Link to={createPageUrl("Disclaimer")} className="hover:text-white transition">Disclaimer</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            <p>{t("home.footer_copyright")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}