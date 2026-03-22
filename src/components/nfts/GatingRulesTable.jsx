import React from "react";
import { Button } from "@/components/ui/button";
import { Copy, Pencil, Power, Trash2 } from "lucide-react";

export default function GatingRulesTable({ rules, onEdit, onDelete, onToggle, onCopy }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5">
        <h2 className="text-lg font-semibold text-slate-900">Active gates</h2>
      </div>
      <div className="divide-y divide-slate-100">
        {rules.length === 0 ? (
          <div className="p-5 text-sm text-slate-500">No NFT gates configured yet.</div>
        ) : rules.map((rule) => (
          <div key={rule.id} className="p-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-slate-900">{rule.name}</p>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${rule.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{rule.status}</span>
              </div>
              <p className="mt-1 text-sm text-slate-500">/{rule.slug} · min {rule.minimum_quantity || 1}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => onCopy(rule.slug)}><Copy className="mr-2 h-4 w-4" />Link</Button>
              <Button variant="outline" size="sm" onClick={() => onEdit(rule)}><Pencil className="mr-2 h-4 w-4" />Edit</Button>
              <Button variant="outline" size="sm" onClick={() => onToggle(rule)}><Power className="mr-2 h-4 w-4" />{rule.status === "active" ? "Pause" : "Activate"}</Button>
              <Button variant="outline" size="sm" onClick={() => onDelete(rule.id)}><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}