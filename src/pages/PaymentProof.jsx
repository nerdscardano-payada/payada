import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  CheckCircle2, XCircle, Loader2, ExternalLink,
  Hexagon, Shield, Clock, Hash, Wallet, Building2
} from "lucide-react";
import { format } from "date-fns";

export default function PaymentProof() {
  const params = new URLSearchParams(window.location.search);
  const txHash = params.get("tx");

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!txHash) { setLoading(false); setNotFound(true); return; }
    base44.entities.Payment.filter({ tx_hash: txHash }, "-created_date", 1)
      .then((res) => {
        if (res && res.length > 0) {
          setPayment(res[0]);
        } else {
          setNotFound(true);
        }
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [txHash]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (notFound || !payment) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 p-6">
        <XCircle className="w-16 h-16 text-red-400" />
        <h1 className="text-xl font-bold text-white">Payment Not Found</h1>
        <p className="text-slate-400 text-sm text-center max-w-sm">
          No payment record found for this transaction hash. It may not have been processed through PayADA.
        </p>
        {txHash && (
          <a
            href={`https://cardanoscan.io/transaction/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-indigo-400 text-xs hover:underline font-mono"
          >
            View on Cardanoscan <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    );
  }

  const isConfirmed = payment.status === "confirmed";
  const amount = payment.received_amount_ada || payment.expected_amount_ada;
  const timestamp = payment.confirmed_at || payment.detected_at || payment.created_date;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center mx-auto mb-4">
            <Hexagon className="w-6 h-6 text-white" />
          </div>
          <p className="text-xs text-slate-500 uppercase tracking-widest">PayADA · Payment Proof</p>
        </div>

        {/* Status banner */}
        <div className={`rounded-2xl p-6 text-center border ${
          isConfirmed
            ? "bg-emerald-500/10 border-emerald-500/20"
            : "bg-amber-500/10 border-amber-500/20"
        }`}>
          {isConfirmed ? (
            <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto mb-3" />
          ) : (
            <Clock className="w-14 h-14 text-amber-400 mx-auto mb-3" />
          )}
          <p className={`text-lg font-bold ${isConfirmed ? "text-emerald-300" : "text-amber-300"}`}>
            {isConfirmed ? "Payment Verified ✓" : "Payment Pending"}
          </p>
          <p className="text-slate-400 text-sm mt-1">
            {isConfirmed
              ? "This transaction has been confirmed on the Cardano blockchain."
              : "This transaction is awaiting blockchain confirmation."}
          </p>
        </div>

        {/* Details card */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 divide-y divide-slate-800">
          <ProofRow
            icon={<Shield className="w-4 h-4 text-slate-400" />}
            label="Amount"
            value={`₳ ${amount?.toFixed(6)}`}
            valueClass="text-white font-bold text-base"
          />
          <ProofRow
            icon={<Building2 className="w-4 h-4 text-slate-400" />}
            label="Merchant"
            value={payment.merchant_id}
            mono
          />
          {payment.payer_address && (
            <ProofRow
              icon={<Wallet className="w-4 h-4 text-slate-400" />}
              label="Payer Wallet"
              value={`${payment.payer_address.slice(0, 20)}…${payment.payer_address.slice(-8)}`}
              mono
            />
          )}
          <ProofRow
            icon={<Hash className="w-4 h-4 text-slate-400" />}
            label="Transaction"
            value={`${payment.tx_hash?.slice(0, 18)}…${payment.tx_hash?.slice(-8)}`}
            mono
          />
          {timestamp && (
            <ProofRow
              icon={<Clock className="w-4 h-4 text-slate-400" />}
              label="Timestamp"
              value={format(new Date(timestamp), "PPpp")}
            />
          )}
        </div>

        {/* Explorer links */}
        {payment.tx_hash && (
          <div className="flex flex-col gap-2">
            <a
              href={`https://cardanoscan.io/transaction/${payment.tx_hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 bg-slate-900 border border-slate-800 rounded-xl py-3 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View on Cardanoscan
            </a>
            <a
              href={`https://cexplorer.io/tx/${payment.tx_hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-slate-300 bg-slate-900 border border-slate-800 rounded-xl py-3 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View on Cexplorer
            </a>
          </div>
        )}

        <p className="text-center text-[11px] text-slate-600">
          Powered by PayADA.io · Cardano Payment Infrastructure
        </p>
      </div>
    </div>
  );
}

function ProofRow({ icon, label, value, mono, valueClass }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div className="flex items-center gap-2 text-slate-400 text-xs min-w-0 flex-shrink-0">
        {icon}
        {label}
      </div>
      <span className={`text-right text-sm truncate ${mono ? "font-mono text-slate-300" : "text-slate-200"} ${valueClass || ""}`}>
        {value}
      </span>
    </div>
  );
}