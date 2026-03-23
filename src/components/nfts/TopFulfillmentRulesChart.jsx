import React from "react";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";

export default function TopFulfillmentRulesChart({ data }) {
  const hasData = data.length > 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900">Top fulfillment rules</h3>
        <p className="mt-1 text-sm text-slate-500">Best performing rules ranked by processed NFT volume.</p>
      </div>

      {hasData ? (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="shortName" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip
                formatter={(value, name) => [value, name === "volume" ? "Volume" : "Transfers"]}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.name || "Rule"}
              />
              <Bar dataKey="volume" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-500">
          No rule performance data yet.
        </div>
      )}
    </div>
  );
}