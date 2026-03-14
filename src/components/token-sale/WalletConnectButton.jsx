import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Wallet, ChevronDown, Copy, LogOut } from "lucide-react";

function shortAddr(addr) {
  if (!addr) return "";
  return addr.slice(0, 12) + "…" + addr.slice(-6);
}

export default function WalletConnectButton({ onConnect, onDisconnect, connectedAddress }) {
  const [open, setOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const availableWallets = () => {
    const w = window.cardano || {};
    return Object.keys(w).filter(k => w[k]?.enable && w[k]?.name);
  };

  const connect = async (walletKey) => {
    setConnecting(true);
    setError(null);
    try {
      const api = await window.cardano[walletKey].enable();
      const addrs = await api.getUsedAddresses();
      const addr = addrs[0] || (await api.getUnusedAddresses())[0];
      if (!addr) throw new Error("No address found");
      onConnect(addr, api);
      setOpen(false);
    } catch (e) {
      setError(e.message || "Connection failed");
    } finally {
      setConnecting(false);
    }
  };

  if (connectedAddress) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(v => !v)}
          className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 rounded-xl px-4 py-2.5 text-emerald-300 text-sm hover:bg-emerald-500/20 transition-colors w-full"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-mono flex-1 text-left">{shortAddr(connectedAddress)}</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
        {showDropdown && (
          <div className="absolute top-full mt-1 right-0 bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-50 w-full min-w-[200px]">
            <button
              onClick={() => { navigator.clipboard.writeText(connectedAddress); setShowDropdown(false); }}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 w-full rounded-t-xl"
            >
              <Copy className="w-3.5 h-3.5" /> Copy Address
            </button>
            <button
              onClick={() => { onDisconnect(); setShowDropdown(false); }}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 w-full rounded-b-xl"
            >
              <LogOut className="w-3.5 h-3.5" /> Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  const wallets = availableWallets();

  if (open) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
        <p className="text-white/50 text-xs uppercase tracking-widest mb-3">Select Wallet</p>
        {wallets.length === 0 ? (
          <div className="text-white/60 text-sm text-center py-4">
            No Cardano wallets detected.<br />
            <span className="text-white/40 text-xs">Install Eternl, Nami, or Lace to continue.</span>
          </div>
        ) : wallets.map(key => {
          const w = window.cardano[key];
          return (
            <button key={key} onClick={() => connect(key)} disabled={connecting}
              className="flex items-center gap-3 w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white text-sm transition-colors disabled:opacity-50">
              {w.icon && <img src={w.icon} className="w-6 h-6 rounded" alt={w.name} />}
              <span className="capitalize">{w.name}</span>
            </button>
          );
        })}
        {error && <p className="text-red-400 text-xs text-center pt-1">{error}</p>}
        <button onClick={() => setOpen(false)} className="text-white/30 text-xs hover:text-white/50 w-full text-center pt-1">
          Cancel
        </button>
      </div>
    );
  }

  return (
    <Button onClick={() => setOpen(true)}
      variant="outline"
      className="w-full border-white/20 text-white bg-white/5 hover:bg-white/10 gap-2">
      <Wallet className="w-4 h-4" />
      Connect Wallet
    </Button>
  );
}