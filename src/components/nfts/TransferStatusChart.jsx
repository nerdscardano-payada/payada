import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#10b981", "#f43f5e"];

export default function TransferStatusChart({ data }) {
  const hasData = data.some((item) => item.value > 0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900">Successful vs failed</h3>
        <p className="mt-1 text-sm text-slate-500">A quick split of completed outcomes for NFT transfers.</p>
      </div>

      {hasData ? (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={65} outerRadius={95} paddingAngle={3}>
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, "Transfers"]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-500">
          No transfer results yet.
        </div>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {data.map((item, index) => (
          <div key={item.name} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
              <span className="text-sm font-medium text-slate-700">{item.name}</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}