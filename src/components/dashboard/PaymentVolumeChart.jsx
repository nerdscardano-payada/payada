import React, { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays, startOfDay } from "date-fns";

export default function PaymentVolumeChart({ payments }) {
  const data = useMemo(() => {
    const last30 = Array.from({ length: 30 }, (_, i) => {
      const date = startOfDay(subDays(new Date(), 29 - i));
      return { date, label: format(date, "MMM d"), volume: 0, count: 0 };
    });

    payments
      .filter(p => p.status === "confirmed")
      .forEach(p => {
        const day = startOfDay(new Date(p.created_date)).getTime();
        const entry = last30.find(d => d.date.getTime() === day);
        if (entry) {
          entry.volume += p.received_amount_ada || p.expected_amount_ada || 0;
          entry.count += 1;
        }
      });

    return last30.map(d => ({ label: d.label, volume: parseFloat(d.volume.toFixed(2)), count: d.count }));
  }, [payments]);

  return (
    <div className="bg-white rounded-xl border border-slate-200/60 p-5">
      <h2 className="text-sm font-semibold text-slate-900 mb-4">Payment Volume (last 30 days)</h2>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            tickLine={false}
            axisLine={false}
            interval={4}
          />
          <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
            formatter={(v) => [`₳ ${v}`, "Volume"]}
          />
          <Area
            type="monotone"
            dataKey="volume"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#volGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}