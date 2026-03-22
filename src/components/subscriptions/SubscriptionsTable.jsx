import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, ListOrdered, XCircle } from "lucide-react";

export default function SubscriptionsTable({ subscriptions, plansById, savingId, onCancel, onMarkPaid, onSaveGraceOverride }) {
  const [values, setValues] = useState({});

  useEffect(() => {
    setValues(Object.fromEntries(subscriptions.map((sub) => [sub.id, String(sub.grace_days_override ?? plansById[sub.subscription_plan_id]?.grace_days ?? 5)])));
  }, [subscriptions, plansById]);

  if (subscriptions.length === 0) {
    return <EmptyState icon={ListOrdered} title="No subscribers yet" description="Subscribers will appear here when customers sign up for your plans." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px]">
        <thead>
          <tr className="border-b border-slate-100">
            {[
              "Subscriber",
              "Plan",
              "Status",
              "Amount",
              "Next due",
              "Last paid",
              "Grace",
              "Actions",
            ].map((label) => (
              <th key={label} className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">{label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {subscriptions.map((sub) => (
            <tr key={sub.id} className="hover:bg-slate-50/60">
              <td className="px-5 py-4">
                <p className="text-sm font-medium text-slate-900">{sub.customer_email || "—"}</p>
                {sub.customer_name && <p className="text-xs text-slate-400">{sub.customer_name}</p>}
              </td>
              <td className="px-5 py-4 text-sm text-slate-700">{sub.plan_name || "—"}</td>
              <td className="px-5 py-4"><StatusBadge status={sub.status} /></td>
              <td className="px-5 py-4 text-sm font-semibold text-slate-900">₳ {sub.amount_ada?.toFixed(2) || "—"}</td>
              <td className="px-5 py-4 text-xs text-slate-500">{sub.next_due_date ? format(new Date(sub.next_due_date), "MMM d, yyyy") : "—"}</td>
              <td className="px-5 py-4 text-xs text-slate-500">{sub.last_payment_date ? format(new Date(sub.last_payment_date), "MMM d, yyyy") : "—"}</td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    value={values[sub.id] ?? ""}
                    onChange={(e) => setValues((current) => ({ ...current, [sub.id]: e.target.value }))}
                    className="w-20"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={savingId === `${sub.id}-grace`}
                    onClick={() => onSaveGraceOverride(sub.id, Number(values[sub.id] || plansById[sub.subscription_plan_id]?.grace_days || 0))}
                  >
                    Save
                  </Button>
                </div>
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center justify-end gap-2">
                  {sub.status !== "cancelled" && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={savingId === `${sub.id}-paid`}
                      onClick={() => onMarkPaid(sub.id)}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Mark paid
                    </Button>
                  )}
                  {sub.status !== "cancelled" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-red-500"
                      onClick={() => onCancel(sub.id)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}