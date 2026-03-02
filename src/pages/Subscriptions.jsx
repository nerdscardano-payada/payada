import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import { ListOrdered, XCircle } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Subscriptions() {
  const [user, setUser] = React.useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ["subscriptions", user?.email],
    queryFn: () => base44.entities.Subscription.filter({ merchant_id: user.email }, "-created_date", 200),
    enabled: !!user,
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => base44.entities.Subscription.update(id, { status: "cancelled", cancelled_at: new Date().toISOString() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast.success("Abonnement geannuleerd");
    },
  });

  return (
    <div>
      <PageHeader title="Subscribers" subtitle="Manage active and past subscriptions" />

      <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
        {isLoading ? (
          <div className="p-5 space-y-3">
            {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : subscriptions.length === 0 ? (
          <EmptyState
            icon={ListOrdered}
            title="No subscribers yet"
            description="Subscribers will appear here when customers sign up for your plans."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Subscriber</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Plan</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Amount</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Next Due</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Started</th>
                  <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Acties</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{sub.customer_email || "—"}</p>
                        {sub.customer_name && <p className="text-xs text-slate-400">{sub.customer_name}</p>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-slate-700">{sub.plan_name || "—"}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={sub.status} />
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="text-sm font-semibold text-slate-900 tabular-nums">
                        ₳ {sub.amount_ada?.toFixed(2) || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="text-xs text-slate-500">
                        {sub.next_due_date ? format(new Date(sub.next_due_date), "MMM d, yyyy") : "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-slate-500">
                        {sub.started_at ? format(new Date(sub.started_at), "MMM d, yyyy") : format(new Date(sub.created_date), "MMM d, yyyy")}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {sub.status !== "cancelled" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-red-500"
                          onClick={() => cancelMutation.mutate(sub.id)}
                          title="Annuleer abonnement"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      )}
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