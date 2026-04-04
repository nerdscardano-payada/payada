import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import SEOHead from "@/components/SEOHead";
import { useTranslation } from "@/components/i18n/useTranslation";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function PrivacyPolicyPage() {
  const { t, lang, setLang } = useTranslation();
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Privacy Policy — PayADA"
        description="PayADA Privacy Policy (updated March 2026): what data we collect, how we use it, legal basis under GDPR, data retention for AML compliance (5 years), your rights to access, rectify or erase data, and how to contact privacy@payada.io."
        canonical="https://payada.io/privacy-policy"
      />
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to={createPageUrl("Home")} className="text-2xl font-bold">
            Pay<span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">ADA</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to={createPageUrl("Documentation")} className="text-sm text-muted-foreground hover:text-foreground">{t("nav.docs")}</Link>
            <Link to={createPageUrl("Contact")} className="text-sm text-muted-foreground hover:text-foreground">{t("nav.contact")}</Link>
            <Link to={createPageUrl("TermsOfService")} className="text-sm text-muted-foreground hover:text-foreground">{t("roadmap.footer_terms")}</Link>
          </div>
          <LanguageSwitcher lang={lang} setLang={setLang} />
        </nav>
      </header>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-5xl font-bold text-foreground mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground mb-2">Last updated: March 7, 2026</p>
        <p className="text-muted-foreground mb-12">This Privacy Policy is compliant with the EU General Data Protection Regulation (GDPR) and applicable crypto-asset regulations including MiCA (Markets in Crypto-Assets Regulation, EU 2023/1114).</p>

        <div className="prose prose-lg max-w-none text-muted-foreground space-y-0">

          <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">1. Identity of the Data Controller</h2>
          <p>
            PayADA ("we", "us", "our", or "the Company") is the data controller responsible for the processing of your personal data
            through the PayADA platform ("Service"). For all privacy-related matters, you may contact us at:
          </p>
          <ul className="list-disc list-inside space-y-2 mt-4">
            <li>Email: <a href="mailto:support@payada.io" className="text-blue-600 hover:underline">support@payada.io</a></li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">2. Data We Collect</h2>
          <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">2.1 Data Provided by You</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Email address and name (when registering or contacting us)</li>
            <li>Business name and type</li>
            <li>Cardano wallet addresses (for payment processing)</li>
            <li>Shipping address (only if explicitly requested by the merchant)</li>
            <li>Payment-related identifiers and transaction hashes</li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">2.2 Technical / Usage Data</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>IP address, browser type, device type, and operating system</li>
            <li>Pages visited, session duration, referral sources</li>
            <li>API usage patterns (for merchants)</li>
            <li>Cookies and local storage data (see Section 6)</li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">2.3 Blockchain Data</h3>
          <p>
            Cardano blockchain transactions are public and immutable by nature. Wallet addresses and transaction hashes associated with payments
            are recorded on-chain and cannot be deleted. We process this data on the basis of legitimate interest and contractual necessity.
            We do not control the Cardano blockchain and cannot erase on-chain data.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">3. Legal Basis for Processing</h2>
          <p>We process your personal data on the following legal bases under GDPR Article 6:</p>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Contractual necessity (Art. 6(1)(b)):</strong> To provide the Service, process payments, and manage your merchant account.</li>
            <li><strong>Legal obligation (Art. 6(1)(c)):</strong> To comply with applicable laws including AML/CFT regulations, MiCA, and tax obligations.</li>
            <li><strong>Legitimate interest (Art. 6(1)(f)):</strong> For fraud prevention, security monitoring, and platform analytics.</li>
            <li><strong>Consent (Art. 6(1)(a)):</strong> For non-essential cookies and marketing communications (where applicable).</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">4. How We Use Your Data</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>To operate, maintain, and improve the Service</li>
            <li>To process transactions and generate payment records</li>
            <li>To verify identity and comply with AML/KYC obligations where required by law</li>
            <li>To send transactional notifications (payment confirmations, account alerts)</li>
            <li>To detect and prevent fraud, money laundering, and unauthorized access</li>
            <li>To comply with legal obligations under EU law and national legislation</li>
            <li>To respond to legal requests from competent authorities</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">5. Data Retention</h2>
          <p>
            We retain personal data only for as long as necessary for the purposes described in this Policy, or as required by applicable law.
            Transaction records and merchant data may be retained for a minimum of <strong>5 years</strong> in compliance with EU anti-money laundering
            directives (AMLD5/AMLD6) and MiCA requirements. After the retention period, data is securely deleted or anonymized.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">6. Cookies and Tracking</h2>
          <p>We use the following categories of cookies:</p>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Strictly necessary cookies:</strong> Required for the basic functioning of the Service (authentication sessions, security tokens). These cannot be disabled.</li>
            <li><strong>Functional cookies:</strong> Remember your preferences and settings. Used only with your consent.</li>
            <li><strong>Analytics cookies:</strong> Help us understand how the Service is used (page views, navigation paths). Used only with your consent.</li>
            <li><strong>No advertising or third-party tracking cookies</strong> are used without explicit consent.</li>
          </ul>
          <p className="mt-4">
            You may manage or withdraw your cookie consent at any time via your browser settings. Disabling strictly necessary cookies
            may impair Service functionality. We do not use cookies to track users across third-party websites.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">7. Security of Your Data</h2>
          <p>
            We implement appropriate technical and organizational security measures in accordance with GDPR Article 32, including:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>TLS 1.3 encryption for all data in transit</li>
            <li>AES-256 encryption for sensitive data at rest</li>
            <li>HMAC-SHA256 webhook signature verification</li>
            <li>Role-based access controls and least-privilege principles</li>
            <li>Regular security reviews and access audits</li>
            <li>API key hashing and secure credential storage</li>
          </ul>
          <p className="mt-4">
            Despite these measures, no transmission over the internet or electronic storage is 100% secure. In the event of a personal data
            breach, we will notify affected users and the competent supervisory authority within 72 hours, as required by GDPR Article 33.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">8. Your Rights Under GDPR</h2>
          <p>As a data subject under GDPR, you have the following rights:</p>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Right of access (Art. 15):</strong> Request a copy of the personal data we hold about you.</li>
            <li><strong>Right to rectification (Art. 16):</strong> Correct inaccurate or incomplete data.</li>
            <li><strong>Right to erasure (Art. 17):</strong> Request deletion of your data, subject to legal retention obligations.</li>
            <li><strong>Right to restriction of processing (Art. 18):</strong> Limit how we process your data in certain circumstances.</li>
            <li><strong>Right to data portability (Art. 20):</strong> Receive your data in a structured, machine-readable format.</li>
            <li><strong>Right to object (Art. 21):</strong> Object to processing based on legitimate interest.</li>
            <li><strong>Right to withdraw consent:</strong> Where processing is based on consent, you may withdraw it at any time.</li>
          </ul>
          <p className="mt-4">
            To exercise any of these rights, use our <Link to={createPageUrl("Contact")} className="text-indigo-600 hover:underline">contact form</Link>. 
            We will respond within 30 days. You also have the right to lodge a complaint with your national data protection authority.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">9. International Data Transfers</h2>
          <p>
            Where personal data is transferred outside the European Economic Area (EEA), we ensure adequate safeguards are in place,
            such as Standard Contractual Clauses (SCCs) approved by the European Commission, or transfers to countries with an
            adequacy decision.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">10. Third-Party Services</h2>
          <p>
            We use Blockfrost (IOHK) as a Cardano blockchain API provider. Their privacy policy governs data processed by their infrastructure.
            We do not sell your personal data to third parties. We do not use social media tracking pixels.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">11. Crypto-Asset Compliance (MiCA)</h2>
          <p>
            PayADA operates in the context of crypto-asset payment services. In accordance with the EU Markets in Crypto-Assets Regulation
            (MiCA, Regulation (EU) 2023/1114) and applicable Anti-Money Laundering directives, we may be required to collect,
            verify, and retain certain identity and transaction data for regulatory purposes. Users subject to AML/KYC verification
            will be notified separately.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">12. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of material changes by email or prominent notice
            on our website. Continued use of the Service after such changes constitutes acceptance of the updated Policy.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-12 mb-4">13. Contact</h2>
          <p>For any privacy-related questions or to exercise your rights:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Email: <a href="mailto:support@payada.io" className="text-blue-600 hover:underline">support@payada.io</a></li>
          </ul>
        </div>
      </section>
    </div>
  );
}