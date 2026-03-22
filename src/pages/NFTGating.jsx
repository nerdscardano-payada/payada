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
      toast.success("NFT gate saved");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.NftGateRule.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nft-gates"] });
      toast.success("NFT gate deleted");
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

  const activeRules = rules.filter((rule) => rule.status === "active").length;

  const copyGateLink = (slug) => {
    navigator.clipboard.writeText(`${window.location.origin}/NFTGate?slug=${slug}`);
    toast.success("Gate link copied");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="NFT Gating" subtitle="Wallet-based access control for communities, content, and premium experiences." />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Active gates</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-950">{activeRules}</p>
          <p className="mt-1 text-sm text-emerald-900">Live rules visitors can use immediately.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Verification flow</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">Wallet connect → verify → unlock</p>
          <p className="mt-1 text-sm text-slate-600">A clean holder journey without manual checks.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Shareable links</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">Ready to use</p>
          <p className="mt-1 text-sm text-slate-600">Every gate gets its own public link for campaigns and communities.</p>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_1.3fr]">
        <GatingRuleForm formData={formData} setFormData={setFormData} onSubmit={handleSubmit} isSubmitting={saveMutation.isPending} editingRule={editingRule} onCancel={() => { setEditingRule(null); setFormData(initialForm); }} />
        <GatingRulesTable rules={rules} onEdit={(rule) => { setEditingRule(rule); setFormData(rule); }} onDelete={(id) => deleteMutation.mutate(id)} onToggle={toggleStatus} onCopy={copyGateLink} />
      </div>
    </div>
  );
}