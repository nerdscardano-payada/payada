import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import PageHeader from "@/components/shared/PageHeader";
import ListingForm from "@/components/nfts/ListingForm";
import ListingsTable from "@/components/nfts/ListingsTable";
import FulfillmentSetupRequiredCard from "@/components/nfts/FulfillmentSetupRequiredCard";
import { Button } from "@/components/ui/button";
import upsertHiddenNftPaymentLink from "@/lib/upsertHiddenNftPaymentLink";
import { toast } from "sonner";

const initialForm = { title: "", slug: "", description: "", image_url: "", payment_link_id: "", policy_id: "", asset_name_hex: "", asset_label: "", collection_name: "", collection_slug: "", quantity: 1, price_ada: 0, status: "draft" };
const createSlug = (value = "") => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function NFTMarketplace() {
  const [user, setUser] = React.useState(null);
  const [selectedAssetUnit, setSelectedAssetUnit] = React.useState("");
  const [formData, setFormData] = React.useState(initialForm);
  const [editingListing, setEditingListing] = React.useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: merchantProfile, isLoading: isLoadingMerchantProfile } = useQuery({
    queryKey: ["merchant-profile", user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.MerchantProfile.filter({ user_id: user.email }, "-created_date", 1);
      return profiles[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: paymentLinks = [] } = useQuery({
    queryKey: ["payment-links-marketplace", user?.email],
    queryFn: () => base44.entities.PaymentLink.filter({ merchant_id: user.email }, "-created_date", 100),
    enabled: !!user?.email,
  });

  const { data: listings = [] } = useQuery({
    queryKey: ["nft-listings", user?.email],
    queryFn: () => base44.entities.NftListing.filter({ merchant_id: user.email }, "-created_date", 100),
    enabled: !!user?.email,
  });

  const { data: signerWallet } = useQuery({
    queryKey: ["merchant-signer-wallet", user?.email],
    queryFn: async () => {
      const wallets = await base44.entities.MerchantSignerWallet.filter({ merchant_id: user.email }, "-updated_date", 1);
      return wallets[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: hotWallet } = useQuery({
    queryKey: ["merchant-hot-wallet", user?.email],
    queryFn: async () => {
      const wallets = await base44.entities.MerchantHotWallet.filter({ merchant_id: user.email }, "-updated_date", 1);
      return wallets[0] || null;
    },
    enabled: !!user?.email,
  });

  const isFulfillmentConfigured = Boolean(merchantProfile?.nft_fulfillment_mode);
  const configuredAssetWalletAddress = merchantProfile?.nft_fulfillment_mode === "automatic" ? hotWallet?.wallet_address : signerWallet?.wallet_address;

  const { data: walletAssets = [] } = useQuery({
    queryKey: ["wallet-nfts", configuredAssetWalletAddress],
    queryFn: async () => {
      const response = await base44.functions.invoke("getWalletNfts", { wallet_address: configuredAssetWalletAddress });
      return response.data.assets || [];
    },
    enabled: !!configuredAssetWalletAddress,
  });
  const resolvedStoreSlug = createSlug(merchantProfile?.nft_store_slug || merchantProfile?.business_name || user?.full_name || user?.email?.split("@")[0] || "nft-store");
  const publicStorePath = `/nft/${resolvedStoreSlug}`;
  const paymentLinksById = Object.fromEntries(paymentLinks.map((link) => [link.id, link]));
  const activeListings = listings.filter((listing) => listing.status === "active").length;
  const draftListings = listings.filter((listing) => listing.status === "draft").length;

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      const existingPaymentLink = paymentLinksById[editingListing?.payment_link_id];
      const paymentLink = await upsertHiddenNftPaymentLink({
        existingLink: existingPaymentLink,
        merchantId: user.email,
        title: `${payload.title || payload.asset_label || "NFT listing"} • NFT purchase`,
        amountAda: payload.price_ada,
        receiveAddress: merchantProfile?.default_receive_address,
        slugBase: `nft-market-${payload.slug || payload.title}`,
      });

      const listingPayload = {
        ...payload,
        payment_link_id: paymentLink.id,
        price_ada: Number(payload.price_ada) || 0,
      };

      return editingListing
        ? base44.entities.NftListing.update(editingListing.id, listingPayload)
        : base44.entities.NftListing.create(listingPayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nft-listings"] });
      queryClient.invalidateQueries({ queryKey: ["payment-links-marketplace"] });
      setFormData(initialForm);
      setEditingListing(null);
      toast.success("NFT listing saved");
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (listing) => {
      const paymentLink = paymentLinksById[listing.payment_link_id];
      if (paymentLink?.is_hidden) {
        await base44.entities.PaymentLink.delete(paymentLink.id);
      }
      return base44.entities.NftListing.delete(listing.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nft-listings"] });
      queryClient.invalidateQueries({ queryKey: ["payment-links-marketplace"] });
      toast.success("NFT listing deleted");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user?.email) return;
    if (!merchantProfile?.default_receive_address) {
      toast.error("Set eerst een standaard ontvangstadres in je merchant profiel");
      return;
    }
    if (!Number(formData.price_ada) || Number(formData.price_ada) <= 0) {
      toast.error("Voer een geldige ADA prijs in");
      return;
    }
    saveMutation.mutate({
      ...formData,
      merchant_id: user.email,
      slug: createSlug(formData.slug || formData.title),
      collection_slug: createSlug(formData.collection_name || ""),
    });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}${publicStorePath}`);
    toast.success("Storefront link copied");
  };

  const handleSelectAsset = (unit) => {
    const asset = walletAssets.find((item) => item.unit === unit);
    if (!asset) return;
    setSelectedAssetUnit(unit);
    setFormData((prev) => ({
      ...prev,
      title: asset.asset_label,
      slug: prev.slug || createSlug(asset.asset_label),
      asset_label: asset.asset_label,
      policy_id: asset.policy_id,
      asset_name_hex: asset.asset_name_hex,
      quantity: prev.quantity || 1,
      image_url: prev.image_url || asset.image_url || "",
      description: prev.description || asset.description || "",
    }));
  };

  if (!isLoadingMerchantProfile && !isFulfillmentConfigured) {
    return (
      <div className="space-y-6">
        <PageHeader title="NFT Marketplace" subtitle="Stel eerst je fulfillment methode in voor je marketplace listings maakt." />
        <FulfillmentSetupRequiredCard />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="NFT Marketplace" subtitle="Beheer hier je listings met NFT’s uit je opgeslagen wallet, zonder extra wallet setup op deze pagina." />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Active listings</p>
          <p className="mt-2 text-3xl font-semibold text-amber-950">{activeListings}</p>
          <p className="mt-1 text-sm text-amber-900">NFTs currently visible in your storefront.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Draft pipeline</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{draftListings}</p>
          <p className="mt-1 text-sm text-slate-600">Listings waiting for publication or pricing review.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Public slug</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">/{resolvedStoreSlug}</p>
          <p className="mt-1 text-sm text-slate-600">Used for your public marketplace link.</p>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">NFT instellingen</h2>
        <p className="mt-1 text-sm text-slate-500">Fulfillment en wallet-koppeling gebeuren nu enkel op de wizardpagina; deze marketplace leest daarna automatisch je opgeslagen wallet.</p>
        {!configuredAssetWalletAddress && (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            {merchantProfile?.nft_fulfillment_mode === "automatic"
              ? "Stel eerst je hot wallet in op NFT Fulfillment Setup zodat je marketplace NFT’s kan laden."
              : "Stel eerst je signer wallet in op NFT Fulfillment Setup zodat je marketplace NFT’s kan laden."}
          </div>
        )}
        <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Public link</p>
          <p className="mt-2 break-all text-sm text-slate-700">{`${window.location.origin}${publicStorePath}`}</p>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild><Link to="/NFTFulfillmentSetup">Open fulfillment wizard</Link></Button>
          <Button asChild variant="outline"><a href={`${window.location.origin}${publicStorePath}`} target="_blank" rel="noreferrer">Preview store</a></Button>
        </div>
      </div>
      <ListingForm formData={formData} setFormData={setFormData} walletAssets={walletAssets} selectedAssetUnit={selectedAssetUnit} onSelectAsset={handleSelectAsset} onSubmit={handleSubmit} editingListing={editingListing} isSubmitting={saveMutation.isPending} onCancel={() => { setEditingListing(null); setFormData(initialForm); setSelectedAssetUnit(""); }} />
      <ListingsTable listings={listings} paymentLinksById={paymentLinksById} onEdit={(listing) => { setEditingListing(listing); setFormData({ ...initialForm, ...listing, price_ada: listing.price_ada || paymentLinksById[listing.payment_link_id]?.amount_ada || 0 }); setSelectedAssetUnit(`${listing.policy_id}${listing.asset_name_hex || ""}`); }} onDelete={(listing) => deleteMutation.mutate(listing)} onCopy={copyLink} onPreview={() => window.open(publicStorePath, "_blank")} />
    </div>
  );
}