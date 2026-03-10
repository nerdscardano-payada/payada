import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import { useTranslation } from "@/components/i18n/useTranslation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function ContactPage() {
  const { t, lang, setLang } = useTranslation();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact PayADA",
    "url": "https://payada.io/contact",
    "description": "Get in touch with the PayADA team.",
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "support@payada.io",
      "contactType": "customer support"
    }
  };

  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    await base44.integrations.Core.SendEmail({
      to: "support@payada.io",
      subject: `[Contact] ${formData.subject} — from ${formData.name}`,
      body: `Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`,
    });
    setSending(false);
    toast.success("Message sent! We'll get back to you soon.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Contact PayADA — Get in Touch"
        description="Have questions about PayADA? Send us a message or browse our FAQ."
        canonical="https://payada.io/contact"
        structuredData={structuredData}
      />
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to={createPageUrl("Home")} className="text-2xl font-bold">
            Pay<span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">ADA</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to={createPageUrl("About")} className="text-sm text-slate-600 hover:text-slate-900">{t("nav.about") || "About"}</Link>
            <Link to={createPageUrl("Documentation")} className="text-sm text-slate-600 hover:text-slate-900">{t("nav.docs")}</Link>
          </div>
          <LanguageSwitcher lang={lang} setLang={setLang} />
        </nav>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-20">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">{t("contact.hero_title")}</h1>
          <p className="text-xl text-slate-600">{t("contact.hero_sub")}</p>
        </div>

        <div className="max-w-2xl mx-auto mb-16">
          <div className="border border-slate-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">{t("contact.form_title")}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">{t("contact.label_name")}</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder={t("contact.placeholder_name")} required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">{t("contact.label_email")}</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="your@email.com" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">{t("contact.label_subject")}</label>
                <select value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  required>
                  <option value="">{t("contact.subject_placeholder")}</option>
                  {(t("contact.subject_options") || []).map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">{t("contact.label_message")}</label>
                <textarea value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})}
                  rows="6" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder={t("contact.placeholder_message")} required />
              </div>
              <Button disabled={sending} className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white">
                {sending ? "Sending…" : t("contact.send_button")}
              </Button>
            </form>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">{t("contact.faq_title")}</h2>
          <div className="space-y-4">
            {[
              { q: t("contact.faq1_q"), a: t("contact.faq1_a") },
              { q: t("contact.faq2_q"), a: t("contact.faq2_a") },
              { q: t("contact.faq3_q"), a: t("contact.faq3_a") },
            ].map((faq, i) => (
              <details key={i} className="border border-slate-200 rounded-lg p-6 cursor-pointer group">
                <summary className="font-semibold text-slate-900 flex justify-between items-center">
                  {faq.q}
                  <span className="group-open:rotate-180 transition">▼</span>
                </summary>
                <p className="text-slate-600 mt-4">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}