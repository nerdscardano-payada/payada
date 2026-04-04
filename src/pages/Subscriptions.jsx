import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useProfileCheck } from "@/components/hooks/useProfileCheck";
import PageHeader from "@/components/shared/PageHeader";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import SubscriptionSummaryCards from "@/components/subscriptions/SubscriptionSummaryCards";
import SubscriptionPlansPanel from "@/components/subscriptions/SubscriptionPlansPanel";
import SubscriptionsTable from "@/components/subscriptions/SubscriptionsTable";
import SubscriptionPlanForm from "@/components/subscriptions/SubscriptionPlanForm";
import SubscriptionPlanLinks from "@/components/subscriptions/SubscriptionPlanLinks";
import { createSubscriptionPlanSlug } from "@/lib/subscriptionPlans";

export default function Subscriptions() {
  const { isProfileComplete, profile } = useProfileCheck();
  const [user, setUser] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [savingPlanId, setSavingPlanId] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  if (!isProfileComplete && profile !== undefined) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-blue-50 border border-blue-300 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-blue-900">Complete Your Profile</h2>
          </div>
          <p className="text-sm text-blue-800 mb-4">
            To access PayADA tools, please complete your merchant profile first. You need to provide your business name and a receiving wallet address.
          </p>
          <button
            onClick={() => window.location.href = "/MerchantProfile"}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Go to Profile
          </button>
        </div>
      </div>
    );
  }

  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ["subscriptions", user?.email],
    queryFn: () => base44.entities.Subscription.filter({ merchant_id: user.email }, "-created_date", 200),
    enabled: !!user,
  });

  const { data: plans = [] } = useQuery({
    queryKey: ["subscription-plans", user?.email],
    queryFn: () => base44.entities.SubscriptionPlan.filter({ merchant_id: user.email }, "-created_date", 100),
    enabled: !!user,
  });

  const refreshData = async (message) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] }),
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] }),
    ]);
    if (message) toast.success(message);
  };

  const createPlanMutation = useMutation({
    mutationFn: (planData) => base44.entities.SubscriptionPlan.create(planData),
    onSuccess: () => refreshData("Subscription plan created"),
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => base44.entities.Subscription.update(id, { status: "cancelled", cancelled_at: new Date().toISOString() }),
    onSuccess: () => refreshData("Subscription cancelled"),
  });

  const markPaidMutation = useMutation({
    mutationFn: (subscriptionId) => base44.functions.invoke("markSubscriptionPaid", { subscriptionId }),
    onSuccess: () => refreshData("Payment confirmed"),
  });

  const updatePlanMutation = useMutation({
    mutationFn: ({ planId, graceDays }) => base44.entities.SubscriptionPlan.update(planId, { grace_days: graceDays }),
    onSuccess: () => refreshData("Grace period updated"),
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: ({ subscriptionId, graceDays }) => base44.entities.Subscription.update(subscriptionId, { grace_days_override: graceDays }),
    onSuccess: () => refreshData("Subscriber grace period updated"),
  });

  const deletePlanMutation = useMutation({
    mutationFn: (planId) => base44.entities.SubscriptionPlan.delete(planId),
    onSuccess: () => refreshData("Subscription plan deleted"),
  });

  const plansById = Object.fromEntries(plans.map((plan) => [plan.id, plan]));

  return (
    <div className="space-y-6">
      <PageHeader title="Subscriptions" subtitle="Create plans, generate checkout links, and manage manual renewals." />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1.4fr]">
        <SubscriptionPlanForm
          isSubmitting={createPlanMutation.isPending}
          onSubmit={(formData) => {
            if (!user?.email) {
              toast.error("Please wait until your account is loaded");
              return;
            }

            createPlanMutation.mutate({
              merchant_id: user.email,
              slug: createSubscriptionPlanSlug(formData.name),
              name: formData.name,
              description: formData.description,
              amount_mode: "fixed_ada",
              amount_ada: formData.amount_ada,
              fiat_currency: "EUR",
              interval_type: formData.interval_type,
              interval_days: formData.interval_days,
              trial_days: formData.trial_days,
              grace_days: 5,
              confirmations_required: 2,
              fee_model: formData.fee_model,
              status: "active",
              subscriber_count: 0,
            });
          }}
        />
        <SubscriptionPlanLinks
          plans={plans}
          deletingPlanId={deletePlanMutation.isPending ? deletePlanMutation.variables : null}
          onDeletePlan={(planId) => deletePlanMutation.mutate(planId)}
        />
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Cardano subscriptions stay manually approved by the customer. PayADA sends reminders automatically, shows who is overdue, and moves access to late when the grace period ends.
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-28 rounded-2xl" />)}
        </div>
      ) : (
        <SubscriptionSummaryCards subscriptions={subscriptions} />
      )}

      <SubscriptionPlansPanel
        plans={plans}
        savingPlanId={savingPlanId}
        onSaveGrace={(planId, graceDays) => {
          setSavingPlanId(planId);
          updatePlanMutation.mutateAsync({ planId, graceDays }).finally(() => setSavingPlanId(null));
        }}
      />

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-lg font-semibold text-slate-900">Subscribers</h2>
          <p className="mt-1 text-sm text-slate-500">Confirm manual payments, track due dates, and adjust grace periods per subscriber.</p>
        </div>
        {isLoading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-14 w-full" />)}
          </div>
        ) : (
          <SubscriptionsTable
            subscriptions={subscriptions}
            plansById={plansById}
            savingId={savingId}
            onCancel={(subscriptionId) => cancelMutation.mutate(subscriptionId)}
            onMarkPaid={(subscriptionId) => {
              setSavingId(`${subscriptionId}-paid`);
              markPaidMutation.mutateAsync(subscriptionId).finally(() => setSavingId(null));
            }}
            onSaveGraceOverride={(subscriptionId, graceDays) => {
              setSavingId(`${subscriptionId}-grace`);
              updateSubscriptionMutation.mutateAsync({ subscriptionId, graceDays }).finally(() => setSavingId(null));
            }}
          />
        )}
      </div>
    </div>
  );
}