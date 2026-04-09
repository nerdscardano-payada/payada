import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Wallet, ChevronDown, Loader2, CheckCircle2, XCircle, Smartphone, Monitor, ExternalLink } from "lucide-react";
import { useCardano } from "@cardano-foundation/cardano-connect-with-wallet";
import { Button } from "@/components/ui/button";

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

const KNOWN_WALLETS = [
  { id: "nami", name: "Nami" },
  { id: "eternl", name: "Eternl", mobileLabel: "Use Eternl dApp browser" },
  { id: "lace", name: "Lace" },
  { id: "typhon", name: "Typhon" },
  { id: "gerowallet", name: "GeroWallet" },
  { id: "yoroi", name: "Yoroi", mobileLabel: "Use Yoroi dApp browser" },
  { id: "vespr", name: "Vespr", mobileLabel: "Use Vespr dApp browser" },
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
  const isMobile = useMemo(() => typeof window !== "undefined" && window.innerWidth < 1024, []);
  const { connect, disconnect, isConnected: hookConnected, stakeAddress, enabledWallet } = useCardano();

  const saveWalletState = useCallback((walletId, walletDisplayName, address, api = null, lovelace = null) => {
    localStorage.setItem("payada_connected_wallet_address", address);
    localStorage.setItem("payada_connected_wallet_id", walletId || "");
    localStorage.setItem("payada_connected_wallet_name", walletDisplayName || "Wallet");
    window.dispatchEvent(new Event("payada-wallet-updated"));
    setWalletName(walletDisplayName || "Wallet");
    setWalletAddress(address);
    setWalletBalance(lovelace !== null ? lovelace / 1_000_000 : null);
    setConnected(true);
    onConnected?.({ api, walletId, address, lovelace });
  }, [onConnected]);

  const clearWalletState = useCallback(() => {
    localStorage.removeItem("payada_connected_wallet_address");
    localStorage.removeItem("payada_connected_wallet_id");
    localStorage.removeItem("payada_connected_wallet_name");
    window.dispatchEvent(new Event("payada-wallet-updated"));
    setConnected(false);
    setWalletName(null);
    setWalletAddress(null);
    setWalletBalance(null);
    onDisconnected?.();
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
    const handleStorageSync = () => {
      const storedAddress = localStorage.getItem("payada_connected_wallet_address");
      const storedWalletId = localStorage.getItem("payada_connected_wallet_id");
      const storedWalletName = localStorage.getItem("payada_connected_wallet_name");
      if (!storedAddress) return;
      setConnected(true);
      setWalletAddress(storedAddress);
      setWalletName(storedWalletName || storedWalletId || "Wallet");
      setWalletBalance(null);
    };
    handleStorageSync();
    window.addEventListener("payada-wallet-updated", handleStorageSync);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("payada-wallet-updated", handleStorageSync);
    };
  }, [detectWallets]);

  useEffect(() => {
    if (!hookConnected || !stakeAddress) return;
    const walletId = enabledWallet || selectedWalletId || localStorage.getItem("payada_connected_wallet_id") || "wallet";
    const walletDisplayName = KNOWN_WALLETS.find((item) => item.id === walletId)?.name || walletId;
    saveWalletState(walletId, walletDisplayName, stakeAddress, null, null);
    setError(null);
  }, [hookConnected, stakeAddress, enabledWallet, selectedWalletId, saveWalletState]);

  const connectWallet = async (walletId) => {
    setConnecting(true);
    setSelectedWalletId(walletId);
    setError(null);
    setShowPicker(false);
    try {
      if (window.cardano?.[walletId]?.enable) {
        await connect(walletId);
        const api = await window.cardano[walletId].enable();
        const usedAddresses = await api.getUsedAddresses().catch(() => []);
        const changeAddr = await api.getChangeAddress().catch(() => null);
        const primaryRawAddress = usedAddresses?.[0] || changeAddr;
        const address = normalizeWalletAddress(primaryRawAddress);
        const balanceCbor = await api.getBalance();
        let lovelace = 0;
        try {
          const bytes = balanceCbor.match(/.{1,2}/g).map((b) => parseInt(b, 16));
          const firstByte = bytes[0];
          const majorType = firstByte >> 5;
          const addInfo = firstByte & 0x1f;
          if (majorType === 0) {
            if (addInfo <= 23) lovelace = addInfo;
            else if (addInfo === 24) lovelace = bytes[1];
            else if (addInfo === 25) lovelace = (bytes[1] << 8) | bytes[2];
            else if (addInfo === 26) lovelace = ((bytes[1] << 24) | (bytes[2] << 16) | (bytes[3] << 8) | bytes[4]) >>> 0;
          }
        } catch {}
        saveWalletState(walletId, window.cardano[walletId]?.name || walletId, address, api, lovelace);
        return;
      }

      if (isMobile) {
        setError("Open this page inside your wallet app browser to connect.");
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
    await disconnect().catch(() => null);
    clearWalletState();
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
      <div className="flex items-center justify-between rounded-xl border border-slate-700/60 bg-slate-900/60 px-3 py-2">
        <div className="flex items-center gap-2 text-[11px] text-slate-300">
          {isMobile ? <Smartphone className="w-3.5 h-3.5 text-cyan-400" /> : <Monitor className="w-3.5 h-3.5 text-cyan-400" />}
          <span>{isMobile ? "Mobile wallets" : "Desktop wallets"}</span>
        </div>
        <span className="text-[10px] text-slate-400">{installedWallets.length} options</span>
      </div>

      <Button
        variant="outline"
        className="w-full border-slate-700 bg-slate-900/90 text-slate-200 hover:bg-slate-900 hover:text-white hover:border-cyan-500 gap-2 justify-between"
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

      {showPicker && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50 overflow-y-auto max-h-72">
          {installedWallets.length > 0 ? installedWallets.map((w) => (
            <button
              key={w.id}
              onClick={() => connectWallet(w.id)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-800 transition-colors text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                {w.icon ? (
                  <img src={w.icon} alt={w.name} className="w-6 h-6 rounded" />
                ) : (
                  <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">{w.name[0]}</div>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="text-sm text-white font-medium">{w.name}</span>
                  <span className="text-[11px] text-slate-400">{w.available ? "Ready to connect" : (w.mobileLabel || "Open in wallet browser")}</span>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] border ${w.available ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-slate-600 bg-slate-800 text-slate-300"}`}>
                {w.available ? <CheckCircle2 className="w-3 h-3" /> : <ExternalLink className="w-3 h-3" />}
                {w.available ? "Detected" : "Mobile"}
              </span>
            </button>
          )) : (
            <div className="px-4 py-4 text-sm text-slate-300">
              No wallet detected on this device.
            </div>
          )}
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