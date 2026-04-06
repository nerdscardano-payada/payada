import React from "react";
import { ShieldCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminDashboardHero({ onRefresh, refreshing }) {
  return (
    <div className="rounded-3xl border border-border bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 md:p-8 text-white shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin command center
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Admin Dashboard</h1>
            <p className="mt-2 text-sm text-slate-300 md:text-base">
              Volg betalingen, homepage-links, merchants, verificaties en systeemstatus in één professioneel overzicht.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={onRefresh}
          className="h-11 rounded-xl border border-white/10 bg-white/10 px-5 text-white hover:bg-white/20"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Vernieuwen
        </Button>
      </div>
    </div>
  );
}