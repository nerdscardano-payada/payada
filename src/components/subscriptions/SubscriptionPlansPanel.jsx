import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SubscriptionPlansPanel({ plans, savingPlanId, onSaveGrace }) {
  const [values, setValues] = useState({});

  useEffect(() => {
    setValues(Object.fromEntries(plans.map((plan) => [plan.id, String(plan.grace_days ?? 5)])));
  }, [plans]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5">
        <h2 className="text-lg font-semibold text-slate-900">Grace periods per plan</h2>
        <p className="mt-1 text-sm text-slate-500">Bepaal hoeveel dagen te laat nog toegelaten zijn voor handmatige ADA betalingen.</p>
      </div>
      <div className="divide-y divide-slate-100">
        {plans.map((plan) => (
          <div key={plan.id} className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-medium text-slate-900">{plan.name}</p>
              <p className="text-sm text-slate-500">{plan.interval_type === "custom" ? `Elke ${plan.interval_days} dagen` : `Plan: ${plan.interval_type}`}</p>
            </div>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min="0"
                value={values[plan.id] ?? ""}
                onChange={(e) => setValues((current) => ({ ...current, [plan.id]: e.target.value }))}
                className="w-24"
              />
              <Button
                variant="outline"
                disabled={savingPlanId === plan.id}
                onClick={() => onSaveGrace(plan.id, Number(values[plan.id] || plan.grace_days || 0))}
              >
                {savingPlanId === plan.id ? "Opslaan..." : "Bewaar"}
              </Button>
            </div>
          </div>
        ))}
        {plans.length === 0 && <div className="p-5 text-sm text-slate-500">Nog geen abonnementsplannen gevonden.</div>}
      </div>
    </div>
  );
}