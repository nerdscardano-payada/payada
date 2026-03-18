import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight } from "lucide-react";

export default function MerchantProfileBanner() {
  return (
    <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-4">
      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-amber-900">Complete your merchant profile</p>
        <p className="text-xs text-amber-700 mt-0.5">
          Add your business name and Cardano wallet address so you can start receiving payments when you're ready.
        </p>
      </div>
      <Link
        to="/MerchantProfile"
        className="flex-shrink-0 flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
      >
        Complete profile <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}