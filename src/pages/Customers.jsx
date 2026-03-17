import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useProfileCheck } from "@/components/hooks/useProfileCheck";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { Users, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const KNOWN_DECIMALS = {
  "5d16cc1a177b5d9ba9cfa9793b07e60f1fb70fea1f8aef064415d114": 6,
  "29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c6": 6,
  "5dac8536653edc12f6f5e1045d8164b9f59998d3bdc300fc92843489": 6,
  "c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad": 6,
  "fe7c786ab321f41c654ef6c1af7b3250a613c24e4213e0425a7ae456": 6,
  "8db269c3ec630e06ae29f74bc39edd1f87c819f1056206e879a1cd61": 6,
};

function getCntDecimals(policyId, storedDecimals) {
  if (storedDecimals && storedDecimals > 0) return storedDecimals;
  return KNOWN_DECIMALS[policyId] ?? 0;
}

function getCustomerAmountDisplay(customer, payments) {
  const matchedPayments = payments.filter((payment) => {
    if (customer.email && payment.payer_email === customer.email) return true;
    if (customer.wallet_address && payment.payer_address === customer.wallet_address) return true;
    return false;
  });

  const confirmedPayments = matchedPayments.filter((payment) => payment.status === "confirmed");
  const adaTotal = confirmedPayments
    .filter((payment) => payment.payment_type !== "cnt")
    .reduce((sum, payment) => sum + (payment.merchant_amount_ada || payment.received_amount_ada || payment.expected_amount_ada || 0), 0);

  const cntByToken = {};
  confirmedPayments
    .filter((payment) => payment.payment_type === "cnt")
    .forEach((payment) => {
      const key = payment.cnt_policy_id || payment.cnt_ticker || "CNT";
      if (!cntByToken[key]) {
        cntByToken[key] = {
          ticker: payment.cnt_ticker || "CNT",
          decimals: getCntDecimals(payment.cnt_policy_id, payment.cnt_decimals),
          amount: 0,
        };
      }
      cntByToken[key].amount += payment.merchant_amount_cnt ?? payment.received_amount_cnt ?? payment.expected_amount_cnt ?? 0;
    });

  const cntTokens = Object.values(cntByToken);
  if (adaTotal === 0 && cntTokens.length === 1) {
    const token = cntTokens[0];
    return `${Number(token.amount).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: token.decimals,
    })} ${token.ticker}`;
  }

  return `₳ ${Number(adaTotal || customer.total_merchant_ada || customer.total_paid_ada || 0).toFixed(2)}`;
}

export default function Customers() {
  const { isProfileComplete, profile } = useProfileCheck();
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  // Show profile warning banner if not complete
  if (!isProfileComplete && profile !== undefined) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-blue-50 border border-blue-300 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-blue-900">Complete Your Profile</h2>
          </div>
          <p className="text-sm text-blue-800 mb-4">
            To access PayADA tools, please complete your merchant profile first. You need to provide your business name and a receiving wallet address.
          </p>
          <button
            onClick={() => window.location.href = '/MerchantProfile'}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
            Go to Profile
          </button>
        </div>
      </div>
    );
  }

  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ["customers", user?.email],
    queryFn: () => base44.entities.Customer.filter({ merchant_id: user.email }, "-created_date", 200),
    enabled: !!user,
  });

  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ["customer-payments", user?.email],
    queryFn: () => base44.entities.Payment.filter({ merchant_id: user.email }, "-created_date", 500),
    enabled: !!user,
  });

  const isLoading = customersLoading || paymentsLoading;

  return (
    <div>
      <PageHeader title="Customers" subtitle="All customers who have interacted with your payment links" />

      <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
        {isLoading ? (
          <div className="p-5 space-y-3">
            {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : customers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No customers yet"
            description="Customers are automatically tracked when they make payments."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Customer</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Total Paid</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Payments</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Subscription</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{c.email}</p>
                        {c.name && <p className="text-xs text-slate-400">{c.name}</p>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold text-slate-900 tabular-nums">{getCustomerAmountDisplay(c, payments)}</span>
                        <span className="text-xs text-slate-400">net</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-slate-600">{c.payment_count || 0}</span>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      {c.has_active_subscription ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span>
                      ) : (
                        <span className="text-xs text-slate-400">None</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-slate-500">{format(new Date(c.created_date), "MMM d, yyyy")}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}