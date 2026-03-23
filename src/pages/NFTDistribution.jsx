import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import PageHeader from "@/components/shared/PageHeader";
import FulfillmentRuleForm from "@/components/nfts/FulfillmentRuleForm";
import FulfillmentRulesTable from "@/components/nfts/FulfillmentRulesTable";
import TransferQueueTable from "@/components/nfts/TransferQueueTable";
import FulfillmentSetupRequiredCard from "@/components/nfts/FulfillmentSetupRequiredCard";
import ManualSigningCard from "@/components/nfts/ManualSigningCard";
import { Button } from "@/components/ui/button";
import upsertHiddenNftPaymentLink from "@/lib/upsertHiddenNftPaymentLink";
import { toast } from "sonner";

const initialForm = { payment_link_id: "", asset_label: "", policy_id: "", asset_name_hex: "", quantity: 1, price_ada: 0 };

export default function NFTDistribution() {
  const [user, setUser] = React.useState(undefined);
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

  const rulesById = Object.fromEntries(rules.map((rule) => [rule.id, rule]));
  const fulfillmentMode = merchantProfile?.nft_fulfillment_mode || null;
  const isFulfillmentConfigured = Boolean(merchantProfile?.nft_fulfillment_mode);
  const configuredAssetWalletAddress = fulfillmentMode === "automatic" ? hotWallet?.wallet_address : wallet?.wallet_address;
  const isAssetWalletReady = Boolean(configuredAssetWalletAddress);

  const { data: walletAssets = [] } = useQuery({
    queryKey: ["wallet-nfts", configuredAssetWalletAddress],
    queryFn: async () => {
      const response = await base44.functions.invoke("getWalletNfts", { wallet_address: configuredAssetWalletAddress });
      return response.data.assets || [];
    },
    enabled: !!configuredAssetWalletAddress,
  });

  const paymentLinksById = Object.fromEntries(paymentLinks.map((link) => [link.id, link]));

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

  const handleRuleSubmit = (e) => {
    e.preventDefault();
    if (!user?.email) return;
    if (!merchantProfile?.default_receive_address) {
      toast.error("Please set a default receive address in your merchant profile first");
      return;
    }
    if (!Number(formData.price_ada) || Number(formData.price_ada) <= 0) {
      toast.error("Enter a valid ADA price");
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

  if (user === undefined || (user?.email && isLoadingMerchantProfile)) {
    return null;
  }

  if (!isLoadingMerchantProfile && !isFulfillmentConfigured) {
    return (
      <div className="space-y-6">
        <PageHeader title="NFT Distribution" subtitle="Set your fulfillment method first before configuring NFT distribution." />
        <FulfillmentSetupRequiredCard />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="NFT Distribution" subtitle="Pick NFTs from your saved wallet and manage distribution rules and the transfer queue." />
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Dashboard & settings moved</h2>
            <p className="mt-1 text-sm text-slate-500">Your central NFT overview is on the NFT Dashboard; fulfillment is managed via the separate wizard page.</p>
          </div>
          <Button asChild variant="outline"><Link to="/NFTOperations">Open NFT Dashboard</Link></Button>
        </div>
      </div>

      {!isAssetWalletReady && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          {fulfillmentMode === "automatic"
            ? "First set up your hot wallet on NFT Fulfillment Setup so this page can load your NFTs automatically."
            : "First set up your signer wallet on NFT Fulfillment Setup so this page can load your NFTs automatically."}
        </div>
      )}

      <FulfillmentRuleForm formData={formData} setFormData={setFormData} walletAssets={walletAssets} selectedAssetUnit={selectedAssetUnit} onSelectAsset={handleSelectAsset} onSubmit={handleRuleSubmit} editingRule={editingRule} isSubmitting={saveRuleMutation.isPending} onCancel={() => { setEditingRule(null); setFormData(initialForm); setSelectedAssetUnit(""); }} />

      {fulfillmentMode !== "automatic" && (
        <ManualSigningCard
          configuredAddress={wallet?.wallet_address || null}
          connectedAddress={walletSession?.address || null}
          onConnect={setWalletSession}
          onDisconnect={() => setWalletSession(null)}
        />
      )}

      <FulfillmentRulesTable rules={rules} paymentLinksById={paymentLinksById} onEdit={(rule) => { setEditingRule(rule); setFormData({ ...initialForm, ...rule, price_ada: paymentLinksById[rule.payment_link_id]?.amount_ada || 0 }); setSelectedAssetUnit(`${rule.policy_id}${rule.asset_name_hex || ""}`); }} onDelete={(rule) => deleteRuleMutation.mutate(rule)} onToggle={toggleStatus} />
      <TransferQueueTable logs={transferLogs} signingId={signingId} onSign={handleSignTransfer} fulfillmentMode={fulfillmentMode} />
    </div>
  );
}