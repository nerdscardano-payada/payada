import React from "react";
import { Badge } from "@/components/ui/badge";

export default function SimplePaySummaryCard({ paymentLink, sessionData }) {
  const isCnt = paymentLink?.amount_mode === "fixed_cnt";
  const total = isCnt
    ? `${Number(paymentLink?.cnt_amount || 0).toLocaleString()} ${paymentLink?.cnt_ticker || "CNT"}`
    : `₳ ${Number(sessionData?.amount_total_ada ?? paymentLink?.amount_ada ?? 0).toFixed(3)}`;

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-black/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{paymentLink?.title}</h1>
          {paymentLink?.description ? <p className="mt-2 text-sm text-slate-300">{paymentLink.description}</p> : null}
        </div>
        <Badge className="bg-slate-800 text-slate-100 border border-slate-700">{isCnt ? "Token payment" : "ADA payment"}</Badge>
      </div>
      <div className="mt-6 rounded-2xl bg-slate-950 px-5 py-4 text-white">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">You pay</p>
        <p className="mt-2 text-3xl font-bold">{total}</p>
      </div>
    </div>
  );
}