import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Users, DollarSign, Activity, AlertCircle } from "lucide-react";

function MetricCard({ title, value, icon: Icon, color = "text-slate-600" }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <p className={`text-2xl font-bold mt-2 ${color}`}>{value}</p>
        </div>
        <div className={`p-2.5 rounded-lg ${color === "text-green-600" ? "bg-green-50" : color === "text-red-600" ? "bg-red-50" : "bg-slate-50"}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
    </div>
  );
}

export default function KeyMetrics() {
  const { data: merchantCount = 0, isLoading: merchantLoading } = useQuery({
    queryKey: ["admin-key-merchant-count"],
    queryFn: async () => {
      const profiles = await base44.entities.MerchantProfile.list();
      return profiles.length;
    },
  });

  const { data: paymentStats = {}, isLoading: paymentLoading } = useQuery({
    queryKey: ["admin-key-payment-stats"],
    queryFn: async () => {
      const payments = await base44.entities.Payment.list();
      const confirmedPayments = payments.filter((p) => p.status === "confirmed");
      const totalAda = confirmedPayments.reduce(
        (sum, p) => sum + (p.received_amount_ada || 0),
        0
      );
      const totalFeeAda = confirmedPayments.reduce(
        (sum, p) => sum + (p.fee_amount_ada || 0),
        0
      );
      return {
        confirmed: confirmedPayments.length,
        total: payments.length,
        volumeAda: totalAda,
        feesAda: totalFeeAda,
      };
    },
  });

  const { data: errorCount = 0, isLoading: errorLoading } = useQuery({
    queryKey: ["admin-key-error-count"],
    queryFn: async () => {
      const notifications = await base44.entities.Notification.filter({
        category: "admin",
      });
      return notifications.filter(
        (n) => n.severity === "critical" || n.severity === "warning"
      ).length;
    },
    refetchInterval: 10000,
  });

  const isLoading = merchantLoading || paymentLoading || errorLoading;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-slate-200 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Actieve Merchants"
        value={merchantCount}
        icon={Users}
      />
      <MetricCard
        title="Totaal Transacties"
        value={paymentStats.total || 0}
        icon={Activity}
      />
      <MetricCard
        title="Transactie Volume"
        value={`₳${(paymentStats.volumeAda || 0).toFixed(0)}`}
        icon={DollarSign}
        color="text-green-600"
      />
      <MetricCard
        title="Kritieke Issues"
        value={errorCount}
        icon={AlertCircle}
        color={errorCount > 0 ? "text-red-600" : "text-slate-600"}
      />
    </div>
  );
}