import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import SEOHead from "@/components/SEOHead";
import { useTranslation } from "@/components/i18n/useTranslation";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function TermsOfServicePage() {
  const { t, lang, setLang } = useTranslation();
  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Terms of Service — PayADA"
        description="PayADA Terms of Service (updated March 2026): eligibility requirements, nature of the non-custodial service, crypto-asset risk disclosures, prohibited uses, 1.75% fee structure, liability limitations, and EU governing law."
        canonical="https://payada.io/terms-of-service"
      />
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to={createPageUrl("Home")} className="text-2xl font-bold">
            Pay<span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">ADA</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to={createPageUrl("Documentation")} className="text-sm text-slate-600 hover:text-slate-900">{t("nav.docs")}</Link>
            <Link to={createPageUrl("Contact")} className="text-sm text-slate-600 hover:text-slate-900">{t("nav.contact")}</Link>
            <Link to={createPageUrl("PrivacyPolicy")} className="text-sm text-slate-600 hover:text-slate-900">{t("roadmap.footer_privacy")}</Link>
          </div>
          <LanguageSwitcher lang={lang} setLang={setLang} />
        </nav>
      </header>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-5xl font-bold text-slate-900 mb-4">Terms of Service</h1>
        <p className="text-slate-500 mb-2">Last updated: March 7, 2026</p>
        <p className="text-slate-500 mb-12">
          These Terms of Service ("Terms") govern your access to and use of the PayADA platform ("Service"). 
          By using the Service, you agree to be legally bound by these Terms in their entirety.
          If you do not agree, you must immediately cease use of the Service.
        </p>

        <div className="prose prose-lg max-w-none text-slate-600 space-y-0">

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">1. Definitions</h2>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>"PayADA"</strong> refers to the PayADA platform operator.</li>
            <li><strong>"Service"</strong> refers to the PayADA payment infrastructure, website, APIs, and related services.</li>
            <li><strong>"Merchant"</strong> refers to any registered business or individual using PayADA to accept payments.</li>
            <li><strong>"Payer"</strong> refers to an end user making a payment through a merchant's checkout.</li>
            <li><strong>"Crypto-assets"</strong> includes ADA and Cardano Native Tokens (CNTs) processed through the Service.</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">2. Eligibility and Account Registration</h2>
          <p>To use the Service as a Merchant, you must:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Be at least 18 years of age or the age of majority in your jurisdiction</li>
            <li>Possess the legal authority to enter into binding agreements</li>
            <li>Provide accurate, complete, and up-to-date registration information</li>
            <li>Maintain the security of your account credentials and API keys</li>
            <li>Not be subject to sanctions or operating in a prohibited jurisdiction</li>
          </ul>
          <p className="mt-4">
            You are solely responsible for all activity occurring under your account. You must notify PayADA immediately at
            <a href="mailto:support@payada.io" className="text-indigo-600 hover:underline ml-1">support@payada.io</a> upon becoming aware of any unauthorized access.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">3. Nature of the Service</h2>
          <p>
            PayADA provides a technical infrastructure layer that facilitates crypto-asset payment processing on the Cardano blockchain.
            PayADA is <strong>not a financial institution, bank, exchange, custodian, or investment service provider</strong>.
            PayADA does not hold, custody, or control user funds at any point. All transactions are peer-to-peer, processed directly
            on the Cardano blockchain between the payer's wallet and the merchant's designated receiving address.
          </p>
          <p className="mt-4">
            PayADA acts as a technical service provider only. The economic and contractual relationship for any underlying purchase
            or service exists solely between the Merchant and the Payer. PayADA is not a party to such transactions.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">4. Crypto-Asset Risk Disclosure</h2>
          <p>
            Crypto-assets including ADA and Cardano Native Tokens are highly volatile and speculative in nature. By using the Service, you acknowledge and accept that:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>The value of crypto-assets can fluctuate significantly and may result in partial or total loss of value</li>
            <li>Blockchain transactions are irreversible once confirmed; PayADA cannot reverse, cancel, or refund completed transactions</li>
            <li>PayADA does not provide investment advice, financial advice, or price guarantees</li>
            <li>Network congestion, protocol changes, or forks may affect transaction speed and finality</li>
            <li>Smart contract and wallet-related losses are the sole responsibility of the user</li>
            <li>PayADA is not responsible for losses arising from market volatility between payment initiation and confirmation</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">5. Regulatory Compliance — MiCA & AML</h2>
          <p>
            PayADA operates in compliance with applicable European Union regulations, including:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>MiCA (EU 2023/1114):</strong> Markets in Crypto-Assets Regulation</li>
            <li><strong>AMLD5/AMLD6:</strong> Anti-Money Laundering Directives</li>
            <li><strong>GDPR (EU 2016/679):</strong> General Data Protection Regulation</li>
            <li><strong>Travel Rule (FATF):</strong> Where applicable to crypto-asset transfers</li>
          </ul>
          <p className="mt-4">
            Merchants and users may be required to complete identity verification (KYC) procedures. PayADA reserves the right to
            report suspicious transactions to competent authorities. Use of the Service for money laundering, terrorist financing,
            sanctions evasion, or any other illegal purpose is strictly prohibited and may result in immediate account suspension,
            reporting to authorities, and legal action.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">6. Prohibited Uses</h2>
          <p>You are strictly prohibited from using the Service for:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Money laundering, terrorist financing, or financing of criminal organizations</li>
            <li>Evasion of international sanctions (OFAC, EU, UN)</li>
            <li>Processing payments for illegal goods or services</li>
            <li>Fraud, phishing, or deceptive practices</li>
            <li>Activities regulated as financial services without appropriate licensing</li>
            <li>Pyramid schemes, Ponzi schemes, or fraudulent investment products</li>
            <li>Sale of counterfeit, stolen, or embargoed goods</li>
            <li>Any activity that violates applicable law in your jurisdiction or that of the recipient</li>
          </ul>
          <p className="mt-4">
            Violation of this section may result in immediate account termination, asset freezing where legally required, and reporting to law enforcement.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">7. Fees and Payment</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>A platform fee (as displayed on the Pricing page) is automatically deducted at the time of each confirmed transaction</li>
            <li>Fees are denominated as a percentage of the transaction value in ADA</li>
            <li>PayADA reserves the right to modify fee structures with a minimum of 30 days' prior written notice</li>
            <li>Blockchain network fees (transaction fees) are separate and charged by the Cardano network; PayADA has no control over these</li>
            <li>No refunds are issued for platform fees once a transaction has been confirmed on-chain</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">8. Limitation of Liability</h2>
          <p>
            <strong>To the maximum extent permitted by applicable law</strong>, PayADA and its officers, directors, employees, agents, partners,
            and licensors shall not be liable for:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>Any indirect, incidental, special, consequential, punitive, or exemplary damages</li>
            <li>Loss of profits, revenue, business, data, or goodwill</li>
            <li>Losses arising from blockchain network failures, congestion, or forks</li>
            <li>Losses resulting from errors in wallet addresses provided by users</li>
            <li>Unauthorized access to accounts due to user negligence</li>
            <li>Losses arising from price volatility of crypto-assets</li>
            <li>Service interruptions caused by third-party infrastructure, including Blockfrost or the Cardano network</li>
            <li>Any loss or damage not directly and primarily caused by PayADA's own gross negligence or willful misconduct</li>
          </ul>
          <p className="mt-4">
            In any event, PayADA's total aggregate liability to you for any claim shall not exceed the total platform fees
            paid by you in the <strong>three (3) months preceding the event giving rise to the claim</strong>.
          </p>
          <p className="mt-4">
            Some jurisdictions do not allow the exclusion or limitation of certain liabilities. In such cases, the applicable limitations
            will apply to the maximum extent permitted by law.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">9. Indemnification</h2>
          <p>
            You agree to fully indemnify, defend, and hold harmless PayADA and its affiliates, officers, directors, employees, and agents from and against
            any and all claims, liabilities, damages, losses, costs, and expenses (including reasonable legal fees) arising out of or relating to:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>Your use of or access to the Service</li>
            <li>Your violation of these Terms</li>
            <li>Your violation of any applicable law, regulation, or third-party right</li>
            <li>Any dispute between you and a Payer or third party</li>
            <li>Any fraudulent or illegal transactions processed through your account</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">10. Intellectual Property</h2>
          <p>
            All content, trademarks, logos, software, and materials on the PayADA platform are the property of PayADA or its licensors.
            You are granted a limited, non-exclusive, non-transferable license to use the Service for its intended purpose.
            You may not copy, reproduce, modify, distribute, or create derivative works without prior written consent.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">11. Availability and Modifications</h2>
          <p>
            PayADA does not guarantee uninterrupted, error-free, or secure availability of the Service. We reserve the right to
            modify, suspend, or discontinue the Service (or any part thereof) at any time, with or without notice.
            PayADA shall not be liable for any such modification, suspension, or discontinuation.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">12. Termination</h2>
          <p>
            PayADA may suspend or terminate your access to the Service, at any time, with or without notice, for any reason, including but not limited to:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>Violation of these Terms or applicable law</li>
            <li>Suspected fraudulent, unlawful, or abusive conduct</li>
            <li>Regulatory or compliance requirements</li>
            <li>Non-payment of fees</li>
            <li>Receipt of a court order or regulatory directive requiring suspension</li>
          </ul>
          <p className="mt-4">
            Upon termination, your right to use the Service ceases immediately. Sections on Liability, Indemnification, Governing Law,
            and any accrued rights shall survive termination.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">13. Dispute Resolution</h2>
          <p>
            In the event of a dispute arising from these Terms or your use of the Service, you agree to first attempt resolution
            by contacting us at <a href="mailto:legal@payada.io" className="text-indigo-600 hover:underline">legal@payada.io</a> and allowing 30 days for good-faith resolution.
          </p>
          <p className="mt-4">
            If the dispute cannot be resolved amicably, it shall be submitted to binding arbitration under the rules of a mutually
            agreed arbitration institution, unless otherwise required by applicable consumer protection law in your jurisdiction.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">14. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with European Union law and applicable national law.
            Any disputes not resolved through arbitration shall be subject to the exclusive jurisdiction of the competent courts.
            Nothing in these Terms limits your rights as a consumer under mandatory EU consumer protection law.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">15. Severability</h2>
          <p>
            If any provision of these Terms is found to be unlawful, void, or unenforceable, that provision shall be deemed severable
            and shall not affect the validity and enforceability of the remaining provisions.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">16. Entire Agreement</h2>
          <p>
            These Terms, together with the Privacy Policy and any other policies referenced herein, constitute the entire agreement
            between you and PayADA with respect to the Service and supersede all prior agreements and understandings.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">17. Contact</h2>
          <p>For legal matters or questions regarding these Terms:</p>
          <ul className="list-disc list-inside space-y-2">
            <li><Link to={createPageUrl("Contact")} className="text-indigo-600 hover:underline">Contact form</Link></li>
          </ul>
        </div>
      </section>
    </div>
  );
}