import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/shared/PageHeader";
import SignerWalletSetupCard from "@/components/nfts/SignerWalletSetupCard";
import FulfillmentRuleForm from "@/components/nfts/FulfillmentRuleForm";
import FulfillmentRulesTable from "@/components/nfts/FulfillmentRulesTable";
import TransferQueueTable from "@/components/nfts/TransferQueueTable";
import { toast } from "sonner";

const initialForm = { payment_link_id: "", asset_label: "", policy_id: "", asset_name_hex: "", quantity: 1 };

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
      toast.success("Signer wallet opgeslagen");
    },
  });

  const saveRuleMutation = useMutation({
    mutationFn: (payload) => editingRule ? base44.entities.NftFulfillmentRule.update(editingRule.id, payload) : base44.entities.NftFulfillmentRule.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nft-fulfillment-rules"] });
      setFormData(initialForm);
      setEditingRule(null);
      toast.success("Fulfillment regel opgeslagen");
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: (id) => base44.entities.NftFulfillmentRule.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nft-fulfillment-rules"] });
      toast.success("Fulfillment regel verwijderd");
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

  const handleRuleSubmit = (e) => {
    e.preventDefault();
    if (!user?.email) return;
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
      toast.error("Verbind eerst je signer wallet");
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
      queryClient.invalidateQueries({ queryKey: ["nft-transfer-logs"] });
      toast.success(`NFT transfer verzonden: ${submitResponse.data.txHash}`);
    } catch (error) {
      toast.error(error?.response?.data?.error || error.message || "NFT signing mislukt");
    } finally {
      setSigningId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="NFT Distribution" subtitle="Custodyless flow: confirmed betalingen maken een transfer request aan, daarna tekent de merchant met zijn eigen wallet." />
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-sm text-blue-900">Geen mnemonic-opslag meer. De automation maakt pending NFT requests aan en de merchant ondertekent daarna de transfer met wallet signing.</div>
      <div className="grid gap-6 xl:grid-cols-[1.05fr_1.35fr]">
        <SignerWalletSetupCard wallet={wallet} connectedAddress={walletSession?.address || null} onConnect={setWalletSession} onDisconnect={() => { setWalletSession(null); setSelectedAssetUnit(""); }} onSave={handleWalletSave} isSaving={walletMutation.isPending} />
        <FulfillmentRuleForm formData={formData} setFormData={setFormData} paymentLinks={paymentLinks} walletAssets={walletAssets} selectedAssetUnit={selectedAssetUnit} onSelectAsset={handleSelectAsset} onSubmit={handleRuleSubmit} editingRule={editingRule} isSubmitting={saveRuleMutation.isPending} onCancel={() => { setEditingRule(null); setFormData(initialForm); setSelectedAssetUnit(""); }} />
      </div>
      <FulfillmentRulesTable rules={rules} paymentLinksById={paymentLinksById} onEdit={(rule) => { setEditingRule(rule); setFormData(rule); setSelectedAssetUnit(`${rule.policy_id}${rule.asset_name_hex || ""}`); }} onDelete={(id) => deleteRuleMutation.mutate(id)} onToggle={toggleStatus} />
      <TransferQueueTable logs={transferLogs} signingId={signingId} onSign={handleSignTransfer} />
    </div>
  );
}