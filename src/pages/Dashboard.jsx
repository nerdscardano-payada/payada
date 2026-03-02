import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/shared/StatCard";
import StatusBadge from "@/components/shared/StatusBadge";
import PaymentVolumeChart from "@/components/dashboard/PaymentVolumeChart";
import TopCustomers from "@/components/dashboard/TopCustomers";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  CreditCard,
  Link2,
  RefreshCw,
  Users,
  TrendingUp,
  ArrowRight
} from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: payments = [], isLoading: loadingPayments } = useQuery({
    queryKey: ["payments", user?.email],
    queryFn: () => base44.entities.Payment.filter({ merchant_id: user.email }, "-created_date", 200),
    enabled: !!user,
  });

  const { data: paymentLinks = [], isLoading: loadingLinks } = useQuery({
    queryKey: ["paymentLinks", user?.email],
    queryFn: () => base44.entities.PaymentLink.filter({ merchant_id: user.email }, "-created_date", 50),
    enabled: !!user,
  });

  const { data: subscriptions = [], isLoading: loadingSubs } = useQuery({
    queryKey: ["subscriptions", user?.email],
    queryFn: () => base44.entities.Subscription.filter({ merchant_id: user.email }, "-created_date", 50),
    enabled: !!user,
  });

  const { data: customers = [], isLoading: loadingCustomers } = useQuery({
    queryKey: ["customers", user?.email],
    queryFn: () => base44.entities.Customer.filter({ merchant_id: user.email }, "-created_date", 50),
    enabled: !!user,
  });

  const totalAda = payments
    .filter(p => p.status === "confirmed")
    .reduce((sum, p) => sum + (p.received_amount_ada || p.expected_amount_ada || 0), 0);

  const totalFees = payments
    .filter(p => p.status === "confirmed")
    .reduce((sum, p) => sum + (p.fee_amount_ada || 0), 0);

  const confirmedPayments = payments.filter(p => p.status === "confirmed").length;
  const activeLinks = paymentLinks.filter(l => l.status === "active").length;
  const activeSubs = subscriptions.filter(s => s.status === "active" || s.status === "trial").length;

  const isLoading = loadingPayments || loadingLinks || loadingSubs || loadingCustomers;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your PayADA merchant account"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200/60 p-5">
              <Skeleton className="h-4 w-20 mb-4" />
              <Skeleton className="h-8 w-28" />
            </div>
          ))
        ) : (
          <>
            <StatCard
              title="Net Revenue"
              value={`₳ ${(totalAda - totalFees).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}`}
              subtitle={`${confirmedPayments} confirmed payments`}
              icon={TrendingUp}
              accentColor="green"
            />
            <StatCard
              title="Payment Links"
              value={activeLinks}
              subtitle={`${paymentLinks.length} total`}
              icon={Link2}
              accentColor="indigo"
            />
            <StatCard
              title="Active Subscriptions"
              value={activeSubs}
              subtitle={`${subscriptions.length} total`}
              icon={RefreshCw}
              accentColor="cyan"
            />
            <StatCard
              title="Customers"
              value={customers.length}
              icon={Users}
              accentColor="purple"
            />
          </>
        )}
      </div>

      {/* Chart + Top Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {isLoading ? (
          <>
            <div className="bg-white rounded-xl border border-slate-200/60 p-5"><Skeleton className="h-48 w-full" /></div>
            <div className="bg-white rounded-xl border border-slate-200/60 p-5"><Skeleton className="h-48 w-full" /></div>
          </>
        ) : (
          <>
            <PaymentVolumeChart payments={payments} />
            <TopCustomers customers={customers} />
          </>
        )}
      </div>

      {/* Recent Payments */}
      <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Recent Payments</h2>
          <Link
            to={createPageUrl("Payments")}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {isLoading ? (
          <div className="p-5 space-y-3">
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : payments.length === 0 ? (
          <div className="py-12 text-center">
            <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No payments yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {payments.slice(0, 7).map((payment) => (
              <div key={payment.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {payment.payer_email || payment.tx_hash?.slice(0, 16) + "..." || "Anonymous"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {format(new Date(payment.created_date), "MMM d, HH:mm")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={payment.status} />
                  <span className="text-sm font-semibold text-slate-900 tabular-nums">
                    ₳ {(payment.received_amount_ada || payment.expected_amount_ada)?.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}