import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { createPageUrl } from "@/utils";
import SEOHead from "@/components/SEOHead";
import { useTranslation } from "@/components/i18n/useTranslation";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { Toaster } from "sonner";
import HomeActionGrid from "@/components/home/HomeActionGrid";
import HomeHighlights from "@/components/home/HomeHighlights";
import HomePublicLinksSection from "@/components/home/HomePublicLinksSection";
import HomeInlineCreator from "@/components/home/HomeInlineCreator";
import HomeWalletLinksManager from "@/components/home/HomeWalletLinksManager";
import HomeTrustProofSection from "@/components/home/HomeTrustProofSection";
import WalletConnect from "@/components/checkout/WalletConnect";
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
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="top-right" />
      <SEOHead
        title="PayADA — Accept Cardano (ADA) Payments Easily"
        description="Accept Cardano (ADA) payments effortlessly with PayADA. Instant blockchain settlement, advanced analytics, global reach, and 1.75% flat fee. Set up in under 5 minutes — no credit card required."
        canonical="https://payada.io/"
        structuredData={structuredData}
      />
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69999e4306b9e4632bd7d454/1b4bc7fb6_be2b2b99e_1000069668.jpg" alt="PayADA Logo" className="h-9 w-9 rounded-xl" />
            <span className="text-lg font-bold text-foreground">PayADA</span>
          </Link>

          <nav className="hidden items-center gap-6 md:ml-8 md:flex lg:ml-12">
            <Link to={createPageUrl("Features")} className="text-sm font-medium text-muted-foreground transition hover:text-foreground">Features</Link>
            <Link to={createPageUrl("Pricing")} className="text-sm font-medium text-muted-foreground transition hover:text-foreground">Pricing</Link>
            <Link to={createPageUrl("Documentation")} className="text-sm font-medium text-muted-foreground transition hover:text-foreground">Documentation</Link>
            <Link to={createPageUrl("Contact")} className="text-sm font-medium text-muted-foreground transition hover:text-foreground">Contact</Link>
          </nav>

          <div className="flex items-center gap-3 flex-1 justify-end">
            <div className="hidden lg:block w-full max-w-[220px]">
              <WalletConnect onConnected={({ address, ...walletData }) => {
                setConnectedWallet({ address, ...walletData });
              }} />
            </div>
            <ThemeToggle className="border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800" />
            <Button variant="ghost" onClick={handleLogin} className="hidden sm:inline-flex">Log in</Button>
            <Button onClick={handleSignUp}>Dashboard</Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden pt-20 pb-16 px-4 sm:px-6 bg-background">
        <div className="relative max-w-7xl mx-auto space-y-6">
          <div className="rounded-3xl border border-primary/20 bg-primary/10 px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-primary">Payada V2 launch</p>
              <p className="text-sm text-foreground">Create a payment link, share it on X, and we’ll be your first customer with 5 ADA.</p>
            </div>
            <Button asChild className="rounded-2xl w-full sm:w-auto">
              <Link to="/try">Try the campaign</Link>
            </Button>
          </div>
          <HomeInlineCreator onWalletConnected={setConnectedWallet} />
          <HomeWalletLinksManager walletAddress={connectedWallet?.address || localStorage.getItem("payada_manual_wallet_address") || localStorage.getItem("payada_connected_wallet_address") || ""} />
        </div>
      </section>

      <HomeHighlights items={homeHighlights} />

      <HomeTrustProofSection />

      <HomePublicLinksSection />

      <HomeActionGrid
        title="More tools after checkout"
        description="Na je snelle link-creatie kan je nog altijd verder met de bestaande tools en systemen."
        items={homePrimaryActions}
      />


      <HomeActionGrid
        title="Merchant workspace sections"
        description="Each section below matches the tools merchants use most once they enter PayADA."
        items={homeWorkspaceSections}
      />


      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-8 mb-8 items-start">
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