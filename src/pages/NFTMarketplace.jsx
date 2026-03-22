import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/shared/PageHeader";
import ListingForm from "@/components/nfts/ListingForm";
import ListingsTable from "@/components/nfts/ListingsTable";
import SignerWalletSetupCard from "@/components/nfts/SignerWalletSetupCard";
import { toast } from "sonner";

const initialForm = { title: "", slug: "", description: "", image_url: "", payment_link_id: "", policy_id: "", asset_name_hex: "", asset_label: "", quantity: 1, price_ada: 0, status: "draft" };
const createSlug = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function NFTMarketplace() {
  const [user, setUser] = React.useState(null);
  const [walletSession, setWalletSession] = React.useState(null);
  const [selectedAssetUnit, setSelectedAssetUnit] = React.useState("");
  const [formData, setFormData] = React.useState(initialForm);
  const [editingListing, setEditingListing] = React.useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => { base44.auth.me().then(setUser); }, []);

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
      toast.success("NFT listing opgeslagen");
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
      toast.success("Signer wallet opgeslagen");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.NftListing.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nft-listings"] });
      toast.success("NFT listing verwijderd");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user?.email) return;
    saveMutation.mutate({ ...formData, merchant_id: user.email, slug: createSlug(formData.slug || formData.title) });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/NFTStore?merchant=${encodeURIComponent(user.email)}`);
    toast.success("Storefront link gekopieerd");
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
      slug: prev.slug || asset.asset_label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
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
      <PageHeader title="NFT Marketplace" subtitle="Merchant-owned storefronts met PayADA checkout, metadata en custodyless delivery." />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Actieve listings</p>
          <p className="mt-2 text-3xl font-semibold text-amber-950">{activeListings}</p>
          <p className="mt-1 text-sm text-amber-900">NFT's die live zichtbaar zijn in je storefront.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Draft pipeline</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{draftListings}</p>
          <p className="mt-1 text-sm text-slate-600">Listings die nog klaarstaan voor publicatie of prijscontrole.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Signer wallet</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{signerStatus}</p>
          <p className="mt-1 text-sm text-slate-600">Storefront en fulfilment blijven gekoppeld aan je eigen wallet flow.</p>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.05fr_1.35fr]">
        <SignerWalletSetupCard wallet={signerWallet} connectedAddress={walletSession?.address || null} onConnect={setWalletSession} onDisconnect={() => { setWalletSession(null); setSelectedAssetUnit(""); }} onSave={saveSignerWallet} isSaving={signerWalletMutation.isPending} />
        <ListingForm formData={formData} setFormData={setFormData} paymentLinks={paymentLinks} walletAssets={walletAssets} selectedAssetUnit={selectedAssetUnit} onSelectAsset={handleSelectAsset} onSubmit={handleSubmit} editingListing={editingListing} isSubmitting={saveMutation.isPending} onCancel={() => { setEditingListing(null); setFormData(initialForm); setSelectedAssetUnit(""); }} />
      </div>
      <ListingsTable listings={listings} paymentLinksById={paymentLinksById} onEdit={(listing) => { setEditingListing(listing); setFormData(listing); setSelectedAssetUnit(`${listing.policy_id}${listing.asset_name_hex || ""}`); }} onDelete={(id) => deleteMutation.mutate(id)} onCopy={copyLink} />
    </div>
  );
}