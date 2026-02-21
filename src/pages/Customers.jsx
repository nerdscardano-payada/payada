import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { Users } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function Customers() {
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: () => base44.entities.Customer.list("-created_date", 200),
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
                      <span className="text-sm font-semibold text-slate-900 tabular-nums">₳ {(c.total_paid_ada || 0).toFixed(2)}</span>
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