import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, ExternalLink, PenSquare } from "lucide-react";

function shortHash(value = "") {
  return value ? `${value.slice(0, 12)}…${value.slice(-8)}` : "";
}

export default function TransferQueueTable({ logs, signingId, onSign, onPrepareSign, canSign = false, fulfillmentMode = "manual", rulesById = {}, listingsByPaymentLinkId = {}, paymentsById = {} }) {
  const isManual = fulfillmentMode !== "automatic";

  const copyAddress = async (address) => {
    await navigator.clipboard.writeText(address);
    toast.success("Buyer wallet copied");
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5">
        <h2 className="text-lg font-semibold text-slate-900">Delivery queue</h2>
        <p className="mt-1 text-sm text-slate-500">
          {isManual ? "Every paid NFT order that still needs a manual transfer appears here." : "Confirmed NFT orders are tracked here while they are being sent automatically."}
        </p>
      </div>
      <div className="divide-y divide-slate-100">
        {logs.length === 0 ? (
          <div className="p-5 text-sm text-slate-500">No paid NFT orders need action right now.</div>
        ) : logs.map((log) => {
          const rule = rulesById?.[log.nft_rule_id];
          const listing = listingsByPaymentLinkId?.[log.payment_link_id];
          const payment = paymentsById?.[log.payment_id];
          const itemTitle = listing?.title || rule?.asset_label || "NFT item";
          const buyerLabel = payment?.payer_name || payment?.payer_email || "Buyer";
          const statusTone = log.status === "pending"
            ? "bg-amber-100 text-amber-700"
            : log.status === "submitted"
              ? "bg-blue-100 text-blue-700"
              : log.status === "failed"
                ? "bg-red-100 text-red-700"
                : "bg-slate-100 text-slate-600";

          return (
            <div key={log.id} className="p-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-slate-900">{itemTitle} • qty {log.quantity || 1}</p>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone}`}>{log.status}</span>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Send to buyer wallet</p>
                    <p className="mt-2 break-all font-mono text-xs text-slate-700">{log.recipient_address || "No buyer wallet saved"}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                    <p><span className="font-medium text-slate-900">Buyer:</span> {buyerLabel}</p>
                    {payment?.confirmed_at && <p className="mt-1"><span className="font-medium text-slate-900">Paid:</span> {new Date(payment.confirmed_at).toLocaleString()}</p>}
                    {log.tx_hash && (
                      <p className="mt-1 break-all"><span className="font-medium text-slate-900">Transfer tx:</span> {shortHash(log.tx_hash)}</p>
                    )}
                  </div>
                </div>

                {log.error_message && <p className="text-sm text-red-600">{log.error_message}</p>}
              </div>

              <div className="flex flex-wrap gap-2 lg:justify-end">
                {log.recipient_address && (
                  <Button type="button" variant="outline" size="sm" onClick={() => copyAddress(log.recipient_address)}>
                    <Copy className="mr-2 h-4 w-4" />Copy wallet
                  </Button>
                )}
                {log.tx_hash && (
                  <Button asChild type="button" variant="outline" size="sm">
                    <a href={`https://cardanoscan.io/transaction/${log.tx_hash}`} target="_blank" rel="noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />View tx
                    </a>
                  </Button>
                )}
                {isManual && log.status === "pending" && (
                  <Button onClick={() => onSign(log)} disabled={signingId === log.id}>
                    <PenSquare className="mr-2 h-4 w-4" />
                    {signingId === log.id ? "Signing..." : "Sign & send"}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}