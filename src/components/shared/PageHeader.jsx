import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function PageHeader({ title, subtitle, action, actionLabel, actionIcon: ActionIcon, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 rounded-3xl border border-border bg-card px-6 py-5 shadow-sm">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {children}
        {action && (
          <Button onClick={action} className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-10 rounded-xl">
            {ActionIcon && <ActionIcon className="w-4 h-4" />}
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}