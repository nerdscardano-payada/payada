import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { AlertTriangle, CheckCircle2, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WalletHealthCheck({ 
  connectedWallet, 
  paymentLink, 
  onHealthChecked 
}) {
  const [healthCheck, setHealthCheck] = useState(null);
  const [checking, setChecking] = useState(false);
  const [showCleanWarning, setShowCleanWarning] = useState(false);

  useEffect(() => {
    if (!connectedWallet?.address || !paymentLink?.amount_mode === "fixed_cnt") {
      return;
    }

    const performCheck = async () => {
      setChecking(true);
      try {
        const res = await base44.functions.invoke('detectAndCleanDirtyWallet', {
          walletAddress: connectedWallet.address,
          cntPolicyId: paymentLink.cnt_policy_id,
          cntAssetName: paymentLink.cnt_asset_name
        });

        setHealthCheck(res.data?.status);
        
        if (res.data?.status?.recommendation === "DIRTY" || res.data?.status?.recommendation === "MIXED") {
          setShowCleanWarning(true);
        }

        if (onHealthChecked) {
          onHealthChecked(res.data?.status);
        }
      } catch (err) {
        console.error("Wallet health check failed:", err);
      } finally {
        setChecking(false);
      }
    };

    performCheck();
  }, [connectedWallet?.address, paymentLink?.amount_mode, paymentLink?.cnt_policy_id]);

  if (!paymentLink?.amount_mode === "fixed_cnt" || !healthCheck) {
    return null;
  }

  if (healthCheck.recommendation === "CLEAN") {
    return (
      <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <span className="text-sm text-emerald-300">Wallet is optimized for payment</span>
      </div>
    );
  }

  if (healthCheck.recommendation === "DIRTY") {
    return (
      <div className="space-y-3">
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-300">Wallet needs consolidation</p>
            <p className="text-xs text-red-300/70 mt-1">
              Your wallet contains {healthCheck.otherTokens.length} other tokens mixed with {paymentLink.cnt_ticker}. 
              PayADA requires a clean wallet for secure CNT payments.
            </p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
          disabled={checking}
        >
          {checking ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
          {checking ? "Optimizing..." : "Auto-Clean Wallet (Optional)"}
        </Button>
        
        <p className="text-xs text-slate-400">
          You can proceed to payment, but a clean wallet reduces transaction risk. 
          <br />Or manually consolidate your wallet first.
        </p>
      </div>
    );
  }

  if (healthCheck.recommendation === "MIXED") {
    return (
      <div className="space-y-3">
        <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <Zap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-300">Wallet is partially mixed</p>
            <p className="text-xs text-amber-300/70 mt-1">
              Found {healthCheck.cleanUtxos} clean UTXOs. PayADA can use these directly, 
              or auto-split for extra safety.
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-400">
          Your payment will use clean UTXOs first. No action needed unless you prefer to consolidate.
        </p>
      </div>
    );
  }

  return null;
}