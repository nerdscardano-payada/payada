import React, { useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function RevenueChart() {
  const { data: payments = [] } = useQuery({
    queryKey: ["admin-revenue-chart"],
    queryFn: () => base44.entities.Payment.list("-created_date", 500),
    refetchInterval: 60000,
  });

  const chartData = useMemo(() => {
    // Get last 6 months
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // Initialize monthly buckets
    const months = {};
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const key = d.toLocaleString("nl-BE", { month: "short", year: "2-digit" });
      months[key] = { revenue: 0, fees: 0 };
    }

    // Aggregate confirmed payments
    payments
      .filter(p => p.status === "confirmed" && p.payment_type === "ada" && p.confirmed_at)
      .forEach(p => {
        const date = new Date(p.confirmed_at);
        if (date >= sixMonthsAgo) {
          const key = date.toLocaleString("nl-BE", { month: "short", year: "2-digit" });
          if (months[key]) {
            months[key].revenue += p.merchant_amount_ada || 0;
            months[key].fees += p.fee_amount_ada || 0;
          }
        }
      });

    return Object.entries(months).map(([month, { revenue, fees }]) => ({
      month,
      revenue: Math.round(revenue * 100) / 100,
      fees: Math.round(fees * 100) / 100,
    }));
  }, [payments]);

  const totalRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0);
  const totalFees = chartData.reduce((sum, d) => sum + d.fees, 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Omzet & Fees (6 Maanden)</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
            <div className="text-xs text-blue-600 font-medium">Merchant Inkomsten</div>
            <div className="text-lg font-bold text-blue-900">₳{totalRevenue.toFixed(2)}</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
            <div className="text-xs text-green-600 font-medium">Fee Inkomsten</div>
            <div className="text-lg font-bold text-green-900">₳{totalFees.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: 12 }} />
            <YAxis stroke="#94a3b8" style={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #475569",
                borderRadius: "8px",
                color: "#f1f5f9",
              }}
              formatter={(value) => `₳${value.toFixed(2)}`}
            />
            <Legend wrapperStyle={{ paddingTop: 15 }} />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6", r: 4 }}
              activeDot={{ r: 6 }}
              name="Merchant Inkomsten"
            />
            <Line
              type="monotone"
              dataKey="fees"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: "#10b981", r: 4 }}
              activeDot={{ r: 6 }}
              name="Fee Inkomsten"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}