import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/shared/PageHeader";
import AdminSubmissionTable from "@/components/try/AdminSubmissionTable";
import { toast } from "sonner";

export default function TryAdmin() {
  const queryClient = useQueryClient();
  const { data: user } = useQuery({ queryKey: ["try-admin-user"], queryFn: () => base44.auth.me() });
  const { data: submissions = [] } = useQuery({
    queryKey: ["try-admin-submissions"],
    queryFn: () => base44.entities.LaunchSubmission.list("-created_date", 200),
    initialData: []
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.LaunchSubmission.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["try-admin-submissions"] })
  });

  if (!user || user.role !== "admin") {
    return <div className="p-8">Admin access required.</div>;
  }

  const pending = submissions.filter((item) => item.status === "pending");

  const handleExport = async () => {
    const content = pending.map((item) => item.wallet_address).join("\n");
    await navigator.clipboard.writeText(content);
    toast.success("Addresses copied for batch payout.");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Try Campaign Admin" subtitle="Review pending launch submissions and process payouts." />
      <AdminSubmissionTable
        items={pending}
        onExport={handleExport}
        onMarkPaid={(item) => updateMutation.mutate({ id: item.id, data: { status: "paid", paid_at: new Date().toISOString(), paid_amount_ada: 5 } })}
        onReject={(item) => updateMutation.mutate({ id: item.id, data: { status: "rejected", rejection_reason: "Rejected by admin" } })}
      />
    </div>
  );
}