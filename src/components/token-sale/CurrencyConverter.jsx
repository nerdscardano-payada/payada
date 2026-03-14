import React, { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";

export default function CurrencyConverter({ adaAmount, tokenTicker, tokenPriceAda }) {
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
      // silently fail — CoinGecko may rate-limit
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  if (!adaAmount || isNaN(parseFloat(adaAmount))) return null;

  const ada = parseFloat(adaAmount);
  const tokens = tokenPriceAda ? Math.floor(ada / tokenPriceAda) : 0;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-white/50 text-xs uppercase tracking-widest">Rate Preview</p>
        <button onClick={fetchRates} disabled={loading}
          className="text-white/30 hover:text-white/60 transition-colors">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-white font-semibold">{ada.toLocaleString()} ₳</p>
          <p className="text-white/40 text-xs">ADA</p>
        </div>
        {rates.usd && (
          <div>
            <p className="text-emerald-400 font-semibold">${(ada * rates.usd).toFixed(2)}</p>
            <p className="text-white/40 text-xs">USD</p>
          </div>
        )}
        {rates.eur && (
          <div>
            <p className="text-blue-400 font-semibold">€{(ada * rates.eur).toFixed(2)}</p>
            <p className="text-white/40 text-xs">EUR</p>
          </div>
        )}
      </div>
      <div className="pt-2 border-t border-white/10">
        <p className="text-white/70 text-sm text-center">
          You receive <span className="text-white font-bold">{tokens.toLocaleString()} {tokenTicker}</span>
          {rates.usd && tokenPriceAda && (
            <span className="text-white/40 text-xs ml-2">@ ${(tokenPriceAda * rates.usd).toFixed(4)}/token</span>
          )}
        </p>
      </div>
      {lastUpdated && (
        <p className="text-white/20 text-xs text-center">
          Rates updated {lastUpdated.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}