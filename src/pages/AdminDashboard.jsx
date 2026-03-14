import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import PlatformHealthOverview from "@/components/admin/PlatformHealthOverview";
import SystemErrorLogs from "@/components/admin/SystemErrorLogs";
import FeeRevenueStats from "@/components/admin/FeeRevenueStats";
import MerchantOverview from "@/components/admin/MerchantOverview";
import RecentTransactions from "@/components/admin/RecentTransactions";

export default function AdminDashboard() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => base44.auth.me(),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <h2 className="text-lg font-semibold text-red-900">Access Denied</h2>
            <p className="text-red-800 mt-2">
              You need admin privileges to access this dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-600 mt-1">
            Monitor platform health and system performance
          </p>
        </div>

        {/* Fee Revenue Stats */}
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            💰 Fee Inkomsten (Platform Revenue)
          </h2>
          <FeeRevenueStats />
        </section>

        {/* Merchant Overview */}
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            🏢 Merchant Overzicht & Reset
          </h2>
          <MerchantOverview />
        </section>

        {/* Platform Health Metrics */}
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Platform Health
          </h2>
          <PlatformHealthOverview />
        </section>

        {/* System Error Logs */}
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            System Monitor
          </h2>
          <SystemErrorLogs />
        </section>
      </div>
    </div>
  );
}