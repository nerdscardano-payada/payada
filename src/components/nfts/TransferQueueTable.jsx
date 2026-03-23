import React from "react";
import { Button } from "@/components/ui/button";
import { PenSquare } from "lucide-react";

export default function TransferQueueTable({ logs, signingId, onSign, fulfillmentMode = "manual" }) {
  const isManual = fulfillmentMode !== "automatic";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5">
        <h2 className="text-lg font-semibold text-slate-900">Transfer queue</h2>
        <p className="mt-1 text-sm text-slate-500">{isManual ? "Pending deliveries wait here for manual wallet signing." : "Confirmed payments are tracked here and sent automatically from the hot wallet."}</p>
      </div>
      <div className="divide-y divide-slate-100">
        {logs.length === 0 ? (
          <div className="p-5 text-sm text-slate-500">No NFT transfer requests yet.</div>
        ) : logs.map((log) => (
          <div key={log.id} className="p-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-slate-900">{log.policy_id.slice(0, 10)}… / qty {log.quantity || 1}</p>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${log.status === "pending" ? "bg-amber-100 text-amber-700" : log.status === "submitted" ? "bg-blue-100 text-blue-700" : log.status === "failed" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"}`}>{log.status}</span>
              </div>
              <p className="mt-1 text-xs font-mono text-slate-500">{log.recipient_address}</p>
              {log.error_message && <p className="mt-2 text-sm text-red-600">{log.error_message}</p>}
            </div>
            {isManual && log.status === "pending" && (
              <Button onClick={() => onSign(log)} disabled={signingId === log.id}>
                <PenSquare className="mr-2 h-4 w-4" />
                {signingId === log.id ? "Signing..." : "Sign & send"}
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}