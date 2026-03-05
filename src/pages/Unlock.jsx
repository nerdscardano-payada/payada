import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  CheckCircle2, XCircle, Loader2, Unlock, Lock,
  ExternalLink, Hexagon, Download, Link2, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnlockPage() {
  const params = new URLSearchParams(window.location.search);
  const txHash = params.get("tx");
  const linkId = params.get("link");

  const [status, setStatus] = useState("loading"); // loading | unlocked | not_found | pending
  const [payment, setPayment] = useState(null);
  const [paymentLink, setPaymentLink] = useState(null);

  useEffect(() => {
    if (!txHash && !linkId) { setStatus("not_found"); return; }

    const filter = {};
    if (txHash) filter.tx_hash = txHash;
    if (linkId) filter.payment_link_id = linkId;

    base44.entities.Payment.filter({ ...filter, status: "confirmed" }, "-confirmed_at", 1)
      .then(async (res) => {
        if (res && res.length > 0) {
          setPayment(res[0]);
          // Also load the payment link for unlock_url/success_redirect_url
          if (res[0].payment_link_id) {
            const links = await base44.entities.PaymentLink.filter({ id: res[0].payment_link_id }, "-created_date", 1).catch(() => []);
            if (links.length > 0) setPaymentLink(links[0]);
          }
          setStatus("unlocked");
        } else {
          // Check if it exists but is pending
          const anyFilter = {};
          if (txHash) anyFilter.tx_hash = txHash;
          const anyPayment = await base44.entities.Payment.filter(anyFilter, "-created_date", 1).catch(() => []);
          setStatus(anyPayment.length > 0 ? "pending" : "not_found");
        }
      })
      .catch(() => setStatus("not_found"));
  }, [txHash, linkId]);

  const unlockUrl = paymentLink?.success_redirect_url;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center mx-auto mb-4">
            <Hexagon className="w-6 h-6 text-white" />
          </div>
          <p className="text-xs text-slate-500 uppercase tracking-widest">PayADA · Access Unlock</p>
        </div>

        {status === "loading" && (
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-12 flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
            <p className="text-slate-400 text-sm">Verifying payment…</p>
          </div>
        )}

        {status === "unlocked" && (
          <div className="space-y-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <Unlock className="w-8 h-8 text-emerald-400" />
              </div>
              <h1 className="text-xl font-bold text-white mb-2">Access Granted!</h1>
              <p className="text-slate-400 text-sm">
                Your payment of <span className="text-white font-semibold">
                  ₳ {(payment?.received_amount_ada || payment?.expected_amount_ada)?.toFixed(2)}
                </span> has been confirmed.
              </p>
            </div>

            {/* Product info */}
            {paymentLink && (
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
                <h2 className="font-semibold text-white text-sm mb-1">{paymentLink.title}</h2>
                {paymentLink.description && (
                  <p className="text-slate-400 text-xs">{paymentLink.description}</p>
                )}
              </div>
            )}

            {/* Unlock actions */}
            <div className="space-y-3">
              {unlockUrl && (
                <a href={unlockUrl} className="block">
                  <Button className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-2">
                    <ArrowRight className="w-4 h-4" />
                    Access Content
                  </Button>
                </a>
              )}

              {txHash && (
                <a
                  href={`https://cardanoscan.io/transaction/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  View payment proof on Cardanoscan <ExternalLink className="w-3 h-3" />
                </a>
              )}

              {txHash && (
                <a
                  href={`/PaymentProof?tx=${txHash}`}
                  className="flex items-center justify-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  View full payment proof
                </a>
              )}
            </div>
          </div>
        )}

        {status === "pending" && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            </div>
            <h1 className="text-xl font-bold text-white">Payment Pending</h1>
            <p className="text-slate-400 text-sm">
              Your transaction was detected but is still awaiting blockchain confirmation.
              This usually takes 1–2 minutes. Please refresh this page shortly.
            </p>
            <Button
              variant="outline"
              className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
              onClick={() => window.location.reload()}
            >
              Refresh
            </Button>
          </div>
        )}

        {status === "not_found" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8 text-slate-500" />
            </div>
            <h1 className="text-xl font-bold text-white">Access Not Found</h1>
            <p className="text-slate-400 text-sm">
              No confirmed payment was found for this link. Make sure you completed a successful payment first.
            </p>
          </div>
        )}

        <p className="text-center text-[11px] text-slate-600">
          Powered by PayADA.io · Cardano Payment Infrastructure
        </p>
      </div>
    </div>
  );
}