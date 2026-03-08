import React from "react";
import { Download, FileText, Zap, Lock, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import SEOHead from "@/components/SEOHead";
import { useTranslation } from "@/components/i18n/useTranslation";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Litepaper() {
  const { t, lang, setLang } = useTranslation();
  const downloadPDF = () => {
    // Create PDF content as string
    const content = `
PayADA Litepaper
================

1. EXECUTIVE SUMMARY
PayADA is a decentralized payment processing platform built on Cardano that enables merchants to accept ADA and Cardano Native Tokens (CNTs) with minimal fees and maximum security. The platform facilitates seamless integration of blockchain payments into existing business workflows.

2. THE PROBLEM
Traditional payment processors charge 2-4% in fees, require complex integrations, and don't support blockchain-based assets. Merchants and communities need a simple, cost-effective way to accept Cardano-based payments while maintaining full control over their funds.

3. THE SOLUTION
PayADA provides:
- Native Cardano payment processing with 1.75% base fee
- Support for both ADA and Cardano Native Tokens (CNTs)
- Instant payment detection with blockchain confirmation
- Flexible webhook integration for real-time updates
- Discord community access integration
- Subscription and recurring payment support

4. TECHNOLOGY STACK
- Blockchain: Cardano
- Smart Contracts: Plutus
- Backend: Deno with Base44 SDK
- Frontend: React + Tailwind CSS
- Payment Detection: Blockfrost API
- Storage: On-chain and off-chain data

5. BUSINESS MODEL

5.1 Fee Structure
- Base Platform Fee: 1.75% per transaction
- CNT Payment Fees: Earned in the paid token (not ADA)
- Enterprise Plans: Custom fee structures available

5.2 Revenue Streams
- Transaction fees from ADA payments
- Native token fees from CNT payments
- Enterprise merchant partnerships
- Premium features (webhooks, analytics, custom integrations)

6. USE CASES

6.1 E-Commerce
Merchants can accept direct Cardano payments without intermediaries, reducing fees and settlement times.

6.2 Digital Content & Subscriptions
Creators can monetize content with recurring ADA/CNT payments, with built-in subscription management.

6.3 Community Access & Discord Integration
Communities can gate access using PayADA's Discord plugin - members pay once, receive automatic role assignment.

6.4 Fundraising & Donations
Organizations can accept CNT or ADA donations with complete transparency on the blockchain.

7. PLATFORM FEATURES

7.1 Payment Links
- Fixed ADA or Fiat amounts with auto-conversion
- Native Token (CNT) payment support
- Custom expiry and confirmation requirements
- Success/cancel redirect URLs

7.2 Payment Terminal
- Point-of-sale style interface
- Multi-plan subscription support
- Custom branding and colors
- Mobile responsive design

7.3 Commerce API
- Full REST API for custom integrations
- Webhook support for payment events
- Idempotency keys for reliability
- Rate limiting and authentication

7.4 Admin Dashboard
- Real-time payment monitoring
- Fee revenue analytics per token
- Merchant performance tracking
- System health and error logs

7.5 Merchant Tools
- Detailed payment history and analytics
- Customer management
- Subscription tracking
- API keys and webhook management

8. SECURITY & COMPLIANCE

8.1 Blockchain Security
- All payments verified on-chain
- Cryptographic signatures for authenticity
- No custodial risk - merchants control wallets

8.2 Data Security
- HTTPS only communication
- API key hashing and rotation
- Audit logs for all actions
- PCI-DSS compliant architecture

8.3 Transaction Validation
- Multi-confirmation support
- Output validation for fee/merchant amounts
- Protection against double-spending
- Transparent error handling

9. CARDANO NATIVE TOKEN INTEGRATION

9.1 Why CNTs?
Cardano Native Tokens allow merchants to create custom payment currencies and community tokens, enabling:
- Custom economic models
- Community-specific pricing
- Token-based loyalty programs
- Alternative value storage

9.2 Fee Model for CNTs
Platform fees are earned in the token itself, aligning incentives between PayADA and token communities. This creates a sustainable ecosystem where:
- Token projects benefit from adoption
- PayADA is incentivized to promote CNT payments
- Merchants can offer token-based discounts

10. ROADMAP

Q1 2026
- Core ADA payment processing ✓
- Basic CNT support ✓
- Merchant dashboard ✓
- Discord integration ✓

Q2 2026
- Advanced analytics
- Custom webhook filtering
- Batch payment exports
- Multi-merchant accounts

Q3 2026
- Native mobile apps (iOS/Android)
- Staking integration
- Governance token launch
- Community marketplace

Q4 2026+
- Layer 2 scaling solutions
- Cross-chain bridging
- Advanced DeFi integrations
- Global merchant network

11. TOKENOMICS (Future)
Future governance token will distribute:
- 40% Community & Users
- 30% Team (vesting)
- 20% Treasury
- 10% Advisors

12. COMPETITIVE ADVANTAGES

✓ Native Cardano Integration - Built on Cardano, not a wrapper
✓ Low Fees - 1.75% base fee is industry-leading
✓ CNT Support - Only platform with native CNT integration
✓ No Custodial Risk - Merchants maintain wallet control
✓ Community Focused - Discord integration and governance plans
✓ Transparent - All fees visible, no hidden costs

13. CONCLUSION
PayADA represents the next generation of payment processing - decentralized, transparent, and aligned with the Cardano ecosystem. By removing intermediaries and enabling direct blockchain payments, PayADA creates value for merchants, communities, and the Cardano network.

For more information: www.payada.io
    `;

    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(content));
    element.setAttribute("download", "PayADA-Litepaper.txt");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <SEOHead
        title="Litepaper — PayADA Decentralized Cardano Payment Platform"
        description="The PayADA Litepaper covers our decentralized Cardano payment architecture, 1.75% fee model, CNT native token support, self-custodial design, use cases for e-commerce, digital content, community access and fundraising, plus the development roadmap."
        canonical="https://payada.io/litepaper"
      />
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-10 h-10" />
            <h1 className="text-4xl font-bold">PayADA Litepaper</h1>
          </div>
          <p className="text-slate-300 text-lg max-w-2xl">
            Decentralized Cardano Payment Processing for the Modern Web
          </p>
          <div className="mt-8">
            <Button
              onClick={downloadPDF}
              className="bg-indigo-600 hover:bg-indigo-700 gap-2"
            >
              <Download className="w-4 h-4" />
              Download Litepaper
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Highlights */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <Zap className="w-8 h-8 text-indigo-600 mb-3" />
            <h3 className="font-semibold text-slate-900 mb-2">Low Fees</h3>
            <p className="text-slate-600 text-sm">
              1.75% base fee - lowest in the industry with no hidden costs
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <Lock className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-slate-900 mb-2">Self-Custodial</h3>
            <p className="text-slate-600 text-sm">
              Merchants control their wallets - PayADA never holds customer funds
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <TrendingUp className="w-8 h-8 text-cyan-600 mb-3" />
            <h3 className="font-semibold text-slate-900 mb-2">Native Tokens</h3>
            <p className="text-slate-600 text-sm">
              Accept both ADA and Cardano Native Tokens with same infrastructure
            </p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-12">
          {/* Executive Summary */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Executive Summary</h2>
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <p className="text-slate-700 leading-relaxed mb-4">
                PayADA is a decentralized payment processing platform built on Cardano that enables merchants to accept ADA and Cardano Native Tokens (CNTs) with minimal fees and maximum security. The platform facilitates seamless integration of blockchain payments into existing business workflows without requiring merchants to manage complex wallet infrastructure.
              </p>
              <p className="text-slate-700 leading-relaxed">
                By leveraging Cardano's UTXO model and native asset support, PayADA creates a transparent, auditable payment ecosystem where merchants maintain complete control over their funds while benefiting from instant settlement and low fees.
              </p>
            </div>
          </section>

          {/* The Problem */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">The Problem</h2>
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <ul className="space-y-3 text-slate-700">
                <li className="flex gap-3">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span>Traditional payment processors charge 2-4% fees per transaction</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span>Complex integrations require significant developer resources</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span>No support for blockchain-based assets and community tokens</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span>Merchants lack control over customer data and payment flow</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Solution */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">The Solution</h2>
            <div className="bg-white rounded-xl p-6 border border-slate-200 space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">🔵 Native Cardano Integration</h4>
                <p className="text-slate-700">
                  Built directly on Cardano without wrappers or bridges, ensuring maximum security and minimal latency.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">💰 Competitive Fees</h4>
                <p className="text-slate-700">
                  1.75% base fee for ADA payments, with CNT fees earned in the token itself - aligning platform incentives with merchant success.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">🔗 Flexible Integration</h4>
                <p className="text-slate-700">
                  Payment links for quick setup, REST API for custom integrations, and webhook support for real-time updates.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">🎯 Community Features</h4>
                <p className="text-slate-700">
                  Discord integration for membership gating, subscription support, and community token payments.
                </p>
              </div>
            </div>
          </section>

          {/* Technology */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Technology Architecture</h2>
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="space-y-4">
                <div>
                  <span className="font-semibold text-slate-900">Blockchain Layer:</span>
                  <p className="text-slate-700">Cardano UTXO model with native asset support</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Backend:</span>
                  <p className="text-slate-700">Deno runtime with Base44 serverless infrastructure</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Frontend:</span>
                  <p className="text-slate-700">React with Tailwind CSS for responsive UI</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Payment Detection:</span>
                  <p className="text-slate-700">Blockfrost API for real-time transaction monitoring</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Wallet Integration:</span>
                  <p className="text-slate-700">Mesh SDK and CIP standards for secure wallet connections</p>
                </div>
              </div>
            </div>
          </section>

          {/* Use Cases */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Use Cases</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-2">E-Commerce</h4>
                <p className="text-slate-700 text-sm">
                  Accept direct Cardano payments from customers worldwide with settlement in minutes, not days.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-2">Digital Content</h4>
                <p className="text-slate-700 text-sm">
                  Creators monetize content with ADA micropayments or custom CNT subscription models.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-2">Community Access</h4>
                <p className="text-slate-700 text-sm">
                  Gate Discord servers or websites behind ADA payments with automatic role assignment.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-2">Fundraising</h4>
                <p className="text-slate-700 text-sm">
                  Collect ADA or CNT donations with full blockchain transparency and no intermediaries.
                </p>
              </div>
            </div>
          </section>

          {/* Roadmap */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Development Roadmap</h2>
            <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-200">
              <p className="text-slate-700 mb-4">
                For detailed updates on our development progress and upcoming features, visit our full roadmap.
              </p>
              <Link to={createPageUrl("Roadmap")} className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold">
                View Full Roadmap →
              </Link>
            </div>
          </section>

          {/* CTA */}
          <div className="bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-xl p-8 text-center">
            <h3 className="text-2xl font-bold mb-3">Ready to Accept Cardano Payments?</h3>
            <p className="mb-6 opacity-90">
              Join merchants accepting ADA and Cardano Native Tokens on PayADA
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={downloadPDF}
                className="bg-white text-indigo-600 hover:bg-slate-100 font-semibold"
              >
                Download Full Litepaper
              </Button>
              <Button
                className="bg-indigo-700 hover:bg-indigo-800 border border-white/20"
                onClick={() => window.location.href = "/"}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}