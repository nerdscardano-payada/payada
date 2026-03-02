import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Transaction, AppWallet, BlockfrostProvider } from "@meshsdk/core";

/**
 * Builds and submits a multi-output Cardano transaction using MeshSDK + CIP-30 wallet.
 * Splits payment between merchant and PayADA fee wallet in one tx.
 */
export default function WalletPayButton({ connectedWallet, sessionData, paymentLink, onSuccess }) {
  const [txLoading, setTxLoading] = useState(false);

  const handlePay = async () => {
    if (!connectedWallet || !sessionData) return;
    setTxLoading(true);
    try {
      const { api, walletId } = connectedWallet;

      const merchantAddress = sessionData.merchant_address || paymentLink.receive_address;
      const feeAddress = sessionData.fee_wallet_address;
      const merchantLovelace = Math.floor(sessionData.merchant_amount_ada * 1_000_000);
      const platformFeeLovelace = Math.floor(sessionData.platform_fee_ada * 1_000_000);

      // Use CIP-30 directly: build tx with Mesh Transaction builder using raw wallet API
      const { BrowserWallet, Transaction: MeshTx } = await import("@meshsdk/core");

      // Connect Mesh to the already-enabled wallet
      const wallet = await BrowserWallet.enable(walletId);

      const tx = new MeshTx({ initiator: wallet });

      // Add merchant output
      tx.sendLovelace(merchantAddress, String(merchantLovelace));

      // Add fee output if applicable
      if (feeAddress && platformFeeLovelace > 0) {
        tx.sendLovelace(feeAddress, String(platformFeeLovelace));
      }

      const unsignedTx = await tx.build();
      const signedTx = await wallet.signTx(unsignedTx);
      const txHash = await wallet.submitTx(signedTx);

      toast.success("Transaction submitted! Waiting for confirmation…");
      onSuccess?.(txHash);
    } catch (err) {
      if (err?.code === 2 || err?.message?.includes("cancelled") || err?.message?.includes("declined")) {
        toast.error("Transaction cancelled.");
      } else {
        toast.error(err?.message || "Transaction failed. Please try again.");
        console.error("Wallet pay error:", err);
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