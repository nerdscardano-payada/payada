import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KNOWN_CNTS } from "./knownCNTs";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";

export default function StepBasic({ form, update, isEditing, isAdmin }) {
  // All merchants have access to all platform-approved tokens
  const availableTokens = KNOWN_CNTS;
  const generateSlug = (title, email) => {
    const base = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    if (isEditing) return base;
    const prefix = email?.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) || "m";
    return `${prefix}-${base}`;
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Title *</Label>
        <Input
          value={form.title}
          onChange={(e) => {
            update("title", e.target.value);
            if (!isEditing) update("slug", generateSlug(e.target.value, form._userEmail));
          }}
          placeholder="e.g. Support our project"
        />
      </div>

      <div className="space-y-2">
        <Label>URL Slug *</Label>
        <div className="flex items-center">
          <span className="text-xs text-slate-400 bg-slate-50 border border-r-0 border-slate-200 px-3 py-2.5 rounded-l-md">/pay/</span>
          <Input
            value={form.slug}
            onChange={(e) => update("slug", e.target.value)}
            className="rounded-l-none"
            placeholder="my-payment"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Optional description for the payer"
          rows={2}
        />
      </div>

      <div className="border-t border-slate-100 pt-5 space-y-4">
        <h4 className="text-sm font-medium text-slate-700">Amount</h4>

        <div className="space-y-2">
          <Label>Payment type</Label>
          <Select value={form.amount_mode} onValueChange={(v) => update("amount_mode", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed_ada">Fixed amount in ADA</SelectItem>
                  <SelectItem value="fixed_cnt">Cardano Native Token (CNT)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {form.amount_mode === "fixed_ada" && (
          <div className="space-y-2">
            <Label>Amount (ADA)</Label>
            <Input type="number" step="0.01" value={form.amount_ada} onChange={(e) => update("amount_ada", e.target.value)} placeholder="e.g. 25" />
          </div>
        )}

        {form.amount_mode === "fixed_fiat" && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={form.fiat_currency} onValueChange={(v) => update("fiat_currency", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input type="number" step="0.01" value={form.amount_fiat} onChange={(e) => update("amount_fiat", e.target.value)} placeholder="e.g. 9.99" />
            </div>
          </div>
        )}

        {form.amount_mode === "fixed_cnt" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select token</Label>
              <div className="flex flex-wrap gap-2">
                {availableTokens.map((cnt) => (
                  <button
                    key={cnt.ticker}
                    type="button"
                    onClick={() => {
                      update("cnt_ticker", cnt.ticker);
                      update("cnt_policy_id", cnt.policy_id);
                      update("cnt_asset_name", cnt.asset_name);
                      update("cnt_decimals", cnt.decimals);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                      form.cnt_ticker === cnt.ticker
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-slate-700 border-slate-200 hover:border-indigo-400"
                    }`}
                  >
                    {cnt.ticker}
                  </button>
                ))}
              </div>
            </div>

            {form.cnt_ticker && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1 text-xs font-mono text-slate-500">
                <p><span className="text-slate-400">Policy ID: </span>{form.cnt_policy_id}</p>
                <p><span className="text-slate-400">Asset Name: </span>{form.cnt_asset_name}</p>
                <p><span className="text-slate-400">Decimals: </span>{form.cnt_decimals}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Amount ({form.cnt_ticker || "tokens"})</Label>
              <Input type="number" value={form.cnt_amount} onChange={(e) => update("cnt_amount", e.target.value)} placeholder="e.g. 1000" />
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 pt-5 space-y-3">
        <h4 className="text-sm font-medium text-slate-700">Receive address</h4>
        <div className="space-y-2">
          <Label>Cardano address *</Label>
          <Input value={form.receive_address} onChange={(e) => update("receive_address", e.target.value)} placeholder="addr1q9..." className="font-mono text-xs" />
        </div>
      </div>
    </div>
  );
}