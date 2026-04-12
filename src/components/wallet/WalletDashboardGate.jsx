import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import WalletConnect from "@/components/checkout/WalletConnect";
import { base44 } from "@/api/base44Client";
import { ShieldCheck, Wallet } from "lucide-react";

export default function WalletDashboardGate({ profile, onLinked }) {
  const [connectedAddress, setConnectedAddress] = React.useState(null);
  const [manualAddress, setManualAddress] = useState("");
  const [saving, setSaving] = React.useState(false);
  const isMobile = useMemo(() => typeof window !== "undefined" && window.innerWidth < 1024, []);

  useEffect(() => {
    const savedAddress = localStorage.getItem("payada_manual_wallet_address") || profile?.connected_wallet_address || profile?.default_receive_address || "";
    setManualAddress(savedAddress);
  }, [profile?.connected_wallet_address, profile?.default_receive_address]);

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

  const handleManualSave = async () => {
    const trimmedAddress = manualAddress.trim();
    if (!trimmedAddress) return;

    localStorage.setItem("payada_manual_wallet_address", trimmedAddress);
    localStorage.setItem("payada_connected_wallet_address", trimmedAddress);
    window.dispatchEvent(new CustomEvent("payada-wallet-connected", { detail: { address: trimmedAddress } }));

    setSaving(true);
    if (profile?.id) {
      await base44.entities.MerchantProfile.update(profile.id, {
        connected_wallet_address: trimmedAddress,
        default_receive_address: trimmedAddress,
      });
    }
    setConnectedAddress(trimmedAddress);
    setSaving(false);
    onLinked?.(trimmedAddress);
  };

  const isLinked = !!profile?.connected_wallet_address;
  const matchesConnectedWallet = !!(connectedAddress && profile?.connected_wallet_address === connectedAddress);

  return (
    <Card className="h-full p-6 border-indigo-200 bg-indigo-50/70">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-slate-900 font-semibold">
            <Wallet className="w-5 h-5 text-indigo-600" />
            Connect your Cardano wallet
          </div>
          <p className="text-sm text-slate-600">
            Get started quickly: use your wallet address to manage payment links and access links.
          </p>
          {isLinked && (
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
              <ShieldCheck className="w-3.5 h-3.5" />
              Wallet linked to merchant profile
            </div>
          )}
...
          {!isMobile && <WalletConnect onConnected={handleConnected} />}

          {isMobile && (
            <div className="space-y-3 rounded-xl border border-indigo-200 bg-white/80 p-4">
              <div>
                <p className="text-sm font-medium text-slate-900">No wallet connected yet?</p>
                <p className="text-xs text-slate-500">Enter your Cardano wallet address here. You can also manage this later in Merchant Profile.</p>
              </div>
              <Input
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                placeholder="Paste your Cardano wallet address"
                className="bg-white text-xs"
              />
              <Button onClick={handleManualSave} className="w-full" disabled={!manualAddress.trim() || saving}>
                Save wallet address
              </Button>
            </div>
          )}

          {saving && <p className="text-xs text-slate-500">Saving wallet...</p>}
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