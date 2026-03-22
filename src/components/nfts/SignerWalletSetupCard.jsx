import React from "react";
import { Button } from "@/components/ui/button";
import WalletConnectButton from "@/components/token-sale/WalletConnectButton";

export default function SignerWalletSetupCard({ wallet, connectedAddress, onConnect, onDisconnect, onSave, isSaving }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Merchant signer wallet</h2>
        <p className="text-sm text-slate-500">Geen mnemonic-opslag meer: de merchant tekent NFT-transfers met zijn eigen wallet wanneer er een pending levering klaarstaat.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <WalletConnectButton
          connectedAddress={connectedAddress}
          onConnect={(address, api, walletKey) => onConnect({ address, api, walletKey })}
          onDisconnect={onDisconnect}
        />
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3">
          <span className="text-slate-500">Opgeslagen signer wallet</span>
          <span className="font-mono text-slate-900 text-xs">{wallet?.wallet_address || "Nog niet ingesteld"}</span>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3">
          <span className="text-slate-500">Verbonden wallet</span>
          <span className="font-mono text-slate-900 text-xs">{connectedAddress || "Nog niet verbonden"}</span>
        </div>
      </div>

      <Button onClick={onSave} disabled={isSaving || !connectedAddress}>
        {isSaving ? "Opslaan..." : "Gebruik verbonden wallet"}
      </Button>
    </div>
  );
}