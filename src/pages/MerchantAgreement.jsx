import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import SEOHead from "@/components/SEOHead";
import { useTranslation } from "@/components/i18n/useTranslation";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function MerchantAgreementPage() {
  const { t, lang, setLang } = useTranslation();
  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Merchant Agreement — PayADA"
        description="PayADA Merchant Agreement: grant of services, merchant obligations for compliance, customer communication and data security, 1.75% fee settlement, termination conditions, and dispute resolution for Cardano payment processing."
        canonical="https://payada.io/merchant-agreement"
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
        <h1 className="text-5xl font-bold text-slate-900 mb-4">Merchant Agreement</h1>
        <p className="text-slate-500 mb-2">Last updated: March 7, 2026</p>
        <p className="text-slate-500 mb-12">This Merchant Agreement ("Agreement") is entered into between PayADA ("Service Provider") and any individual or entity registering as a merchant on the PayADA platform ("Merchant").</p>

        <div className="prose prose-lg max-w-none text-slate-600 space-y-0">

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">1. Grant of Services</h2>
          <p>
            PayADA grants the Merchant a non-exclusive, revocable license to use the PayADA platform to:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>Create payment links and checkout pages</li>
            <li>Receive payments in ADA and whitelisted Cardano Native Tokens</li>
            <li>Access transaction history and reporting tools</li>
            <li>Integrate with PayADA's REST API and webhooks</li>
            <li>Manage customer data in accordance with applicable laws</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">2. Merchant Obligations</h2>
          <p>The Merchant agrees to:</p>
          
          <h3 className="text-xl font-semibold text-slate-900 mt-8 mb-3">2.1 Compliance</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Comply with all applicable local, national, and international laws and regulations</li>
            <li>Maintain accurate and complete information in merchant profile and settings</li>
            <li>Obtain all necessary licenses and permits required in their jurisdiction</li>
            <li>Notify PayADA immediately of any regulatory investigations or compliance issues</li>
            <li>Comply with PayADA's Acceptable Use Policy and Terms of Service</li>
          </ul>

          <h3 className="text-xl font-semibold text-slate-900 mt-8 mb-3">2.2 Customer Communication</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Provide clear, accurate descriptions of products and services</li>
            <li>Disclose refund and return policies prominently</li>
            <li>Respond to customer inquiries in a timely and professional manner</li>
            <li>Honor commitments made in product descriptions and marketing materials</li>
            <li>Not engage in deceptive or misleading marketing practices</li>
          </ul>

          <h3 className="text-xl font-semibold text-slate-900 mt-8 mb-3">2.3 Security & Data Protection</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Maintain the confidentiality of API keys and access credentials</li>
            <li>Implement reasonable security measures to protect customer data</li>
            <li>Report suspected security breaches to PayADA immediately</li>
            <li>Comply with GDPR, MiCA, and applicable data protection laws</li>
            <li>Not store sensitive payment information unnecessarily</li>
          </ul>

          <h3 className="text-xl font-semibold text-slate-900 mt-8 mb-3">2.4 Financial Integrity</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Maintain accurate financial records for transactions processed</li>
            <li>Cooperate with PayADA audits and compliance reviews</li>
            <li>Report suspicious transactions or potential fraud immediately</li>
            <li>Not engage in wash trading, layering, or structuring to evade reporting</li>
            <li>Accept the fees disclosed in the Pricing section without dispute</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">3. Payment Processing & Settlement</h2>
          <p>
            PayADA processes payments on behalf of the Merchant and settles funds directly to the Merchant's designated Cardano wallet address. 
            The Merchant acknowledges that:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>All settlements occur on-chain to the Merchant's specified wallet address</li>
            <li>PayADA deducts platform fees (currently 1.75%) from each confirmed transaction</li>
            <li>Blockchain network fees are separate and controlled by the Cardano network</li>
            <li>Confirmed transactions are irreversible; PayADA cannot reverse on-chain settlements</li>
            <li>The Merchant is solely responsible for managing received crypto-assets</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">4. Term & Termination</h2>
          
          <h3 className="text-xl font-semibold text-slate-900 mt-8 mb-3">4.1 Term</h3>
          <p>This Agreement becomes effective upon the Merchant's account activation and continues indefinitely unless terminated.</p>

          <h3 className="text-xl font-semibold text-slate-900 mt-8 mb-3">4.2 Termination by Merchant</h3>
          <p>
            The Merchant may terminate this Agreement at any time by notifying PayADA in writing at{" "}
            <a href="mailto:support@payada.io" className="text-blue-600 hover:underline">support@payada.io</a>.
          </p>

          <h3 className="text-xl font-semibold text-slate-900 mt-8 mb-3">4.3 Termination by PayADA</h3>
          <p>PayADA may terminate this Agreement immediately, with or without cause, if:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>The Merchant violates this Agreement or the Acceptable Use Policy</li>
            <li>The Merchant engages in illegal or fraudulent activity</li>
            <li>PayADA receives a court order or regulatory directive</li>
            <li>The Merchant becomes subject to sanctions or operates in a prohibited jurisdiction</li>
            <li>High-risk transaction patterns suggest money laundering or other financial crime</li>
          </ul>

          <h3 className="text-xl font-semibold text-slate-900 mt-8 mb-3">4.4 Effect of Termination</h3>
          <p>Upon termination:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>The Merchant's account access is immediately revoked</li>
            <li>Pending transactions may be completed or cancelled at PayADA's discretion</li>
            <li>Settlement of remaining funds occurs per the Merchant's instructions</li>
            <li>Data is retained in accordance with applicable law and this Agreement</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">5. Dispute Resolution & Chargebacks</h2>
          <p>
            The Merchant acknowledges that PayADA processes transactions on the Cardano blockchain. Once confirmed on-chain:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>Transactions cannot be reversed by PayADA or the Cardano network</li>
            <li>The Merchant assumes responsibility for customer disputes</li>
            <li>The Merchant is responsible for providing refunds if required</li>
            <li>PayADA does not manage chargebacks; disputes must be resolved between Merchant and customer</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">6. Representations & Warranties</h2>
          <p>The Merchant represents and warrants that:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>The Merchant has authority to enter into this Agreement</li>
            <li>All information provided is accurate, complete, and current</li>
            <li>The Merchant's business complies with applicable law</li>
            <li>Funds received through PayADA are from legitimate business activities</li>
            <li>The Merchant does not operate in a sanctioned jurisdiction</li>
            <li>No individual beneficial owner is subject to sanctions or restrictions</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">7. Liability & Indemnification</h2>
          <p>
            To the maximum extent permitted by law, PayADA shall not be liable for losses arising from the Merchant's use of the platform, 
            customer disputes, technical failures, or blockchain-related issues. The Merchant agrees to indemnify PayADA for claims arising 
            from the Merchant's products, services, or violation of this Agreement.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">8. Data & Privacy</h2>
          <p>
            The Merchant agrees to comply with the PayADA Privacy Policy and all applicable data protection laws (GDPR, MiCA, etc.). 
            PayADA may process transaction data for compliance, fraud prevention, and regulatory reporting purposes.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">9. Contact</h2>
          <p>For questions regarding this Merchant Agreement:</p>
          <ul className="list-disc list-inside space-y-2">
            <li><Link to={createPageUrl("Contact")} className="text-blue-600 hover:underline">Contact form</Link></li>
          </ul>
        </div>
      </section>
    </div>
  );
}