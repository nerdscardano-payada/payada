import React from "react";
import WalletConnectButton from "@/components/token-sale/WalletConnectButton";

export default function ManualSigningCard({ configuredAddress, connectedAddress, onConnect, onDisconnect }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Manual signing</h2>
        <p className="text-sm text-slate-500">Your signer wallet is already stored in NFT Fulfillment Setup. Only connect temporarily here when you want to sign a pending transfer.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
          <span className="text-slate-500">Saved signer wallet</span>
          <span className="font-mono text-xs text-slate-900">{configuredAddress || "Not configured"}</span>
        </div>
        <WalletConnectButton
          connectedAddress={connectedAddress}
          onConnect={(address, api, walletKey) => onConnect({ address, api, walletKey })}
          onDisconnect={onDisconnect}
        />
      </div>
    </div>
  );
}