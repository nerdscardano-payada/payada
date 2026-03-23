import React from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";

export default function NFTDetail() {
  const { storeSlug, listingId } = useParams();
  const [data, setData] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    setIsLoading(true);
    base44.functions
      .invoke("getPublicNftListing", { store_slug: storeSlug, listing_id: listingId })
      .then((res) => {
        setData(res.data);
        setIsLoading(false);
      })
      .catch((e) => {
        setError(e?.message || "Failed to load listing");
        setIsLoading(false);
      });
  }, [storeSlug, listingId]);

  const websiteUrlRaw = data?.merchant?.website_url || "";
  const websiteUrl = React.useMemo(() => {
    if (!websiteUrlRaw) return "";
    if (/^https?:\/\//i.test(websiteUrlRaw)) return websiteUrlRaw;
    return `https://${websiteUrlRaw.replace(/^\/+/, "")}`;
  }, [websiteUrlRaw]);

  const receiveAddr = data?.merchant?.default_receive_address || "";
  const receiveAddrShort = React.useMemo(() => {
    if (!receiveAddr) return "";
    return receiveAddr.length <= 12 ? receiveAddr : `${receiveAddr.slice(0, 6)}..${receiveAddr.slice(-6)}`;
  }, [receiveAddr]);
  const receiveAddrUrl = receiveAddr ? `https://cardanoscan.io/address/${encodeURIComponent(receiveAddr)}` : "";

  if (isLoading) {
    return <div className="min-h-screen bg-slate-100 p-6">Loading NFT...</div>;
  }
  if (error || !data?.listing) {
    return <div className="min-h-screen bg-slate-100 p-6">Listing not found.</div>;
  }

  const l = data.listing;

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 px-8 py-10 text-white shadow-sm">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {data?.merchant?.logo_url && (
              <img src={data.merchant.logo_url} alt={data.merchant.nft_store_name} className="h-8 w-8 rounded" />
            )}
            <span className="text-slate-200 font-medium flex items-center gap-2">
              {data.merchant.nft_store_name}
              {data?.merchant?.verified_merchant && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-300 text-xs font-semibold">Verified</span>
              )}
            </span>
            {websiteUrl && (
              <a href={websiteUrl} target="_blank" rel="noreferrer" className="text-cyan-300 hover:underline">Website</a>
            )}
            {websiteUrl && receiveAddrUrl && <span className="text-slate-500">•</span>}
            {receiveAddrUrl && (
              <a href={receiveAddrUrl} target="_blank" rel="noreferrer" className="text-cyan-300 hover:underline">Owned by {receiveAddrShort}</a>
            )}
            <div className="ml-auto flex gap-2">
              <Button variant="outline" className="border-white/20 bg-white text-slate-900 hover:bg-slate-100 hover:text-slate-900" asChild>
                <a href={`/nft/${data.merchant.nft_store_slug}`}>Back to store</a>
              </Button>
              {l.payment_link_slug && (
                <Button className="bg-cyan-400 text-slate-950 hover:bg-cyan-300" asChild>
                  <a href={`/Pay?slug=${l.payment_link_slug}`}>Buy now</a>
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            {l.image_url ? (
              <div className="flex h-[480px] w-full items-center justify-center bg-slate-50 p-4">
                <img src={l.image_url} alt={l.title} className="max-h-full w-full object-contain" />
              </div>
            ) : (
              <div className="flex h-[480px] w-full items-center justify-center bg-slate-200 text-sm font-semibold text-slate-500">NFT preview</div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h1 className="text-2xl font-semibold text-slate-900">{l.title}</h1>
              {l.asset_label && <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{l.asset_label}</p>}
              <p className="mt-4 text-sm leading-6 text-slate-600">{l.description || "This NFT listing includes PayADA checkout and merchant-signed delivery."}</p>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Collection</p>
                  <p className="mt-1 text-sm text-slate-900">{l.collection_name || "—"}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Price in ADA</p>
                  <p className="mt-1 text-sm text-slate-900">{l.price_ada ? `₳ ${Number(l.price_ada).toFixed(2)}` : "Available via checkout"}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Policy ID</p>
                  <p className="mt-1 text-xs break-all text-slate-900">{l.policy_id || "—"}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Asset name (hex)</p>
                  <p className="mt-1 text-xs break-all text-slate-900">{l.asset_name_hex || "—"}</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Quantity</p>
                  <p className="mt-1 text-sm text-slate-900">{l.quantity ?? 1}</p>
                </div>
                {l.image_url && (
                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Image URL</p>
                    <a className="mt-1 block text-sm text-blue-600 hover:underline break-all" href={l.image_url} target="_blank" rel="noreferrer">Open image</a>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-2">
                <Button variant="outline" asChild>
                  <a href={`/nft/${data.merchant.nft_store_slug}`}>Back to store</a>
                </Button>
                {l.payment_link_slug && (
                  <Button asChild>
                    <a href={`/Pay?slug=${l.payment_link_slug}`}>Buy now</a>
                  </Button>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}