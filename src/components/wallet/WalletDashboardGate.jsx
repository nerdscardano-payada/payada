import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import WalletConnect from "@/components/checkout/WalletConnect";
import { base44 } from "@/api/base44Client";
import { ShieldCheck, Wallet } from "lucide-react";

export default function WalletDashboardGate({ profile, onLinked }) {
  const [connectedAddress, setConnectedAddress] = React.useState(null);
  const [saving, setSaving] = React.useState(false);

  const handleConnected = async ({ address }) => {
    setConnectedAddress(address);
    if (!profile?.id || !address) return;
    setSaving(true);
    await base44.entities.MerchantProfile.update(profile.id, {
      connected_wallet_address: address,
      default_receive_address: profile.default_receive_address || address,
    });
    setSaving(false);
    onLinked?.(address);
  };

  const isLinked = !!profile?.connected_wallet_address;
  const matchesConnectedWallet = !!(connectedAddress && profile?.connected_wallet_address === connectedAddress);

  return (
    <Card className="p-6 border-indigo-200 bg-indigo-50/70">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-slate-900 font-semibold">
            <Wallet className="w-5 h-5 text-indigo-600" />
            Connect your Cardano wallet
          </div>
          <p className="text-sm text-slate-600">
            Get started quickly: connect your wallet to manage payment links and access links.
          </p>
          {isLinked && (
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
              <ShieldCheck className="w-3.5 h-3.5" />
              Wallet linked to merchant profile
            </div>
          )}
...
          <WalletConnect onConnected={handleConnected} />
          {saving && <p className="text-xs text-slate-500">Linking wallet...</p>}
          {isLinked && !connectedAddress && (
            <Button variant="outline" className="w-full" disabled>
              Wallet linked
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}