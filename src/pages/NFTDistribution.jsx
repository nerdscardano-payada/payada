import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import PageHeader from "@/components/shared/PageHeader";
import SignerWalletSetupCard from "@/components/nfts/SignerWalletSetupCard";
import HotWalletSetupCard from "@/components/nfts/HotWalletSetupCard";
import FulfillmentRuleForm from "@/components/nfts/FulfillmentRuleForm";
import FulfillmentRulesTable from "@/components/nfts/FulfillmentRulesTable";
import TransferQueueTable from "@/components/nfts/TransferQueueTable";
import FulfillmentSetupRequiredCard from "@/components/nfts/FulfillmentSetupRequiredCard";
import { Button } from "@/components/ui/button";
import upsertHiddenNftPaymentLink from "@/lib/upsertHiddenNftPaymentLink";
import { toast } from "sonner";

const initialForm = { payment_link_id: "", asset_label: "", policy_id: "", asset_name_hex: "", quantity: 1, price_ada: 0 };

export default function NFTDistribution() {
  const [user, setUser] = React.useState(null);
  const [walletSession, setWalletSession] = React.useState(null);
  const [selectedAssetUnit, setSelectedAssetUnit] = React.useState("");
  const [signingId, setSigningId] = React.useState(null);
  const [formData, setFormData] = React.useState(initialForm);
  const [editingRule, setEditingRule] = React.useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => { base44.auth.me().then(setUser); }, []);

  const { data: wallet } = useQuery({
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

  const { data: merchantProfile, isLoading: isLoadingMerchantProfile } = useQuery({
    queryKey: ["merchant-profile-nft-distribution", user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.MerchantProfile.filter({ user_id: user.email }, "-created_date", 1);
      return profiles[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: paymentLinks = [] } = useQuery({
    queryKey: ["payment-links-for-nft", user?.email],
    queryFn: () => base44.entities.PaymentLink.filter({ merchant_id: user.email }, "-created_date", 100),
    enabled: !!user?.email,
  });

  const { data: rules = [] } = useQuery({
    queryKey: ["nft-fulfillment-rules", user?.email],
    queryFn: () => base44.entities.NftFulfillmentRule.filter({ merchant_id: user.email }, "-created_date", 100),
    enabled: !!user?.email,
  });

  const { data: transferLogs = [] } = useQuery({
    queryKey: ["nft-transfer-logs", user?.email],
    queryFn: () => base44.entities.NftTransferLog.filter({ merchant_id: user.email }, "-created_date", 100),
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

  const fulfillmentMode = merchantProfile?.nft_fulfillment_mode || null;
  const isFulfillmentConfigured = Boolean(merchantProfile?.nft_fulfillment_mode);
  const paymentLinksById = Object.fromEntries(paymentLinks.map((link) => [link.id, link]));

  const walletMutation = useMutation({
    mutationFn: (payload) => {
      if (wallet?.id) {
        return base44.entities.MerchantSignerWallet.update(wallet.id, payload);
      }
      return base44.entities.MerchantSignerWallet.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchant-signer-wallet"] });
      toast.success("Signer wallet saved");
    },
  });

  const hotWalletMutation = useMutation({
    mutationFn: (payload) => base44.functions.invoke("saveMerchantHotWallet", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchant-hot-wallet"] });
      toast.success("Hot wallet saved");
    },
    onError: (error) => toast.error(error?.response?.data?.error || error.message),
  });

  const saveRuleMutation = useMutation({
    mutationFn: async (payload) => {
      const existingPaymentLink = paymentLinksById[editingRule?.payment_link_id];
      const paymentLink = await upsertHiddenNftPaymentLink({
        existingLink: existingPaymentLink,
        merchantId: user.email,
        title: `${payload.asset_label || "NFT asset"} • NFT delivery`,
        amountAda: payload.price_ada,
        receiveAddress: merchantProfile?.default_receive_address,
        slugBase: `nft-distribution-${payload.asset_label || payload.policy_id}`,
      });

      const rulePayload = {
        merchant_id: payload.merchant_id,
        payment_link_id: paymentLink.id,
        asset_label: payload.asset_label,
        policy_id: payload.policy_id,
        asset_name_hex: payload.asset_name_hex,
        quantity: payload.quantity,
        status: payload.status,
      };

      return editingRule
        ? base44.entities.NftFulfillmentRule.update(editingRule.id, rulePayload)
        : base44.entities.NftFulfillmentRule.create(rulePayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nft-fulfillment-rules"] });
      queryClient.invalidateQueries({ queryKey: ["payment-links-for-nft"] });
      setFormData(initialForm);
      setEditingRule(null);
      toast.success("Fulfillment rule saved");
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteRuleMutation = useMutation({
    mutationFn: async (rule) => {
      const paymentLink = paymentLinksById[rule.payment_link_id];
      if (paymentLink?.is_hidden) {
        await base44.entities.PaymentLink.delete(paymentLink.id);
      }
      return base44.entities.NftFulfillmentRule.delete(rule.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nft-fulfillment-rules"] });
      queryClient.invalidateQueries({ queryKey: ["payment-links-for-nft"] });
      toast.success("Fulfillment rule deleted");
    },
  });

  const handleWalletSave = () => {
    if (!user?.email || !walletSession?.address) return;
    walletMutation.mutate({
      merchant_id: user.email,
      wallet_address: walletSession.address,
      wallet_provider: walletSession.walletKey || null,
      status: "active",
      last_verified_at: new Date().toISOString(),
    });
  };

  const handleHotWalletSave = (payload) => hotWalletMutation.mutate(payload);

  const handleRuleSubmit = (e) => {
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
    saveRuleMutation.mutate({ ...formData, merchant_id: user.email, status: editingRule?.status || "active" });
  };

  const handleSelectAsset = (unit) => {
    const asset = walletAssets.find((item) => item.unit === unit);
    if (!asset) return;
    setSelectedAssetUnit(unit);
    setFormData((prev) => ({
      ...prev,
      asset_label: asset.asset_label,
      policy_id: asset.policy_id,
      asset_name_hex: asset.asset_name_hex,
      quantity: prev.quantity || 1,
    }));
  };

  const toggleStatus = (rule) => base44.entities.NftFulfillmentRule.update(rule.id, { status: rule.status === "active" ? "disabled" : "active" }).then(() => queryClient.invalidateQueries({ queryKey: ["nft-fulfillment-rules"] }));

  const handleSignTransfer = async (log) => {
    if (!walletSession?.api || !walletSession?.address) {
      toast.error("Connect your signer wallet first");
      return;
    }

    setSigningId(log.id);
    try {
      const buildResponse = await base44.functions.invoke("buildNftTransferTx", {
        transfer_log_id: log.id,
        wallet_address: walletSession.address,
      });
      const witnessSetCbor = await walletSession.api.signTx(buildResponse.data.txCbor, true);
      const submitResponse = await base44.functions.invoke("submitNftSignedTx", {
        transfer_log_id: log.id,
        tx_cbor: buildResponse.data.txCbor,
        witness_set_cbor: witnessSetCbor,
      });
      await queryClient.refetchQueries({ queryKey: ["nft-transfer-logs", user?.email] });
      toast.success(`NFT transfer sent: ${submitResponse.data.txHash}`);
    } catch (error) {
      await queryClient.refetchQueries({ queryKey: ["nft-transfer-logs", user?.email] });
      toast.error(error?.response?.data?.error || error.message || "NFT signing failed");
    } finally {
      setSigningId(null);
    }
  };

  if (!isLoadingMerchantProfile && !isFulfillmentConfigured) {
    return (
      <div className="space-y-6">
        <PageHeader title="NFT Distribution" subtitle="Stel eerst je fulfillment methode in voor je NFT-distributie configureert." />
        <FulfillmentSetupRequiredCard />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="NFT Distribution" subtitle="Operationele pagina voor wallet setup, fulfillment rules en de transfer queue." />
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Dashboard & instellingen verhuisd</h2>
            <p className="mt-1 text-sm text-slate-500">Je centrale NFT-overzicht, marketplace instellingen en fulfillment methode staan nu samen op NFT Control.</p>
          </div>
          <Button asChild variant="outline"><Link to="/NFTOperations">Open NFT Control</Link></Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_1.35fr]">
        <div className="space-y-6">
          {fulfillmentMode === "automatic" ? (
            <>
              <HotWalletSetupCard wallet={hotWallet} onSave={handleHotWalletSave} isSaving={hotWalletMutation.isPending} />
              <SignerWalletSetupCard wallet={wallet} connectedAddress={walletSession?.address || null} onConnect={setWalletSession} onDisconnect={() => { setWalletSession(null); setSelectedAssetUnit(""); }} onSave={handleWalletSave} isSaving={walletMutation.isPending} />
            </>
          ) : (
            <SignerWalletSetupCard wallet={wallet} connectedAddress={walletSession?.address || null} onConnect={setWalletSession} onDisconnect={() => { setWalletSession(null); setSelectedAssetUnit(""); }} onSave={handleWalletSave} isSaving={walletMutation.isPending} />
          )}
        </div>
        <FulfillmentRuleForm formData={formData} setFormData={setFormData} walletAssets={walletAssets} selectedAssetUnit={selectedAssetUnit} onSelectAsset={handleSelectAsset} onSubmit={handleRuleSubmit} editingRule={editingRule} isSubmitting={saveRuleMutation.isPending} onCancel={() => { setEditingRule(null); setFormData(initialForm); setSelectedAssetUnit(""); }} />
      </div>

      <FulfillmentRulesTable rules={rules} paymentLinksById={paymentLinksById} onEdit={(rule) => { setEditingRule(rule); setFormData({ ...initialForm, ...rule, price_ada: paymentLinksById[rule.payment_link_id]?.amount_ada || 0 }); setSelectedAssetUnit(`${rule.policy_id}${rule.asset_name_hex || ""}`); }} onDelete={(rule) => deleteRuleMutation.mutate(rule)} onToggle={toggleStatus} />
      <TransferQueueTable logs={transferLogs} signingId={signingId} onSign={handleSignTransfer} fulfillmentMode={fulfillmentMode} />
    </div>
  );
}