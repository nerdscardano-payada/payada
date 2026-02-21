import React from "react";
import { cn } from "@/lib/utils";

export default function StatCard({ title, value, subtitle, icon: Icon, trend, trendUp, accentColor = "indigo" }) {
  const colors = {
    indigo: "from-indigo-500/10 to-indigo-500/5 text-indigo-600",
    cyan: "from-cyan-500/10 to-cyan-500/5 text-cyan-600",
    green: "from-emerald-500/10 to-emerald-500/5 text-emerald-600",
    orange: "from-orange-500/10 to-orange-500/5 text-orange-600",
    purple: "from-violet-500/10 to-violet-500/5 text-violet-600",
    red: "from-red-500/10 to-red-500/5 text-red-600",
  };

  const iconBg = {
    indigo: "bg-indigo-100 text-indigo-600",
    cyan: "bg-cyan-100 text-cyan-600",
    green: "bg-emerald-100 text-emerald-600",
    orange: "bg-orange-100 text-orange-600",
    purple: "bg-violet-100 text-violet-600",
    red: "bg-red-100 text-red-600",
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/60 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {trend && (
            <div className={cn(
              "inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full",
              trendUp ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
            )}>
              {trend}
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn("p-2.5 rounded-xl", iconBg[accentColor])}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}