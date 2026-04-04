import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import { useTranslation } from "@/components/i18n/useTranslation";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function PricingPage() {
  const { t, lang, setLang } = useTranslation();

  const features = t("pricing_page.features");
  const faqs = t("pricing_page.faqs");

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "PriceSpecification",
    "name": "PayADA Transaction Fee",
    "description": "Flat 1.75% fee per Cardano (ADA) transaction. No setup fees, no monthly minimums.",
    "price": "1.75",
    "priceCurrency": "PERCENT"
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Pricing — 1.75% Flat Fee | PayADA"
        description="One simple fee: 1.75% per transaction. PayADA includes unlimited payment links, unlimited API keys, webhooks, subscription management, and advanced analytics — with no setup fees and no monthly minimums."
        canonical="https://payada.io/pricing"
        structuredData={structuredData}
      />
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to={createPageUrl("Home")} className="text-2xl font-bold text-foreground">
            Pay<span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">ADA</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to={createPageUrl("Features")} className="text-sm text-muted-foreground hover:text-foreground">{t("nav.features")}</Link>
            <Link to={createPageUrl("Security")} className="text-sm text-muted-foreground hover:text-foreground">{t("nav.security")}</Link>
            <Link to={createPageUrl("Documentation")} className="text-sm text-muted-foreground hover:text-foreground">{t("nav.docs")}</Link>
          </div>
          <LanguageSwitcher lang={lang} setLang={setLang} />
        </nav>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-foreground mb-4">{t("pricing_page.hero_title")}</h1>
          <p className="text-xl text-muted-foreground">{t("pricing_page.hero_sub")}</p>
        </div>

        <div className="grid md:grid-cols-1 gap-8 mb-20 max-w-2xl mx-auto">
          <div className="border border-primary/30 shadow-lg ring-2 ring-primary/10 rounded-lg p-8 bg-card">
            <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
              {t("pricing_page.flat_rate")}
            </div>
            <h3 className="text-2xl font-bold text-card-foreground mb-2">PayADA</h3>
            <p className="text-muted-foreground mb-6">{t("pricing_page.plan_desc")}</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-card-foreground">1.75%</span>
            </div>
            <Button className="w-full mb-8 bg-gradient-to-r from-primary to-accent hover:opacity-90">
              {t("pricing_page.plan_cta")}
            </Button>
            <div className="space-y-4">
              {Array.isArray(features) && features.map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">{t("pricing_page.faq_title")}</h2>
          <div className="space-y-6">
            {Array.isArray(faqs) && faqs.map((faq, idx) => (
              <div key={idx} className="border border-border rounded-lg p-6 bg-card">
                <h3 className="font-semibold text-card-foreground mb-2">{faq.q}</h3>
                <p className="text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}