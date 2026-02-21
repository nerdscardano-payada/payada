import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function PageHeader({ title, subtitle, action, actionLabel, actionIcon: ActionIcon, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {children}
        {action && (
          <Button onClick={action} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 h-10">
            {ActionIcon && <ActionIcon className="w-4 h-4" />}
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}