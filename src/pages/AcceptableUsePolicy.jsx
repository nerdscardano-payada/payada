import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import SEOHead from "@/components/SEOHead";
import { useTranslation } from "@/components/i18n/useTranslation";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function AcceptableUsePolicyPage() {
  const { t, lang, setLang } = useTranslation();
  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Acceptable Use Policy — PayADA"
        description="PayADA Acceptable Use Policy: prohibited activities including illegal transactions, money laundering, AML violations, fraud, technical abuse, and geographic restrictions for sanctioned countries."
        canonical="https://payada.io/acceptable-use-policy"
      />
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to={createPageUrl("Home")} className="text-2xl font-bold">
            Pay<span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">ADA</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to={createPageUrl("Documentation")} className="text-sm text-slate-600 hover:text-slate-900">{t("nav.docs")}</Link>
            <Link to={createPageUrl("Contact")} className="text-sm text-slate-600 hover:text-slate-900">{t("nav.contact")}</Link>
            <Link to={createPageUrl("TermsOfService")} className="text-sm text-slate-600 hover:text-slate-900">{t("roadmap.footer_terms")}</Link>
          </div>
          <LanguageSwitcher lang={lang} setLang={setLang} />
        </nav>
      </header>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-5xl font-bold text-slate-900 mb-4">Acceptable Use Policy</h1>
        <p className="text-slate-500 mb-2">Last updated: March 7, 2026</p>
        <p className="text-slate-500 mb-12">This Acceptable Use Policy ("AUP") sets forth the standards of conduct and restrictions for acceptable use of the PayADA platform and services.</p>

        <div className="prose prose-lg max-w-none text-slate-600 space-y-0">

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">1. Prohibited Activities</h2>
          <p>You agree not to use the PayADA platform for any of the following prohibited activities:</p>
          
          <h3 className="text-xl font-semibold text-slate-900 mt-8 mb-3">1.1 Illegal Activities</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Processing payments for illegal goods, services, or activities</li>
            <li>Money laundering or terrorist financing</li>
            <li>Sanctions evasion or violation of export controls</li>
            <li>Fraud, theft, or embezzlement</li>
            <li>Sale of counterfeit, stolen, or embargoed items</li>
            <li>Any activity that violates applicable laws and regulations</li>
          </ul>

          <h3 className="text-xl font-semibold text-slate-900 mt-8 mb-3">1.2 Financial Crimes & AML Violations</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Structuring transactions to evade AML/KYC reporting thresholds</li>
            <li>Processing payments on behalf of sanctioned individuals or entities</li>
            <li>Attempting to circumvent identity verification procedures</li>
            <li>Providing false or misleading information during account setup</li>
            <li>Using the platform to facilitate suspicious activity reporting (SAR) violations</li>
          </ul>

          <h3 className="text-xl font-semibold text-slate-900 mt-8 mb-3">1.3 Fraudulent & Deceptive Practices</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Phishing, spoofing, or social engineering attacks</li>
            <li>Creating fake merchant accounts or impersonating others</li>
            <li>Misrepresenting products, services, or refund policies</li>
            <li>Initiating payment disputes without legitimate grounds</li>
            <li>Manipulating exchange rates or price quotes</li>
            <li>Operating multi-level marketing schemes or pyramid schemes</li>
          </ul>

          <h3 className="text-xl font-semibold text-slate-900 mt-8 mb-3">1.4 Technical Abuse</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Attempting to hack, probe, or penetrate PayADA systems</li>
            <li>Launching distributed denial-of-service (DDoS) attacks</li>
            <li>Scraping, crawling, or unauthorized API access</li>
            <li>Reverse engineering or attempting to bypass security measures</li>
            <li>Uploading malware, viruses, or harmful code</li>
            <li>Circumventing rate limits or using automation to bypass controls</li>
          </ul>

          <h3 className="text-xl font-semibold text-slate-900 mt-8 mb-3">1.5 Harmful Content & Abuse</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Harassment, threats, or abusive language toward PayADA staff or other users</li>
            <li>Publishing or distributing child sexual abuse material (CSAM)</li>
            <li>Content promoting violence, extremism, or hate speech</li>
            <li>Spam or unsolicited commercial messages</li>
            <li>Defamation or false statements damaging PayADA's reputation</li>
          </ul>

          <h3 className="text-xl font-semibold text-slate-900 mt-8 mb-3">1.6 Regulated Activities Without License</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Operating as an unregistered payment institution or money transmitter</li>
            <li>Offering investment advisory services without proper licensing</li>
            <li>Engaging in securities trading or derivatives without authorization</li>
            <li>Operating a lending platform without compliance with applicable law</li>
            <li>Gambling or lottery services in restricted jurisdictions</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">2. Restricted Use Categories</h2>
          <p>The following activities are restricted and require explicit prior approval from PayADA:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>High-risk merchant categories (e.g., adult entertainment, firearms, tobacco)</li>
            <li>Cryptocurrency exchange services or crypto-to-fiat conversion without licensing</li>
            <li>Charitable fundraising or donation collection (must be verified 501(c)(3) or equivalent)</li>
            <li>Political fundraising or campaign contributions</li>
            <li>Cross-border payment services for high-risk jurisdictions</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">3. Geographic Restrictions</h2>
          <p>PayADA does not operate in the following jurisdictions due to regulatory restrictions:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>OFAC-sanctioned countries (North Korea, Iran, Syria, Crimea, etc.)</li>
            <li>Countries with comprehensive US or EU sanctions programs</li>
            <li>High-risk jurisdictions designated by FATF as non-compliant</li>
          </ul>
          <p className="mt-4">
            Merchants and users located in or operating from restricted jurisdictions are prohibited from using the Service.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">4. Enforcement & Consequences</h2>
          <p>Violation of this AUP may result in:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Immediate account suspension or termination</li>
            <li>Freezing of funds pending investigation</li>
            <li>Reporting to law enforcement and regulatory authorities</li>
            <li>Permanent blacklisting from the PayADA platform</li>
            <li>Legal action to recover damages</li>
            <li>Cooperation with authorities in civil or criminal investigations</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">5. Reporting & Compliance</h2>
          <p>
            If you believe another user is violating this AUP or engaging in illegal activity, please report it immediately via our{" "}
            <Link to={createPageUrl("Contact")} className="text-blue-600 hover:underline">contact form</Link>. 
            All reports are investigated thoroughly and treated confidentially.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">6. Changes to This Policy</h2>
          <p>
            PayADA reserves the right to update this AUP at any time. Continued use of the platform constitutes acceptance of changes. 
            Material changes will be communicated via email or prominent notice.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">7. Contact</h2>
          <p>For questions about this Acceptable Use Policy:</p>
          <ul className="list-disc list-inside space-y-2">
            <li><Link to={createPageUrl("Contact")} className="text-blue-600 hover:underline">Contact form</Link></li>
          </ul>
        </div>
      </section>
    </div>
  );
}