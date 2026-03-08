import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, Wallet, Zap, Shield, Globe, MessageSquare, CheckCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import { useTranslation } from "@/components/i18n/useTranslation";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const SUPPORTED_WALLETS = [
  { name: "Nami", url: "https://namiwallet.io" },
  { name: "Eternl", url: "https://eternl.io" },
  { name: "Lace", url: "https://www.lace.io" },
  { name: "Typhon", url: "https://typhonwallet.io" },
  { name: "GeroWallet", url: "https://gerowallet.io" },
  { name: "Yoroi", url: "https://yoroi-wallet.com" },
];

const featureIcons = [Zap, Shield, Globe, MessageSquare, CheckCircle, Users];

export default function FeaturesPage() {
  const { t, lang, setLang } = useTranslation();

  const featureKeys = ["f1", "f2", "f3", "f4", "f5", "f6"];
  const features = featureKeys.map((k) => ({
    title: t(`features_page.${k}_title`),
    desc: t(`features_page.${k}_desc`),
  }));

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Features — PayADA Cardano Payment Gateway"
        description="PayADA offers instant ADA settlements, bank-grade security, Discord community gating, REST API with webhooks, and compatibility with Nami, Eternl, Lace, Typhon, GeroWallet and Yoroi wallets."
        canonical="https://payada.io/features"
      />
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to={createPageUrl("Home")} className="text-2xl font-bold">
            Pay<span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">ADA</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to={createPageUrl("Pricing")} className="text-sm text-slate-600 hover:text-slate-900">{t("nav.pricing")}</Link>
            <Link to={createPageUrl("Security")} className="text-sm text-slate-600 hover:text-slate-900">{t("nav.security")}</Link>
            <Link to={createPageUrl("Documentation")} className="text-sm text-slate-600 hover:text-slate-900">{t("nav.docs")}</Link>
            <Link to={createPageUrl("Contact")} className="text-sm text-slate-600 hover:text-slate-900">{t("nav.contact")}</Link>
          </div>
          <LanguageSwitcher lang={lang} setLang={setLang} />
        </nav>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-20">
          <h1 className="text-5xl font-bold text-slate-900 mb-6">{t("features_page.hero_title")}</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">{t("features_page.hero_sub")}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, idx) => {
            const Icon = featureIcons[idx];
            return (
              <div key={idx} className="border border-slate-200 rounded-lg p-6 hover:border-cyan-300 hover:shadow-lg transition">
                <Icon className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="mb-20">
          <div className="text-center mb-10">
            <Wallet className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent mx-auto mb-3" />
            <h2 className="text-3xl font-bold text-slate-900 mb-3">{t("features_page.wallets_title")}</h2>
            <p className="text-slate-600">{t("features_page.wallets_sub")}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {SUPPORTED_WALLETS.map((w) => (
              <a key={w.name} href={w.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-3 border border-slate-200 rounded-full hover:border-cyan-400 hover:shadow-md transition bg-white text-slate-700 font-medium text-sm">
                <Wallet className="w-4 h-4 bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent" />
                {w.name}
              </a>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">{t("features_page.cta_title")}</h2>
          <p className="text-lg mb-8 opacity-90">{t("features_page.cta_sub")}</p>
          <Link to={createPageUrl("Home")}>
            <Button className="bg-white text-blue-600 hover:bg-blue-50">
              {t("features_page.cta_button")} <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}