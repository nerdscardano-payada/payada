import React, { useState, useEffect, useRef } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

export default function WalletPayButton({ connectedWallet, sessionData, paymentLink, onSuccess }) {
  const [txLoading, setTxLoading] = useState(false);
  const [txStatus, setTxStatus] = useState(null); // null | 'building' | 'signing' | 'submitting'
  const [pageHidden, setPageHidden] = useState(false);
  const abortRef = useRef(false);

  // Detect bfcache / page visibility changes that kill wallet connection
  useEffect(() => {
    const onVisChange = () => {
      if (document.visibilityState === "hidden") {
        setPageHidden(true);
      } else {
        setPageHidden(false);
      }
    };
    // Prevent bfcache: tell browser this page should not be cached
    const onPageShow = (e) => {
      if (e.persisted) {
        // Page was restored from bfcache — reload to restore wallet connection
        window.location.reload();
      }
    };
    document.addEventListener("visibilitychange", onVisChange);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      document.removeEventListener("visibilitychange", onVisChange);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  const handlePay = async () => {
    if (!connectedWallet || !sessionData) return;
    setTxLoading(true);
    abortRef.current = false;

    try {
      const { api, address: walletAddress } = connectedWallet;
      const merchantAddress = sessionData.merchant_address || paymentLink.receive_address;
      const merchantLovelace = String(Math.floor(sessionData.merchant_amount_ada * 1_000_000));
      const platformFeeLovelace = String(Math.floor(sessionData.platform_fee_ada * 1_000_000));

      // Step 1: Build the tx via backend
      setTxStatus('building');
      const buildRes = await base44.functions.invoke('buildPaymentTx', {
        walletAddress,
        merchantAddress,
        merchantLovelace,
        platformFeeLovelace,
      });

      if (!buildRes?.data?.txCbor) {
        throw new Error(buildRes?.data?.error || "Failed to build transaction CBOR");
      }

      // Step 2: Sign with wallet — opens wallet popup
      setTxStatus('signing');
      toast.info("Please confirm the transaction in your wallet…", { duration: 30000, id: "wallet-sign" });

      let witnessCbor;
      try {
        witnessCbor = await api.signTx(buildRes.data.txCbor, true);
      } catch (signErr) {
        toast.dismiss("wallet-sign");
        // Code 2 = user declined
        if (signErr?.code === 2 || signErr?.info?.includes("cancelled") || signErr?.info?.includes("declined")) {
          throw { code: 2, message: "Transaction cancelled by user." };
        }
        // Connection lost — give helpful message
        throw new Error("Wallet signing failed. Please ensure your wallet extension is open and try again. Error: " + (signErr?.info || signErr?.message || JSON.stringify(signErr)));
      }
      toast.dismiss("wallet-sign");

      // Step 3: Submit via backend (avoids CSP issues with direct Blockfrost calls)
      setTxStatus('submitting');
      const submitRes = await base44.functions.invoke('submitSignedTx', {
        unsignedTxCbor: buildRes.data.txCbor,
        witnessCbor,
      });

      if (!submitRes?.data?.success) {
        throw new Error(submitRes?.data?.error || "Failed to submit transaction");
      }

      const txHash = submitRes.data.txHash;
      toast.success("Transaction submitted! Waiting for confirmation…");
      onSuccess?.(txHash);

    } catch (err) {
      if (err?.code === 2) {
        toast.error("Transaction cancelled.");
      } else {
        toast.error(err?.message || "Transaction failed. Please try again.");
      }
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