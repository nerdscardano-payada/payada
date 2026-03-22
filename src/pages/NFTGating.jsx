import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/shared/PageHeader";
import GatingRuleForm from "@/components/nfts/GatingRuleForm";
import GatingRulesTable from "@/components/nfts/GatingRulesTable";
import { toast } from "sonner";

const initialForm = {
  name: "",
  slug: "",
  policy_id: "",
  asset_name_hex: "",
  minimum_quantity: 1,
  access_url: "",
  success_message: "Access granted",
};

const createSlug = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function NFTGating() {
  const [user, setUser] = React.useState(null);
  const [formData, setFormData] = React.useState(initialForm);
  const [editingRule, setEditingRule] = React.useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => { base44.auth.me().then(setUser); }, []);

  const { data: rules = [] } = useQuery({
    queryKey: ["nft-gates", user?.email],
    queryFn: () => base44.entities.NftGateRule.filter({ merchant_id: user.email }, "-created_date", 100),
    enabled: !!user?.email,
  });

  const saveMutation = useMutation({
    mutationFn: (payload) => editingRule ? base44.entities.NftGateRule.update(editingRule.id, payload) : base44.entities.NftGateRule.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nft-gates"] });
      setFormData(initialForm);
      setEditingRule(null);
      toast.success("NFT gate opgeslagen");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.NftGateRule.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nft-gates"] });
      toast.success("NFT gate verwijderd");
    },
  });

  const toggleStatus = (rule) => base44.entities.NftGateRule.update(rule.id, { status: rule.status === "active" ? "disabled" : "active" }).then(() => {
    queryClient.invalidateQueries({ queryKey: ["nft-gates"] });
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user?.email) return;
    saveMutation.mutate({
      ...formData,
      merchant_id: user.email,
      slug: createSlug(formData.slug || formData.name),
      status: editingRule?.status || "active",
    });
  };

  const copyGateLink = (slug) => {
    navigator.clipboard.writeText(`${window.location.origin}/NFTGate?slug=${slug}`);
    toast.success("Gate link gekopieerd");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="NFT Gating" subtitle="Geef holders toegang tot communities, content en premium flows op basis van walletbezit." />
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">Maak een gate, deel de link en laat bezoekers hun wallet verifiëren om toegang vrij te geven.</div>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_1.3fr]">
        <GatingRuleForm formData={formData} setFormData={setFormData} onSubmit={handleSubmit} isSubmitting={saveMutation.isPending} editingRule={editingRule} onCancel={() => { setEditingRule(null); setFormData(initialForm); }} />
        <GatingRulesTable rules={rules} onEdit={(rule) => { setEditingRule(rule); setFormData(rule); }} onDelete={(id) => deleteMutation.mutate(id)} onToggle={toggleStatus} onCopy={copyGateLink} />
      </div>
    </div>
  );
}