import React from "react";
import { CheckCircle2, Copy, ExternalLink, Link2, Share2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function InstantLinkSuccess({ linkUrl, amount, description, onCopy, onCreateAnother, onClaimDashboard, onShareX }) {
  return (
    <Card className="border-emerald-200 bg-white shadow-xl shadow-emerald-100/40">
      <div className="px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-700">Your payment link is ready</p>
            <h3 className="text-2xl font-bold text-slate-900">Share it now</h3>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-start gap-3">
            <Link2 className="mt-0.5 h-4 w-4 text-slate-400" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Live link</p>
              <p className="mt-1 break-all text-sm font-medium text-slate-900">{linkUrl}</p>
            </div>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl bg-white px-3 py-2 text-sm text-slate-600">
              <span className="text-slate-400">Amount:</span> ₳ {amount.toFixed(2)}
            </div>
            <div className="rounded-xl bg-white px-3 py-2 text-sm text-slate-600">
              <span className="text-slate-400">Description:</span> {description || "Test payment"}
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Button onClick={onCopy} className="gap-2 bg-slate-950 text-white hover:bg-slate-800">
            <Copy className="h-4 w-4" />
            Copy link
          </Button>
          <Button onClick={onShareX} variant="outline" className="gap-2">
            <Share2 className="h-4 w-4" />
            Post on X
          </Button>
          <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="block">
            <Button variant="outline" className="w-full gap-2">
              <ExternalLink className="h-4 w-4" />
              Open link
            </Button>
          </a>
          <Button variant="outline" onClick={onCreateAnother}>Create another</Button>
        </div>

        <div className="mt-6 flex flex-col items-start justify-between gap-3 rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold text-slate-900">Want to track payments and manage links?</p>
            <p className="text-sm text-slate-600">Claim your dashboard after your first success.</p>
          </div>
          <Button onClick={onClaimDashboard} className="bg-cyan-500 text-white hover:bg-cyan-600">
            Claim dashboard
          </Button>
        </div>
      </div>
    </Card>
  );
}