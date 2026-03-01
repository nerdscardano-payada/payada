import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function MetricsCard({
  title,
  value,
  isLoading,
  icon: Icon,
  trend,
  description,
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-slate-600">
            {title}
          </CardTitle>
          {Icon && <Icon className="w-4 h-4 text-slate-400" />}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold text-slate-900">{value}</div>
            {trend && (
              <p className={`text-xs mt-1 ${
                trend > 0 ? "text-green-600" : "text-red-600"
              }`}>
                {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}% from last week
              </p>
            )}
            {description && (
              <p className="text-xs text-slate-500 mt-2">{description}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}