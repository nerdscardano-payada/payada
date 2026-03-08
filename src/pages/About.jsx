import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Target, Zap, Globe, Shield, Rocket, Heart } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { useTranslation } from "@/components/i18n/useTranslation";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function AboutPage() {
  const { t, lang, setLang } = useTranslation();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "PayADA",
    "url": "https://payada.io",
    "description": "PayADA is building the future of Cardano payments — making crypto commerce accessible for every merchant.",
    "foundingLocation": "Belgium",
    "areaServed": "Worldwide"
  };

  const values = [
    { Icon: Target, titleKey: "about.v1_title", descKey: "about.v1_desc", color: "text-blue-500" },
    { Icon: Shield, titleKey: "about.v2_title", descKey: "about.v2_desc", color: "text-cyan-500" },
    { Icon: Globe, titleKey: "about.v3_title", descKey: "about.v3_desc", color: "text-indigo-500" },
    { Icon: Heart, titleKey: "about.v4_title", descKey: "about.v4_desc", color: "text-violet-500" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="About PayADA — Building the Future of Cardano Payments"
        description="PayADA is building the future of Cardano payments. Our mission: make crypto commerce simple, secure, and accessible for every merchant."
        canonical="https://payada.io/about"
        structuredData={structuredData}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to={createPageUrl("Home")} className="text-2xl font-bold">
            Pay<span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">ADA</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to={createPageUrl("Features")} className="text-sm text-slate-600 hover:text-slate-900">{t("nav.features")}</Link>
            <Link to={createPageUrl("Roadmap")} className="text-sm text-slate-600 hover:text-slate-900">{t("nav.roadmap")}</Link>
            <Link to={createPageUrl("Security")} className="text-sm text-slate-600 hover:text-slate-900">{t("nav.security")}</Link>
            <Link to={createPageUrl("Contact")} className="text-sm text-slate-600 hover:text-slate-900">{t("nav.contact")}</Link>
          </div>
          <LanguageSwitcher lang={lang} setLang={setLang} />
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Rocket className="w-4 h-4" />
            {t("about.badge")}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            {t("about.hero_title")}
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {t("about.hero_sub")}
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">{t("about.mission_title")}</h2>
          <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
            <p>{t("about.mission_p1")}</p>
            <p>{t("about.mission_p2")}</p>
            <p>{t("about.mission_p3")}</p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">{t("about.values_title")}</h2>
          <p className="text-slate-600 text-center mb-12 max-w-xl mx-auto">{t("about.values_sub")}</p>
          <div className="grid md:grid-cols-2 gap-6">
            {values.map(({ Icon, titleKey, descKey, color }, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-8 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center mb-5`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{t(titleKey)}</h3>
                <p className="text-slate-600 leading-relaxed">{t(descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team / Origin */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">{t("about.team_title")}</h2>
          <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
            <p>{t("about.team_p1")}</p>
            <p>{t("about.team_p2")}</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-cyan-500 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">{t("about.cta_title")}</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">{t("about.cta_sub")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={createPageUrl("Home")}
              className="bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors"
            >
              {t("about.cta_button")}
            </Link>
            <Link
              to={createPageUrl("Roadmap")}
              className="border border-white/40 text-white font-semibold px-8 py-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              {t("about.cta_roadmap")}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500">
          © 2026 PayADA.io. All rights reserved.
        </div>
      </footer>
    </div>
  );
}