import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Wallet, ChevronDown, Loader2, CheckCircle2, XCircle, Smartphone, Monitor, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function hexToBech32(hexStr, hrp = "addr") {
  const CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
  const bytes = [];
  for (let i = 0; i < hexStr.length; i += 2) bytes.push(parseInt(hexStr.substr(i, 2), 16));
  let bits = 0;
  let value = 0;
  const result = [];
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      result.push((value >> bits) & 31);
    }
  }
  if (bits > 0) result.push((value << (5 - bits)) & 31);
  const values = [...hrp.split("").map((c) => c.charCodeAt(0) >> 5), 0];
  for (const c of hrp) values.push(c.charCodeAt(0) & 31);
  const polymod = (v) => {
    const GENERATOR = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
    let chk = 1;
    for (const x of v) {
      const b = chk >> 25;
      chk = ((chk & 0x1ffffff) << 5) ^ x;
      for (let i = 0; i < 5; i++) chk ^= ((b >> i) & 1) ? GENERATOR[i] : 0;
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
  return hrp + "1" + result.map((d) => CHARSET[d]).join("");
}

function decodeCborUnsigned(bytes, startIndex = 0) {
  const firstByte = bytes[startIndex];
  if (firstByte === undefined) return null;

  const majorType = firstByte >> 5;
  const additionalInfo = firstByte & 0x1f;
  if (majorType !== 0) return null;

  if (additionalInfo < 24) {
    return { value: additionalInfo, nextIndex: startIndex + 1 };
  }

  if (additionalInfo === 24) {
    return { value: bytes[startIndex + 1], nextIndex: startIndex + 2 };
  }

  if (additionalInfo === 25) {
    return {
      value: (bytes[startIndex + 1] << 8) | bytes[startIndex + 2],
      nextIndex: startIndex + 3,
    };
  }

  if (additionalInfo === 26) {
    return {
      value: ((bytes[startIndex + 1] * 2 ** 24) + (bytes[startIndex + 2] << 16) + (bytes[startIndex + 3] << 8) + bytes[startIndex + 4]),
      nextIndex: startIndex + 5,
    };
  }

  if (additionalInfo === 27) {
    let value = 0;
    for (let i = 1; i <= 8; i += 1) {
      value = (value * 256) + bytes[startIndex + i];
    }
    return { value, nextIndex: startIndex + 9 };
  }

  return null;
}

function decodeCborBalance(hexValue) {
  if (!hexValue || typeof hexValue !== "string") return null;

  const hex = hexValue.startsWith("0x") ? hexValue.slice(2) : hexValue;
  const bytes = hex.match(/.{1,2}/g)?.map((b) => parseInt(b, 16)) || [];
  if (!bytes.length) return null;

  const directValue = decodeCborUnsigned(bytes, 0);
  if (directValue) return directValue.value;

  const isArray = (bytes[0] >> 5) === 4;
  if (!isArray) return null;

  const firstItem = decodeCborUnsigned(bytes, 1);
  return firstItem?.value ?? null;
}

const KNOWN_WALLETS = [
  { id: "nami", name: "Nami" },
  { id: "eternl", name: "Eternl", mobileLabel: "Open in Eternl app" },
  { id: "yoroi", name: "Yoroi", mobileLabel: "Open in Yoroi app" },
  { id: "lace", name: "Lace", mobileLabel: "Open in Lace app" },
  { id: "vespr", name: "Vespr", mobileLabel: "Open in Vespr app" },
  { id: "typhon", name: "Typhon" },
  { id: "gerowallet", name: "GeroWallet" },
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
  const [selectedWalletId, setSelectedWalletId] = useState(null);
  const [manualAddress, setManualAddress] = useState("");
  const isMobile = useMemo(() => typeof window !== "undefined" && window.innerWidth < 1024, []);

  const saveWalletState = useCallback((walletId, walletDisplayName, address, api = null, lovelace = null) => {
    localStorage.setItem("payada_connected_wallet_address", address);
    localStorage.setItem("payada_connected_wallet_id", walletId || "manual");
    localStorage.setItem("payada_connected_wallet_name", walletDisplayName || "Wallet");
    localStorage.setItem("payada_manual_wallet_address", address);
    setManualAddress(address);
    setWalletName(walletDisplayName || "Wallet");
    setWalletAddress(address);
    setWalletBalance(lovelace !== null ? lovelace / 1_000_000 : null);
    setConnected(true);
    onConnected?.({ api, walletId: walletId || "manual", address, lovelace });
    window.dispatchEvent(new Event("payada-wallet-updated"));
  }, [onConnected]);

  const clearWalletState = useCallback(() => {
    localStorage.removeItem("payada_connected_wallet_address");
    localStorage.removeItem("payada_connected_wallet_id");
    localStorage.removeItem("payada_connected_wallet_name");
    localStorage.removeItem("payada_manual_wallet_address");
    setManualAddress("");
    setConnected(false);
    setWalletName(null);
    setWalletAddress(null);
    setWalletBalance(null);
    onDisconnected?.();
    window.dispatchEvent(new Event("payada-wallet-updated"));
  }, [onDisconnected]);

  const normalizeWalletAddress = (rawAddress) => {
    if (!rawAddress) return null;
    if (rawAddress.startsWith("addr")) return rawAddress;
    let addrHex = rawAddress;
    if (rawAddress.startsWith("58")) {
      const length = parseInt(rawAddress.slice(2, 4), 16);
      addrHex = rawAddress.slice(4, 4 + length * 2);
    }
    return hexToBech32(addrHex, "addr");
  };


  const detectWallets = useCallback(() => {
    if (typeof window === "undefined") return;
    const cardanoProviders = window.cardano || {};
    const found = [];
    const knownIds = new Set(KNOWN_WALLETS.map((w) => w.id));
    const hasInjectedProviders = Object.keys(cardanoProviders).some((key) => cardanoProviders[key]?.enable);

    KNOWN_WALLETS.forEach(({ id, name, mobileLabel }) => {
      if (cardanoProviders[id]?.enable) {
        found.push({ id, name, mobileLabel, icon: cardanoProviders[id].icon || null, available: true });
      } else if (isMobile && mobileLabel) {
        found.push({ id, name, mobileLabel, icon: null, available: false, mobileFallback: true });
      }
    });

    Object.keys(cardanoProviders).forEach((key) => {
      if (!knownIds.has(key) && cardanoProviders[key]?.enable) {
        const w = cardanoProviders[key];
        found.push({ id: key, name: w.name || key, icon: w.icon || null, available: true });
      }
    });

    setInstalledWallets(isMobile && !hasInjectedProviders ? found.filter((wallet) => wallet.mobileFallback) : found);
  }, [isMobile]);

  useEffect(() => {
    const timer = setTimeout(detectWallets, 500);
    let isMounted = true;

    const handleStorageSync = async () => {
      const storedAddress = localStorage.getItem("payada_connected_wallet_address") || localStorage.getItem("payada_manual_wallet_address");
      const storedWalletId = localStorage.getItem("payada_connected_wallet_id");
      const storedWalletName = localStorage.getItem("payada_connected_wallet_name");

      if (!storedAddress) {
        if (!isMounted) return;
        setConnected(false);
        setWalletAddress(null);
        setWalletName(null);
        setWalletBalance(null);
        return;
      }

      if (!isMounted) return;
      setManualAddress(storedAddress);
      setConnected(true);
      setWalletAddress(storedAddress);
      setWalletName(storedWalletName || (storedWalletId === "manual" ? "Manual wallet" : storedWalletId) || "Wallet");
      setWalletBalance((current) => current);

      if (storedWalletId && window.cardano?.[storedWalletId]?.enable) {
        const api = await window.cardano[storedWalletId].enable().catch(() => null);
        if (!api || !isMounted) return;
        const balanceCbor = await api.getBalance().catch(() => null);
        const lovelace = decodeCborBalance(balanceCbor);
        if (!isMounted) return;
        setWalletBalance(lovelace !== null ? lovelace / 1_000_000 : null);
      }
    };

    handleStorageSync();
    window.addEventListener("payada-wallet-updated", handleStorageSync);
    return () => {
      isMounted = false;
      clearTimeout(timer);
      window.removeEventListener("payada-wallet-updated", handleStorageSync);
    };
  }, [detectWallets]);

  const connectWallet = async (walletId) => {
    setConnecting(true);
    setSelectedWalletId(walletId);
    setError(null);
    setShowPicker(false);
    try {
      if (window.cardano?.[walletId]?.enable) {
        const api = await window.cardano[walletId].enable();
        const usedAddresses = await api.getUsedAddresses().catch(() => []);
        const unusedAddresses = await api.getUnusedAddresses?.().catch(() => []);
        const changeAddr = await api.getChangeAddress().catch(() => null);
        const primaryRawAddress = usedAddresses?.[0] || unusedAddresses?.[0] || changeAddr;
        const address = normalizeWalletAddress(primaryRawAddress);
        if (!address) {
          throw new Error("No wallet address found");
        }
        const balanceCbor = await api.getBalance().catch(() => null);
        const lovelace = decodeCborBalance(balanceCbor);
        saveWalletState(walletId, window.cardano[walletId]?.name || walletId, address, api, lovelace);
        return;
      }

      if (isMobile) {
        setError("Copy this page URL and open it inside your Cardano wallet app browser to connect.");
        return;
      }

      throw new Error("Wallet not detected on this device");
    } catch (err) {
      setError(err?.message || "Failed to connect wallet");
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    clearWalletState();
  };

  const handleManualConnect = () => {
    const trimmedAddress = manualAddress.trim();
    if (!trimmedAddress) {
      setError("Voer eerst een Cardano walletadres in.");
      return;
    }
    setError(null);
    saveWalletState("manual", "Manual wallet", trimmedAddress, null, null);
  };

  const shortAddress = (addr) => !addr ? "" : addr.length <= 20 ? addr : `${addr.slice(0, 10)}…${addr.slice(-8)}`;

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
            {walletBalance !== null && <p className="text-[10px] text-slate-500">Balance: ₳ {walletBalance.toFixed(2)}</p>}
          </div>
        </div>
        <button onClick={handleDisconnect} className="text-[10px] text-slate-500 hover:text-red-400 transition-colors underline">
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="relative space-y-2">
      <Button
        variant="outline"
        className="w-full border-slate-300 bg-white text-slate-900 hover:bg-slate-50 hover:text-slate-950 hover:border-cyan-500 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:bg-slate-900 dark:hover:text-white gap-2 justify-between"
        onClick={() => {
          setError(null);
          setShowPicker((p) => !p);
        }}
        disabled={connecting}
      >
        <div className="flex items-center gap-2">
          {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
          {connecting ? "Connecting…" : "Connect Cardano Wallet"}
        </div>
        <ChevronDown className="w-3.5 h-3.5 opacity-50" />
      </Button>

      {!isMobile && showPicker && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-y-auto max-h-72 dark:bg-slate-900 dark:border-slate-700">
          {installedWallets.length > 0 ? installedWallets.map((w) => (
            <button
              key={w.id}
              onClick={() => connectWallet(w.id)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                {w.icon ? (
                  <img src={w.icon} alt={w.name} className="w-6 h-6 rounded" />
                ) : (
                  <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">{w.name[0]}</div>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="text-sm text-slate-900 dark:text-white font-medium">{w.name}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">{w.available ? "Ready to connect" : "Unavailable"}</span>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] border ${w.available ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-slate-600 bg-slate-800 text-slate-300"}`}>
                {w.available ? <CheckCircle2 className="w-3 h-3" /> : <ExternalLink className="w-3 h-3" />}
                {w.available ? "Detected" : "Off"}
              </span>
            </button>
          )) : (
            <div className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">
              No wallet detected on this device.
            </div>
          )}
        </div>
      )}

      {isMobile && (
        <div className="space-y-3 rounded-lg border border-amber-500/30 bg-amber-50 px-3 py-3 text-xs text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100">
          <p>Op mobiel kan je je Cardano walletadres handmatig invullen en opslaan.</p>
          <Input
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            placeholder="addr1..."
            className="bg-white text-slate-900 dark:bg-slate-950 dark:text-white"
          />
          <Button type="button" className="w-full" onClick={handleManualConnect} disabled={connecting}>
            Gebruik dit walletadres
          </Button>
        </div>
      )}

      {error && (
        <div className="mt-2 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs leading-5 text-red-700">
          <XCircle className="mt-0.5 w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}