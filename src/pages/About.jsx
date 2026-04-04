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
    { Icon: Target, titleKey: "about.v1_title", descKey: "about.v1_desc", color: "text-primary" },
    { Icon: Shield, titleKey: "about.v2_title", descKey: "about.v2_desc", color: "text-accent" },
    { Icon: Globe, titleKey: "about.v3_title", descKey: "about.v3_desc", color: "text-primary" },
    { Icon: Heart, titleKey: "about.v4_title", descKey: "about.v4_desc", color: "text-accent" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="About PayADA — Building the Future of Cardano Payments"
        description="PayADA is building the future of Cardano payments. Our mission: make crypto commerce simple, secure, and accessible for every merchant."
        canonical="https://payada.io/about"
        structuredData={structuredData}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to={createPageUrl("Home")} className="text-2xl font-bold">
            Pay<span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">ADA</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to={createPageUrl("Features")} className="text-sm text-muted-foreground hover:text-foreground">{t("nav.features")}</Link>
            <Link to={createPageUrl("Roadmap")} className="text-sm text-muted-foreground hover:text-foreground">{t("nav.roadmap")}</Link>
            <Link to={createPageUrl("Security")} className="text-sm text-muted-foreground hover:text-foreground">{t("nav.security")}</Link>
            <Link to={createPageUrl("Contact")} className="text-sm text-muted-foreground hover:text-foreground">{t("nav.contact")}</Link>
          </div>
          <LanguageSwitcher lang={lang} setLang={setLang} />
        </nav>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Rocket className="w-4 h-4" />
            {t("about.badge")}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            {t("about.hero_title")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("about.hero_sub")}
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-8">{t("about.mission_title")}</h2>
          <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
            <p>{t("about.mission_p1")}</p>
            <p>{t("about.mission_p2")}</p>
            <p>{t("about.mission_p3")}</p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-muted py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-4 text-center">{t("about.values_title")}</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">{t("about.values_sub")}</p>
          <div className="grid md:grid-cols-2 gap-6">
            {values.map(({ Icon, titleKey, descKey, color }, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-8 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-5`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{t(titleKey)}</h3>
                <p className="text-muted-foreground leading-relaxed">{t(descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team / Origin */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-8">{t("about.team_title")}</h2>
          <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
            <p>{t("about.team_p1")}</p>
            <p>{t("about.team_p2")}</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary to-accent py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">{t("about.cta_title")}</h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">{t("about.cta_sub")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={createPageUrl("Home")}
              className="bg-background text-primary font-semibold px-8 py-3 rounded-lg hover:bg-background/90 transition-colors"
            >
              {t("about.cta_button")}
            </Link>
            <Link
              to={createPageUrl("Roadmap")}
              className="border border-primary-foreground/30 text-primary-foreground font-semibold px-8 py-3 rounded-lg hover:bg-primary-foreground/10 transition-colors"
            >
              {t("about.cta_roadmap")}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          © 2026 PayADA.io. All rights reserved.
        </div>
      </footer>
    </div>
  );
}