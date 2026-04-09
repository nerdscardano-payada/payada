import React, { useState, useEffect, useMemo } from "react";
import { Wallet, ChevronDown, Loader2, CheckCircle2, XCircle, Smartphone, Monitor, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

// Convert hex string to Bech32 (Cardano address format)
function hexToBech32(hexStr, hrp = 'addr') {
  const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
  
  // Convert hex to bytes
  const bytes = [];
  for (let i = 0; i < hexStr.length; i += 2) {
    bytes.push(parseInt(hexStr.substr(i, 2), 16));
  }
  
  // Convert 8-bit bytes to 5-bit groups
  let bits = 0, value = 0, count = 0;
  const result = [];
  
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      result.push((value >> bits) & 31);
    }
  }
  if (bits > 0) {
    result.push((value << (5 - bits)) & 31);
  }
  
  // Calculate checksum
  const values = [...hrp.split('').map(c => c.charCodeAt(0) >> 5), 0];
  for (const c of hrp) values.push(c.charCodeAt(0) & 31);
  
  const polymod = (v) => {
    const GENERATOR = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
    let chk = 1;
    for (const x of v) {
      const b = chk >> 25;
      chk = ((chk & 0x1ffffff) << 5) ^ x;
      for (let i = 0; i < 5; i++) {
        chk ^= ((b >> i) & 1) ? GENERATOR[i] : 0;
      }
    }
    return chk;
  };
  
  const checksum = polymod([...values, ...result, 0, 0, 0, 0, 0, 0]) ^ 1;
  result.push((checksum >> 25) & 31);
  result.push((checksum >> 20) & 31);
  result.push((checksum >> 15) & 31);
  result.push((checksum >> 10) & 31);
  result.push((checksum >> 5) & 31);
  result.push(checksum & 31);
  
  return hrp + '1' + result.map(d => CHARSET[d]).join('');
}

// Known wallets with fallback icons
const KNOWN_WALLETS = [
  { id: "nami", name: "Nami" },
  { id: "eternl", name: "Eternl", mobileLabel: "Open in Eternl app", mobileUrl: (url) => `eternl://wallet/connect?url=${url}` },
  { id: "lace", name: "Lace" },
  { id: "typhon", name: "Typhon", mobileLabel: "Open in Typhon app", mobileUrl: (url) => `typhon://open?url=${url}` },
  { id: "gerowallet", name: "GeroWallet" },
  { id: "yoroi", name: "Yoroi", mobileLabel: "Open in Yoroi app", mobileUrl: (url) => `yoroi://open?url=${url}` },
  { id: "vespr", name: "Vespr", mobileLabel: "Open in Vespr app", mobileUrl: (url) => `vespr://open?url=${url}` },
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
  const [detectionMode, setDetectionMode] = useState("desktop");
  const isMobile = useMemo(() => typeof window !== "undefined" && window.innerWidth < 1024, []);

  const applyStoredWallet = () => {
    const storedAddress = localStorage.getItem("payada_connected_wallet_address");
    const storedWalletId = localStorage.getItem("payada_connected_wallet_id");
    const storedWalletName = localStorage.getItem("payada_connected_wallet_name");

    if (!storedAddress) return;

    setConnected(true);
    setWalletAddress(storedAddress);
    setWalletName(storedWalletName || (storedWalletId ? storedWalletId.charAt(0).toUpperCase() + storedWalletId.slice(1) : "Wallet"));
    setWalletInstance(storedWalletId ? { api: null, walletId: storedWalletId } : null);
    setWalletBalance(null);
    onConnected?.({ api: null, walletId: storedWalletId || null, address: storedAddress, lovelace: null });
  };

  const normalizeWalletAddress = (rawAddress) => {
    if (!rawAddress) return null;
    if (rawAddress.startsWith('addr')) return rawAddress;

    let addrHex = rawAddress;
    if (rawAddress.startsWith('58')) {
      const length = parseInt(rawAddress.slice(2, 4), 16);
      addrHex = rawAddress.slice(4, 4 + length * 2);
    }

    return hexToBech32(addrHex, 'addr');
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      detectWallets();
      applyStoredWallet();
    }, 500);

    const handleStorageSync = () => {
      applyStoredWallet();
    };

    window.addEventListener("payada-wallet-updated", handleStorageSync);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("payada-wallet-updated", handleStorageSync);
    };
  }, []);

  const getMobileWalletUrl = (walletId) => {
    if (typeof window === "undefined") return null;
    const currentUrl = encodeURIComponent(window.location.href);
    const wallet = KNOWN_WALLETS.find((item) => item.id === walletId);
    return wallet?.mobileUrl ? wallet.mobileUrl(currentUrl) : null;
  };

  const detectWallets = () => {
    if (typeof window === "undefined") return;

    const found = [];
    const knownIds = new Set(KNOWN_WALLETS.map(w => w.id));
    const cardanoProviders = window.cardano || {};
    const hasInjectedProviders = Object.keys(cardanoProviders).some((key) => cardanoProviders[key]?.enable);

    setDetectionMode(isMobile ? "mobile" : "desktop");

    KNOWN_WALLETS.forEach(({ id, name, mobileLabel }) => {
      if (cardanoProviders[id]?.enable) {
        found.push({ id, name, mobileLabel, icon: cardanoProviders[id].icon || null, available: true });
      } else if (isMobile && getMobileWalletUrl(id)) {
        found.push({ id, name, mobileLabel, icon: null, available: false, mobileFallback: true });
      }
    });

    Object.keys(cardanoProviders).forEach(key => {
      if (!knownIds.has(key) && cardanoProviders[key]?.enable) {
        const w = cardanoProviders[key];
        found.push({
          id: key,
          name: w.name || (key.charAt(0).toUpperCase() + key.slice(1)),
          icon: w.icon || null,
          available: true,
        });
      }
    });

    if (!hasInjectedProviders && isMobile) {
      setInstalledWallets(found.filter((wallet) => wallet.mobileFallback));
      return;
    }

    setInstalledWallets(found);
  };

  const connectWallet = async (walletId) => {
    setConnecting(true);
    setError(null);
    setShowPicker(false);
    try {
      if (!window.cardano?.[walletId]?.enable) {
        const mobileUrl = isMobile ? getMobileWalletUrl(walletId) : null;
        if (mobileUrl) {
          window.location.href = mobileUrl;
          return;
        }
        throw new Error("Wallet not detected on this device");
      }

      const api = await window.cardano[walletId].enable();
      
      const usedAddresses = await api.getUsedAddresses().catch(() => []);
      const changeAddr = await api.getChangeAddress().catch(() => null);
      const primaryRawAddress = usedAddresses?.[0] || changeAddr;

      console.log("🔥 Raw wallet addresses:", {
        usedCount: usedAddresses?.length || 0,
        primary: primaryRawAddress?.slice?.(0, 30) || null,
        change: changeAddr?.slice?.(0, 30) || null,
      });

      let address;
      try {
        address = normalizeWalletAddress(primaryRawAddress);
        console.log("🔥 ✅ Using wallet address:", address?.slice(0, 20) + '...');
      } catch (e) {
        console.error("🔥 ❌ Address conversion FAILED:", e.message, e);
        throw new Error('Failed to read a usable wallet address');
      }

      // Get balance in lovelace — CBOR decode
      const balanceCbor = await api.getBalance();
      let lovelace = 0;
      try {
        // CBOR hex: first byte encodes type+value
        // Major type 0 (uint): 0x00-0x1b → integer directly
        // Major type 2 (array with value [lovelace, multiasset]): 0x82 → parse first element
        const bytes = balanceCbor.match(/.{1,2}/g).map(b => parseInt(b, 16));
        const firstByte = bytes[0];
        const majorType = firstByte >> 5;
        const addInfo = firstByte & 0x1f;

        if (majorType === 0) {
          // Simple uint
          if (addInfo <= 23) lovelace = addInfo;
          else if (addInfo === 24) lovelace = bytes[1];
          else if (addInfo === 25) lovelace = (bytes[1] << 8) | bytes[2];
          else if (addInfo === 26) lovelace = ((bytes[1] << 24) | (bytes[2] << 16) | (bytes[3] << 8) | bytes[4]) >>> 0;
          else if (addInfo === 27) lovelace = Number(BigInt('0x' + bytes.slice(1, 9).map(b => b.toString(16).padStart(2,'0')).join('')));
        } else if (majorType === 4 && addInfo === 2) {
          // Array [lovelace, multiasset] — parse first element (lovelace)
          const b1 = bytes[1];
          const mt1 = b1 >> 5;
          const ai1 = b1 & 0x1f;
          if (mt1 === 0) {
            if (ai1 <= 23) lovelace = ai1;
            else if (ai1 === 24) lovelace = bytes[2];
            else if (ai1 === 25) lovelace = (bytes[2] << 8) | bytes[3];
            else if (ai1 === 26) lovelace = ((bytes[2] << 24) | (bytes[3] << 16) | (bytes[4] << 8) | bytes[5]) >>> 0;
            else if (ai1 === 27) lovelace = Number(BigInt('0x' + bytes.slice(2, 10).map(b => b.toString(16).padStart(2,'0')).join('')));
          }
        }
      } catch {}

      const adaBalance = lovelace / 1_000_000;

      localStorage.setItem("payada_connected_wallet_address", address);
      localStorage.setItem("payada_connected_wallet_id", walletId);
      localStorage.setItem("payada_connected_wallet_name", window.cardano[walletId]?.name || (walletId.charAt(0).toUpperCase() + walletId.slice(1)));
      window.dispatchEvent(new Event("payada-wallet-updated"));

      setWalletInstance({ api, walletId });
      setWalletName(window.cardano[walletId]?.name || (walletId.charAt(0).toUpperCase() + walletId.slice(1)));
      setWalletAddress(address);
      setWalletBalance(adaBalance > 0 ? adaBalance : null);
      setConnected(true);

      onConnected?.({ api, walletId, address, lovelace, usedAddresses });
    } catch (err) {
      setError(err?.message || "Failed to connect wallet");
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = () => {
    localStorage.removeItem("payada_connected_wallet_address");
    localStorage.removeItem("payada_connected_wallet_id");
    localStorage.removeItem("payada_connected_wallet_name");
    window.dispatchEvent(new Event("payada-wallet-updated"));
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
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-xs font-semibold text-emerald-400">{walletName} connected</p>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300">
                {isMobile ? <Smartphone className="w-3 h-3" /> : <Monitor className="w-3 h-3" />}
                {isMobile ? "Mobile" : "Desktop"}
              </span>
            </div>
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
    <div className="relative space-y-2">
      <div className="flex items-center justify-between rounded-xl border border-slate-700/60 bg-slate-900/60 px-3 py-2">
        <div className="flex items-center gap-2 text-[11px] text-slate-300">
          {isMobile ? <Smartphone className="w-3.5 h-3.5 text-cyan-400" /> : <Monitor className="w-3.5 h-3.5 text-cyan-400" />}
          <span>{detectionMode === "mobile" ? "Mobile wallet detection" : "Desktop wallet detection"}</span>
        </div>
        <span className="text-[10px] text-slate-400">{installedWallets.filter(w => w.available).length} ready</span>
      </div>

      {installedWallets.length === 0 ? (
        <div className="text-center py-4 px-3 bg-slate-50 rounded-xl border border-slate-200">
          <Wallet className="w-5 h-5 text-slate-700 mx-auto mb-1.5" />
          <p className="text-xs text-slate-800">No Cardano wallet detected.</p>
          <p className="text-[11px] text-slate-600 mt-0.5">
            Install{" "}
            <a href="https://namiwallet.io" target="_blank" rel="noopener noreferrer" className="text-cyan-700 hover:underline">Nami</a>,{" "}
            <a href="https://eternl.io" target="_blank" rel="noopener noreferrer" className="text-cyan-700 hover:underline">Eternl</a>,{" "}
            <a href="https://yoroi-wallet.com" target="_blank" rel="noopener noreferrer" className="text-cyan-700 hover:underline">Yoroi</a>,{" "}
            <a href="https://typhonwallet.io" target="_blank" rel="noopener noreferrer" className="text-cyan-700 hover:underline">Typhon</a>, or{" "}
            <a href="https://www.lace.io" target="_blank" rel="noopener noreferrer" className="text-cyan-700 hover:underline">Lace</a>
          </p>
        </div>
      ) : (
        <>
          <Button
            variant="outline"
            className="w-full border-slate-700 bg-slate-900/90 text-slate-200 hover:bg-slate-900 hover:text-white hover:border-cyan-500 gap-2 justify-between"
            onClick={() => setShowPicker((p) => !p)}
            disabled={connecting}
          >
            <div className="flex items-center gap-2">
              {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
              {connecting ? "Connecting…" : "Connect Cardano Wallet"}
            </div>
            <ChevronDown className="w-3.5 h-3.5 opacity-50" />
          </Button>

          {showPicker && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50 overflow-y-auto max-h-60">
              {installedWallets.map((w) => (
                <button
                  key={w.id}
                  onClick={() => connectWallet(w.id)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-800 transition-colors text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {w.icon ? (
                      <img src={w.icon} alt={w.name} className="w-6 h-6 rounded" />
                    ) : (
                      <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">
                        {w.name[0]}
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm text-white font-medium">{w.name}</span>
                      {isMobile && w.mobileFallback && !w.available ? (
                        <span className="text-[11px] text-slate-400">{w.mobileLabel}</span>
                      ) : w.available ? (
                        <span className="text-[11px] text-emerald-400">Ready to connect</span>
                      ) : null}
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] border ${w.available ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-amber-500/30 bg-amber-500/10 text-amber-300'}`}>
                    {w.available ? <CheckCircle2 className="w-3 h-3" /> : <ExternalLink className="w-3 h-3" />}
                    {w.available ? 'Detected' : 'Open app'}
                  </span>
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