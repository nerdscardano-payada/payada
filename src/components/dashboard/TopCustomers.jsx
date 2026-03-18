import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, Users } from "lucide-react";

const KNOWN_DECIMALS = {
  "0691b2fecca1ac4f53cb6dfb00b7013e561d1f34403b957cbb5af1fa": 6,
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

function getCustomerDisplayData(customer, payments = []) {
  const matchedPayments = payments.filter((payment) => {
    if (customer.email) {
      return payment.payer_email === customer.email;
    }
    if (customer.wallet_address) {
      return payment.payer_address === customer.wallet_address;
    }
    return false;
  });

  const visiblePayments = matchedPayments.filter((payment) => !["failed", "expired"].includes(payment.status));
  const adaTotal = visiblePayments
    .filter((payment) => payment.payment_type !== "cnt")
    .reduce((sum, payment) => sum + (payment.merchant_amount_ada || payment.received_amount_ada || payment.expected_amount_ada || 0), 0);

  const cntByToken = {};
  visiblePayments
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
    return {
      sortValue: Number(token.amount),
      amountLabel: `${Number(token.amount).toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: token.decimals,
      })} ${token.ticker}`,
    };
  }

  const adaValue = Number(adaTotal || customer.total_merchant_ada || customer.total_paid_ada || 0);
  return {
    sortValue: adaValue,
    amountLabel: `₳ ${adaValue.toFixed(2)}`,
  };
}

export default function TopCustomers({ customers, payments = [] }) {
  const top = [...customers]
    .map((customer) => ({ ...customer, __display: getCustomerDisplayData(customer, payments) }))
    .sort((a, b) => b.__display.sortValue - a.__display.sortValue)
    .slice(0, 5);

  return (
    <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-900">Top Customers</h2>
        <Link
          to={createPageUrl("Customers")}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
        >
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      {top.length === 0 ? (
        <div className="py-10 text-center">
          <Users className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No customers yet</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50">
          {top.map((c, i) => (
            <div key={c.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/50 transition-colors">
              <span className="w-5 text-xs font-semibold text-slate-400 tabular-nums">{i + 1}</span>
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-600 font-semibold text-xs">
                {(c.name || c.email || "?")[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{c.name || c.email}</p>
                <p className="text-xs text-slate-400">{c.payment_count || 0} payments</p>
              </div>
              <span className="text-sm font-semibold text-slate-900 tabular-nums">
                {c.__display.amountLabel}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}