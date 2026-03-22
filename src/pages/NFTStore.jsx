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

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-3xl bg-slate-950 px-8 py-10 text-white">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">PayADA NFT Store</p>
          <h1 className="mt-4 text-4xl font-semibold">{data?.merchant?.business_name || "NFT Storefront"}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Directe NFT listings met checkout via PayADA, zonder externe marketplace ertussen.</p>
        </div>

        {!merchantId ? <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">Geen merchant opgegeven.</div> : isLoading ? <div className="mt-6 text-sm text-slate-500">Store laden...</div> : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {(data?.listings || []).map((listing) => (
              <div key={listing.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                {listing.image_url ? <img src={listing.image_url} alt={listing.title} className="h-56 w-full object-cover" /> : <div className="h-56 w-full bg-slate-200" />}
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-slate-900">{listing.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{listing.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      {listing.asset_label && <p className="text-xs uppercase tracking-wide text-slate-500">{listing.asset_label}</p>}
                      <p className="text-lg font-semibold text-slate-900">{listing.price_ada ? `₳ ${Number(listing.price_ada).toFixed(2)}` : "Prijs via checkout"}</p>
                    </div>
                    <Button asChild><a href={`/Pay?slug=${listing.payment_link_slug}`}>Koop nu</a></Button>
                  </div>
                </div>
              </div>
            ))}
            {data?.listings?.length === 0 && <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">Nog geen actieve listings beschikbaar.</div>}
          </div>
        )}
      </div>
    </div>
  );
}