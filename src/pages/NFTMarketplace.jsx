import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/shared/PageHeader";
import ListingForm from "@/components/nfts/ListingForm";
import ListingsTable from "@/components/nfts/ListingsTable";
import { toast } from "sonner";

const initialForm = { title: "", slug: "", description: "", image_url: "", payment_link_id: "", policy_id: "", asset_name_hex: "", asset_label: "", quantity: 1, price_ada: 0, status: "draft" };
const createSlug = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function NFTMarketplace() {
  const [user, setUser] = React.useState(null);
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

  const paymentLinksById = Object.fromEntries(paymentLinks.map((link) => [link.id, link]));

  const saveMutation = useMutation({
    mutationFn: (payload) => editingListing ? base44.entities.NftListing.update(editingListing.id, payload) : base44.entities.NftListing.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nft-listings"] });
      setFormData(initialForm);
      setEditingListing(null);
      toast.success("NFT listing opgeslagen");
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

  const copyLink = (listing) => {
    navigator.clipboard.writeText(`${window.location.origin}/NFTStore?merchant=${encodeURIComponent(user.email)}`);
    toast.success("Storefront link gekopieerd");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="NFT Marketplace" subtitle="Open je eigen storefront en verkoop NFT listings rechtstreeks via PayADA checkout." />
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">Gebruik een actieve payment link per listing; de storefront toont automatisch de juiste koopknop voor elke NFT.</div>
      <div className="grid gap-6 xl:grid-cols-[1.05fr_1.35fr]">
        <ListingForm formData={formData} setFormData={setFormData} paymentLinks={paymentLinks} onSubmit={handleSubmit} editingListing={editingListing} isSubmitting={saveMutation.isPending} onCancel={() => { setEditingListing(null); setFormData(initialForm); }} />
        <ListingsTable listings={listings} paymentLinksById={paymentLinksById} onEdit={(listing) => { setEditingListing(listing); setFormData(listing); }} onDelete={(id) => deleteMutation.mutate(id)} onCopy={copyLink} />
      </div>
    </div>
  );
}