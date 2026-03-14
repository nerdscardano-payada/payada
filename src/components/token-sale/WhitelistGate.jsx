import React from "react";
import { ShieldCheck, ShieldX, Loader2 } from "lucide-react";

export default function WhitelistGate({ sale, walletAddress, checking }) {
  if (!sale.whitelist_enabled) return null;

  if (!walletAddress) {
    return (
      <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-amber-300 text-sm">
        <ShieldCheck className="w-4 h-4 flex-shrink-0" />
        <span>This sale is <strong>whitelisted</strong>. Connect your wallet to check access.</span>
      </div>
    );
  }

  if (checking) {
    return (
      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-3 text-white/60 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Checking whitelist status…</span>
      </div>
    );
  }

  const whitelisted = (sale.whitelist_addresses || []).includes(walletAddress);

  if (whitelisted) {
    return (
      <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-emerald-300 text-sm">
        <ShieldCheck className="w-4 h-4 flex-shrink-0" />
        <span>Your wallet is <strong>whitelisted</strong> for this sale.</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-300 text-sm">
      <ShieldX className="w-4 h-4 flex-shrink-0" />
      <span>Your wallet is <strong>not whitelisted</strong> for this sale. Contact the project team to apply.</span>
    </div>
  );
}