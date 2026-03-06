import React, { useState, useEffect, useRef } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

export default function WalletPayButton({ connectedWallet, sessionData, paymentLink, payerEmail, payerName, payerDiscordUsername, onSuccess }) {
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
    // Use lovelace directly, fallback to ada conversion
    const merchantLovelace = String(
      sessionData.merchant_amount_lovelace > 0
        ? sessionData.merchant_amount_lovelace
        : Math.floor((sessionData.merchant_amount_ada || 0) * 1_000_000)
    );
    const platformFeeLovelace = String(
      sessionData.platform_fee_lovelace > 0
        ? sessionData.platform_fee_lovelace
        : Math.floor((sessionData.platform_fee_ada || 0) * 1_000_000)
    );

    console.log("[PayButton] merchantLovelace:", merchantLovelace, "feeLovelace:", platformFeeLovelace, "totalAda:", sessionData?.amount_total_ada);
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
        payerEmail: payerEmail || null,
        payerName: payerName || null,
        payerDiscordUsername: payerDiscordUsername || null,
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

    // Step 2: Re-enable wallet fresh right before signing
    let api;
    try {
      api = await window.cardano[walletId].enable();
      const networkId = await api.getNetworkId();
      console.log("Wallet network:", networkId === 1 ? "Mainnet ✅" : `Testnet ⚠️ (ID: ${networkId})`);
    } catch (err) {
      toast.error("Could not connect to wallet. Please ensure your wallet extension is open.");
      setTxLoading(false);
      setTxStatus(null);
      return;
    }

    // Step 3: Sign
    toast.info("Please confirm the transaction in your wallet…", { duration: 60000, id: "wallet-sign" });
    setTxStatus('signing');

    // Step 3: Sign — ask only for witness set (false = don't return full tx)
    let witnessSetHex;
    try {
      witnessSetHex = await api.signTx(txCbor, true);
      console.log("Witness set received:", witnessSetHex?.slice(0, 20));
    } catch (signErr) {
      toast.dismiss("wallet-sign");
      if (signErr?.code === 2 || signErr?.info?.includes("cancelled") || signErr?.info?.includes("declined")) {
        toast.error("Transaction cancelled.");
      } else {
        toast.error("Wallet signing failed: " + (signErr?.info || signErr?.message || "Unknown"));
      }
      setTxLoading(false);
      setTxStatus(null);
      return;
    }
    toast.dismiss("wallet-sign");
    setTxStatus('submitting');

    // Assemble full signed tx: [txBody, witnessSet, true, null]
    // txCbor from backend is already: 84 <txBody> a0 f5 f6
    // We need to replace the empty witness set (a0) with the real one from the wallet.
    // Strategy: decode txCbor to extract txBody bytes, then re-assemble with real witnessSet.
    function hexToBytes2(hex) {
      return Uint8Array.from(hex.match(/.{1,2}/g).map(b => parseInt(b, 16)));
    }
    function bytesToHex2(bytes) {
      return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
    }

    // txCbor = 84 [txBody] [witnessSet] f5 f6
    // Parse: skip 0x84 array header, extract txBody bytes, then append real witnessSet
    const unsignedTxBytes = hexToBytes2(txCbor);
    const witnessBytes = hexToBytes2(witnessSetHex);

    // Find txBody: bytes 1 onwards until we hit the witness set marker
    // The txBody starts right after 0x84. We need to find its length.
    // txBody is a CBOR map starting with a4/a5/... — we read its length by finding the witness set
    // Simplest: the backend builds: [0x84, ...cborBytes, 0xa0, 0xf5, 0xf6]
    // So unsignedTxBytes = [0x84, txBodyBytes..., 0xa0, 0xf5, 0xf6]
    // We find 0xa0 0xf5 0xf6 at the end to get txBody length
    const txBodyBytes = unsignedTxBytes.slice(1, unsignedTxBytes.length - 3); // strip 0x84 header and a0 f5 f6

    // Re-assemble: 0x84 array(4) header + txBody + witnessSet + 0xf5 (true) + 0xf6 (null)
    const assembled = new Uint8Array([0x84, ...txBodyBytes, ...witnessBytes, 0xf5, 0xf6]);
    const normalizedSignedTx = bytesToHex2(assembled);
    console.log("Assembled signed tx preview:", normalizedSignedTx.slice(0, 20));

    // Step 4: Submit via wallet (CIP-30), fallback to backend
    try {
      let txHash;
      try {
        txHash = await api.submitTx(normalizedSignedTx);
        console.log("TX HASH (wallet submit):", txHash);
      } catch (walletSubmitErr) {
        console.warn("Wallet submitTx failed, trying backend:", walletSubmitErr?.info || walletSubmitErr?.message);
        const submitRes = await base44.functions.invoke('submitSignedTx', {
          signedTxCbor: normalizedSignedTx,
        });
        if (!submitRes?.data?.success) {
          throw new Error(submitRes?.data?.error || "Failed to submit transaction");
        }
        txHash = submitRes.data.txHash;
        console.log("TX HASH (backend submit):", txHash);
      }
      toast.success("Transaction submitted! Waiting for confirmation…");
      // Record wallet payment with payer info (fire-and-forget)
      base44.functions.invoke('recordWalletPayment', {
        txHash,
        paymentLinkId: paymentLink.id,
        merchantId: paymentLink.merchant_id,
        payerAddress: walletAddress,
        payerEmail: payerEmail || null,
        payerName: payerName || null,
        payerDiscordUsername: payerDiscordUsername || null,
      }).catch(() => {});
      onSuccess?.(txHash);
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