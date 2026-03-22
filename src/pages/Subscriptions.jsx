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

  const cancelMutation = useMutation({
    mutationFn: (id) => base44.entities.Subscription.update(id, { status: "cancelled", cancelled_at: new Date().toISOString() }),
    onSuccess: () => refreshData("Abonnement geannuleerd"),
  });

  const markPaidMutation = useMutation({
    mutationFn: (subscriptionId) => base44.functions.invoke("markSubscriptionPaid", { subscriptionId }),
    onSuccess: () => refreshData("Betaling bevestigd"),
  });

  const updatePlanMutation = useMutation({
    mutationFn: ({ planId, graceDays }) => base44.entities.SubscriptionPlan.update(planId, { grace_days: graceDays }),
    onSuccess: () => refreshData("Grace period bijgewerkt"),
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: ({ subscriptionId, graceDays }) => base44.entities.Subscription.update(subscriptionId, { grace_days_override: graceDays }),
    onSuccess: () => refreshData("Subscriber grace period bijgewerkt"),
  });

  const plansById = Object.fromEntries(plans.map((plan) => [plan.id, plan]));

  return (
    <div className="space-y-6">
      <PageHeader title="Subscriptions" subtitle="Volg manuele ADA renewals, reminders en toegang per abonnee." />

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Cardano abonnementen blijven manueel goedgekeurd door de klant. PayADA stuurt reminders automatisch, toont wie te laat is en zet toegang op late zodra de grace period voorbij is.
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
        onSaveGrace={async (planId, graceDays) => {
          setSavingPlanId(planId);
          await updatePlanMutation.mutateAsync({ planId, graceDays });
          setSavingPlanId(null);
        }}
      />

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-lg font-semibold text-slate-900">Subscribers</h2>
          <p className="mt-1 text-sm text-slate-500">Bevestig handmatige betalingen, volg due dates en stel grace per abonnee bij.</p>
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
            onMarkPaid={async (subscriptionId) => {
              setSavingId(`${subscriptionId}-paid`);
              await markPaidMutation.mutateAsync(subscriptionId);
              setSavingId(null);
            }}
            onSaveGraceOverride={async (subscriptionId, graceDays) => {
              setSavingId(`${subscriptionId}-grace`);
              await updateSubscriptionMutation.mutateAsync({ subscriptionId, graceDays });
              setSavingId(null);
            }}
          />
        )}
      </div>
    </div>
  );
}