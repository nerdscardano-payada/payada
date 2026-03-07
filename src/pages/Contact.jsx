import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to={createPageUrl("Home")} className="text-2xl font-bold">
            Pay<span className="text-indigo-600">ADA</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to={createPageUrl("About")} className="text-sm text-slate-600 hover:text-slate-900">About</Link>
            <Link to={createPageUrl("Documentation")} className="text-sm text-slate-600 hover:text-slate-900">Docs</Link>
          </div>
        </nav>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero */}
        <div className="text-center mb-20">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">Get in Touch</h1>
          <p className="text-xl text-slate-600">We're here to help. Reach out with any questions or feedback.</p>
        </div>



        {/* Contact Form */}
         <div className="max-w-2xl mx-auto">
          <div className="border border-slate-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Send us a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  placeholder="Your name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  placeholder="How can we help?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  rows="6"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  placeholder="Tell us more..."
                  required
                />
              </div>

              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                Send Message
              </Button>
            </form>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <details className="border border-slate-200 rounded-lg p-6 cursor-pointer group">
              <summary className="font-semibold text-slate-900 flex justify-between items-center">
                How long does it take to set up PayADA?
                <span className="group-open:rotate-180 transition">▼</span>
              </summary>
              <p className="text-slate-600 mt-4">
                Most merchants are up and running in less than 5 minutes. Just sign up, verify your email, 
                configure your webhook endpoints, and you're ready to start accepting payments.
              </p>
            </details>

            <details className="border border-slate-200 rounded-lg p-6 cursor-pointer group">
              <summary className="font-semibold text-slate-900 flex justify-between items-center">
                What are your fees?
                  <span className="group-open:rotate-180 transition">▼</span>
                </summary>
                <p className="text-slate-600 mt-4">
                  We charge a simple flat 1.75% fee per transaction, no matter your payment volume. 
                  No hidden fees, no setup costs, no monthly minimums. You only pay when you process a payment.
                </p>
            </details>

            <details className="border border-slate-200 rounded-lg p-6 cursor-pointer group">
              <summary className="font-semibold text-slate-900 flex justify-between items-center">
                Can I cancel my account anytime?
                <span className="group-open:rotate-180 transition">▼</span>
              </summary>
              <p className="text-slate-600 mt-4">
                Yes, absolutely! No long-term contracts. You can cancel your subscription at any time. 
                Your data is retained for 30 days after cancellation.
              </p>
            </details>
          </div>
        </div>
      </section>
    </div>
  );
}