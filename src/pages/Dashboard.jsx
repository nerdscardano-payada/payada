import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/shared/StatCard";
import StatusBadge from "@/components/shared/StatusBadge";
import PaymentVolumeChart from "@/components/dashboard/PaymentVolumeChart";
import TopCustomers from "@/components/dashboard/TopCustomers";
import CntRevenueTable from "@/components/dashboard/CntRevenueTable";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  CreditCard,
  Link2,
  RefreshCw,
  Users,
  TrendingUp,
  ArrowRight,
  AlertTriangle
} from "lucide-react";
import { subDays } from "date-fns";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [paymentTypeTab, setPaymentTypeTab] = useState("ada");

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: merchantProfile } = useQuery({
    queryKey: ["merchantProfile-check", user?.email],
    queryFn: () => base44.entities.MerchantProfile.filter({ user_id: user.email }),
    enabled: !!user,
    select: (data) => data[0] || null,
  });

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
    queryKey: ["subscriptions-dash", user?.email],
    queryFn: () => base44.entities.Subscription.filter({ merchant_id: user.email }, "-created_date", 50),
    enabled: !!user,
  });

  const { data: customers = [], isLoading: loadingCustomers } = useQuery({
    queryKey: ["customers", user?.email],
    queryFn: () => base44.entities.Customer.filter({ merchant_id: user.email }, "-created_date", 50),
    enabled: !!user,
  });

  const KNOWN_DECIMALS = {
    "5d16cc1a177b5d9ba9cfa9793b07e60f1fb70fea1f8aef064415d114": 6, // $IAG
    "29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6": 6, // $MIN
    "5dac8536653edc12f6f5e1045d8164b9f59998d3bdc300fc92843489": 6, // $NMKR
    "c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad": 6, // USDM
    "fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae456": 6, // USDA
    "8db269c3ec630e06ae29f74bc39edd1f87c819f1056206e879a1cd61": 6, // DJED
  };
  const KNOWN_TICKERS = {
    "5d16cc1a177b5d9ba9cfa9793b07e60f1fb70fea1f8aef064415d114": "$IAG",
    "29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6": "$MIN",
    "279c909f348e533da5808898f87f9a14bb2c3dfbbacccd631d927a3": "$Snek",
    "5dac8536653edc12f6f5e1045d8164b9f59998d3bdc300fc92843489": "$NMKR",
    "c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad": "USDM",
    "fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae456": "USDA",
    "8db269c3ec630e06ae29f74bc39edd1f87c819f1056206e879a1cd61": "DJED",
    "533bb94a8850ee3ccbe483106489399112b74c905342cb1792a797a0": "$INDY",
    "9a9693a9a37912a5097918f97918d15240c92ab729a0b7c4aa144d77": "$SUNDAE",
    "a0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481ef0": "$HOSKY",
  };
  const paymentLinkMap = React.useMemo(() => {
    return paymentLinks.reduce((map, link) => { map[link.id] = link.title; return map; }, {});
  }, [paymentLinks]);

  const { data: accessLinks = [] } = useQuery({
    queryKey: ["accessLinks-dash", user?.email],
    queryFn: () => base44.entities.CommunityAccessLink.filter({ merchant_id: user.email }),
    enabled: !!user,
  });

  const { data: events = [] } = useQuery({
    queryKey: ["events-dash", user?.email],
    queryFn: () => base44.entities.Event.filter({ merchant_id: user.email }),
    enabled: !!user,
  });

  const accessLinkMap = React.useMemo(() => {
    return accessLinks.reduce((map, link) => { map[link.id] = link.title; return map; }, {});
  }, [accessLinks]);

  const eventMap = React.useMemo(() => {
    return events.reduce((map, e) => { map[e.id] = e.title; return map; }, {});
  }, [events]);

  const getCntDecimals = (policyId, stored) => (stored && stored > 0) ? stored : (KNOWN_DECIMALS[policyId] ?? 0);
  const getCntTicker = (p) => p.cnt_ticker || KNOWN_TICKERS[p.cnt_policy_id] || p.cnt_policy_id?.slice(0, 8) + "..." || "CNT";

  const confirmedAdaPayments = payments.filter(p => p.status === "confirmed" && (p.payment_type === "ada" || !p.payment_type));
  const confirmedCntPayments = payments.filter(p => p.status === "confirmed" && p.payment_type === "cnt");

  const allConfirmedPayments = payments.filter(p => p.status === "confirmed");

  // CNT summary by token
  const cntByToken = {};
  confirmedCntPayments.forEach(p => {
    const key = `${p.cnt_policy_id}|${p.cnt_ticker || "unknown"}`;
    if (!cntByToken[key]) {
      cntByToken[key] = { ticker: p.cnt_ticker, policy_id: p.cnt_policy_id, decimals: p.cnt_decimals || 0, amount: 0 };
    }
    cntByToken[key].amount += p.received_amount_cnt || 0;
  });

  const [paymentPeriod, setPaymentPeriod] = useState("all");

  const now = new Date();
  const filteredPayments = payments.filter(p => {
    if (paymentPeriod === "7d") return new Date(p.created_date) >= subDays(now, 7);
    if (paymentPeriod === "30d") return new Date(p.created_date) >= subDays(now, 30);
    return true;
  });

  const filteredConfirmedAda = filteredPayments.filter(p => p.status === "confirmed" && (p.payment_type === "ada" || !p.payment_type));
  const totalAda = filteredConfirmedAda.reduce((sum, p) => sum + (p.received_amount_ada || p.expected_amount_ada || 0), 0);

  const confirmedPaymentsCount = filteredConfirmedAda.length;
  const activeLinks = paymentLinks.filter(l => l.status === "active").length;
  const activeSubs = subscriptions.filter(s => s.status === "active" || s.status === "trial").length;

  const isLoading = loadingPayments || loadingLinks || loadingSubs || loadingCustomers;

  const profileIncomplete = user && merchantProfile !== undefined && (
    !merchantProfile || !merchantProfile.default_receive_address
  );

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your PayADA merchant account"
      />

      {profileIncomplete && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-4">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-900">Profile not yet set up</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Enter your business name and Cardano wallet address to start receiving payments.
            </p>
          </div>
          <Link
            to={createPageUrl("Onboarding")}
            className="flex-shrink-0 flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
          >
            Set up profile <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Tabs for ADA/CNT */}
      <div className="mb-8 flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setPaymentTypeTab("ada")}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
            paymentTypeTab === "ada"
              ? "text-indigo-600 border-indigo-600"
              : "text-slate-600 border-transparent hover:text-slate-900"
          }`}
        >
          ADA Payments
        </button>
        {confirmedCntPayments.length > 0 && (
          <button
            onClick={() => setPaymentTypeTab("cnt")}
            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
              paymentTypeTab === "cnt"
                ? "text-indigo-600 border-indigo-600"
                : "text-slate-600 border-transparent hover:text-slate-900"
            }`}
          >
            CNT Payments
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200/60 p-5">
              <Skeleton className="h-4 w-20 mb-4" />
              <Skeleton className="h-8 w-28" />
            </div>
          ))
        ) : paymentTypeTab === "ada" ? (
          <>
            <StatCard
               title="Total Volume"
               value={`₳ ${totalAda.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}`}
               subtitle={`${confirmedPaymentsCount} confirmed payment${confirmedPaymentsCount !== 1 ? "s" : ""} (${paymentPeriod === "all" ? "all time" : paymentPeriod})`}
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
              title="Payments"
              value={filteredPayments.filter(p => p.status === "confirmed").length}
              subtitle={
                <div className="flex gap-1 mt-1">
                  {["7d", "30d", "all"].map(p => (
                    <button
                      key={p}
                      onClick={() => setPaymentPeriod(p)}
                      className={`text-xs px-1.5 py-0.5 rounded font-medium transition-colors ${paymentPeriod === p ? "bg-cyan-600 text-white" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      {p === "all" ? "All" : p}
                    </button>
                  ))}
                </div>
              }
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
        ) : (
          <>
            <StatCard
              title="CNT Payments"
              value={confirmedCntPayments.length}
              subtitle="Total transactions"
              icon={CreditCard}
              accentColor="indigo"
            />
            <StatCard
              title="Unique Tokens"
              value={Object.keys(cntByToken).length}
              subtitle="Active tokens"
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
              title="Customers"
              value={customers.length}
              icon={Users}
              accentColor="purple"
            />
          </>
        )}
      </div>

      {/* Chart + Top Customers (ADA) / CNT Revenue (CNT) */}
      {paymentTypeTab === "ada" ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
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
      ) : (
        <div className="mb-6">
          {isLoading ? (
            <div className="bg-white rounded-xl border border-slate-200/60 p-5"><Skeleton className="h-96 w-full" /></div>
          ) : (
            <CntRevenueTable payments={payments} />
          )}
        </div>
      )}

      {/* Recent Payments (filtered by tab) */}
      <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Recent {paymentTypeTab === "ada" ? "ADA" : "CNT"} Payments</h2>
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
        ) : (paymentTypeTab === "ada" ? confirmedAdaPayments : confirmedCntPayments).length === 0 ? (
          <div className="py-12 text-center">
            <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No {paymentTypeTab === "ada" ? "ADA" : "CNT"} payments yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {(paymentTypeTab === "ada" ? confirmedAdaPayments : confirmedCntPayments).slice(0, 7).map((payment) => (
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
                     {payment.payment_type === "cnt" && ` • ${payment.cnt_ticker || "CNT"}`}
                     {(paymentLinkMap[payment.payment_link_id] || accessLinkMap[payment.access_link_id]) && (
                       <span className="text-indigo-500 font-medium"> • {paymentLinkMap[payment.payment_link_id] || accessLinkMap[payment.access_link_id]}</span>
                     )}
                   </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={payment.status} />
                  <span className="text-sm font-semibold text-slate-900 tabular-nums">
                    {payment.payment_type === "cnt"
                      ? (() => { const dec = getCntDecimals(payment.cnt_policy_id, payment.cnt_decimals); return `${((payment.received_amount_cnt || payment.expected_amount_cnt) / Math.pow(10, dec)).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: dec })} ${getCntTicker(payment)}`; })()
                      : `₳ ${(payment.received_amount_ada || payment.expected_amount_ada)?.toFixed(2)}`
                    }
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