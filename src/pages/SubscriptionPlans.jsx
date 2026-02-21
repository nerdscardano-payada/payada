import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import SubscriptionPlanForm from "@/components/subscriptions/SubscriptionPlanForm";
import { RefreshCw, Plus, Copy, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function SubscriptionPlans() {
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const queryClient = useQueryClient();

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["subscriptionPlans"],
    queryFn: () => base44.entities.SubscriptionPlan.list("-created_date", 100),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SubscriptionPlan.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptionPlans"] });
      toast.success("Plan deleted");
    },
  });

  const copySignupUrl = (slug) => {
    navigator.clipboard.writeText(`${window.location.origin}/subscribe/${slug}`);
    toast.success("Signup URL copied!");
  };

  if (showForm) {
    return <SubscriptionPlanForm plan={editingPlan} onBack={() => { setShowForm(false); setEditingPlan(null); }} />;
  }

  return (
    <div>
      <PageHeader
        title="Subscription Plans"
        subtitle="Manage recurring ADA subscription plans"
        action={() => { setEditingPlan(null); setShowForm(true); }}
        actionLabel="New Plan"
        actionIcon={Plus}
      />

      <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
        {isLoading ? (
          <div className="p-5 space-y-3">
            {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : plans.length === 0 ? (
          <EmptyState
            icon={RefreshCw}
            title="No subscription plans yet"
            description="Create recurring payment plans for your subscribers."
            actionLabel="Create Subscription Plan"
            onAction={() => setShowForm(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Plan</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Amount</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Interval</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                  <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {plans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{plan.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">/{plan.slug}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-semibold text-slate-900 tabular-nums">
                        {plan.amount_mode === "fixed_ada"
                          ? `₳ ${plan.amount_ada?.toFixed(2) || "—"}`
                          : `${plan.fiat_currency} ${plan.amount_fiat?.toFixed(2) || "—"}`
                        }
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-slate-600">{plan.interval_days} days</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={plan.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copySignupUrl(plan.slug)}>
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setEditingPlan(plan); setShowForm(true); }}>
                              <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => deleteMutation.mutate(plan.id)}>
                              <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}