import React from "react";
import { Button } from "@/components/ui/button";

const faqItems = [
  {
    question: "What does automatic NFT delivery mean?",
    answer: "Automatic delivery means the merchant has configured PayADA to send the NFT after a confirmed payment, without waiting for manual sending in normal conditions.",
  },
  {
    question: "What does manual NFT delivery mean?",
    answer: "Manual delivery means the merchant still needs to send the NFT after payment confirmation. Buyers should expect a longer waiting time than with automatic delivery.",
  },
  {
    question: "How do I know which delivery method a store uses?",
    answer: "Each PayADA NFT marketplace clearly shows whether that merchant uses automatic or manual NFT fulfillment on the storefront and listing pages.",
  },
  {
    question: "Are merchants known to PayADA?",
    answer: "Yes. Merchants using PayADA NFT marketplaces are registered with PayADA using email contact details to help reduce fraud and scam risk.",
  },
  {
    question: "Does PayADA guarantee every merchant?",
    answer: "No. Merchant registration helps improve accountability, but buyers should still do their own checks before purchasing any NFT.",
  },
  {
    question: "When is an NFT expected to be delivered?",
    answer: "Delivery timing depends on the fulfillment method used by the merchant and starts after payment confirmation. Automatic delivery is normally faster, while manual delivery can take longer.",
  },
];

export default function NFTMarketplaceFAQ() {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 px-8 py-10 text-white shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">PayADA NFT Marketplace</p>
          <h1 className="mt-4 text-4xl font-semibold">FAQ</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
            Clear answers about delivery methods, buyer expectations, and merchant accountability for PayADA NFT marketplaces.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="outline" className="border-white/20 bg-white text-slate-900 hover:bg-slate-100" asChild>
              <a href="/">Back to home</a>
            </Button>
            <Button className="bg-cyan-400 text-slate-950 hover:bg-cyan-300" asChild>
              <a href="/NFTMarketplaceTerms">Marketplace Terms</a>
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {faqItems.map((item) => (
            <div key={item.question} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">{item.question}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}