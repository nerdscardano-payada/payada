import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  Hexagon, Loader2, ShoppingBag, AlertCircle, ArrowRight, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";

export default function Store() {
  const params = new URLSearchParams(window.location.search);
  const merchantId = params.get("merchant");

  const { data: links = [], isLoading } = useQuery({
    queryKey: ["store-links", merchantId],
    queryFn: () => base44.entities.PaymentLink.filter(
      { merchant_id: merchantId, status: "active" },
      "-created_date",
      50
    ),
    enabled: !!merchantId,
  });

  const { data: profileArr = [] } = useQuery({
    queryKey: ["store-profile", merchantId],
    queryFn: () => base44.entities.MerchantProfile.filter({ user_id: merchantId }, "-created_date", 1),
    enabled: !!merchantId,
  });

  const profile = profileArr[0] || null;

  if (!merchantId) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white">Store not found</h2>
          <p className="text-slate-400 mt-2 text-sm">No merchant ID provided.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (links.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center">
          <ShoppingBag className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white">No products available</h2>
          <p className="text-slate-400 mt-2 text-sm">This store has no active payment links yet.</p>
        </div>
      </div>
    );
  }

  const storeName = profile?.business_name || "ADA Store";
  const logoUrl = profile?.logo_url;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt={storeName} className="w-8 h-8 rounded-lg object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
                <Hexagon className="w-4 h-4 text-white" />
              </div>
            )}
            <span className="font-bold text-white text-base">{storeName}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full px-3 py-1 font-medium">
            ✦ Cardano ADA
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-16 pb-10 text-center">
        <div className="inline-flex items-center gap-1.5 text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full px-3 py-1 font-medium mb-6">
          ✦ Pay with ADA
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
          {storeName}
        </h1>
        {profile?.website_url && (
          <a
            href={profile.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-slate-500 text-sm hover:text-slate-300 transition-colors"
          >
            {profile.website_url} <ExternalLink className="w-3 h-3" />
          </a>
        )}
        <p className="text-slate-500 text-sm mt-3">
          {links.length} product{links.length !== 1 ? "s" : ""} available · Secure Cardano payments
        </p>
      </section>

      {/* Products grid */}
      <main className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {links.map((link) => (
            <ProductCard key={link.id} link={link} />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-xs text-slate-600 hover:text-indigo-400 transition-colors"
        >
          <Hexagon className="w-3.5 h-3.5" />
          Powered by PayADA.io
        </a>
      </footer>
    </div>
  );
}

function ProductCard({ link }) {
  const checkoutUrl = `${window.location.origin}/Checkout?slug=${link.slug}`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col hover:border-indigo-500/40 transition-colors group">
      {/* Amount badge area */}
      <div className="bg-gradient-to-br from-indigo-600/20 to-cyan-600/10 px-6 pt-8 pb-6 text-center border-b border-slate-800">
        <div className="inline-flex items-baseline gap-1.5 mb-2">
          <span className="text-4xl font-black text-white">₳</span>
          <span className="text-4xl font-black text-white">
            {link.amount_ada?.toFixed(2)}
          </span>
        </div>
        {link.amount_mode === "fixed_fiat" && link.amount_fiat && (
          <p className="text-xs text-slate-500 mt-1">≈ {link.fiat_currency} {link.amount_fiat?.toFixed(2)}</p>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-bold text-white text-base mb-2 leading-tight">{link.title}</h3>
        {link.description && (
          <p className="text-slate-400 text-sm leading-relaxed flex-1 mb-4">{link.description}</p>
        )}
        {!link.description && <div className="flex-1" />}

        {link.payment_count > 0 && (
          <p className="text-xs text-slate-600 mb-3">
            {link.payment_count} payment{link.payment_count !== 1 ? "s" : ""} received
          </p>
        )}

        <a href={checkoutUrl}>
          <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-2 group-hover:bg-indigo-500 transition-colors">
            Pay with ADA
            <ArrowRight className="w-4 h-4" />
          </Button>
        </a>
      </div>
    </div>
  );
}