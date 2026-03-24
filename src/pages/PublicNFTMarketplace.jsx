import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import PublicMarketplaceFilters from "@/components/nfts/PublicMarketplaceFilters";
import PublicMarketplaceCard from "@/components/nfts/PublicMarketplaceCard";
import PayadaLogo from "@/components/shared/PayadaLogo";

export default function PublicNFTMarketplace() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedMerchant, setSelectedMerchant] = React.useState("all");
  const [selectedCollection, setSelectedCollection] = React.useState("all");
  const [selectedFulfillment, setSelectedFulfillment] = React.useState("all");
  const [selectedVerified, setSelectedVerified] = React.useState("all");
  const [sortBy, setSortBy] = React.useState("price-asc");

  const { data, isLoading } = useQuery({
    queryKey: ["global-nft-marketplace"],
    queryFn: async () => {
      const response = await base44.functions.invoke("getGlobalNftMarketplace", {});
      return response.data;
    },
  });

  const listings = data?.listings || [];

  const merchantOptions = React.useMemo(() => (
    [...new Set(listings.map((listing) => listing.merchant?.nft_store_name || listing.merchant?.business_name).filter(Boolean))].sort()
  ), [listings]);

  const collectionOptions = React.useMemo(() => (
    [...new Set(listings.map((listing) => listing.collection_name || "Featured NFTs"))].sort()
  ), [listings]);

  const filteredListings = React.useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return [...listings]
      .filter((listing) => {
        const merchantName = listing.merchant?.nft_store_name || listing.merchant?.business_name || "";
        const collectionName = listing.collection_name || "Featured NFTs";
        const searchMatch = !normalizedSearch || [
          listing.title,
          listing.description,
          listing.asset_label,
          merchantName,
          collectionName,
        ].filter(Boolean).some((value) => value.toLowerCase().includes(normalizedSearch));

        const merchantMatch = selectedMerchant === "all" || merchantName === selectedMerchant;
        const collectionMatch = selectedCollection === "all" || collectionName === selectedCollection;
        const fulfillmentMatch = selectedFulfillment === "all" || listing.merchant?.nft_fulfillment_mode === selectedFulfillment;
        const verifiedMatch = selectedVerified === "all"
          || (selectedVerified === "verified" && listing.merchant?.verified_merchant)
          || (selectedVerified === "unverified" && !listing.merchant?.verified_merchant);

        return searchMatch && merchantMatch && collectionMatch && fulfillmentMatch && verifiedMatch;
      })
      .sort((a, b) => {
        const priceA = typeof a.price_ada === "number" ? a.price_ada : Number.POSITIVE_INFINITY;
        const priceB = typeof b.price_ada === "number" ? b.price_ada : Number.POSITIVE_INFINITY;

        if (sortBy === "price-desc") return priceB - priceA;
        if (sortBy === "newest") return new Date(b.created_date || 0) - new Date(a.created_date || 0);
        return priceA - priceB;
      });
  }, [listings, searchTerm, selectedMerchant, selectedCollection, selectedFulfillment, selectedVerified, sortBy]);

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 px-8 py-10 text-white shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <PayadaLogo />
              <p className="mt-6 text-sm uppercase tracking-[0.3em] text-cyan-300">PayADA NFT Marketplace</p>
              <h1 className="mt-4 text-4xl font-semibold">All merchant NFT listings in one public marketplace</h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                Browse every active NFT listing across all registered merchant stores, search collections instantly, and jump directly into any merchant storefront.
              </p>
            </div>

            <div className="flex shrink-0 items-start">
              <Button className="bg-cyan-400 text-slate-950 hover:bg-cyan-300" asChild>
                <a href="/NFTMarketplace">Maak je eigen NFT Store</a>
              </Button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Live listings</p>
              <p className="mt-2 text-3xl font-semibold">{listings.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Merchants</p>
              <p className="mt-2 text-3xl font-semibold">{data?.merchant_count || 0}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Collections</p>
              <p className="mt-2 text-3xl font-semibold">{data?.collection_count || 0}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <PublicMarketplaceFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            merchantOptions={merchantOptions}
            collectionOptions={collectionOptions}
            selectedMerchant={selectedMerchant}
            setSelectedMerchant={setSelectedMerchant}
            selectedCollection={selectedCollection}
            setSelectedCollection={setSelectedCollection}
            selectedFulfillment={selectedFulfillment}
            setSelectedFulfillment={setSelectedFulfillment}
            selectedVerified={selectedVerified}
            setSelectedVerified={setSelectedVerified}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />

          {isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading marketplace...</div>
          ) : filteredListings.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
              <p>No NFT listings match your current filters.</p>
              <div className="mt-4">
                <Button asChild>
                  <a href="/NFTMarketplace">Maak je eigen NFT Store</a>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredListings.map((listing) => (
                <PublicMarketplaceCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}