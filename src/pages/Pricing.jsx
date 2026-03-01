import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for getting started",
    features: [
      "Up to 10 payment links",
      "1 API key",
      "Basic webhooks",
      "Email support",
      "1.5% platform fee",
      "Up to €5,000/month volume"
    ],
    cta: "Get Started"
  },
  {
    name: "Professional",
    price: "€29",
    period: "/month",
    description: "For growing businesses",
    features: [
      "Unlimited payment links",
      "5 API keys",
      "Advanced webhooks",
      "Priority email support",
      "1.0% platform fee",
      "Up to €50,000/month volume",
      "Subscription management",
      "Advanced analytics"
    ],
    cta: "Start Free Trial",
    popular: true
  },
  {
    name: "Business",
    price: "€99",
    period: "/month",
    description: "For established businesses",
    features: [
      "Everything in Professional",
      "Unlimited API keys",
      "Custom webhooks",
      "24/7 phone support",
      "0.5% platform fee",
      "Unlimited volume",
      "Custom branding",
      "Dedicated account manager"
    ],
    cta: "Contact Sales"
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
            Pay<span className="text-indigo-600">ADA</span>
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
          <p className="text-xl text-slate-600">Only pay for what you use. No hidden fees.</p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {plans.map((plan, idx) => (
            <div key={idx} className={`border rounded-lg p-8 ${plan.popular ? 'border-indigo-300 shadow-lg ring-2 ring-indigo-100' : 'border-slate-200'}`}>
              {plan.popular && <div className="bg-indigo-600 text-white text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">Most Popular</div>}
              <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
              <p className="text-slate-600 mb-6">{plan.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                {plan.period && <span className="text-slate-600">{plan.period}</span>}
              </div>
              <Button className={`w-full mb-8 ${plan.popular ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-900 hover:bg-slate-800'}`}>
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