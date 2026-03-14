import React, { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";

export default function AdaRatePreview({ adaAmount }) {
  const [rates, setRates] = useState({ usd: null, eur: null });
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=cardano&vs_currencies=usd,eur");
      const data = await res.json();
      setRates({ usd: data?.cardano?.usd, eur: data?.cardano?.eur });
      setLastUpdated(new Date());
    } catch (_) {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const ada = parseFloat(adaAmount);
  if (!adaAmount || isNaN(ada) || ada <= 0) return null;
  if (!rates.usd && !rates.eur) return null;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-white/50 text-xs uppercase tracking-widest">Rate Preview</p>
        <button onClick={fetchRates} disabled={loading} className="text-white/30 hover:text-white/60 transition-colors">
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>
      <div className="flex items-center justify-center gap-6 text-center">
        <div>
          <p className="text-white font-semibold text-sm">{ada.toLocaleString()} ₳</p>
          <p className="text-white/40 text-xs">ADA</p>
        </div>
        {rates.usd && (
          <div>
            <p className="text-emerald-400 font-semibold text-sm">${(ada * rates.usd).toFixed(2)}</p>
            <p className="text-white/40 text-xs">USD</p>
          </div>
        )}
        {rates.eur && (
          <div>
            <p className="text-blue-400 font-semibold text-sm">€{(ada * rates.eur).toFixed(2)}</p>
            <p className="text-white/40 text-xs">EUR</p>
          </div>
        )}
      </div>
      {lastUpdated && (
        <p className="text-white/20 text-xs text-center">Updated {lastUpdated.toLocaleTimeString()}</p>
      )}
    </div>
  );
}