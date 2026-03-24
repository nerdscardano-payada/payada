import React from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import FulfillmentMethodBadge from "@/components/nfts/FulfillmentMethodBadge";
import DeliveryInfoDialog from "@/components/nfts/DeliveryInfoDialog";
import PayadaLogo from "@/components/shared/PayadaLogo";
import { normalizeIpfsUrl } from "@/utils";

export default function NFTStore() {
  const { storeSlug } = useParams();
  const urlParams = new URLSearchParams(window.location.search);
  const merchantId = urlParams.get("merchant") || "";
  const queryStoreSlug = urlParams.get("store") || "";
  const resolvedStoreSlug = storeSlug || queryStoreSlug;
  const [data, setData] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!resolvedStoreSlug && !merchantId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    base44.functions.invoke("getPublicNftStore", { store_slug: resolvedStoreSlug || null, merchant_id: merchantId || null }).then((response) => {
      setData(response.data);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, [resolvedStoreSlug, merchantId]);

  const listings = data?.listings || [];
  const merchantName = data?.merchant?.nft_store_name || data?.merchant?.business_name || "NFT Storefront";
  const storeDescription = data?.merchant?.nft_store_description || "Direct NFT listings with PayADA checkout and merchant-managed NFT delivery.";
  const fulfillmentMode = data?.merchant?.nft_fulfillment_mode || "manual";
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
  const preferredCollection = data?.merchant?.preferred_collection_name || "";
  const collections = React.useMemo(() => {
    const grouped = listings.reduce((result, listing) => {
      const name = listing.collection_name || "Featured NFTs";
      if (!result[name]) result[name] = [];
      result[name].push(listing);
      return result;
    }, {});

    const arr = Object.entries(grouped).map(([name, items]) => ({
      name,
      items: [...items].sort((a, b) => {
        const priceA = typeof a.price_ada === "number" ? a.price_ada : Number.POSITIVE_INFINITY;
        const priceB = typeof b.price_ada === "number" ? b.price_ada : Number.POSITIVE_INFINITY;
        return priceA - priceB;
      }),
    }));

    if (preferredCollection) {
      const idx = arr.findIndex((c) => c.name === preferredCollection);
      if (idx > 0) {
        const [fav] = arr.splice(idx, 1);
        arr.unshift(fav);
      }
    }
    return arr;
  }, [listings, preferredCollection]);

  const [selectedCollection, setSelectedCollection] = React.useState("all");
  const displayCollections = React.useMemo(() => {
    if (selectedCollection === "all") return collections;
    return collections.filter((c) => c.name === selectedCollection);
  }, [collections, selectedCollection]);
  const marketplaceQuery = React.useMemo(() => {
    const params = new URLSearchParams();
    if (resolvedStoreSlug) params.set("store", resolvedStoreSlug);
    if (merchantId) params.set("merchant", merchantId);
    const query = params.toString();
    return query ? `?${query}` : "";
  }, [resolvedStoreSlug, merchantId]);

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 px-8 py-10 text-white shadow-sm">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <div className="mb-6">
                <PayadaLogo />
              </div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">PayADA NFT Store</p>
              <h1 className="mt-4 text-4xl font-semibold">{merchantName}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">{storeDescription}</p>
              <div className="mt-4 flex items-center gap-3 text-sm">
                {data?.merchant?.logo_url && (
                  <img src={normalizeIpfsUrl(data.merchant.logo_url)} alt={merchantName} className="h-8 w-8 rounded" />
                )}
                <span className="text-slate-200 font-medium flex items-center gap-2">
                  {merchantName}
                  {data?.merchant?.verified_merchant && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-300 text-xs font-semibold">Verified</span>
                  )}
                </span>
                {websiteUrl && (
                  <a href={websiteUrl} target="_blank" rel="noreferrer" className="text-cyan-300 hover:underline">Website</a>
                )}
                {websiteUrl && receiveAddrUrl && (
                  <span className="text-slate-500">•</span>
                )}
                {receiveAddrUrl && (
                  <a href={receiveAddrUrl} target="_blank" rel="noreferrer" className="text-cyan-300 hover:underline">Owned by {receiveAddrShort}</a>
                )}
                <DeliveryInfoDialog mode={fulfillmentMode} />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Live listings</p>
                <p className="mt-2 text-3xl font-semibold text-white">{listings.length}</p>
                <p className="mt-1 text-sm text-slate-300">Active items in this storefront.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Collections</p>
                <p className="mt-2 text-3xl font-semibold text-white">{collections.length}</p>
                <p className="mt-1 text-sm text-slate-300">Organized into separate NFT groups.</p>
                <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                  <a href={`/NFTMarketplaceFAQ${marketplaceQuery}`} className="text-cyan-300 hover:underline">NFT Marketplace FAQ</a>
                  <a href={`/NFTMarketplaceTerms${marketplaceQuery}`} className="text-cyan-300 hover:underline">Marketplace Terms</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {!resolvedStoreSlug && !merchantId ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">No store slug specified for this storefront.</div>
        ) : isLoading ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading store...</div>
        ) : listings.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">No active NFT listings yet</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">This storefront is ready, but there are currently no published items available.</p>
          </div>
        ) : (
          <div className="mt-8 space-y-10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button asChild variant="outline" className="bg-white">
                <a href="/NFTMarketplace">Create your own NFT store</a>
              </Button>
              <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Select collection" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All collections</SelectItem>
                  {collections.map((c) => (
                    <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {displayCollections.map((collection) => (
              <section key={collection.name} className="space-y-5">
                {(collections.length > 1 || collection.name !== "Featured NFTs") && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Collection</p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-900">{collection.name}</h2>
                  </div>
                )}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {collection.items.map((listing) => (
                    <div key={listing.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-transform duration-200 hover:-translate-y-1">
                      {listing.image_url ? (
                        <div className="flex h-72 w-full items-center justify-center bg-slate-50 p-4">
                          <img src={normalizeIpfsUrl(listing.image_url)} alt={listing.title} className="max-h-full w-full object-contain" />
                        </div>
                      ) : (
                        <div className="flex h-72 w-full items-center justify-center bg-slate-200 text-sm font-semibold text-slate-500">NFT preview</div>
                      )}
                      <div className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h2 className="text-xl font-semibold text-slate-900">{listing.title}</h2>
                            {listing.asset_label && <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{listing.asset_label}</p>}
                            <div className="mt-3">
                              <FulfillmentMethodBadge mode={fulfillmentMode} />
                            </div>
                          </div>
                          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">NFT</div>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-600">{listing.description || "This listing uses PayADA checkout and merchant-managed NFT delivery."}</p>
                        <div className="mt-5 flex items-center justify-between gap-4">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">Price</p>
                            <p className="text-lg font-semibold text-slate-900">{listing.price_ada ? `₳ ${Number(listing.price_ada).toFixed(2)}` : "Price via checkout"}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" asChild>
                              <a href={`/nft/${(data?.merchant?.nft_store_slug || resolvedStoreSlug)}/${listing.id}`}>More info</a>
                            </Button>
                            <Button asChild>
                              <a href={`/Pay?slug=${listing.payment_link_slug}`}>Buy now</a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}