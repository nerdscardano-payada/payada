import React from "react";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Heart, Trash2, Code2, Pencil } from "lucide-react";
import { toast } from "sonner";

export default function DonationPageCard({ page, stats, onDelete, onEdit }) {
  const publicUrl = `${window.location.origin}/Donate?slug=${page.slug}`;
  const iframeSnippet = `<iframe src="${publicUrl}" title="${page.title}" width="100%" height="720" style="border:0;border-radius:16px;overflow:hidden;" loading="lazy"></iframe>`;
  const buttonSnippet = `<a href="${publicUrl}" target="_blank" rel="noopener noreferrer">${page.embed_button_label || "Support with ADA"}</a>`;
  const amounts = [...(page.payment_links || [])].sort((a, b) => a.amount_ada - b.amount_ada);

  const copyText = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  return (
    <div className="w-full xl:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center">
              <Heart className="w-4 h-4 text-rose-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{page.title}</h3>
              <p className="text-xs text-slate-500">/Donate?slug={page.slug}</p>
            </div>
          </div>
          {page.description && <p className="text-sm text-slate-600 max-w-xl">{page.description}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="icon" onClick={() => onEdit(page)}>
            <Pencil className="w-4 h-4 text-slate-600" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => onDelete(page)}>
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {amounts.map((link) => (
          <span key={link.payment_link_id} className="px-3 py-1 rounded-full bg-slate-100 text-sm font-medium text-slate-700">
            ₳ {Number(link.amount_ada || 0).toFixed(2)}
          </span>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500">Total raised</p>
          <p className="text-xl font-semibold text-slate-900 mt-1">₳ {stats.total.toFixed(2)}</p>
        </div>
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500">Donations</p>
          <p className="text-xl font-semibold text-slate-900 mt-1">{stats.count}</p>
        </div>
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500">Average</p>
          <p className="text-xl font-semibold text-slate-900 mt-1">₳ {stats.average.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Button variant="outline" className="justify-start gap-2" onClick={() => window.open(publicUrl, "_blank") }>
          <ExternalLink className="w-4 h-4" /> Open page
        </Button>
        <Button variant="outline" className="justify-start gap-2" onClick={() => copyText(publicUrl, "Link") }>
          <Copy className="w-4 h-4" /> Copy link
        </Button>
        <Button variant="outline" className="justify-start gap-2" onClick={() => copyText(buttonSnippet, "Button embed code") }>
          <Code2 className="w-4 h-4" /> Copy button code
        </Button>
        <Button variant="outline" className="justify-start gap-2" onClick={() => copyText(iframeSnippet, "Iframe embed code") }>
          <Code2 className="w-4 h-4" /> Copy iframe code
        </Button>
      </div>
    </div>
  );
}