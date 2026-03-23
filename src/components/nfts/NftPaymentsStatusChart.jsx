import React from "react";
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function NftPaymentsStatusChart({ data }) {
  const hasData = data.some((item) => item.value > 0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900">NFT sales payments</h3>
        <p className="mt-1 text-sm text-slate-500">Status van betalingen die uit NFT-verkoop zijn ontstaan.</p>
      </div>

      {hasData ? (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip formatter={(value) => [value, "Payments"]} />
              <Bar dataKey="value" fill="#0f172a" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-500">
          Nog geen NFT-betalingen gevonden.
        </div>
      )}
    </div>
  );
}