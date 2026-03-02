import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, Users } from "lucide-react";

export default function TopCustomers({ customers }) {
  const top = [...customers]
    .sort((a, b) => (b.total_paid_ada || 0) - (a.total_paid_ada || 0))
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
                ₳ {(c.total_paid_ada || 0).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}