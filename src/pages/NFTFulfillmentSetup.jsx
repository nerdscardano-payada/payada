import React from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/shared/PageHeader";
import FulfillmentModeSelector from "@/components/nfts/FulfillmentModeSelector";
import SignerWalletSetupCard from "@/components/nfts/SignerWalletSetupCard";
import HotWalletSetupCard from "@/components/nfts/HotWalletSetupCard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function NFTFulfillmentSetup() {
  const [user, setUser] = React.useState(null);
  const [selectedMode, setSelectedMode] = React.useState("");
  const [walletSession, setWalletSession] = React.useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: merchantProfile } = useQuery({
    queryKey: ["merchant-profile-nft-fulfillment-setup", user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.MerchantProfile.filter({ user_id: user.email }, "-created_date", 1);
      return profiles[0] || null;
    },
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

  React.useEffect(() => {
    setSelectedMode(merchantProfile?.nft_fulfillment_mode || "");
  }, [merchantProfile?.id, merchantProfile?.nft_fulfillment_mode]);

  const saveMutation = useMutation({
    mutationFn: (mode) => {
      if (merchantProfile?.id) {
        return base44.entities.MerchantProfile.update(merchantProfile.id, { nft_fulfillment_mode: mode });
      }
      return base44.entities.MerchantProfile.create({
        user_id: user.email,
        business_name: user.full_name || user.email,
        nft_fulfillment_mode: mode,
        status: "active",
      });
    },
    onSuccess: (_, mode) => {
      queryClient.invalidateQueries({ queryKey: ["merchant-profile-nft-fulfillment-setup"] });
      queryClient.invalidateQueries({ queryKey: ["merchant-profile-nft-distribution"] });
      queryClient.invalidateQueries({ queryKey: ["merchant-profile"] });
      queryClient.invalidateQueries({ queryKey: ["merchant-profile-nft-operations"] });
      toast.success(mode === "automatic" ? "Automatische fulfillment opgeslagen" : "Manuele fulfillment opgeslagen");
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

  const hotWalletMutation = useMutation({
    mutationFn: (payload) => base44.functions.invoke("saveMerchantHotWallet", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchant-hot-wallet"] });
      toast.success("Hot wallet opgeslagen");
    },
    onError: (error) => toast.error(error?.response?.data?.error || error.message),
  });

  const configuredMode = merchantProfile?.nft_fulfillment_mode || "";
  const activeMode = selectedMode || configuredMode;
  const modeLabel = selectedMode === "automatic" ? "Automatisch met hot wallet" : "Manueel met signer wallet";

  return (
    <div className="space-y-6">
      <PageHeader title="NFT Fulfillment Wizard" subtitle="Stel eerst één keer je fulfillment methode in. Deze keuze wordt daarna onthouden voor NFT Distribution en NFT Marketplace." />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Stap 1</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">Kies je methode</p>
          <p className="mt-1 text-sm text-slate-600">Bepaal of transfers manueel of automatisch verlopen.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Stap 2</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">Sla op</p>
          <p className="mt-1 text-sm text-slate-600">Je keuze wordt centraal bewaard op je merchant profiel.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Stap 3</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">Ga verder</p>
          <p className="mt-1 text-sm text-slate-600">Open daarna NFT Distribution of Marketplace zonder dit opnieuw in te vullen.</p>
        </div>
      </div>

      <FulfillmentModeSelector value={selectedMode} onChange={setSelectedMode} isSaving={saveMutation.isPending} />

      {activeMode === "manual" && (
        <SignerWalletSetupCard
          wallet={signerWallet}
          connectedAddress={walletSession?.address || null}
          onConnect={setWalletSession}
          onDisconnect={() => setWalletSession(null)}
          onSave={() => {
            if (!user?.email || !walletSession?.address) return;
            signerWalletMutation.mutate({
              merchant_id: user.email,
              wallet_address: walletSession.address,
              wallet_provider: walletSession.walletKey || null,
              status: "active",
              last_verified_at: new Date().toISOString(),
            });
          }}
          isSaving={signerWalletMutation.isPending}
        />
      )}

      {activeMode === "automatic" && (
        <HotWalletSetupCard wallet={hotWallet} onSave={(payload) => hotWalletMutation.mutate(payload)} isSaving={hotWalletMutation.isPending} />
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Bevestig je keuze</h2>
        <p className="mt-1 text-sm text-slate-500">
          Huidige opgeslagen keuze: {configuredMode ? (configuredMode === "automatic" ? "Automatisch met hot wallet" : "Manueel met signer wallet") : "Nog niet ingesteld"}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button onClick={() => saveMutation.mutate(selectedMode)} disabled={!selectedMode || saveMutation.isPending}>
            Opslaan
          </Button>
          <Button asChild variant="outline">
            <Link to="/NFTOperations">Terug naar NFT Control</Link>
          </Button>
        </div>
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Volgende stap</p>
          <p className="mt-2 text-sm text-slate-700">Gekozen modus: {selectedMode ? modeLabel : "Kies eerst een fulfillment methode"}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link to="/NFTDistribution">Ga naar NFT Distribution</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/NFTMarketplace">Ga naar NFT Marketplace</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}