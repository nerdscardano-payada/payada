import React from "react";
import { Button } from "@/components/ui/button";
import WalletConnectButton from "@/components/token-sale/WalletConnectButton";

export default function SignerWalletSetupCard({ wallet, connectedAddress, onConnect, onDisconnect, onSave, isSaving }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Merchant signer wallet</h2>
        <p className="text-sm text-slate-500">Connect the wallet you want to use for managing and sending your NFTs inside PayADA.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
        <WalletConnectButton
          connectedAddress={connectedAddress}
          onConnect={(address, api, walletKey) => onConnect({ address, api, walletKey })}
          onDisconnect={onDisconnect}
        />
        <p className="text-xs leading-5 font-medium text-slate-800">
          If you do not see your wallet in preview, open this page in a separate tab. Browser wallet extensions often block injection inside an iframe.
        </p>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3">
          <span className="text-slate-500">Saved signer wallet</span>
          <span className="font-mono text-slate-900 text-xs">{wallet?.wallet_address || "Not configured yet"}</span>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3">
          <span className="text-slate-500">Connected wallet</span>
          <span className="font-mono text-slate-900 text-xs">{connectedAddress || "Not connected yet"}</span>
        </div>
      </div>

      <Button onClick={onSave} disabled={isSaving || !connectedAddress}>
        {isSaving ? "Saving..." : "Use connected wallet"}
      </Button>
    </div>
  );
}