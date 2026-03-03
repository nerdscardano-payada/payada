import React, { useState, useEffect, useRef } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

export default function WalletPayButton({ connectedWallet, sessionData, paymentLink, onSuccess }) {
  const [txLoading, setTxLoading] = useState(false);
  const [txStatus, setTxStatus] = useState(null); // null | 'building' | 'signing' | 'submitting'

  // Prevent bfcache — this kills the wallet extension port
  useEffect(() => {
    const onPageShow = (e) => {
      if (e.persisted) window.location.reload();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  const handlePay = async () => {
    if (!connectedWallet || !sessionData) return;

    const { walletId, address: walletAddress } = connectedWallet;
    const merchantAddress = sessionData.merchant_address || paymentLink.receive_address;
    const merchantLovelace = String(Math.floor(sessionData.merchant_amount_ada * 1_000_000));
    const platformFeeLovelace = String(Math.floor(sessionData.platform_fee_ada * 1_000_000));

    setTxLoading(true);
    setTxStatus('building');

    let txCbor;
    try {
      // Step 1: Build tx via backend BEFORE re-enabling wallet
      const buildRes = await base44.functions.invoke('buildPaymentTx', {
        walletAddress,
        merchantAddress,
        merchantLovelace,
        platformFeeLovelace,
      });
      if (!buildRes?.data?.txCbor) {
        throw new Error(buildRes?.data?.error || "Failed to build transaction CBOR");
      }
      txCbor = buildRes.data.txCbor;
    } catch (err) {
      toast.error(err?.message || "Failed to build transaction.");
      setTxLoading(false);
      setTxStatus(null);
      return;
    }

    // Step 2: Re-enable wallet fresh (avoid stale port from bfcache)
    // This re-establishes the connection right before signing
    let api;
    try {
      api = await window.cardano[walletId].enable();
    } catch (err) {
      toast.error("Could not connect to wallet. Please ensure your wallet extension is open.");
      setTxLoading(false);
      setTxStatus(null);
      return;
    }

    // Step 3: Sign — NO state updates, NO redirects, NO navigation until this resolves
    setTxStatus('signing');
    toast.info("Please confirm the transaction in your wallet…", { duration: 60000, id: "wallet-sign" });

    let witnessCbor;
    try {
      witnessCbor = await api.signTx(txCbor, true);
    } catch (signErr) {
      toast.dismiss("wallet-sign");
      if (signErr?.code === 2 || signErr?.info?.includes("cancelled") || signErr?.info?.includes("declined")) {
        toast.error("Transaction cancelled.");
      } else {
        toast.error("Wallet signing failed. Keep this tab open and try again. Error: " + (signErr?.info || signErr?.message || "Unknown"));
      }
      setTxLoading(false);
      setTxStatus(null);
      return;
    }
    toast.dismiss("wallet-sign");

    // Step 4: Submit via backend
    setTxStatus('submitting');
    try {
      const submitRes = await base44.functions.invoke('submitSignedTx', {
        unsignedTxCbor: txCbor,
        witnessCbor,
      });
      if (!submitRes?.data?.success) {
        throw new Error(submitRes?.data?.error || "Failed to submit transaction");
      }
      toast.success("Transaction submitted! Waiting for confirmation…");
      onSuccess?.(submitRes.data.txHash);
    } catch (err) {
      toast.error(err?.message || "Failed to submit transaction.");
    } finally {
      setTxLoading(false);
      setTxStatus(null);
    }
  };

  const statusLabel = {
    building: "Building transaction…",
    signing: "Waiting for wallet signature…",
    submitting: "Submitting to blockchain…",
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handlePay}
        disabled={txLoading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-base font-semibold gap-2"
      >
        {txLoading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> {statusLabel[txStatus] || "Processing…"}</>
        ) : (
          <>Pay ₳ {sessionData?.amount_total_ada?.toFixed(2)} with Wallet</>
        )}
      </Button>
      {txStatus === 'signing' && (
        <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          Keep this tab open while signing in your wallet extension.
        </div>
      )}
    </div>
  );
}