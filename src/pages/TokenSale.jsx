import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Clock, TrendingUp, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function Countdown({ endTime }) {
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endTime) - new Date();
      if (diff <= 0) return setTimeLeft({ ended: true });
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [endTime]);

  if (timeLeft.ended) return <span className="text-red-400 text-sm">Sale ended</span>;

  const pad = (n) => String(n ?? 0).padStart(2, "0");
  return (
    <div className="flex items-center gap-1 text-white font-mono text-2xl font-bold">
      {[pad(timeLeft.days), pad(timeLeft.hours), pad(timeLeft.minutes), pad(timeLeft.seconds)].map((v, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="text-white/40 text-xl">:</span>}
          <div className="bg-white/10 rounded-lg px-2 py-1 min-w-[48px] text-center">{v}</div>
        </React.Fragment>
      ))}
    </div>
  );
}

export default function TokenSale() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  const [adaAmount, setAdaAmount] = useState("");

  const { data: sales = [], isLoading } = useQuery({
    queryKey: ["token-sale-public", slug],
    queryFn: () => base44.entities.TokenSale.filter({ slug }),
    enabled: !!slug,
  });

  const sale = sales[0];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Sale not found</h1>
          <p className="text-white/50">This token sale does not exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const progressPct = sale.max_raise_ada ? Math.min(100, ((sale.total_raised_ada || 0) / sale.max_raise_ada) * 100) : 0;
  const tokensOut = adaAmount && sale.token_price_ada ? Math.floor(parseFloat(adaAmount) / sale.token_price_ada).toLocaleString() : "—";
  const isActive = sale.status === "active";

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero */}
      <div className="bg-gradient-to-b from-blue-950 to-slate-950 border-b border-white/5 py-12 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-sm text-white/70">
            <span className={`w-2 h-2 rounded-full ${isActive ? "bg-emerald-400 animate-pulse" : "bg-slate-400"}`} />
            {isActive ? "Sale Live" : sale.status === "ended" ? "Sale Ended" : sale.status === "paused" ? "Sale Paused" : "Coming Soon"}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold">{sale.title}</h1>
          {sale.description && (
            <p className="text-white/60 max-w-xl mx-auto leading-relaxed text-sm sm:text-base">{sale.description}</p>
          )}
          {sale.website_url && (
            <a href={sale.website_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 text-sm transition-colors">
              <ExternalLink className="w-3.5 h-3.5" />
              Visit Website
            </a>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
            <p className="text-white/50 text-xs mb-1 uppercase tracking-widest">Max Raise</p>
            <p className="text-2xl font-bold">₳{(sale.max_raise_ada || 0).toLocaleString()}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
            <p className="text-white/50 text-xs mb-1 uppercase tracking-widest">Total Raised</p>
            <p className="text-2xl font-bold text-cyan-400">₳{(sale.total_raised_ada || 0).toLocaleString()}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
            <p className="text-white/50 text-xs mb-1 uppercase tracking-widest">Token Price</p>
            <p className="text-2xl font-bold">₳{sale.token_price_ada}</p>
            <p className="text-white/40 text-xs">per {sale.token_ticker}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
          <div className="flex justify-between text-sm text-white/60">
            <span>₳{(sale.total_raised_ada || 0).toLocaleString()} raised</span>
            <span>{progressPct.toFixed(1)}% of ₳{(sale.max_raise_ada || 0).toLocaleString()}</span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
          </div>
          {sale.accepted_currencies?.length > 0 && (
            <p className="text-white/40 text-xs">Accepted: {sale.accepted_currencies.join(" · ")}</p>
          )}
        </div>

        {/* Countdown */}
        {sale.end_time && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
            <p className="text-white/50 text-xs uppercase tracking-widest">Ends In</p>
            <Countdown endTime={sale.end_time} />
          </div>
        )}

        {/* Purchase box */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-lg">Purchase {sale.token_ticker}</h2>
          {sale.min_buy_ada && (
            <p className="text-white/50 text-sm">Minimum: ₳{sale.min_buy_ada}</p>
          )}
          <div className="space-y-2">
            <label className="text-sm text-white/60">Amount (ADA)</label>
            <Input
              type="number"
              value={adaAmount}
              onChange={e => setAdaAmount(e.target.value)}
              placeholder={`Min ₳${sale.min_buy_ada || 50}`}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/30 text-lg h-12"
            />
          </div>
          {adaAmount && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-1">
              <p className="text-sm text-white/60">Purchase Summary</p>
              <p className="font-semibold">Buying {tokensOut} {sale.token_ticker} for ₳{parseFloat(adaAmount).toLocaleString()} ADA</p>
            </div>
          )}
          <Button
            disabled={!isActive}
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40"
          >
            {isActive ? `Purchase ${sale.token_ticker}` : "Sale not active"}
          </Button>
          {!isActive && (
            <div className="flex items-center gap-2 text-amber-400 text-sm bg-amber-400/10 border border-amber-400/20 rounded-lg p-3">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              This sale is currently <strong>{sale.status}</strong>. Wallet connect will be enabled when the sale goes live.
            </div>
          )}
          <p className="text-xs text-white/30 text-center">Policy ID: {sale.token_policy_id?.slice(0, 30)}...</p>
        </div>
      </div>
    </div>
  );
}