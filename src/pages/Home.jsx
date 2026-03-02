import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Zap, Lock, TrendingUp, Globe } from "lucide-react";
import { createPageUrl } from "@/utils";

const features = [
  {
    icon: Zap,
    title: "Instant Settlement",
    description: "Receive ADA payments in real-time with blockchain-powered speed."
  },
  {
    icon: Lock,
    title: "Secure & Transparent",
    description: "Full cryptographic security built on Cardano's proven technology."
  },
  {
    icon: TrendingUp,
    title: "Advanced Analytics",
    description: "Track all your transactions with detailed dashboards and insights."
  },
  {
    icon: Globe,
    title: "Global Reach",
    description: "Accept payments from anyone, anywhere with Cardano's borderless network."
  }
];

const steps = [
  { number: "1", title: "Create Account", description: "Sign up and verify your identity in minutes" },
  { number: "2", title: "Configure Payments", description: "Set up your Cardano wallet and payment preferences" },
  { number: "3", title: "Start Accepting", description: "Share payment links or integrate via API" }
];

export default function HomePage() {
  const handleSignUp = () => {
    base44.auth.redirectToLogin();
  };

  const handleLogin = () => {
    base44.auth.redirectToLogin();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69999e4306b9e4632bd7d454/1b4bc7fb6_be2b2b99e_1000069668.jpg" alt="PayADA Logo" className="w-8 h-8 rounded-lg" />
            <span className="text-lg font-bold text-slate-900">
              Pay<span className="text-indigo-600">ADA</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link to={createPageUrl("Features")} className="text-sm text-slate-600 hover:text-slate-900">Features</Link>
            <Link to={createPageUrl("Pricing")} className="text-sm text-slate-600 hover:text-slate-900">Pricing</Link>
            <Link to={createPageUrl("Documentation")} className="text-sm text-slate-600 hover:text-slate-900">Docs</Link>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={handleLogin}>
              Sign In
            </Button>
            <Button onClick={handleSignUp} className="bg-indigo-600 hover:bg-indigo-700">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
              Accept Cardano payments effortlessly
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              PayADA.io makes it simple for merchants to accept ADA payments, manage subscriptions, and grow their business with blockchain technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                onClick={handleSignUp}
                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
              >
                Start Free <ArrowRight className="w-5 h-5" />
              </Button>
              <Link to={createPageUrl("Documentation")}>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2"
                >
                  View Docs
                </Button>
              </Link>
            </div>
            <p className="text-sm text-slate-500 mt-6">
              No credit card required. Set up in under 5 minutes.
            </p>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-1 shadow-2xl">
              <div className="bg-slate-950 rounded-xl p-6 md:p-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Payment Received</span>
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="text-3xl font-bold text-white">₳ 250</div>
                  <div className="text-slate-400 text-sm">Confirmed • Block #8,234,567</div>
                  <div className="pt-4 border-t border-slate-700">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-slate-500 text-xs">Net Amount</p>
                        <p className="text-white font-semibold">₳ 246.25</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">Fee</p>
                        <p className="text-white font-semibold">₳ 3.75</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-50 py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Built for modern merchants
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Everything you need to accept Cardano payments and manage your blockchain business.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="bg-white rounded-xl p-8 border border-slate-200 hover:border-indigo-300 transition-colors">
                  <Icon className="w-12 h-12 text-indigo-600 mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center mb-16">
          Get started in 3 easy steps
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="relative">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-indigo-600">
                  <span className="text-indigo-600 font-bold text-lg">{step.number}</span>
                </div>
                <div className="pt-1">
                  <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
                  <p className="text-slate-600 mt-2">{step.description}</p>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 -right-4 w-8 h-1 bg-indigo-200"></div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to accept Cardano payments?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join merchants worldwide who are already using PayADA.io to accept ADA payments safely and securely.
          </p>
          <Button 
            size="lg"
            onClick={handleSignUp}
            className="bg-white text-indigo-600 hover:bg-slate-100 gap-2"
          >
            Create Free Account <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69999e4306b9e4632bd7d454/1b4bc7fb6_be2b2b99e_1000069668.jpg" alt="PayADA Logo" className="w-8 h-8 rounded-lg" />
                <span className="text-white font-bold">PayADA</span>
              </div>
              <p className="text-sm">The easiest way to accept Cardano payments.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to={createPageUrl("Features")} className="hover:text-white transition">Features</Link></li>
                  <li><Link to={createPageUrl("Pricing")} className="hover:text-white transition">Pricing</Link></li>
                  <li><Link to={createPageUrl("Security")} className="hover:text-white transition">Security</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Developers</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to={createPageUrl("Documentation")} className="hover:text-white transition">Documentation</Link></li>
                <li><Link to={createPageUrl("APIReference")} className="hover:text-white transition">API Reference</Link></li>
                <li><Link to={createPageUrl("Webhooks")} className="hover:text-white transition">Webhooks</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to={createPageUrl("About")} className="hover:text-white transition">About</Link></li>
                <li><Link to={createPageUrl("Contact")} className="hover:text-white transition">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm">
            <p>&copy; 2026 PayADA.io. All rights reserved.</p>
            <div className="flex gap-6 mt-4 sm:mt-0">
              <Link to={createPageUrl("PrivacyPolicy")} className="hover:text-white transition">Privacy Policy</Link>
              <Link to={createPageUrl("TermsOfService")} className="hover:text-white transition">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}