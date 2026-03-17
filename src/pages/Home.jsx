import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Zap, Lock, TrendingUp, Globe } from "lucide-react";
import { createPageUrl } from "@/utils";
import SEOHead from "@/components/SEOHead";
import { useTranslation } from "@/components/i18n/useTranslation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { Toaster } from "sonner";

const featureIcons = [Zap, Lock, TrendingUp, Globe];

export default function HomePage() {
  const { t, lang, setLang } = useTranslation();

  useEffect(() => {
    base44.auth.isAuthenticated().then((loggedIn) => {
      if (loggedIn) window.location.href = createPageUrl("Dashboard");
    });

    // Launch celebration on homepage
    const hasSeenLaunchCelebration = localStorage.getItem("payada_launch_2026");
    if (!hasSeenLaunchCelebration) {
      // Show confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Show welcome toast
      toast.success("Welcome to PayADA! 🎉", {
        description: "The easiest way to accept Cardano payments is now live.",
        duration: 5000
      });

      // Mark as seen
      localStorage.setItem("payada_launch_2026", "true");
    }
  }, []);

  const handleSignUp = () => base44.auth.redirectToLogin(createPageUrl("Dashboard"));
  const handleLogin = () => base44.auth.redirectToLogin(createPageUrl("Dashboard"));

  const features = t("home_features");
  const steps = t("home_steps");

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
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69999e4306b9e4632bd7d454/1b4bc7fb6_be2b2b99e_1000069668.jpg" alt="PayADA Logo" className="w-8 h-8 rounded-lg" />
            <span className="text-lg font-bold text-slate-900">
              Pay<span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">ADA</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link to={createPageUrl("Features")} className="text-sm text-slate-600 hover:text-slate-900">{t("nav.features")}</Link>
            <Link to={createPageUrl("Pricing")} className="text-sm text-slate-600 hover:text-slate-900">{t("nav.pricing")}</Link>
            <Link to={createPageUrl("Roadmap")} className="text-sm text-slate-600 hover:text-slate-900">{t("nav.roadmap")}</Link>
            <Link to={createPageUrl("Documentation")} className="text-sm text-slate-600 hover:text-slate-900">{t("nav.docs")}</Link>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher lang={lang} setLang={setLang} />
            <Button variant="ghost" size="sm" onClick={handleLogin}>{t("nav.sign_in")}</Button>
            <Button onClick={handleSignUp} className="hidden sm:inline-flex bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white">
              {t("nav.get_started")}
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
              {t("home.hero_title")}
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              {t("home.hero_sub")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={handleSignUp}
                className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white gap-2"
              >
                {t("home.hero_cta")} <ArrowRight className="w-5 h-5" />
              </Button>

              <Link to="/Documentation">
                <Button size="lg" variant="outline" className="border-2 gap-2">
                  📄 Docs
                </Button>
              </Link>
            </div>
            <p className="text-sm text-slate-500 mt-6">{t("home.hero_note")}</p>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl p-1 shadow-2xl">
              <div className="bg-slate-950 rounded-xl p-6 md:p-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">{t("home.payment_received")}</span>
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="text-3xl font-bold text-white">₳ 250</div>
                  <div className="text-slate-400 text-sm">{t("home.confirmed")} • Block #8,234,567</div>
                  <div className="pt-4 border-t border-slate-700">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-slate-500 text-xs">{t("home.net_amount")}</p>
                        <p className="text-white font-semibold">₳ 246.25</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">{t("home.fee")}</p>
                        <p className="text-white font-semibold">₳ 3.75</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-50 py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t("home.features_title")}</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">{t("home.features_sub")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Array.isArray(features) && features.map((feature, i) => {
              const Icon = featureIcons[i];
              return (
                <div key={i} className="bg-white rounded-xl p-8 border border-slate-200 hover:border-cyan-300 transition-colors">
                  <Icon className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center mb-16">{t("home.steps_title")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Array.isArray(steps) && steps.map((step, i) => (
            <div key={i} className="relative">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-500">
                  <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent font-bold text-lg">{i + 1}</span>
                </div>
                <div className="pt-1">
                  <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
                  <p className="text-slate-600 mt-2">{step.description}</p>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 -right-4 w-8 h-1 bg-gradient-to-r from-blue-200 to-cyan-200"></div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{t("home.cta_title")}</h2>
          <p className="text-xl text-blue-50 mb-8 max-w-2xl mx-auto">{t("home.cta_sub")}</p>
          <Button size="lg" onClick={handleSignUp} className="bg-white text-blue-600 hover:bg-blue-50 gap-2">
            {t("home.cta_button")} <ArrowRight className="w-5 h-5" />
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