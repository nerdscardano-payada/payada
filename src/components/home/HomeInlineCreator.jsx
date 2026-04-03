import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Coins, Link2, LockKeyhole, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import WalletConnect from "@/components/checkout/WalletConnect";
import FeeSelector from "@/components/payment-links/FeeSelector";

export default function HomeInlineCreator({ onWalletConnected }) {
  const [type, setType] = React.useState("payment");
  const [currency, setCurrency] = React.useState("ADA");
  const [feePreview, setFeePreview] = React.useState({ fee_model: "customer_pays", fee_split_ratio: 0.5 });

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 md:p-8 shadow-xl shadow-slate-200/60">
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
            <Coins className="h-4 w-4" />
            Start hier, zonder dashboard
          </div>
          <h1 className="mt-5 text-4xl md:text-6xl font-bold tracking-tight text-slate-900">
            Get paid in ADA or any token. Instantly.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Create payment or access links. Accept Cardano native tokens. No banks.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setType("payment")}
              className={`rounded-2xl border p-4 text-left transition ${type === "payment" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-slate-50 text-slate-900"}`}
            >
              <div className="flex items-center gap-2 text-sm font-semibold"><Link2 className="h-4 w-4" /> Payment only</div>
              <p className={`mt-2 text-sm ${type === "payment" ? "text-slate-300" : "text-slate-600"}`}>Maak een directe betaal-link voor ADA of CNT.</p>
            </button>
            <button
              type="button"
              onClick={() => setType("access")}
              className={`rounded-2xl border p-4 text-left transition ${type === "access" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-slate-50 text-slate-900"}`}
            >
              <div className="flex items-center gap-2 text-sm font-semibold"><LockKeyhole className="h-4 w-4" /> Payment + Access</div>
              <p className={`mt-2 text-sm ${type === "access" ? "text-slate-300" : "text-slate-600"}`}>Ontgrendel content of community toegang na betaling.</p>
            </button>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Product naam</Label>
              <Input placeholder="Bijv. Premium guide" className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>{currency === "ADA" ? "Prijs in ADA" : "Prijs in token"}</Label>
              <Input placeholder={currency === "ADA" ? "10" : "50"} className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setCurrency("ADA")} className={`h-12 rounded-xl border text-sm font-medium ${currency === "ADA" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700"}`}>ADA</button>
                <button type="button" onClick={() => setCurrency("CNT")} className={`h-12 rounded-xl border text-sm font-medium ${currency === "CNT" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700"}`}>Custom token</button>
              </div>
            </div>
            {type === "access" && (
              <div className="space-y-2">
                <Label>Access URL</Label>
                <Input placeholder="https://notion.so/..." className="h-12 rounded-xl" />
              </div>
            )}
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
            <FeeSelector form={feePreview} update={(field, value) => setFeePreview((prev) => ({ ...prev, [field]: value }))} />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" className="h-12 rounded-xl px-6">Create Payment Link</Button>
            <Button size="lg" variant="outline" className="h-12 rounded-xl px-6">Create Access Link</Button>
          </div>
          <p className="mt-3 text-sm text-slate-500">Simpelere V2 flow: maak je link snel aan, met transparante fee-keuze vanaf het begin.</p>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Wallet className="h-4 w-4" />
            Connect wallet
          </div>
          <p className="mt-2 text-sm text-slate-600">Connect Nami, Eternl, Lace of een andere Cardano wallet om direct door te gaan.</p>
          <div className="mt-5">
            <WalletConnect onConnected={onWalletConnected} />
          </div>
          <div className="mt-5 rounded-2xl bg-white p-4 text-sm text-slate-600 border border-slate-200">
            <p className="font-semibold text-slate-900">Hoe dit uitbreidbaar blijft</p>
            <ul className="mt-2 space-y-2 list-disc pl-5">
              <li>ADA blijft standaard</li>
              <li>CNT blijft ondersteund</li>
              <li>Bestaande checkout en detectie blijven bruikbaar</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}