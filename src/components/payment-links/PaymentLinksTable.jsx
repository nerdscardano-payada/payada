import React from "react";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import { Link2, Copy, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

export default function PaymentLinksTable({
  title,
  description,
  links,
  isLoading,
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  onCopy,
  onEdit,
  onDelete,
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
      {(title || description) && (
        <div className="border-b border-slate-100 px-5 py-4">
          {title && <h2 className="text-sm font-semibold text-slate-900">{title}</h2>}
          {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
        </div>
      )}

      {isLoading ? (
        <div className="p-5 space-y-3">
          {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      ) : links.length === 0 ? (
        emptyTitle ? (
          <EmptyState
            icon={Link2}
            title={emptyTitle}
            description={emptyDescription}
            actionLabel={emptyActionLabel}
            onAction={onEmptyAction}
          />
        ) : (
          <div className="p-5 text-sm text-slate-500">No payment links in this section.</div>
        )
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Title</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Amount</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Created</th>
                <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {links.map((link) => (
                <tr key={link.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{link.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">/{link.slug}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-semibold text-slate-900 tabular-nums">
                      {link.amount_mode === "fixed_ada"
                        ? `₳ ${link.amount_ada?.toFixed(2) || "—"}`
                        : link.amount_mode === "fixed_cnt"
                        ? `${link.cnt_amount?.toLocaleString() || "—"} ${link.cnt_ticker || "CNT"}`
                        : `${link.fiat_currency} ${link.amount_fiat?.toFixed(2) || "—"}`
                      }
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={link.status} />
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className="text-xs text-slate-500">
                      {format(new Date(link.created_date), "MMM d, yyyy")}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onCopy(link.slug)}
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(link)}>
                            <Pencil className="w-3.5 h-3.5 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onCopy(link.slug)}>
                            <Copy className="w-3.5 h-3.5 mr-2" />
                            Copy URL
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => onDelete(link.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}