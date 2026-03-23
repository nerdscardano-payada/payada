import React from "react";
import { Button } from "@/components/ui/button";
import FulfillmentMethodBadge from "@/components/nfts/FulfillmentMethodBadge";

export default function MarketplaceTrustNotice({ mode, compact = false }) {
  const isAutomatic = mode === "automatic";

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${compact ? "p-4" : "p-5"}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Marketplace delivery</p>
          <FulfillmentMethodBadge mode={mode} />
          <p className="max-w-3xl text-sm leading-6 text-slate-600">
            {isAutomatic
              ? "This merchant uses automatic NFT fulfillment. After a confirmed payment, buyers can expect delivery without manual follow-up in normal conditions."
              : "This merchant uses manual NFT fulfillment. After a confirmed payment, the NFT still needs to be sent manually by the merchant, so delivery may take longer."}
          </p>
          <p className="max-w-3xl text-sm leading-6 text-slate-600">
            Merchants on PayADA NFT marketplaces are registered with PayADA using email contact details to help reduce fraud and scam risk. This helps with accountability, but buyers should still do their own checks before purchasing.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <a href="/NFTMarketplaceFAQ">NFT Marketplace FAQ</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/NFTMarketplaceTerms">Marketplace Terms</a>
          </Button>
        </div>
      </div>
    </div>
  );
}