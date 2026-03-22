import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/shared/PageHeader";
import HotWalletSetupCard from "@/components/nfts/HotWalletSetupCard";
import FulfillmentRuleForm from "@/components/nfts/FulfillmentRuleForm";
import FulfillmentRulesTable from "@/components/nfts/FulfillmentRulesTable";
import { toast } from "sonner";

const initialForm = { payment_link_id: "", asset_label: "", policy_id: "", asset_name_hex: "", quantity: 1 };

export default function NFTDistribution() {
  const [user, setUser] = React.useState(null);
  const [formData, setFormData] = React.useState(initialForm);
  const [editingRule, setEditingRule] = React.useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => { base44.auth.me().then(setUser); }, []);

  const { data: wallet } = useQuery({
    queryKey: ["merchant-hot-wallet", user?.email],
    queryFn: async () => {
      const wallets = await base44.entities.MerchantHotWallet.filter({ merchant_id: user.email }, "-updated_date", 1);
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

  const paymentLinksById = Object.fromEntries(paymentLinks.map((link) => [link.id, link]));

  const walletMutation = useMutation({
    mutationFn: (payload) => base44.functions.invoke("saveMerchantHotWallet", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchant-hot-wallet"] });
      toast.success("NFT wallet opgeslagen");
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

  const handleWalletSave = (payload) => {
    if (!payload.mnemonic && wallet) {
      walletMutation.mutate({ wallet_address: payload.wallet_address, wallet_name: payload.wallet_name, mnemonic: "keep-existing" });
      return;
    }
    walletMutation.mutate(payload);
  };

  const handleRuleSubmit = (e) => {
    e.preventDefault();
    if (!user?.email) return;
    saveRuleMutation.mutate({ ...formData, merchant_id: user.email, status: editingRule?.status || "active" });
  };

  const toggleStatus = (rule) => base44.entities.NftFulfillmentRule.update(rule.id, { status: rule.status === "active" ? "disabled" : "active" }).then(() => queryClient.invalidateQueries({ queryKey: ["nft-fulfillment-rules"] }));

  return (
    <div className="space-y-6">
      <PageHeader title="NFT Distribution" subtitle="Laat bevestigde betalingen automatisch de juiste NFT uitsturen vanuit de wallet van de merchant." />
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-sm text-blue-900">De automation voor bevestigde betalingen staat klaar; hier koppel je de merchant wallet en de fulfillment regels.</div>
      <div className="grid gap-6 xl:grid-cols-[1.05fr_1.35fr]">
        <HotWalletSetupCard wallet={wallet} onSave={handleWalletSave} isSaving={walletMutation.isPending} />
        <FulfillmentRuleForm formData={formData} setFormData={setFormData} paymentLinks={paymentLinks} onSubmit={handleRuleSubmit} editingRule={editingRule} isSubmitting={saveRuleMutation.isPending} onCancel={() => { setEditingRule(null); setFormData(initialForm); }} />
      </div>
      <FulfillmentRulesTable rules={rules} paymentLinksById={paymentLinksById} onEdit={(rule) => { setEditingRule(rule); setFormData(rule); }} onDelete={(id) => deleteRuleMutation.mutate(id)} onToggle={toggleStatus} />
    </div>
  );
}