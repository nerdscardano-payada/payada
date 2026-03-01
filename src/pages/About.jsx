import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Users, Target, Zap, Globe } from "lucide-react";

export default function AboutPage() {
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
            <Link to={createPageUrl("Blog")} className="text-sm text-slate-600 hover:text-slate-900">Blog</Link>
            <Link to={createPageUrl("Security")} className="text-sm text-slate-600 hover:text-slate-900">Security</Link>
          </div>
        </nav>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero */}
        <div className="text-center mb-20">
          <h1 className="text-5xl font-bold text-slate-900 mb-6">About PayADA</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">Building the future of payments on the Cardano blockchain.</p>
        </div>

        {/* Story */}
        <div className="max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Story</h2>
          <div className="space-y-6 text-slate-600 text-lg">
            <p>
              PayADA was founded with a simple mission: to make Cardano payments accessible to everyone. 
              We saw the potential of blockchain technology but recognized that merchants needed a simple, 
              secure, and user-friendly way to accept cryptocurrency payments.
            </p>
            <p>
              What started as a weekend project evolved into a full-featured payment platform trusted by 
              hundreds of merchants worldwide. We've processed millions in Cardano transactions while maintaining 
              our commitment to security, simplicity, and customer support.
            </p>
            <p>
              Today, PayADA is the leading payment processor for Cardano, serving merchants from startups to 
              established businesses across Europe and beyond.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Our Values</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="border border-slate-200 rounded-lg p-8">
              <Target className="w-12 h-12 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Simplicity</h3>
              <p className="text-slate-600">
                We believe cryptocurrency should be easy. Our platform removes complexity and puts 
                the power of blockchain payments in your hands.
              </p>
            </div>

            <div className="border border-slate-200 rounded-lg p-8">
              <Zap className="w-12 h-12 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Reliability</h3>
              <p className="text-slate-600">
                Your business depends on our platform. We maintain 99.9% uptime, use secure infrastructure, 
                and provide 24/7 support.
              </p>
            </div>

            <div className="border border-slate-200 rounded-lg p-8">
              <Globe className="w-12 h-12 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Global Reach</h3>
              <p className="text-slate-600">
                PayADA enables global commerce. Accept payments from anywhere in the world without 
                currency conversion delays or high fees.
              </p>
            </div>

            <div className="border border-slate-200 rounded-lg p-8">
              <Users className="w-12 h-12 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Customer-First</h3>
              <p className="text-slate-600">
                Your success is our success. We listen to feedback, continuously improve our product, 
                and provide exceptional support.
              </p>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Team</h2>
          <p className="text-slate-600 text-lg mb-8 max-w-3xl">
            PayADA is built by a talented team of blockchain developers, payment specialists, and 
            entrepreneurs with decades of combined experience in fintech and cryptocurrency.
          </p>
          <p className="text-slate-600 text-lg max-w-3xl">
            We're based in Berlin, Germany, with team members across Europe and globally. We're committed 
            to building a diverse, inclusive, and collaborative team.
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-8 mb-20 py-12 border-y border-slate-200">
          <div className="text-center">
            <div className="text-4xl font-bold text-indigo-600 mb-2">1M+</div>
            <p className="text-slate-600">Transactions Processed</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-indigo-600 mb-2">500K+</div>
            <p className="text-slate-600">ADA Transacted</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-indigo-600 mb-2">1000+</div>
            <p className="text-slate-600">Active Merchants</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-indigo-600 mb-2">99.9%</div>
            <p className="text-slate-600">Uptime SLA</p>
          </div>
        </div>

        {/* Career CTA */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Join Our Team</h2>
          <p className="text-lg mb-8 opacity-90">We're hiring! Check out our open positions.</p>
          <Link to={createPageUrl("Contact")}>
            <button className="bg-white text-indigo-600 hover:bg-slate-100 px-8 py-3 rounded-lg font-semibold">
              View Careers
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}