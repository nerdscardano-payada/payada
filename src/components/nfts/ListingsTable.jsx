import React from "react";
import { Button } from "@/components/ui/button";
import { Copy, Pencil, Trash2 } from "lucide-react";

export default function ListingsTable({ listings, paymentLinksById, onEdit, onDelete, onCopy }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5"><h2 className="text-lg font-semibold text-slate-900">Listings</h2></div>
      <div className="divide-y divide-slate-100">
        {listings.length === 0 ? <div className="p-5 text-sm text-slate-500">Nog geen NFT listings aangemaakt.</div> : listings.map((listing) => (
          <div key={listing.id} className="p-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-4 items-start">
              {listing.image_url ? <img src={listing.image_url} alt={listing.title} className="h-16 w-16 rounded-xl object-cover border border-slate-200" /> : <div className="h-16 w-16 rounded-xl bg-slate-100" />}
              <div>
                <div className="flex items-center gap-2"><p className="font-medium text-slate-900">{listing.title}</p><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${listing.status === "active" ? "bg-emerald-100 text-emerald-700" : listing.status === "draft" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{listing.status}</span></div>
                <p className="mt-1 text-sm text-slate-500">{paymentLinksById[listing.payment_link_id]?.title || "Geen link"}{listing.price_ada ? ` · ₳ ${Number(listing.price_ada).toFixed(2)}` : ""}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => onCopy(listing)}><Copy className="mr-2 h-4 w-4" />Link</Button>
              <Button variant="outline" size="sm" onClick={() => onEdit(listing)}><Pencil className="mr-2 h-4 w-4" />Bewerk</Button>
              <Button variant="outline" size="sm" onClick={() => onDelete(listing.id)}><Trash2 className="mr-2 h-4 w-4" />Verwijder</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}