import React from "react";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Pencil, Power, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function FulfillmentRulesTable({ rules, paymentLinksById, onEdit, onDelete, onToggle }) {
  const copyLink = (url) => {
    navigator.clipboard.writeText(url);
    toast.success("Payment link copied");
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5"><h2 className="text-lg font-semibold text-slate-900">Fulfillment rules</h2></div>
      <div className="divide-y divide-slate-100">
        {rules.length === 0 ? <div className="p-5 text-sm text-slate-500">No fulfillment rules configured yet.</div> : rules.map((rule) => {
          const paymentLink = paymentLinksById[rule.payment_link_id];
          const paymentUrl = paymentLink?.slug ? `${window.location.origin}/Pay?slug=${paymentLink.slug}` : null;

          return (
          <div key={rule.id} className="p-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2"><p className="font-medium text-slate-900">{rule.asset_label || "NFT asset"}</p><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${rule.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{rule.status}</span></div>
              <p className="mt-1 text-sm text-slate-500">{paymentLink?.title || "Unknown link"} · qty {rule.quantity || 1}</p>
              {paymentUrl && <p className="mt-2 text-xs text-slate-400 break-all">{paymentUrl}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              {paymentUrl && (
                <>
                  <Button variant="outline" size="sm" asChild><a href={paymentUrl} target="_blank" rel="noreferrer"><ExternalLink className="mr-2 h-4 w-4" />Open link</a></Button>
                  <Button variant="outline" size="sm" onClick={() => copyLink(paymentUrl)}><Copy className="mr-2 h-4 w-4" />Copy link</Button>
                </>
              )}
              <Button variant="outline" size="sm" onClick={() => onEdit(rule)}><Pencil className="mr-2 h-4 w-4" />Edit</Button>
              <Button variant="outline" size="sm" onClick={() => onToggle(rule)}><Power className="mr-2 h-4 w-4" />{rule.status === "active" ? "Pause" : "Activate"}</Button>
              <Button variant="outline" size="sm" onClick={() => onDelete(rule.id)}><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
            </div>
          </div>
        )})}
      </div>
    </div>
  );
}