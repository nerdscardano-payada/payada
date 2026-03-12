import React from "react";
import PageHeader from "@/components/shared/PageHeader";
import { Check, Zap, Percent, Settings2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function Billing() {
  return (
    <div>
      <PageHeader
        title="Billing"
        subtitle="Simple, transparent pricing for all merchants"
      />

      {/* Single pricing model */}
      <div className="max-w-2xl">
        <Card className="bg-white border-indigo-300 shadow-lg shadow-indigo-100/50 ring-1 ring-indigo-200 p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">One Simple Fee</h3>
              <p className="text-slate-600 mt-1">Fair pricing for every merchant, no tiers, no surprises</p>
            </div>
            <div className="bg-indigo-100 rounded-lg p-3">
              <Percent className="w-6 h-6 text-indigo-600" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-lg p-6 mb-6">
            <p className="text-slate-600 text-sm mb-2">Flat transaction fee on all payments</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-indigo-600">1.75%</span>
              <span className="text-slate-600">per transaction</span>
            </div>
          </div>

          <ul className="space-y-3 mb-6">
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-slate-900">No subscription fees</p>
                <p className="text-sm text-slate-600">Everything included, no monthly costs</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-slate-900">Unlimited features</p>
                <p className="text-sm text-slate-600">Payment links, webhooks, API access for all</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-slate-900">Global rate limits</p>
                <p className="text-sm text-slate-600">100 API requests/min, fair for all merchants</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-slate-900">Transparent breakdown</p>
                <p className="text-sm text-slate-600">See exact fees for every payment you receive</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-slate-900">Flexible fee assignment</p>
                <p className="text-sm text-slate-600">Choose per payment link who pays the fee: merchant, customer, or split 50/50</p>
              </div>
            </li>
          </ul>

          <div className="border-t border-slate-200 pt-6">
            <p className="text-sm text-slate-600 mb-3">
              <span className="font-semibold text-slate-900">Example (merchant pays):</span> For a ₳100 payment, you receive ₳98.25 (fee: ₳1.75)
            </p>
            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Settings2 className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-semibold text-slate-800">Fee models</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                <div className="bg-white rounded-md p-3 border border-slate-200">
                  <p className="font-semibold text-slate-800 mb-1">Merchant pays</p>
                  <p>Customer pays ₳100</p>
                  <p>You receive ₳98.25</p>
                  <p className="text-slate-400">Fee: ₳1.75</p>
                </div>
                <div className="bg-white rounded-md p-3 border border-slate-200">
                  <p className="font-semibold text-slate-800 mb-1">Customer pays</p>
                  <p>Customer pays ₳101.75</p>
                  <p>You receive ₳100</p>
                  <p className="text-slate-400">Fee: ₳1.75</p>
                </div>
                <div className="bg-white rounded-md p-3 border border-slate-200">
                  <p className="font-semibold text-slate-800 mb-1">Split 50/50</p>
                  <p>Customer pays ₳100.875</p>
                  <p>You receive ₳99.125</p>
                  <p className="text-slate-400">Fee: ₳1.75</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}