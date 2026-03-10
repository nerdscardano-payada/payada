import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import SEOHead from "@/components/SEOHead";
import { useTranslation } from "@/components/i18n/useTranslation";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function DisclaimerPage() {
  const { t, lang, setLang } = useTranslation();
  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Disclaimer — PayADA"
        description="PayADA Disclaimer: no financial or investment advice, crypto-asset volatility warnings, irreversibility of Cardano blockchain transactions, no custody of funds, technology risks, and limitations of liability."
        canonical="https://payada.io/disclaimer"
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
        <h1 className="text-5xl font-bold text-slate-900 mb-4">Disclaimer</h1>
        <p className="text-slate-500 mb-2">Last updated: March 7, 2026</p>
        <p className="text-slate-500 mb-12">This Disclaimer provides important information about the risks and limitations associated with using the PayADA platform.</p>

        <div className="prose prose-lg max-w-none text-slate-600 space-y-0">

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">1. No Financial or Investment Advice</h2>
          <p>
            <strong>IMPORTANT:</strong> PayADA is a technical payment infrastructure provider, not a financial advisor, investment firm, or bank. 
            Nothing on the PayADA platform constitutes financial advice, investment advice, tax advice, or legal advice. You should:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>Consult with a qualified financial advisor before transacting</li>
            <li>Conduct your own research on crypto-assets and blockchain technology</li>
            <li>Consult with a tax professional regarding tax implications of crypto transactions</li>
            <li>Seek legal counsel for jurisdictional compliance questions</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">2. Crypto-Asset Volatility Warning</h2>
          <p>
            <strong>WARNING:</strong> Cryptocurrency prices are highly volatile and speculative. By using PayADA to transact in crypto-assets, you acknowledge and accept that:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>The value of ADA and other crypto-assets can fluctuate dramatically in short periods</li>
            <li>You may experience partial or total loss of value in crypto holdings</li>
            <li>PayADA does not guarantee or control crypto-asset prices</li>
            <li>Market volatility between payment initiation and settlement is not PayADA's responsibility</li>
            <li>You assume all risk of price movements</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">3. Blockchain Irreversibility</h2>
          <p>
            <strong>CRITICAL:</strong> All transactions processed on the Cardano blockchain are permanent and irreversible. Once a payment is confirmed on-chain:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>Funds cannot be recovered by any party, including PayADA</li>
            <li>PayADA cannot reverse, cancel, or refund transactions</li>
            <li>Blockchain consensus is final and immutable</li>
            <li>Incorrect wallet addresses cannot be recovered</li>
            <li>You are solely responsible for verifying receiving addresses before sending</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">4. No Custody or Control</h2>
          <p>
            PayADA does <strong>NOT</strong> custody, hold, or control your crypto-assets at any point. All transactions are peer-to-peer, 
            directly from the payer's wallet to the receiving address. You are responsible for:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>Securing your private keys and wallet credentials</li>
            <li>Managing your crypto-assets after receipt</li>
            <li>Protecting against theft, hacking, or loss of your wallet</li>
            <li>Complying with local tax and regulatory obligations for held assets</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">5. Technology Risks</h2>
          <p>
            The PayADA platform operates over internet and blockchain infrastructure, which carry inherent technical risks:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>Network congestion may delay transactions</li>
            <li>Blockchain forks or protocol changes may affect transaction finality</li>
            <li>PayADA infrastructure outages may temporarily prevent access</li>
            <li>Smart contract bugs or vulnerabilities could result in loss of funds</li>
            <li>Third-party integrations may fail or behave unexpectedly</li>
            <li>Cyber attacks may compromise platform security</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">6. No Warranty</h2>
          <p>
            <strong>THE PAYADA PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND.</strong>
          </p>
          <p className="mt-4">PayADA disclaims:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Merchantability or fitness for any particular purpose</li>
            <li>Non-infringement of third-party rights</li>
            <li>Uninterrupted, error-free, or secure service</li>
            <li>That defects or bugs will be corrected</li>
            <li>That the Service will meet your expectations or requirements</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">7. Limitation of Liability</h2>
          <p>
            <strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW, PAYADA SHALL NOT BE LIABLE FOR:</strong>
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>Any indirect, incidental, special, consequential, or punitive damages</li>
            <li>Loss of profits, revenue, data, or business opportunities</li>
            <li>Losses from blockchain failures, network congestion, or protocol changes</li>
            <li>Losses from user error or incorrect wallet addresses</li>
            <li>Losses from theft, hacking, or unauthorized access</li>
            <li>Losses from market volatility or price fluctuations</li>
            <li>Losses from third-party service failures (e.g., Blockfrost, Cardano network)</li>
            <li>Any loss or damage not directly caused by PayADA's gross negligence</li>
          </ul>
          <p className="mt-4">
            In no event shall PayADA's total aggregate liability exceed the fees paid by you in the 3 months preceding the claim, 
            or €100, whichever is greater.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">8. Regulatory Uncertainty</h2>
          <p>
            The regulatory landscape for crypto-assets is evolving. PayADA operates in compliance with applicable European regulations (MiCA, GDPR, AML/CFT), 
            but regulations may change. You acknowledge:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>Future regulatory changes may affect PayADA's operations</li>
            <li>PayADA may be required to suspend or modify services due to regulatory requirements</li>
            <li>Your jurisdiction may have restrictions or prohibitions on crypto-assets</li>
            <li>You are responsible for understanding local regulatory requirements</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">9. No Guarantees</h2>
          <p>
            PayADA makes no guarantees regarding:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>Transaction speed or confirmation times</li>
            <li>Price stability or exchange rates</li>
            <li>Availability of specific features or functionality</li>
            <li>Maintenance of historical data or records</li>
            <li>Protection against market manipulation or fraud by third parties</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">10. User Responsibility</h2>
          <p>
            By using PayADA, you accept full responsibility for:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>Verifying wallet addresses before sending funds</li>
            <li>Understanding the mechanics of blockchain transactions</li>
            <li>Managing your private keys and account security</li>
            <li>Complying with applicable laws in your jurisdiction</li>
            <li>Conducting due diligence on any products or services purchased</li>
            <li>All consequences of using PayADA</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">11. Third-Party Links & Integrations</h2>
          <p>
            PayADA may link to third-party websites or integrate with external services. PayADA is not responsible for:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>Third-party content, accuracy, or availability</li>
            <li>Security breaches at third-party providers</li>
            <li>Third-party privacy practices or terms</li>
            <li>Losses arising from third-party service failures</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">12. Acknowledgment</h2>
          <p>
            <strong>BY USING PAYADA, YOU ACKNOWLEDGE THAT YOU HAVE READ THIS DISCLAIMER IN FULL, UNDERSTAND THE RISKS, 
            AND ACCEPT ALL TERMS AND LIMITATIONS SET FORTH HEREIN.</strong>
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">13. Contact</h2>
          <p>For questions about this Disclaimer:</p>
          <ul className="list-disc list-inside space-y-2">
            <li><Link to={createPageUrl("Contact")} className="text-blue-600 hover:underline">Contact form</Link></li>
          </ul>
        </div>
      </section>
    </div>
  );
}