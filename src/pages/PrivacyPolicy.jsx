import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to={createPageUrl("Home")} className="text-2xl font-bold">
            Pay<span className="text-indigo-600">ADA</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to={createPageUrl("Contact")} className="text-sm text-slate-600 hover:text-slate-900">Contact</Link>
            <Link to={createPageUrl("TermsOfService")} className="text-sm text-slate-600 hover:text-slate-900">Terms</Link>
          </div>
        </nav>
      </header>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-5xl font-bold text-slate-900 mb-4">Privacy Policy</h1>
        <p className="text-slate-600 mb-12">Last updated: March 1, 2024</p>

        <div className="prose prose-lg max-w-none text-slate-600">
          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">1. Introduction</h2>
          <p>
            PayADA GmbH ("we", "us", "our", or "Company") operates the PayADA.io website and payment platform 
            (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure 
            of personal data when you use our Service and the choices you have associated with that data.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">2. Information Collection and Use</h2>
          <p>We collect several different types of information for various purposes to provide and improve our Service:</p>
          
          <h3 className="text-xl font-semibold text-slate-900 mt-8 mb-3">2.1 Personal Data</h3>
          <p>While using our Service, we may ask you to provide us with certain personally identifiable information:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Email address</li>
            <li>First name and last name</li>
            <li>Phone number</li>
            <li>Address, State, Province, ZIP/Postal code, City</li>
            <li>Cookies and Usage Data</li>
            <li>Business information (company name, business type)</li>
            <li>Wallet addresses for payment processing</li>
          </ul>

          <h3 className="text-xl font-semibold text-slate-900 mt-8 mb-3">2.2 Usage Data</h3>
          <p>
            We may also collect information on how the Service is accessed and used ("Usage Data"). This may include 
            information such as your computer's Internet Protocol address (e.g. IP address), browser type, browser version, 
            the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, and 
            other diagnostic data.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">3. Use of Data</h2>
          <p>PayADA uses the collected data for various purposes:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>To provide and maintain the Service</li>
            <li>To notify you about changes to our Service</li>
            <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
            <li>To provide customer care and support</li>
            <li>To gather analysis or valuable information so that we can improve the Service</li>
            <li>To monitor the usage of the Service</li>
            <li>To detect, prevent and address technical issues</li>
            <li>To comply with legal obligations</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">4. Security of Data</h2>
          <p>
            The security of your data is important to us, but remember that no method of transmission over the Internet 
            or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to 
            protect your Personal Data, we cannot guarantee its absolute security.
          </p>
          <p className="mt-4">
            We implement appropriate technical and organizational measures to protect your personal data against unauthorized 
            access, alteration, disclosure, or destruction, including encryption with TLS 1.3, secure API keys, and regular 
            security audits.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">5. GDPR Compliance</h2>
          <p>
            If you are located in the European Union (EU), you have certain data protection rights. PayADA aims to take 
            reasonable steps to allow you to correct, amend, delete, or limit the use of your Personal Data.
          </p>
          <p className="mt-4">You have the right to:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Access your Personal Data</li>
            <li>Rectification of your Personal Data</li>
            <li>Erasure of your Personal Data</li>
            <li>Restrict processing of your Personal Data</li>
            <li>Data portability</li>
            <li>Object to processing of your Personal Data</li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">6. Cookies</h2>
          <p>
            We use cookies and similar tracking technologies to track activity on our Service and hold certain information. 
            You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do 
            not accept cookies, you may not be able to use some portions of our Service.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">7. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>By email: privacy@payada.io</li>
            <li>By mail: PayADA GmbH, Berlin, Germany</li>
            <li>By phone: +49 30 123 456 789</li>
          </ul>
        </div>
      </section>
    </div>
  );
}