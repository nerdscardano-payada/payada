import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Wallet, ChevronDown, Copy, LogOut, RefreshCw, ExternalLink } from "lucide-react";

function shortAddr(addr) {
  if (!addr) return "";
  return addr.slice(0, 12) + "…" + addr.slice(-6);
}

// Convert hex address (CIP-30) to bech32 addr1... format
function hexAddrToBech32(hex) {
  try {
    const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
    const GENERATOR = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
    function polymod(values) {
      let chk = 1;
      for (const v of values) {
        const b = chk >> 25;
        chk = ((chk & 0x1ffffff) << 5) ^ v;
        for (let i = 0; i < 5; i++) if ((b >> i) & 1) chk ^= GENERATOR[i];
      }
      return chk;
    }
    function hrpExpand(hrp) {
      const ret = [];
      for (const c of hrp) ret.push(c.charCodeAt(0) >> 5);
      ret.push(0);
      for (const c of hrp) ret.push(c.charCodeAt(0) & 31);
      return ret;
    }
    function createChecksum(hrp, data) {
      const values = hrpExpand(hrp).concat(data).concat([0,0,0,0,0,0]);
      const mod = polymod(values) ^ 1;
      return Array.from({length: 6}, (_, p) => (mod >> (5 * (5 - p))) & 31);
    }
    function encode(hrp, data) {
      return hrp + '1' + data.concat(createChecksum(hrp, data)).map(d => CHARSET[d]).join('');
    }
    function convertbits(data, frombits, tobits) {
      let acc = 0, bits = 0;
      const ret = [], maxv = (1 << tobits) - 1;
      for (const value of data) {
        acc = (acc << frombits) | value;
        bits += frombits;
        while (bits >= tobits) { bits -= tobits; ret.push((acc >> bits) & maxv); }
      }
      if (bits > 0) ret.push((acc << (tobits - bits)) & maxv);
      return ret;
    }
    // If already bech32 (starts with addr), return as-is
    if (hex.startsWith('addr')) return hex;
    const bytes = Array.from(hex.match(/.{1,2}/g).map(b => parseInt(b, 16)));
    const networkId = bytes[0] & 0x0f;
    const hrp = networkId === 0 ? 'addr_test' : 'addr';
    return encode(hrp, convertbits(bytes, 8, 5));
  } catch {
    return hex; // fallback to original if conversion fails
  }
}

export default function WalletConnectButton({ onConnect, onDisconnect, connectedAddress, requiredAddress = null, persistKey = null }) {
  const [open, setOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [wallets, setWallets] = useState([]);

  const matchesRequiredAddress = (address) => !requiredAddress || (address || "").toLowerCase() === requiredAddress.toLowerCase();

  const clearSavedConnection = () => {
    if (persistKey) localStorage.removeItem(persistKey);
  };

  const scanWallets = () => {
    const w = window.cardano || {};
    const detected = Object.keys(w).filter(k => w[k]?.enable && (w[k]?.name || w[k]?.icon));
    setWallets(detected);
    return detected;
  };

  useEffect(() => {
    const runScan = () => scanWallets();
    runScan();
    const timeout = setTimeout(runScan, 600);
    window.addEventListener("focus", runScan);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("focus", runScan);
    };
  }, []);

  const connect = async (walletKey) => {
    setConnecting(true);
    setError(null);
    try {
      const api = await window.cardano[walletKey].enable();
      const addrs = await api.getUsedAddresses();
      const hexAddr = addrs[0] || (await api.getUnusedAddresses())[0];
      if (!hexAddr) throw new Error("No address found");
      const addr = hexAddrToBech32(hexAddr);
      if (!matchesRequiredAddress(addr)) {
        clearSavedConnection();
        throw new Error("Deze wallet komt niet overeen met de ingestelde signer wallet");
      }
      if (persistKey) {
        localStorage.setItem(persistKey, JSON.stringify({ walletKey, address: addr }));
      }
      onConnect(addr, api, walletKey);
      setOpen(false);
    } catch (e) {
      setError(e.message || "Connection failed");
    } finally {
      setConnecting(false);
    }
  };

  useEffect(() => {
    if (!persistKey || connectedAddress || wallets.length === 0) return;

    const savedRaw = localStorage.getItem(persistKey);
    if (!savedRaw) return;

    try {
      const saved = JSON.parse(savedRaw);
      if (!saved?.walletKey || !saved?.address) {
        clearSavedConnection();
        return;
      }
      if (!matchesRequiredAddress(saved.address) || !window.cardano?.[saved.walletKey]?.enable) {
        clearSavedConnection();
        return;
      }
      connect(saved.walletKey);
    } catch {
      clearSavedConnection();
    }
  }, [persistKey, connectedAddress, wallets.length, requiredAddress]);

  useEffect(() => {
    if (!connectedAddress || matchesRequiredAddress(connectedAddress)) return;
    clearSavedConnection();
    onDisconnect?.();
  }, [connectedAddress, requiredAddress]);

  const handleDisconnect = () => {
    clearSavedConnection();
    onDisconnect?.();
    setShowDropdown(false);
  };

  if (connectedAddress) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(v => !v)}
          className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-900 hover:bg-emerald-100 transition-colors w-full"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-mono flex-1 text-left">{shortAddr(connectedAddress)}</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
        {showDropdown && (
          <div className="absolute top-full mt-1 right-0 z-50 w-full min-w-[200px] rounded-xl border border-slate-200 bg-white shadow-xl">
            <button
              onClick={() => { navigator.clipboard.writeText(connectedAddress); setShowDropdown(false); }}
              className="flex w-full items-center gap-2 rounded-t-xl px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              <Copy className="w-3.5 h-3.5" /> Copy Address
            </button>
            <button
              onClick={handleDisconnect}
              className="flex w-full items-center gap-2 rounded-b-xl px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-3.5 h-3.5" /> Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  const isInIframe = typeof window !== "undefined" && window.self !== window.top;

  if (open) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
        <p className="mb-3 text-xs uppercase tracking-widest text-slate-500">Select Wallet</p>
        {wallets.length === 0 ? (
          <div className="space-y-3 py-4 text-center">
            <div className="text-sm text-slate-700">
              No Cardano wallets detected.<br />
              <span className="text-xs text-slate-500">Install Eternl, Nami, or Lace to continue.</span>
            </div>
            {isInIframe && (
              <div className="rounded-xl border border-amber-300 bg-amber-100 p-3 text-left">
                <p className="text-xs font-semibold text-amber-950">Wallet extensions often do not load inside the preview iframe.</p>
                <button
                  onClick={() => window.open(window.location.href, "_blank", "noopener,noreferrer")}
                  className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-amber-950 hover:text-amber-800"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open this page in a new tab
                </button>
              </div>
            )}
            <button
              onClick={scanWallets}
              className="mx-auto inline-flex items-center gap-2 text-xs text-slate-700 hover:text-slate-900"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Scan again
            </button>
          </div>
        ) : wallets.map(key => {
          const w = window.cardano[key];
          return (
            <button key={key} onClick={() => connect(key)} disabled={connecting}
              className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 transition-colors hover:bg-slate-50 disabled:opacity-50">
              {w.icon && <img src={w.icon} className="w-6 h-6 rounded" alt={w.name} />}
              <span className="capitalize">{w.name}</span>
            </button>
          );
        })}
        {error && <p className="pt-1 text-center text-xs text-red-600">{error}</p>}
        <button onClick={() => setOpen(false)} className="w-full pt-1 text-center text-xs text-slate-500 hover:text-slate-700">
          Cancel
        </button>
      </div>
    );
  }

  return (
    <Button onClick={() => setOpen(true)}
      variant="outline"
      className="w-full gap-2 border-slate-300 bg-white text-slate-900 hover:bg-slate-50">
      <Wallet className="w-4 h-4" />
      Connect Wallet
    </Button>
  );
}