import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to={createPageUrl("Home")} className="text-2xl font-bold">
            Pay<span className="text-indigo-600">ADA</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to={createPageUrl("Documentation")} className="text-sm text-slate-600 hover:text-slate-900">Docs</Link>
            <Link to={createPageUrl("Contact")} className="text-sm text-slate-600 hover:text-slate-900">Contact</Link>
            <Link to={createPageUrl("PrivacyPolicy")} className="text-sm text-slate-600 hover:text-slate-900">Privacy</Link>
          </div>
        </nav>
      </header>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-5xl font-bold text-slate-900 mb-4">Terms of Service</h1>
        <p className="text-slate-600 mb-12">Last updated: March 1, 2026</p>

        <div className="prose prose-lg max-w-none text-slate-600">
          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">1. Agreement to Terms</h2>
          <p>
            By accessing and using PayADA (the "Service"), you accept and agree to be bound by and comply with these 
            Terms of Service and our Privacy Policy. If you do not agree to abide by the foregoing, please do not use 
            this Service.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">2. Use License</h2>
          <p>
            PayADA grants you a limited license to access and use the Service for your personal or business use. This 
            license is non-exclusive, non-transferable, and subject to these restrictions:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>You may not reproduce, distribute, or transmit content without our prior written consent</li>
            <li>You may not modify the materials (including removing any proprietary notices)</li>
            <li>You may not use the materials for any illegal purpose or in violation of any laws</li>
            <li>You may not attempt to gain unauthorized access to the Service</li>
            <li>You may not reverse engineer, decompile, or disassemble the Service</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">3. Payment Terms</h2>
          <p>
            By using the Payment Service, you agree to pay the applicable fees as listed on our Pricing page. Payment 
            processing is subject to the following terms:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>All fees are exclusive of applicable taxes unless otherwise stated</li>
            <li>We reserve the right to change our fees with 30 days notice</li>
            <li>You are responsible for all transaction disputes and chargebacks</li>
            <li>We may suspend service for non-payment or fraud</li>
            <li>All payments are processed on the Cardano blockchain</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">4. User Accounts</h2>
          <p>
            When you create an account with us, you are responsible for maintaining the confidentiality of your account 
            information and passwords. You agree to:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>Provide accurate, complete, and current information</li>
            <li>Maintain the confidentiality of your account and password</li>
            <li>Accept responsibility for all activity that occurs under your account</li>
            <li>Notify us immediately of any unauthorized use of your account</li>
            <li>Comply with all applicable laws and regulations</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">5. Prohibited Uses</h2>
          <p>You agree not to use the Service:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>To facilitate illegal activities or money laundering</li>
            <li>To transmit viruses, malware, or any code that harms the Service</li>
            <li>To engage in any form of harassment or abuse</li>
            <li>To send spam or unsolicited communications</li>
            <li>To violate intellectual property rights</li>
            <li>To process payments for high-risk merchants or activities</li>
            <li>In any way that violates these Terms of Service</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">6. Limitation of Liability</h2>
          <p>
            In no event shall PayADA, nor its directors, employees, or agents, be liable to you for any indirect, incidental, 
            special, consequential, or punitive damages, including loss of profits, data, use, goodwill, or other intangible 
            losses.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">7. Indemnification</h2>
          <p>
            You agree to indemnify, defend, and hold harmless PayADA from any claims, damages, losses, costs, or expenses 
            (including attorney's fees) arising from or related to your use of the Service or breach of these Terms.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">8. Termination</h2>
          <p>
            We may terminate or suspend your account and access to the Service at any time, in our sole discretion, with 
            or without notice, for any reason whatsoever, including if:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>You violate these Terms of Service</li>
            <li>We suspect fraudulent or illegal activity</li>
            <li>You fail to pay outstanding fees</li>
            <li>You engage in abusive or harassing behavior</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">9. Modifications to Service</h2>
          <p>
            We reserve the right to modify or discontinue the Service (or any part thereof) at any time, with or without notice. 
            We will not be liable to you or any third party for any modification, suspension, or discontinuance of the Service.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">10. Governing Law</h2>
          <p>
            These Terms of Service are governed by and construed in accordance with the laws of Germany, without regard to 
            its conflicts of law provisions. Your exclusive jurisdiction for any disputes shall be the courts located in Berlin, Germany.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">11. Contact Information</h2>
          <p>If you have any questions about these Terms of Service, please contact us:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>By email: legal@payada.io</li>
            <li>By mail: PayADA GmbH, Berlin, Germany</li>
            <li>By phone: +49 30 123 456 789</li>
          </ul>
        </div>
      </section>
    </div>
  );
}