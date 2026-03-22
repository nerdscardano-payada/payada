import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/shared/PageHeader";
import ListingForm from "@/components/nfts/ListingForm";
import ListingsTable from "@/components/nfts/ListingsTable";
import MarketplaceSettingsForm from "@/components/nfts/MarketplaceSettingsForm";
import SignerWalletSetupCard from "@/components/nfts/SignerWalletSetupCard";
import { toast } from "sonner";

const initialForm = { title: "", slug: "", description: "", image_url: "", payment_link_id: "", policy_id: "", asset_name_hex: "", asset_label: "", collection_name: "", collection_slug: "", quantity: 1, price_ada: 0, status: "draft" };
const initialStoreSettings = { nft_store_name: "", nft_store_slug: "", nft_store_description: "" };
const createSlug = (value = "") => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function NFTMarketplace() {
  const [user, setUser] = React.useState(null);
  const [walletSession, setWalletSession] = React.useState(null);
  const [selectedAssetUnit, setSelectedAssetUnit] = React.useState("");
  const [formData, setFormData] = React.useState(initialForm);
  const [editingListing, setEditingListing] = React.useState(null);
  const [storeSettings, setStoreSettings] = React.useState(initialStoreSettings);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: merchantProfile } = useQuery({
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

  const { data: walletAssets = [] } = useQuery({
    queryKey: ["wallet-nfts", walletSession?.address],
    queryFn: async () => {
      const response = await base44.functions.invoke("getWalletNfts", { wallet_address: walletSession.address });
      return response.data.assets || [];
    },
    enabled: !!walletSession?.address,
  });

  React.useEffect(() => {
    if (!user?.email) return;
    setStoreSettings({
      nft_store_name: merchantProfile?.nft_store_name || merchantProfile?.business_name || user.full_name || "",
      nft_store_slug: merchantProfile?.nft_store_slug || createSlug(merchantProfile?.business_name || user.full_name || user.email.split("@")[0]),
      nft_store_description: merchantProfile?.nft_store_description || "",
    });
  }, [merchantProfile?.id, user?.email]);

  const resolvedStoreSlug = createSlug(storeSettings.nft_store_slug || merchantProfile?.nft_store_slug || merchantProfile?.business_name || user?.full_name || user?.email?.split("@")[0] || "nft-store");
  const publicStorePath = `/nft/${resolvedStoreSlug}`;
  const paymentLinksById = Object.fromEntries(paymentLinks.map((link) => [link.id, link]));
  const activeListings = listings.filter((listing) => listing.status === "active").length;
  const draftListings = listings.filter((listing) => listing.status === "draft").length;
  const signerStatus = signerWallet?.wallet_address ? "Configured" : "Not configured";

  const saveMutation = useMutation({
    mutationFn: (payload) => editingListing ? base44.entities.NftListing.update(editingListing.id, payload) : base44.entities.NftListing.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nft-listings"] });
      setFormData(initialForm);
      setEditingListing(null);
      toast.success("NFT listing saved");
    },
  });

  const settingsMutation = useMutation({
    mutationFn: (payload) => {
      if (merchantProfile?.id) {
        return base44.entities.MerchantProfile.update(merchantProfile.id, payload);
      }
      return base44.entities.MerchantProfile.create({
        user_id: user.email,
        business_name: payload.nft_store_name || user.full_name || user.email.split("@")[0],
        ...payload,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchant-profile"] });
      toast.success("Marketplace settings saved");
    },
  });

  const signerWalletMutation = useMutation({
    mutationFn: (payload) => {
      if (signerWallet?.id) {
        return base44.entities.MerchantSignerWallet.update(signerWallet.id, payload);
      }
      return base44.entities.MerchantSignerWallet.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchant-signer-wallet"] });
      toast.success("Signer wallet saved");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.NftListing.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nft-listings"] });
      toast.success("NFT listing deleted");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user?.email) return;
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

  const saveMarketplaceSettings = () => {
    if (!user?.email) return;
    settingsMutation.mutate({
      nft_store_name: storeSettings.nft_store_name || merchantProfile?.business_name || user.full_name || "NFT Store",
      nft_store_slug: resolvedStoreSlug,
      nft_store_description: storeSettings.nft_store_description || "",
    });
  };

  const saveSignerWallet = () => {
    if (!user?.email || !walletSession?.address) return;
    signerWalletMutation.mutate({
      merchant_id: user.email,
      wallet_address: walletSession.address,
      wallet_provider: walletSession.walletKey || null,
      status: "active",
      last_verified_at: new Date().toISOString(),
    });
  };

  const handleSelectAsset = (unit) => {
    const asset = walletAssets.find((item) => item.unit === unit);
    if (!asset) return;
    setSelectedAssetUnit(unit);
    setFormData((prev) => ({
      ...prev,
      title: prev.title || asset.asset_label,
      slug: prev.slug || createSlug(asset.asset_label),
      asset_label: asset.asset_label,
      policy_id: asset.policy_id,
      asset_name_hex: asset.asset_name_hex,
      quantity: prev.quantity || 1,
      image_url: prev.image_url || asset.image_url || "",
      description: prev.description || asset.description || "",
    }));
  };

  return (
    <div className="space-y-6">
      <PageHeader title="NFT Marketplace" subtitle="Merchant-owned storefronts with your own branding, collections, and a clean public slug." />
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
      <div className="grid gap-6 xl:grid-cols-2">
        <SignerWalletSetupCard wallet={signerWallet} connectedAddress={walletSession?.address || null} onConnect={setWalletSession} onDisconnect={() => { setWalletSession(null); setSelectedAssetUnit(""); }} onSave={saveSignerWallet} isSaving={signerWalletMutation.isPending} />
        <MarketplaceSettingsForm value={storeSettings} onChange={setStoreSettings} onSave={saveMarketplaceSettings} isSaving={settingsMutation.isPending} publicUrl={`${window.location.origin}${publicStorePath}`} />
      </div>
      <ListingForm formData={formData} setFormData={setFormData} paymentLinks={paymentLinks} walletAssets={walletAssets} selectedAssetUnit={selectedAssetUnit} onSelectAsset={handleSelectAsset} onSubmit={handleSubmit} editingListing={editingListing} isSubmitting={saveMutation.isPending} onCancel={() => { setEditingListing(null); setFormData(initialForm); setSelectedAssetUnit(""); }} />
      <ListingsTable listings={listings} paymentLinksById={paymentLinksById} onEdit={(listing) => { setEditingListing(listing); setFormData({ ...initialForm, ...listing }); setSelectedAssetUnit(`${listing.policy_id}${listing.asset_name_hex || ""}`); }} onDelete={(id) => deleteMutation.mutate(id)} onCopy={copyLink} onPreview={() => window.open(publicStorePath, "_blank")} />
    </div>
  );
}