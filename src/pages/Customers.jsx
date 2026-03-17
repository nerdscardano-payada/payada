import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useProfileCheck } from "@/components/hooks/useProfileCheck";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { Users, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function Customers() {
  const { isProfileComplete, profile } = useProfileCheck();
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  // Show profile warning banner if not complete
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
            onClick={() => window.location.href = '/MerchantProfile'}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
            Go to Profile
          </button>
        </div>
      </div>
    );
  }

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customers", user?.email],
    queryFn: () => base44.entities.Customer.filter({ merchant_id: user.email }, "-created_date", 200),
    enabled: !!user,
  });

  return (
    <div>
      <PageHeader title="Customers" subtitle="All customers who have interacted with your payment links" />

      <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
        {isLoading ? (
          <div className="p-5 space-y-3">
            {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : customers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No customers yet"
            description="Customers are automatically tracked when they make payments."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Customer</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Total Paid</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Payments</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Subscription</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{c.email}</p>
                        {c.name && <p className="text-xs text-slate-400">{c.name}</p>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold text-slate-900 tabular-nums">₳ {(c.total_merchant_ada || c.total_paid_ada || 0).toFixed(2)}</span>
                        <span className="text-xs text-slate-400">net</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-slate-600">{c.payment_count || 0}</span>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      {c.has_active_subscription ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span>
                      ) : (
                        <span className="text-xs text-slate-400">None</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-slate-500">{format(new Date(c.created_date), "MMM d, yyyy")}</span>
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