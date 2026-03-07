import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "PayADA",
    price: "1.75%",
    description: "One simple fee for everyone",
    features: [
      "Unlimited payment links",
      "Unlimited API keys",
      "Webhooks & integrations",
      "Email support",
      "Subscription management",
      "Advanced analytics",
      "No setup fees",
      "No monthly minimums"
    ],
    cta: "Get Started",
    popular: true
  }
];

const faqs = [
  {
    q: "Can I cancel my plan anytime?",
    a: "Yes, you can cancel your subscription at any time. No long-term contracts."
  },
  {
    q: "Is there a setup fee?",
    a: "No setup fees. You only pay for transactions processed through PayADA."
  },
  {
    q: "What happens to my data after cancellation?",
    a: "Your data is retained for 30 days. Contact support if you need longer retention."
  },
  {
    q: "Do you offer custom plans?",
    a: "Yes, for Enterprise customers with special requirements. Contact our sales team."
  }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to={createPageUrl("Home")} className="text-2xl font-bold">
            Pay<span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">ADA</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to={createPageUrl("Features")} className="text-sm text-slate-600 hover:text-slate-900">Features</Link>
            <Link to={createPageUrl("Security")} className="text-sm text-slate-600 hover:text-slate-900">Security</Link>
            <Link to={createPageUrl("Documentation")} className="text-sm text-slate-600 hover:text-slate-900">Docs</Link>
          </div>
        </nav>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-slate-600">One flat 1.75% fee per transaction. No hidden fees, no plans, no minimums.</p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-1 gap-8 mb-20 max-w-2xl mx-auto">
          {plans.map((plan, idx) => (
            <div key={idx} className="border border-blue-300 shadow-lg ring-2 ring-blue-100 rounded-lg p-8">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">Flat Rate</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
              <p className="text-slate-600 mb-6">{plan.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                {plan.period && <span className="text-slate-600">{plan.period}</span>}
              </div>
              <Button className="w-full mb-8 bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500">
                {plan.cta}
              </Button>
              <div className="space-y-4">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg p-6">
                <h3 className="font-semibold text-slate-900 mb-2">{faq.q}</h3>
                <p className="text-slate-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}