import React, { useMemo, useState } from "react";
import { Loader2, Sparkles, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import WalletConnect from "@/components/checkout/WalletConnect";

export default function InstantLinkForm({ onGenerate, isPending }) {
  const [amount, setAmount] = useState("5");
  const [description, setDescription] = useState("Test payment");
  const [receiveAddress, setReceiveAddress] = useState("");
  const [connectedWallet, setConnectedWallet] = useState(null);

  const sameAsPayingWallet = Boolean(
    connectedWallet?.address && receiveAddress.trim() && connectedWallet.address === receiveAddress.trim()
  );

  const canGenerate = useMemo(() => {
    return Boolean(connectedWallet?.address) && Number(amount) > 0 && Boolean(receiveAddress.trim()) && !sameAsPayingWallet;
  }, [connectedWallet, amount, receiveAddress, sameAsPayingWallet]);

  const handleGenerate = () => {
    if (!canGenerate) return;
    onGenerate({
      amount: Number(amount),
      description: description.trim(),
      receiveAddress: receiveAddress.trim(),
      wallet: connectedWallet,
    });
  };

  return (
    <Card id="create-link" className="border-slate-800 bg-slate-950 text-white shadow-2xl shadow-slate-950/30">
      <div className="border-b border-white/10 px-6 py-5">
        <div className="flex items-center gap-2 text-cyan-300">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-[0.2em]">Try before signup</span>
        </div>
        <h2 className="mt-3 text-2xl font-bold">Create your first payment link</h2>
        <p className="mt-2 text-sm text-slate-400">
          Fill in the amount, optionally add a label, connect your wallet, and generate a live link instantly.
        </p>
      </div>

      <div className="space-y-5 px-6 py-6">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="demo-amount" className="text-slate-200">Amount (ADA)</Label>
            <Input
              id="demo-amount"
              type="number"
              min="0.1"
              step="0.1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border-slate-700 bg-slate-900 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="demo-description" className="text-slate-200">Description (optional)</Label>
            <Input
              id="demo-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Test payment"
              className="border-slate-700 bg-slate-900 text-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="demo-receive-address" className="text-slate-200">Receive wallet address</Label>
          <Input
            id="demo-receive-address"
            value={receiveAddress}
            onChange={(e) => setReceiveAddress(e.target.value)}
            placeholder="addr1..."
            className="border-slate-700 bg-slate-900 text-white"
          />
          <p className="text-xs text-slate-400">
            Use a different receiving address than the wallet you will use to pay.
          </p>
          {sameAsPayingWallet && (
            <p className="text-xs text-amber-300">
              The receive address cannot be the same as the paying wallet.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-white">
            <Wallet className="h-4 w-4 text-cyan-300" />
            Connect your wallet
          </div>
          <WalletConnect
            onConnected={setConnectedWallet}
            onDisconnected={() => setConnectedWallet(null)}
          />
        </div>

        <Button
          onClick={handleGenerate}
          disabled={!canGenerate || isPending}
          className="h-12 w-full bg-cyan-400 font-semibold text-slate-950 hover:bg-cyan-300"
        >
          {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating link...</> : "Generate link & continue"}
        </Button>

        <div className="grid gap-3 text-xs text-slate-400 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">Default setup: 5 ADA · Test payment</div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">Works without account creation</div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">Use a separate receive address</div>
        </div>
      </div>
    </Card>
  );
}