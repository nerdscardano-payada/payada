import React from "react";
import { Badge } from "@/components/ui/badge";

export default function SimpleAccessSummaryCard({ accessLink }) {
  const isCnt = accessLink?.payment_type === "cnt";
  const amount = isCnt
    ? `${Number(accessLink?.cnt_amount || 0).toLocaleString()} ${accessLink?.cnt_ticker || "CNT"}`
    : `₳ ${Number(accessLink?.price_ada || 0).toFixed(2)}`;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{accessLink?.title}</h1>
          {accessLink?.description ? <p className="mt-2 text-sm text-slate-600">{accessLink.description}</p> : null}
        </div>
        <Badge className="bg-slate-900 text-white">Access</Badge>
      </div>
      <div className="mt-6 rounded-2xl bg-slate-950 px-5 py-4 text-white">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Unlock for</p>
        <p className="mt-2 text-3xl font-bold">{amount}</p>
      </div>
    </div>
  );
}