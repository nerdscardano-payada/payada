import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig = {
  active: { label: "Active", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  confirmed: { label: "Confirmed", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  paid: { label: "Paid", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  pending: { label: "Pending", color: "bg-amber-50 text-amber-700 border-amber-200" },
  detected: { label: "Detected", color: "bg-blue-50 text-blue-700 border-blue-200" },
  trial: { label: "Trial", color: "bg-violet-50 text-violet-700 border-violet-200" },
  due: { label: "Due", color: "bg-orange-50 text-orange-700 border-orange-200" },
  late: { label: "Late", color: "bg-red-50 text-red-700 border-red-200" },
  expired: { label: "Expired", color: "bg-slate-100 text-slate-600 border-slate-200" },
  failed: { label: "Failed", color: "bg-red-50 text-red-700 border-red-200" },
  cancelled: { label: "Cancelled", color: "bg-slate-100 text-slate-600 border-slate-200" },
  disabled: { label: "Disabled", color: "bg-slate-100 text-slate-600 border-slate-200" },
  draft: { label: "Draft", color: "bg-slate-100 text-slate-600 border-slate-200" },
  void: { label: "Void", color: "bg-slate-100 text-slate-600 border-slate-200" },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || { label: status, color: "bg-slate-100 text-slate-600 border-slate-200" };
  
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border uppercase tracking-wider",
      config.color
    )}>
      {config.label}
    </span>
  );
}