import React from "react";

function formatAda(value) {
  return `₳ ${Number(value || 0).toFixed(2)}`;
}

export default function FeeBreakdownCard({ paymentLink, sessionData }) {
  if (!sessionData || paymentLink?.amount_mode === "fixed_cnt") return null;

  const feeMode = paymentLink?.fee_model || "customer_pays";
  const splitRatio = Number(paymentLink?.fee_split_ratio ?? 0.5);
  const baseAmount = Number(paymentLink?.amount_ada || 0);
  const total = Number(sessionData?.amount_total_ada || 0);
  const fee = Number(sessionData?.platform_fee_ada || 0);
  const merchantReceives = Number(sessionData?.merchant_amount_ada || 0);
  const customerFee = feeMode === "split" ? fee * splitRatio : feeMode === "customer_pays" ? fee : 0;

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Fee transparency</p>

      <div className="mt-4 space-y-3 text-sm text-slate-700">
        {feeMode === "merchant_pays" && (
          <>
            <div className="flex items-center justify-between"><span>Customer pays</span><span className="font-semibold">{formatAda(baseAmount)}</span></div>
            <div className="flex items-center justify-between"><span>You receive</span><span className="font-semibold">{formatAda(merchantReceives)}</span></div>
            <div className="flex items-center justify-between"><span>Fee</span><span className="font-semibold">{formatAda(fee)} (included)</span></div>
          </>
        )}

        {feeMode === "customer_pays" && (
          <>
            <div className="flex items-center justify-between"><span>Base amount</span><span className="font-semibold">{formatAda(baseAmount)}</span></div>
            <div className="flex items-center justify-between"><span>Service fee</span><span className="font-semibold">{formatAda(fee)}</span></div>
            <div className="flex items-center justify-between border-t border-slate-200 pt-3"><span>Total</span><span className="font-semibold">{formatAda(total)}</span></div>
          </>
        )}

        {feeMode === "split" && (
          <>
            <div className="flex items-center justify-between"><span>Base amount</span><span className="font-semibold">{formatAda(baseAmount)}</span></div>
            <div className="flex items-center justify-between"><span>You pay</span><span className="font-semibold">{formatAda(total)}</span></div>
            <div className="flex items-center justify-between"><span>Receiver gets</span><span className="font-semibold">{formatAda(merchantReceives)}</span></div>
            <div className="flex items-center justify-between"><span>Fee split</span><span className="font-semibold">{Math.round(splitRatio * 100)} / {Math.round((1 - splitRatio) * 100)}</span></div>
            <div className="flex items-center justify-between"><span>Customer fee share</span><span className="font-semibold">{formatAda(customerFee)}</span></div>
          </>
        )}
      </div>
    </div>
  );
}