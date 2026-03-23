import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MnemonicPhraseInput from "@/components/nfts/MnemonicPhraseInput";

const VALID_COUNTS = [12, 15, 18, 21, 24];

export default function HotWalletSetupCard({ wallet, onSave, isSaving }) {
  const [form, setForm] = React.useState({ wallet_name: "Primary NFT Wallet", wallet_address: "", mnemonic: "" });
  const enteredCount = form.mnemonic.trim() ? form.mnemonic.trim().split(/\s+/).filter(Boolean).length : 0;
  const canSaveMnemonic = !form.mnemonic.trim() ? !!wallet : VALID_COUNTS.includes(enteredCount);

  React.useEffect(() => {
    if (wallet) {
      setForm({
        wallet_name: wallet.wallet_name || "Primary NFT Wallet",
        wallet_address: wallet.wallet_address || "",
        mnemonic: "",
      });
      return;
    }

    setForm({ wallet_name: "Primary NFT Wallet", wallet_address: "", mnemonic: "" });
  }, [wallet]);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Merchant hot wallet</h2>
        <p className="text-sm text-slate-500">This wallet sends NFTs automatically after a confirmed payment.</p>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        The recovery phrase is visible while entering, is encrypted on save, and cannot be read back from PayADA later.
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div><Label>Wallet name</Label><Input value={form.wallet_name} onChange={(e) => update("wallet_name", e.target.value)} /></div>
        <div><Label>Wallet address</Label><Input value={form.wallet_address} onChange={(e) => update("wallet_address", e.target.value)} placeholder="addr1..." /></div>
      </div>

      <MnemonicPhraseInput value={form.mnemonic} onChange={(value) => update("mnemonic", value)} disabled={isSaving} />

      {wallet?.wallet_address && <p className="text-xs text-slate-500">Active hot wallet: {wallet.wallet_address}</p>}

      <Button onClick={() => onSave(form)} disabled={isSaving || !form.wallet_address.trim() || !canSaveMnemonic}>
        {isSaving ? "Saving..." : wallet ? "Update hot wallet" : "Save hot wallet"}
      </Button>
    </div>
  );
}