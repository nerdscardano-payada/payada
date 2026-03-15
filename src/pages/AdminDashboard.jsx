import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import KeyMetrics from "@/components/admin/KeyMetrics";
import SystemErrorLogs from "@/components/admin/SystemErrorLogs";
import FeeRevenueStats from "@/components/admin/FeeRevenueStats";
import MerchantOverview from "@/components/admin/MerchantOverview";
import TransactionTimeline from "@/components/admin/TransactionTimeline";
import RevenueChart from "@/components/admin/RevenueChart";

export default function AdminDashboard() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => base44.auth.me(),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto animate-pulse space-y-6">
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
        <div className="max-w-7xl mx-auto">
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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-600 mt-1">
            Monitor platform health, performance, and financial metrics
          </p>
        </div>

        {/* Key Metrics Row */}
        <section>
          <KeyMetrics />
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Activity & Transactions */}
          <div className="lg:col-span-2 space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                📈 Groei
              </h2>
              <RevenueChart />
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                📊 Transacties
              </h2>
              <TransactionTimeline />
            </section>
          </div>

          {/* Right Column - System Health */}
          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                🔧 Systeemstatus
              </h2>
              <SystemErrorLogs />
            </section>
          </div>
        </div>

        {/* Financial Overview */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            💰 Financieel Overzicht
          </h2>
          <FeeRevenueStats />
        </section>

        {/* Merchant Management */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            🏢 Merchant Beheer
          </h2>
          <MerchantOverview />
        </section>
      </div>
    </div>
  );
}