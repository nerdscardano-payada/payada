import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Trash2, Zap, BookTemplate } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function TemplateSelector({ merchantId, onSelect }) {
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["paymentLinkTemplates", merchantId],
    queryFn: () =>
      base44.entities.PaymentLinkTemplate.filter({ merchant_id: merchantId }, "-created_date", 50),
    enabled: !!merchantId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PaymentLinkTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentLinkTemplates"] });
      toast.success("Template deleted");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
        <BookTemplate className="w-8 h-8 mb-2 opacity-40" />
        <p className="text-sm font-medium">No templates yet</p>
        <p className="text-xs mt-1">Create a payment link and save it as a template to reuse it later.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {templates.map((tpl) => (
        <div
          key={tpl.id}
          className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-2 hover:border-indigo-300 hover:shadow-sm transition-all"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{tpl.name}</p>
              <p className="text-xs text-slate-500 truncate">{tpl.title}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(tpl.id); }}
              className="flex-shrink-0 text-slate-300 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs font-semibold text-indigo-600">
            {tpl.amount_mode === "fixed_ada"
              ? `₳ ${tpl.amount_ada?.toFixed(2) || "—"}`
              : `${tpl.fiat_currency} ${tpl.amount_fiat?.toFixed(2) || "—"}`}
          </p>

          {tpl.description && (
            <p className="text-xs text-slate-400 line-clamp-2">{tpl.description}</p>
          )}

          <Button
            size="sm"
            className="mt-auto bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 w-full"
            onClick={() => onSelect(tpl)}
          >
            <Zap className="w-3.5 h-3.5" />
            Use Template
          </Button>
        </div>
      ))}
    </div>
  );
}