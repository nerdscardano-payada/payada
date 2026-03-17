import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KNOWN_CNTS } from "@/components/payment-links/wizard/knownCNTs";
import { Coins, CheckCircle2, Send } from "lucide-react";
import { toast } from "sonner";

export default function CNTTokenRequestForm({ user, onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    token_type: "known", // "known" or "custom"
    selected_ticker: "",
    custom_ticker: "",
    custom_policy_id: "",
    custom_asset_name: "",
    custom_decimals: "0",
    reason: "",
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const selectedToken = KNOWN_CNTS.find(c => c.ticker === form.selected_ticker);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const ticker = form.token_type === "known" ? form.selected_ticker : form.custom_ticker;
    if (!ticker) { toast.error("Please select or enter a token"); return; }
    if (form.token_type === "custom" && !form.custom_policy_id) { toast.error("Please enter the Policy ID"); return; }
    if (!form.reason.trim()) { toast.error("Please explain why you want to accept this token"); return; }

    const policyId = form.token_type === "known" ? selectedToken?.policy_id : form.custom_policy_id;
    const assetName = form.token_type === "known" ? selectedToken?.asset_name : form.custom_asset_name;
    const decimals = form.token_type === "known" ? selectedToken?.decimals : parseInt(form.custom_decimals) || 0;

    setLoading(true);
    await base44.integrations.Core.SendEmail({
      to: "support@payada.io",
      from_name: "PayADA Token Request",
      subject: `CNT Whitelist Request: ${ticker} — ${user?.email}`,
      body: `
CNT Token Whitelist Request
============================

Merchant: ${user?.full_name || "—"}
Email: ${user?.email}

Token Details:
- Ticker: ${ticker}
- Policy ID: ${policyId || "—"}
- Asset Name (hex): ${assetName || "—"}
- Decimals: ${decimals}

Reason / Use Case:
${form.reason}

---
Submitted via PayADA Merchant Dashboard
      `.trim(),
    });

    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">Request submitted!</h3>
        <p className="text-sm text-slate-500 max-w-xs mx-auto">
          We'll review your request and notify you at <strong>{user?.email}</strong> once the token is approved.
        </p>
        {onClose && (
          <Button variant="outline" onClick={onClose}>Close</Button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
          <Coins className="w-4 h-4 text-purple-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">Request CNT Token Access</h3>
          <p className="text-xs text-slate-500">We'll review and whitelist the token for your account</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Token type</Label>
        <Select value={form.token_type} onValueChange={v => set("token_type", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="known">Choose from known tokens</SelectItem>
            <SelectItem value="custom">Custom token (manual entry)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {form.token_type === "known" ? (
        <div className="space-y-1.5">
          <Label>Select token</Label>
          <div className="flex flex-wrap gap-2">
            {KNOWN_CNTS.map(cnt => (
              <button
                type="button"
                key={cnt.ticker}
                onClick={() => set("selected_ticker", cnt.ticker)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                  form.selected_ticker === cnt.ticker
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-white text-slate-700 border-slate-200 hover:border-purple-400"
                }`}
              >
                {cnt.ticker}
              </button>
            ))}
          </div>
          {selectedToken && (
            <div className="p-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-500 space-y-0.5 mt-2">
              <p><span className="font-medium text-slate-700">Policy ID:</span> <span className="font-mono">{selectedToken.policy_id}</span></p>
              <p><span className="font-medium text-slate-700">Decimals:</span> {selectedToken.decimals}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Ticker *</Label>
              <Input value={form.custom_ticker} onChange={e => set("custom_ticker", e.target.value)} placeholder="$TOKEN" />
            </div>
            <div className="space-y-1.5">
              <Label>Decimals</Label>
              <Input type="number" min="0" max="18" value={form.custom_decimals} onChange={e => set("custom_decimals", e.target.value)} placeholder="0" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Policy ID *</Label>
            <Input value={form.custom_policy_id} onChange={e => set("custom_policy_id", e.target.value)} placeholder="56chars hex..." className="font-mono text-xs" />
          </div>
          <div className="space-y-1.5">
            <Label>Asset Name (hex)</Label>
            <Input value={form.custom_asset_name} onChange={e => set("custom_asset_name", e.target.value)} placeholder="hex encoded asset name" className="font-mono text-xs" />
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <Label>Why do you want to accept this token? *</Label>
        <Textarea
          value={form.reason}
          onChange={e => set("reason", e.target.value)}
          placeholder="Describe your use case, e.g. 'I run a Cardano NFT marketplace and want to accept $NMKR as payment...'"
          rows={3}
        />
      </div>

      <div className="flex gap-3">
        {onClose && <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>}
        <Button type="submit" disabled={loading} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white gap-2">
          <Send className="w-4 h-4" />
          {loading ? "Submitting..." : "Submit Request"}
        </Button>
      </div>
    </form>
  );
}