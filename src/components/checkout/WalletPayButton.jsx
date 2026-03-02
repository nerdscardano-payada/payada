import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

/**
 * Builds a Cardano tx via backend (buildPaymentTx) and submits via CIP-30 wallet.
 * The backend returns unsigned CBOR → wallet signs → wallet submits.
 */
export default function WalletPayButton({ connectedWallet, sessionData, paymentLink, onSuccess }) {
  const [txLoading, setTxLoading] = useState(false);

  const handlePay = async () => {
    if (!connectedWallet || !sessionData) return;
    setTxLoading(true);
    try {
      const { api, address: walletAddress } = connectedWallet;

      const merchantAddress = sessionData.merchant_address || paymentLink.receive_address;
      const merchantLovelace = String(Math.floor(sessionData.merchant_amount_ada * 1_000_000));
      const platformFeeLovelace = String(Math.floor(sessionData.platform_fee_ada * 1_000_000));

      // Build the tx CBOR via backend
      const buildRes = await base44.functions.invoke('buildPaymentTx', {
        walletAddress,
        merchantAddress,
        merchantLovelace,
        platformFeeLovelace,
      });

      if (!buildRes?.data?.txCbor) {
        throw new Error(buildRes?.data?.error || "Failed to build transaction CBOR");
      }

      // Sign with wallet (CIP-30) — opens wallet popup
      const signedTx = await api.signTx(buildRes.data.txCbor, true);

      // Submit via wallet
      const txHash = await api.submitTx(signedTx);

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
    }
  };

  return (
    <Button
      onClick={handlePay}
      disabled={txLoading}
      className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-base font-semibold gap-2"
    >
      {txLoading ? (
        <><Loader2 className="w-4 h-4 animate-spin" /> Signing transaction…</>
      ) : (
        <>Pay ₳ {sessionData?.amount_total_ada?.toFixed(2)} with Wallet</>
      )}
    </Button>
  );
}