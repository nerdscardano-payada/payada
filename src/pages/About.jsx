import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Users, Target, Zap, Globe } from "lucide-react";
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
    "description": "PayADA is the leading Cardano payment processor, serving merchants from startups to established businesses across Europe and beyond.",
    "foundingLocation": "Belgium",
    "areaServed": "Worldwide"
  };

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="About PayADA — Cardano Payment Processor"
        description="PayADA was founded to make Cardano payments accessible to everyone. Built by a team of blockchain developers and fintech specialists, based in Belgium, serving merchants worldwide."
        canonical="https://payada.io/about"
        structuredData={structuredData}
      />
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to={createPageUrl("Home")} className="text-2xl font-bold">
            Pay<span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">ADA</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to={createPageUrl("Security")} className="text-sm text-slate-600 hover:text-slate-900">{t("nav.security")}</Link>
            <Link to={createPageUrl("Contact")} className="text-sm text-slate-600 hover:text-slate-900">{t("nav.contact")}</Link>
          </div>
          <LanguageSwitcher lang={lang} setLang={setLang} />
        </nav>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-20">
          <h1 className="text-5xl font-bold text-slate-900 mb-6">{t("about.hero_title")}</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">{t("about.hero_sub")}</p>
        </div>

        <div className="max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">{t("about.story_title")}</h2>
          <div className="space-y-6 text-slate-600 text-lg">
            <p>{t("about.story_p1")}</p>
            <p>{t("about.story_p2")}</p>
            <p>{t("about.story_p3")}</p>
          </div>
        </div>

        <div className="mb-20">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">{t("about.values_title")}</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { Icon: Target, titleKey: "about.v1_title", descKey: "about.v1_desc" },
              { Icon: Zap, titleKey: "about.v2_title", descKey: "about.v2_desc" },
              { Icon: Globe, titleKey: "about.v3_title", descKey: "about.v3_desc" },
              { Icon: Users, titleKey: "about.v4_title", descKey: "about.v4_desc" },
            ].map(({ Icon, titleKey, descKey }, i) => (
              <div key={i} className="border border-slate-200 rounded-lg p-8">
                <Icon className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{t(titleKey)}</h3>
                <p className="text-slate-600">{t(descKey)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-20">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">{t("about.team_title")}</h2>
          <p className="text-slate-600 text-lg mb-8 max-w-3xl">{t("about.team_p1")}</p>
          <p className="text-slate-600 text-lg max-w-3xl">{t("about.team_p2")}</p>
        </div>
      </section>
    </div>
  );
}