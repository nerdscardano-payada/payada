import React from "react";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Pencil, Trash2 } from "lucide-react";

export default function ListingsTable({ listings, paymentLinksById, onEdit, onDelete, onCopy, onPreview }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5">
        <h2 className="text-lg font-semibold text-slate-900">Listings</h2>
        <p className="mt-1 text-sm text-slate-500">Manage live storefront items, pricing, and connected checkout links.</p>
      </div>
      <div className="divide-y divide-slate-100">
        {listings.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">No NFT listings created yet. Publish your first storefront item to put your collection live.</div>
        ) : listings.map((listing) => (
          <div key={listing.id} className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              {listing.image_url ? (
                <img src={listing.image_url} alt={listing.title} className="h-20 w-20 rounded-2xl border border-slate-200 bg-slate-50 object-contain p-1" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-400">
                  NFT
                </div>
              )}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-slate-900">{listing.title}</p>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${listing.status === "active" ? "bg-emerald-100 text-emerald-700" : listing.status === "draft" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{listing.status}</span>
                </div>
                <p className="mt-1 text-sm text-slate-500">/{listing.slug || "listing"}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span>{paymentLinksById[listing.payment_link_id]?.title || "No payment link"}</span>
                  {listing.collection_name ? <span>{listing.collection_name}</span> : null}
                  {listing.price_ada ? <span>₳ {Number(listing.price_ada).toFixed(2)}</span> : null}
                  {listing.asset_label ? <span>{listing.asset_label}</span> : null}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => onPreview?.(listing)}><ExternalLink className="mr-2 h-4 w-4" />Preview</Button>
              <Button variant="outline" size="sm" onClick={() => onCopy(listing)}><Copy className="mr-2 h-4 w-4" />Storefront</Button>
              <Button variant="outline" size="sm" onClick={() => onEdit(listing)}><Pencil className="mr-2 h-4 w-4" />Edit</Button>
              <Button variant="outline" size="sm" onClick={() => onDelete(listing)}><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}