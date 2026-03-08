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
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Security & Compliance — PayADA"
        description="PayADA uses TLS 1.3, AES-256 encryption, bcrypt API key hashing, HMAC-SHA256 webhook signatures, and on-chain Cardano validation. Fully compliant with GDPR, MiCA, AMLD5/6, and the FATF Travel Rule."
        canonical="https://payada.io/security"
      />
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to={createPageUrl("Home")} className="text-2xl font-bold">
            Pay<span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">ADA</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to={createPageUrl("Features")} className="text-sm text-slate-600 hover:text-slate-900">{t("nav.features")}</Link>
            <Link to={createPageUrl("PrivacyPolicy")} className="text-sm text-slate-600 hover:text-slate-900">Privacy</Link>
            <Link to={createPageUrl("TermsOfService")} className="text-sm text-slate-600 hover:text-slate-900">Terms</Link>
          </div>
          <LanguageSwitcher lang={lang} setLang={setLang} />
        </nav>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-20">
          <h1 className="text-5xl font-bold text-slate-900 mb-6">{t("security.hero_title")}</h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">{t("security.hero_sub")}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {securityFeatures.map((feature, idx) => {
            const Icon = featureIcons[idx];
            return (
              <div key={idx} className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <Icon className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{t(feature.titleKey)}</h3>
                <p className="text-slate-600 text-sm">{t(feature.descKey)}</p>
              </div>
            );
          })}
        </div>

        <div className="space-y-16">
          <div className="border-t border-slate-200 pt-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">{t("security.tech_title")}</h2>
            <p className="text-slate-600 mb-6">{t("security.tech_sub")}</p>
            <div className="grid md:grid-cols-2 gap-4">
              {techItems.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">{t("security.blockchain_title")}</h2>
            <p className="text-slate-600 mb-6">{t("security.blockchain_sub")}</p>
            <div className="space-y-3">
              {blockchainItems.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">{t("security.compliance_title")}</h2>
            <p className="text-slate-600 mb-6">{t("security.compliance_sub")}</p>
            <div className="space-y-6">
              {[
                { title: "MiCA — Markets in Crypto-Assets Regulation (EU 2023/1114)", text: "PayADA aligns with MiCA requirements governing crypto-asset service providers in the EU. This includes disclosure obligations, consumer protection standards, and anti-market-abuse provisions." },
                { title: "GDPR — General Data Protection Regulation (EU 2016/679)", text: null },
                { title: "AML/CFT — Anti-Money Laundering & Counter-Terrorism Financing (AMLD5/AMLD6)", text: "PayADA enforces AML controls including suspicious transaction monitoring, KYC procedures where required, and mandatory reporting obligations to competent authorities." },
                { title: "FATF Travel Rule", text: "Where applicable, PayADA complies with FATF Recommendation 16 requiring transmission of originator and beneficiary information for qualifying crypto-asset transfers." },
              ].map((item, i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                  {item.text ? (
                    <p className="text-slate-600 text-sm">{item.text}</p>
                  ) : (
                    <p className="text-slate-600 text-sm">
                      Full compliance with GDPR including lawful bases for processing, data subject rights, breach notification within 72 hours, data minimisation, and privacy by design. See our <Link to={createPageUrl("PrivacyPolicy")} className="text-indigo-600 hover:underline">Privacy Policy</Link> for details.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">{t("security.cookie_title")}</h2>
            <p className="text-slate-600 mb-6">{t("security.cookie_sub")}</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-slate-900 border-b border-slate-200">Category</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-900 border-b border-slate-200">Purpose</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-900 border-b border-slate-200">Consent Required</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100"><td className="px-4 py-3 font-medium text-slate-900">Strictly Necessary</td><td className="px-4 py-3 text-slate-600">Authentication, session management, security tokens</td><td className="px-4 py-3"><span className="text-red-600 font-medium">No — required for operation</span></td></tr>
                  <tr className="border-b border-slate-100"><td className="px-4 py-3 font-medium text-slate-900">Functional</td><td className="px-4 py-3 text-slate-600">User preferences, language settings</td><td className="px-4 py-3"><span className="text-amber-600 font-medium">Yes — opt-in required</span></td></tr>
                  <tr className="border-b border-slate-100"><td className="px-4 py-3 font-medium text-slate-900">Analytics</td><td className="px-4 py-3 text-slate-600">Anonymised usage statistics to improve the platform</td><td className="px-4 py-3"><span className="text-amber-600 font-medium">Yes — opt-in required</span></td></tr>
                  <tr><td className="px-4 py-3 font-medium text-slate-900">Advertising / Tracking</td><td className="px-4 py-3 text-slate-600">Third-party advertising</td><td className="px-4 py-3"><span className="text-green-700 font-medium">Not used</span></td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">{t("security.disclosure_title")}</h2>
            <p className="text-slate-600">
              {t("security.disclosure_text")}{" "}
              <a href="mailto:security@payada.io" className="text-blue-600 hover:underline">security@payada.io</a>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}