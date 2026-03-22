import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function HotWalletSetupCard({ wallet, onSave, isSaving }) {
  const [form, setForm] = React.useState({ wallet_name: "Primary NFT Wallet", wallet_address: "", mnemonic: "" });

  React.useEffect(() => {
    if (wallet) {
      setForm({
        wallet_name: wallet.wallet_name || "Primary NFT Wallet",
        wallet_address: wallet.wallet_address || "",
        mnemonic: "",
      });
    }
  }, [wallet]);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Merchant hot wallet</h2>
        <p className="text-sm text-slate-500">Deze wallet wordt gebruikt om NFTs automatisch uit te sturen na bevestigde betaling.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div><Label>Wallet naam</Label><Input value={form.wallet_name} onChange={(e) => update("wallet_name", e.target.value)} /></div>
        <div><Label>Wallet adres</Label><Input value={form.wallet_address} onChange={(e) => update("wallet_address", e.target.value)} /></div>
      </div>
      <div>
        <Label>Mnemonic</Label>
        <Textarea value={form.mnemonic} onChange={(e) => update("mnemonic", e.target.value)} rows={4} placeholder={wallet ? "Laat leeg om ongewijzigd te laten" : "12/15/24 woorden"} />
      </div>
      {wallet?.wallet_address && <p className="text-xs text-slate-500">Huidige wallet: {wallet.wallet_address}</p>}
      <Button onClick={() => onSave(form)} disabled={isSaving || (!form.mnemonic && !wallet)}>{isSaving ? "Opslaan..." : "Wallet opslaan"}</Button>
    </div>
  );
}