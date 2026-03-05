import React, { useMemo, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  subDays, subWeeks, subMonths,
  startOfDay, startOfWeek, startOfMonth,
  format, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval
} from "date-fns";

const PERIODS = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
];

function buildData(payments, period) {
  const now = new Date();

  let intervals = [];
  let labelFn;
  let startFn;

  if (period === "daily") {
    const start = subDays(now, 29);
    intervals = eachDayOfInterval({ start: startOfDay(start), end: startOfDay(now) });
    labelFn = (d) => format(d, "MMM d");
    startFn = (d) => startOfDay(d).getTime();
  } else if (period === "weekly") {
    const start = subWeeks(now, 11);
    intervals = eachWeekOfInterval({ start: startOfWeek(start), end: startOfWeek(now) });
    labelFn = (d) => format(d, "MMM d");
    startFn = (d) => startOfWeek(d).getTime();
  } else {
    const start = subMonths(now, 11);
    intervals = eachMonthOfInterval({ start: startOfMonth(start), end: startOfMonth(now) });
    labelFn = (d) => format(d, "MMM yy");
    startFn = (d) => startOfMonth(d).getTime();
  }

  const buckets = intervals.map((d) => ({
    key: startFn(d),
    label: labelFn(d),
    volume: 0,
    revenue: 0,
    total: 0,
    confirmed: 0,
  }));

  payments.forEach((p) => {
    const ts = startFn(new Date(p.created_date));
    const bucket = buckets.find((b) => b.key === ts);
    if (!bucket) return;
    bucket.total += 1;
    if (p.status === "confirmed") {
      bucket.confirmed += 1;
      bucket.volume += p.received_amount_ada || p.expected_amount_ada || 0;
      bucket.revenue += p.merchant_amount_ada || (p.received_amount_ada || p.expected_amount_ada || 0);
    }
  });

  return buckets.map((b) => ({
    label: b.label,
    volume: parseFloat(b.volume.toFixed(2)),
    revenue: parseFloat(b.revenue.toFixed(2)),
    successRate: b.total > 0 ? parseFloat(((b.confirmed / b.total) * 100).toFixed(1)) : 0,
    transactions: b.total,
  }));
}

const CustomTooltipVolume = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-3 text-xs">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {p.name.includes("ADA") ? `₳ ${p.value}` : p.value}
        </p>
      ))}
    </div>
  );
};

export default function PaymentVolumeChart({ payments }) {
  const [period, setPeriod] = useState("daily");

  const data = useMemo(() => buildData(payments, period), [payments, period]);

  return (
    <div className="bg-white rounded-xl border border-slate-200/60 p-5 space-y-6">
      {/* Header + period switcher */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Analytics Overview</h2>
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`text-xs px-3 py-1 rounded-md font-medium transition-all ${
                period === p.value
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction Volume (ADA) */}
      <div>
        <p className="text-xs text-slate-500 font-medium mb-2">Transaction Volume (ADA)</p>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltipVolume />} />
            <Area type="monotone" dataKey="volume" name="Volume ADA" stroke="#6366f1" strokeWidth={2} fill="url(#volGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Net Revenue (ADA) */}
      <div>
        <p className="text-xs text-slate-500 font-medium mb-2">Net Revenue (ADA)</p>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltipVolume />} />
            <Bar dataKey="revenue" name="Revenue ADA" fill="#06b6d4" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Success Rate */}
      <div>
        <p className="text-xs text-slate-500 font-medium mb-2">Payment Success Rate (%)</p>
        <ResponsiveContainer width="100%" height={130}>
          <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} domain={[0, 100]} unit="%" />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
              formatter={(v) => [`${v}%`, "Success Rate"]}
            />
            <Line type="monotone" dataKey="successRate" stroke="#10b981" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}