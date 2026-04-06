import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import KeyMetrics from "@/components/admin/KeyMetrics";
import SystemErrorLogs from "@/components/admin/SystemErrorLogs";
import FeeRevenueStats from "@/components/admin/FeeRevenueStats";
import MerchantOverview from "@/components/admin/MerchantOverview";
import MerchantVerificationPanel from "@/components/admin/MerchantVerificationPanel";
import TransactionTimeline from "@/components/admin/TransactionTimeline";
import RevenueChart from "@/components/admin/RevenueChart";
import AdminDashboardHero from "@/components/admin/AdminDashboardHero";
import HomepageLinkOverview from "@/components/admin/HomepageLinkOverview";

export default function AdminDashboard() {
  const queryClient = useQueryClient();
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
      <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6">
            <h2 className="text-lg font-semibold text-destructive">Access denied</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Je hebt admin rechten nodig om dit dashboard te openen.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleRefresh = () => {
    queryClient.invalidateQueries();
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <AdminDashboardHero onRefresh={handleRefresh} refreshing={false} />

        <section>
          <KeyMetrics />
        </section>

        <section>
          <HomepageLinkOverview />
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
          <section className="space-y-6">
            <div>
              <h2 className="mb-4 text-lg font-semibold text-foreground">Groei en transacties</h2>
              <RevenueChart />
            </div>
            <div>
              <TransactionTimeline />
            </div>
          </section>

          <section className="space-y-6">
            <div>
              <h2 className="mb-4 text-lg font-semibold text-foreground">Merchant verificatie</h2>
              <MerchantVerificationPanel />
            </div>
            <div>
              <h2 className="mb-4 text-lg font-semibold text-foreground">Systeemstatus</h2>
              <SystemErrorLogs />
            </div>
          </section>
        </div>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Financieel overzicht</h2>
          <FeeRevenueStats />
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Merchant beheer</h2>
          <MerchantOverview />
        </section>
      </div>
    </div>
  );
}