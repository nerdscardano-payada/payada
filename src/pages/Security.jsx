import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Shield, Lock, Eye, CheckCircle, AlertTriangle, Key } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { useTranslation } from "@/components/i18n/useTranslation";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const featureIcons = [Lock, Shield, Eye, Key, Shield, AlertTriangle];

export default function SecurityPage() {
  const { t, lang, setLang } = useTranslation();

  const securityFeatures = [
    { titleKey: "security.f1_title", descKey: "security.f1_desc" },
    { titleKey: "security.f2_title", descKey: "security.f2_desc" },
    { titleKey: "security.f3_title", descKey: "security.f3_desc" },
    { titleKey: "security.f4_title", descKey: "security.f4_desc" },
    { titleKey: "security.f5_title", descKey: "security.f5_desc" },
    { titleKey: "security.f6_title", descKey: "security.f6_desc" },
  ];

  const techItems = t("security.tech_items");
  const blockchainItems = t("security.blockchain_items");

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Security & Compliance — PayADA"
        description="PayADA uses TLS 1.3, AES-256 encryption, bcrypt API key hashing, HMAC-SHA256 webhook signatures, and on-chain Cardano validation. Fully compliant with GDPR, MiCA, AMLD5/6, and the FATF Travel Rule."
        canonical="https://payada.io/security"
      />
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to={createPageUrl("Home")} className="text-2xl font-bold">
            Pay<span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">ADA</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to={createPageUrl("Features")} className="text-sm text-muted-foreground hover:text-foreground">{t("nav.features")}</Link>
            <Link to={createPageUrl("PrivacyPolicy")} className="text-sm text-muted-foreground hover:text-foreground">Privacy</Link>
            <Link to={createPageUrl("TermsOfService")} className="text-sm text-muted-foreground hover:text-foreground">Terms</Link>
          </div>
          <LanguageSwitcher lang={lang} setLang={setLang} />
        </nav>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-20">
          <h1 className="text-5xl font-bold text-foreground mb-6">{t("security.hero_title")}</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">{t("security.hero_sub")}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {securityFeatures.map((feature, idx) => {
            const Icon = featureIcons[idx];
            return (
              <div key={idx} className="border border-border rounded-xl p-6 hover:shadow-md transition-shadow">
                <Icon className="w-10 h-10 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">{t(feature.titleKey)}</h3>
                <p className="text-muted-foreground text-sm">{t(feature.descKey)}</p>
              </div>
            );
          })}
        </div>

        <div className="space-y-16">
          <div className="border-t border-border pt-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">{t("security.tech_title")}</h2>
            <p className="text-muted-foreground mb-6">{t("security.tech_sub")}</p>
            <div className="grid md:grid-cols-2 gap-4">
              {techItems.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-foreground text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">{t("security.blockchain_title")}</h2>
            <p className="text-muted-foreground mb-6">{t("security.blockchain_sub")}</p>
            <div className="space-y-3">
              {blockchainItems.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">{t("security.compliance_title")}</h2>
            <p className="text-muted-foreground mb-6">{t("security.compliance_sub")}</p>
            <div className="space-y-6">
              {[
                { titleKey: "security.compliance_mica_title", textKey: "security.compliance_mica_text" },
                { titleKey: "security.compliance_gdpr_title", textKey: "security.compliance_gdpr_text" },
                { titleKey: "security.compliance_aml_title", textKey: "security.compliance_aml_text" },
                { titleKey: "security.compliance_fatf_title", textKey: "security.compliance_fatf_text" },
              ].map((item, i) => (
                <div key={i} className="bg-muted rounded-xl p-6 border border-border">
                  <h3 className="font-bold text-foreground mb-2">{t(item.titleKey)}</h3>
                  <p className="text-muted-foreground text-sm">{t(item.textKey)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">{t("security.cookie_title")}</h2>
            <p className="text-muted-foreground mb-6">{t("security.cookie_sub")}</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-foreground border-b border-border">{t("security.cookie_col_category")}</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground border-b border-border">{t("security.cookie_col_purpose")}</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground border-b border-border">{t("security.cookie_col_consent")}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100"><td className="px-4 py-3 font-medium text-foreground">{t("security.cookie_cat_necessary")}</td><td className="px-4 py-3 text-muted-foreground">{t("security.cookie_cat_necessary_desc")}</td><td className="px-4 py-3"><span className="text-red-600 font-medium">{t("security.cookie_cat_necessary_consent")}</span></td></tr>
                  <tr className="border-b border-slate-100"><td className="px-4 py-3 font-medium text-foreground">{t("security.cookie_cat_functional")}</td><td className="px-4 py-3 text-muted-foreground">{t("security.cookie_cat_functional_desc")}</td><td className="px-4 py-3"><span className="text-amber-600 font-medium">{t("security.cookie_cat_functional_consent")}</span></td></tr>
                  <tr className="border-b border-slate-100"><td className="px-4 py-3 font-medium text-foreground">{t("security.cookie_cat_analytics")}</td><td className="px-4 py-3 text-muted-foreground">{t("security.cookie_cat_analytics_desc")}</td><td className="px-4 py-3"><span className="text-amber-600 font-medium">{t("security.cookie_cat_analytics_consent")}</span></td></tr>
                  <tr><td className="px-4 py-3 font-medium text-foreground">{t("security.cookie_cat_ads")}</td><td className="px-4 py-3 text-muted-foreground">{t("security.cookie_cat_ads_desc")}</td><td className="px-4 py-3"><span className="text-green-700 font-medium">{t("security.cookie_cat_ads_consent")}</span></td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-border pt-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">{t("security.disclosure_title")}</h2>
            <p className="text-muted-foreground">
              {t("security.disclosure_text")}{" "}
              <Link to={createPageUrl("Contact")} className="text-primary hover:underline">contact form</Link>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}