import React from "react";
import WalletConnect from "@/components/checkout/WalletConnect";
import { Wallet } from "lucide-react";

export default function GlobalWalletConnect({
  onConnected,
  onDisconnected,
  title = "Connect your wallet",
  description = "Use Nami, Eternl or Lace to continue without creating an account first.",
  className = "",
}) {
  return (
    <div className={`rounded-[1.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur-sm ${className}`}>
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
          <Wallet className="h-5 w-5 text-cyan-300" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <p className="mt-1 text-sm text-slate-300">{description}</p>
        </div>
      </div>
      <WalletConnect onConnected={onConnected} onDisconnected={onDisconnected} />
      <p className="mt-3 text-xs text-slate-400">
        Supported wallets: Nami, Eternl, Lace and other installed Cardano wallets.
      </p>
    </div>
  );
}