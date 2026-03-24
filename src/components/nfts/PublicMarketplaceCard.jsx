import React from "react";
import { Button } from "@/components/ui/button";
import FulfillmentMethodBadge from "@/components/nfts/FulfillmentMethodBadge";
import { normalizeIpfsUrl } from "@/utils";

export default function PublicMarketplaceCard({ listing }) {
  const storeName = listing.merchant?.nft_store_name || listing.merchant?.business_name || "Merchant store";

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-transform duration-200 hover:-translate-y-1">
      {listing.image_url ? (
        <div className="flex h-72 w-full items-center justify-center bg-slate-50 p-4">
          <img src={normalizeIpfsUrl(listing.image_url)} alt={listing.title} className="max-h-full w-full object-contain" />
        </div>
      ) : (
        <div className="flex h-72 w-full items-center justify-center bg-slate-200 text-sm font-semibold text-slate-500">NFT preview</div>
      )}

      <div className="space-y-4 p-6">
        <div className="flex items-center gap-3">
          {listing.merchant?.logo_url && (
            <img src={normalizeIpfsUrl(listing.merchant.logo_url)} alt={storeName} className="h-10 w-10 rounded-xl object-cover" />
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{storeName}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <FulfillmentMethodBadge mode={listing.merchant?.nft_fulfillment_mode} />
              {listing.merchant?.verified_merchant && (
                <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">Verified</span>
              )}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-900">{listing.title}</h2>
          <p className="mt-1 text-sm text-slate-500">{listing.collection_name || "Featured NFTs"}</p>
          <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-600">
            {listing.description || "This NFT listing includes PayADA checkout and merchant-managed delivery."}
          </p>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Price</p>
            <p className="text-lg font-semibold text-slate-900">
              {listing.price_ada ? `₳ ${Number(listing.price_ada).toFixed(2)}` : "Price via checkout"}
            </p>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" asChild>
              <a href={listing.storefront_path}>View store</a>
            </Button>
            {listing.detail_path && (
              <Button variant="outline" asChild>
                <a href={listing.detail_path}>More info</a>
              </Button>
            )}
            {listing.payment_link_slug && (
              <Button asChild>
                <a href={`/Pay?slug=${listing.payment_link_slug}`}>Buy now</a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}