import React from "react";
import { Button } from "@/components/ui/button";

const sections = [
  {
    title: "1. Scope",
    body: "These marketplace terms apply specifically to NFT storefronts and NFT listing pages published through PayADA.",
  },
  {
    title: "2. Merchant responsibility",
    body: "Each merchant is responsible for the accuracy of their NFT listings, pricing, descriptions, delivery setup, and post-sale fulfillment.",
  },
  {
    title: "3. Delivery method disclosure",
    body: "PayADA storefronts display whether a merchant uses automatic NFT fulfillment or manual NFT fulfillment. Buyers should review this before purchasing.",
  },
  {
    title: "4. Manual fulfillment timing",
    body: "When a merchant uses manual fulfillment, NFT delivery may take longer because the transfer still needs to be completed by the merchant after payment confirmation.",
  },
  {
    title: "5. Merchant identification",
    body: "Merchants using PayADA NFT marketplaces are registered with PayADA using email contact details to help reduce fraud and scam risk, but buyers must still perform their own due diligence.",
  },
  {
    title: "6. No guarantee of value or outcome",
    body: "PayADA does not guarantee the value, performance, resale potential, or suitability of any NFT listed by a merchant.",
  },
  {
    title: "7. Payment finality",
    body: "Blockchain payments are generally irreversible. Buyers should review listing details, merchant identity, and fulfillment method before completing payment.",
  },
  {
    title: "8. Platform role",
    body: "PayADA provides the storefront, payment, and delivery infrastructure, but the underlying NFT offer remains the merchant’s responsibility unless explicitly stated otherwise.",
  },
];

export default function NFTMarketplaceTerms() {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 px-8 py-10 text-white shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">PayADA NFT Marketplace</p>
          <h1 className="mt-4 text-4xl font-semibold">Marketplace Terms</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
            Terms focused on NFT marketplace listings, delivery disclosures, merchant accountability, and buyer expectations.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="outline" className="border-white/20 bg-white text-slate-900 hover:bg-slate-100" asChild>
              <a href="/NFTMarketplaceFAQ">Back to FAQ</a>
            </Button>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {sections.map((section) => (
            <div key={section.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{section.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}