import React from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";

export default function NFTStore() {
  const urlParams = new URLSearchParams(window.location.search);
  const merchantId = urlParams.get("merchant") || "";
  const [data, setData] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!merchantId) {
      setIsLoading(false);
      return;
    }
    base44.functions.invoke("getPublicNftStore", { merchant_id: merchantId }).then((response) => {
      setData(response.data);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, [merchantId]);

  const listings = data?.listings || [];
  const merchantName = data?.merchant?.business_name || "NFT Storefront";

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 px-8 py-10 text-white shadow-sm">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">PayADA NFT Store</p>
              <h1 className="mt-4 text-4xl font-semibold">{merchantName}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">Directe NFT listings met checkout via PayADA, zonder externe marketplace ertussen en met custodyless delivery via merchant signing.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Live listings</p>
                <p className="mt-2 text-3xl font-semibold text-white">{listings.length}</p>
                <p className="mt-1 text-sm text-slate-300">Actieve items in deze storefront.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Checkout</p>
                <p className="mt-2 text-lg font-semibold text-white">PayADA native</p>
                <p className="mt-1 text-sm text-slate-300">Snelle ADA checkout binnen dezelfde flow.</p>
              </div>
            </div>
          </div>
        </div>

        {!merchantId ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Geen merchant opgegeven voor deze storefront.</div>
        ) : isLoading ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Store laden...</div>
        ) : listings.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Nog geen actieve NFT listings</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Deze storefront staat klaar, maar er zijn momenteel nog geen gepubliceerde items beschikbaar.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing) => (
              <div key={listing.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-transform duration-200 hover:-translate-y-1">
                {listing.image_url ? (
                  <img src={listing.image_url} alt={listing.title} className="h-64 w-full object-cover" />
                ) : (
                  <div className="flex h-64 w-full items-center justify-center bg-slate-200 text-sm font-semibold text-slate-500">NFT preview</div>
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">{listing.title}</h2>
                      {listing.asset_label && <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{listing.asset_label}</p>}
                    </div>
                    <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">NFT</div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{listing.description || "Deze listing gebruikt PayADA checkout en merchant-signed delivery."}</p>
                  <div className="mt-5 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">Prijs</p>
                      <p className="text-lg font-semibold text-slate-900">{listing.price_ada ? `₳ ${Number(listing.price_ada).toFixed(2)}` : "Prijs via checkout"}</p>
                    </div>
                    <Button asChild>
                      <a href={`/Pay?slug=${listing.payment_link_slug}`}>Koop nu</a>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}