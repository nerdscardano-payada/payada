import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

function formatAmount(item, type) {
  if (type === "payment") {
    if (item.amount_mode === "fixed_cnt") {
      return `${Number(item.cnt_amount || 0).toLocaleString()} ${item.cnt_ticker || "CNT"}`;
    }
    return `₳ ${Number(item.amount_ada || 0).toFixed(2)}`;
  }

  if (item.payment_type === "cnt") {
    return `${Number(item.cnt_amount || 0).toLocaleString()} ${item.cnt_ticker || "CNT"}`;
  }
  return `₳ ${Number(item.price_ada || 0).toFixed(2)}`;
}

export default function HomePublicLinkCard({ item, type }) {
  const href = type === "payment"
    ? `/Pay?slug=${encodeURIComponent(item.slug)}`
    : `/Access?slug=${encodeURIComponent(item.slug)}`;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">{item.title}</h3>
          {item.description && (
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
          )}
        </div>
        <div className="rounded-2xl bg-slate-950 px-4 py-3 text-right text-white">
          <div className="text-lg font-bold">{formatAmount(item, type)}</div>
          <div className="text-xs text-cyan-300">Fee included by flow</div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Vereenvoudigde checkout zonder formulierstart</span>
        </div>
        <Link to={href}>
          <Button className="gap-2">
            Open link <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}