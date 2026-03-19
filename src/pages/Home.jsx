import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Zap, Lock, TrendingUp, Globe, CreditCard, Users, Ticket } from "lucide-react";
import { createPageUrl } from "@/utils";
import SEOHead from "@/components/SEOHead";
import ProductDemoSection from "@/components/home/ProductDemoSection";
import { useAuth } from "@/lib/AuthContext";
import { useTranslation } from "@/components/i18n/useTranslation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { Toaster } from "sonner";

const pathwayIcons = [CreditCard, Users, Ticket];
const whyIcons = [Zap, Lock, Globe, TrendingUp];
const pathwayPages = ["PaymentLinks", "AccessLinks", "Events"];
const pathwayVideos = [
  "https://video.twimg.com/amplify_video/2034541284552257536/vid/avc1/1888x866/ax3v4sHFu2PFZGRe.mp4?tag=21",
  "https://video.twimg.com/amplify_video/2034541227027103745/vid/avc1/1910x860/nGxDLZO2Fg-iVhVU.mp4?tag=21",
  "https://video.twimg.com/amplify_video/2034541324985159680/vid/avc1/1912x870/X5Pi5tlwEuO3aCcV.mp4?tag=21"
];
const pathwayEmbeds = [
  "https://1drv.ms/v/c/c9babd2faa79be07/IQQLyBOcBK29QZUfjZCXL21lAdltf7y3dLhjH0bszbWDb3o?autoplay=1&muted=1",
  "https://1drv.ms/v/c/c9babd2faa79be07/IQQvHwrDm-M8RKpKv_BpV30hAUWhNw91YfDv0N-JkGVHEDU?autoplay=1&muted=1",
  "https://1drv.ms/v/c/c9babd2faa79be07/IQT1kxT9DnpKTLL1pYZ-zVPWAY3Q8f9Mg2TzOu1I_l6RP2k?autoplay=1&muted=1",
];

export default function HomePage() {
  const { t, lang, setLang } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [activeDemoIndex, setActiveDemoIndex] = useState(0);
  const demoSectionRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = createPageUrl("Dashboard");
      return;
    }

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
  }, [isAuthenticated]);

  const handleSignUp = () => base44.auth.redirectToLogin(createPageUrl("Dashboard"));
  const handleLogin = () => base44.auth.redirectToLogin(createPageUrl("Dashboard"));
  const handleStartFlow = () => base44.auth.redirectToLogin(createPageUrl("Dashboard"));
  const handlePreviewFlow = (index) => {
    setActiveDemoIndex(index);
    demoSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const pathways = t("home.pathways");
  const useCases = t("home.usecases");
  const whyItems = t("home.why_items");
  const activePathway = Array.isArray(pathways) ? pathways[activeDemoIndex] : null;

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

      {/* Hero + Pathways */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.14),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.10),transparent_35%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center mb-12">
            <div className="max-w-4xl text-center lg:text-left mx-auto lg:mx-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-700 mb-6">
                <span className="h-2 w-2 rounded-full bg-cyan-500" />
                {t("home.hero_badge")}
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
                {t("home.hero_title")}
              </h1>
              <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto lg:mx-0 mb-8">
                {t("home.hero_sub")}
              </p>
              <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4 mb-4">
                <Button
                  size="lg"
                  onClick={() => handleStartFlow("PaymentLinks")}
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white gap-2 min-w-[240px]"
                >
                  {t("home.hero_primary_cta")} <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <Link to="/Demo">
                  <Button size="lg" variant="outline" className="border-slate-200 bg-white/80 gap-2">
                    ⚡ {t("home.demo_cta")}
                  </Button>
                </Link>
                <Link to="/Documentation">
                  <Button size="lg" variant="outline" className="border-slate-200 bg-white/80 gap-2">
                    📄 {t("home.docs_cta")}
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-400 rounded-[2rem] p-1 shadow-[0_30px_80px_rgba(14,165,233,0.22)]">
                <div className="bg-[#050816] rounded-[1.7rem] p-8 md:p-10 border border-slate-800/80">
                  <div className="space-y-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-slate-400 text-lg">{t("home.payment_received")}</p>
                      </div>
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 mt-1" />
                    </div>
                    <div className="text-3xl md:text-6xl font-bold text-white tracking-tight">₳ 250</div>
                    <div className="text-slate-400 text-xl">{t("home.confirmed")} • Block #8,234,567</div>
                    <div className="border-t border-slate-700/80 pt-6 grid grid-cols-2 gap-8">
                      <div>
                        <p className="text-slate-500 text-base mb-2">{t("home.net_amount")}</p>
                        <p className="text-white font-semibold text-xl md:text-3xl">₳ 246.25</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-base mb-2">{t("home.fee")}</p>
                        <p className="text-white font-semibold text-xl md:text-3xl">₳ 3.75</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">{t("home.pathways_title")}</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">{t("home.pathways_sub")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.isArray(pathways) && pathways.map((pathway, index) => {
              const Icon = pathwayIcons[index];
              return (
                <div key={pathway.title} className="group rounded-3xl border border-slate-200 bg-white/90 backdrop-blur-sm p-4 md:p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center mb-5 shadow-lg shadow-cyan-100">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-slate-900 mb-3">{pathway.title}</h3>
                  <p className="text-slate-600 mb-6 min-h-[72px]">{pathway.description}</p>
                  <Button
                    variant="ghost"
                    className="px-0 text-blue-600 hover:text-blue-700 hover:bg-transparent group-hover:translate-x-1 transition-transform"
                    onClick={() => handlePreviewFlow(index)}
                  >
                    {pathway.cta} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div ref={demoSectionRef}>
        <ProductDemoSection
          eyebrow={t("home.demo_section_eyebrow")}
          title={activePathway?.title || ""}
          description={activePathway?.description || ""}
          ctaLabel={activePathway?.cta || t("home.hero_primary_cta")}
          ctaTo={createPageUrl("Dashboard")}
          onCtaClick={handleSignUp}
          videoUrl={pathwayVideos[activeDemoIndex]}
          embedUrl={pathwayEmbeds[activeDemoIndex]}
        />
      </div>

      {/* Use Cases */}
      <section className="bg-slate-50 py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t("home.usecases_title")}</h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">{t("home.usecases_sub")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.isArray(useCases) && useCases.map((item, index) => {
              const Icon = pathwayIcons[index];
              return (
                <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-cyan-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why PayADA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 items-start">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t("home.why_title")}</h2>
            <p className="text-lg text-slate-600 max-w-2xl">{t("home.why_sub")}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.isArray(whyItems) && whyItems.map((item, index) => {
              const Icon = whyIcons[index] || CheckCircle2;
              return (
                <div key={item} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <Icon className="w-5 h-5 text-blue-600 mb-3" />
                  <p className="font-medium text-slate-900">{item}</p>
                </div>
              );
            })}
          </div>
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