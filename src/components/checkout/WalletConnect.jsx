import React, { useState, useEffect } from "react";
import { Wallet, ChevronDown, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Known wallets with fallback icons
const KNOWN_WALLETS = [
  { id: "nami", name: "Nami" },
  { id: "eternl", name: "Eternl" },
  { id: "flint", name: "Flint" },
  { id: "lace", name: "Lace" },
  { id: "typhon", name: "Typhon" },
  { id: "gerowallet", name: "GeroWallet" },
  { id: "yoroi", name: "Yoroi" },
];

export default function WalletConnect({ onConnected, onDisconnected }) {
  const [installedWallets, setInstalledWallets] = useState([]);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [walletName, setWalletName] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [error, setError] = useState(null);
  const [walletInstance, setWalletInstance] = useState(null);

  useEffect(() => {
    // Delay to allow browser extensions to inject window.cardano
    const timer = setTimeout(() => detectWallets(), 500);
    return () => clearTimeout(timer);
  }, []);

  const detectWallets = () => {
    if (typeof window === "undefined") return;
    const found = [];
    KNOWN_WALLETS.forEach(({ id, name }) => {
      if (window.cardano?.[id]) {
        found.push({
          id,
          name,
          icon: window.cardano[id].icon || null,
        });
      }
    });
    setInstalledWallets(found);
  };

  const connectWallet = async (walletId) => {
    setConnecting(true);
    setError(null);
    setShowPicker(false);
    try {
      const api = await window.cardano[walletId].enable();
      
      // Get address (CIP-30 returns hex-encoded CBOR)
      const changeAddr = await api.getChangeAddress();
      const address = changeAddr; // hex CBOR — backend will convert to bech32

      // Get balance in lovelace
      const balanceCbor = await api.getBalance();
      // balanceCbor is a CBOR-encoded value; try to parse lovelace naively
      let lovelace = 0;
      try {
        // Simple: if it's a plain number string in CBOR, parse it
        // Most wallets return a hex-encoded CBOR integer for ADA-only balances
        const balHex = balanceCbor;
        // Attempt hex decode for simple integer
        const num = parseInt(balHex, 16);
        if (!isNaN(num) && num > 0) lovelace = num;
      } catch {}

      const adaBalance = lovelace / 1_000_000;

      setWalletInstance({ api, walletId });
      setWalletName(walletId.charAt(0).toUpperCase() + walletId.slice(1));
      setWalletAddress(address);
      setWalletBalance(adaBalance > 0 ? adaBalance : null);
      setConnected(true);

      onConnected?.({ api, walletId, address, lovelace });
    } catch (err) {
      setError(err?.message || "Failed to connect wallet");
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = () => {
    setConnected(false);
    setWalletInstance(null);
    setWalletName(null);
    setWalletAddress(null);
    setWalletBalance(null);
    onDisconnected?.();
  };

  const shortAddress = (addr) => {
    if (!addr) return "";
    if (addr.length <= 20) return addr;
    return addr.slice(0, 10) + "…" + addr.slice(-8);
  };

  if (connected) {
    return (
      <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/25 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-emerald-400">{walletName} connected</p>
            <p className="text-[10px] text-slate-400 font-mono">{shortAddress(walletAddress)}</p>
            {walletBalance !== null && (
              <p className="text-[10px] text-slate-500">Balance: ₳ {walletBalance.toFixed(2)}</p>
            )}
          </div>
        </div>
        <button onClick={disconnect} className="text-[10px] text-slate-500 hover:text-red-400 transition-colors underline">
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {installedWallets.length === 0 ? (
        <div className="text-center py-4 px-3 bg-slate-800/50 rounded-xl border border-slate-700">
          <Wallet className="w-5 h-5 text-slate-500 mx-auto mb-1.5" />
          <p className="text-xs text-slate-400">No Cardano wallet detected.</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Install{" "}
            <a href="https://namiwallet.io" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Nami</a>,{" "}
            <a href="https://eternl.io" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Eternl</a>, or{" "}
            <a href="https://www.lace.io" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Lace</a>
          </p>
        </div>
      ) : (
        <>
          <Button
            variant="outline"
            className="w-full border-slate-700 text-slate-300 hover:text-white hover:border-indigo-500 gap-2 justify-between"
            onClick={() => setShowPicker((p) => !p)}
            disabled={connecting}
          >
            <div className="flex items-center gap-2">
              {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
              {connecting ? "Connecting…" : "Connect Wallet"}
            </div>
            <ChevronDown className="w-3.5 h-3.5 opacity-50" />
          </Button>

          {showPicker && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
              {installedWallets.map((w) => (
                <button
                  key={w.id}
                  onClick={() => connectWallet(w.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700 transition-colors text-left"
                >
                  {w.icon ? (
                    <img src={w.icon} alt={w.name} className="w-6 h-6 rounded" />
                  ) : (
                    <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">
                      {w.name[0]}
                    </div>
                  )}
                  <span className="text-sm text-white font-medium">{w.name}</span>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {error && (
        <div className="mt-2 flex items-center gap-2 text-red-400 text-xs">
          <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}