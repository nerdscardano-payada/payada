import React from "react";
import { Wallet } from "lucide-react";

export default function FeeMetricsCard({ title, value, subtitle }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
          {subtitle ? <p className="mt-2 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        <div className="rounded-2xl bg-slate-100 p-3">
          <Wallet className="h-5 w-5 text-slate-700" />
        </div>
      </div>
    </div>
  );
}