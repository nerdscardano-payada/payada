import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KNOWN_CNTS } from "./knownCNTs";

const MULTI_CNT_SUPPORTED_TICKERS = new Set([
  "$NIGHT",
  "$SNEK",
  "$MIN",
  "$INDY",
  "$SUNDAE",
  "$WMTX",
  "$IAG",
  "$STRIKE",
  "$NMKR",
  "$HOSKY",
  "$TITAN",
  "USDM",
  "USDA",
  "DJED",
  "USDCX",
  "$LQ",
]);

export default function StepBasic({ form, update, isEditing }) {
  const availableTokens = KNOWN_CNTS;
  const multiCntTokens = availableTokens.filter((token) => MULTI_CNT_SUPPORTED_TICKERS.has(token.ticker.toUpperCase()));

  const generateSlug = (title, email) => {
    const base = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    if (isEditing) return base;
    const prefix = email?.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) || "m";
    return `${prefix}-${base}`;
  };

  const isAlternativeSelected = (token) =>
    (form.accepted_cnt_tokens || []).some(
      (selected) => selected.policy_id === token.policy_id && selected.asset_name === token.asset_name
    );

  const toggleAlternativeToken = (token) => {
    const current = form.accepted_cnt_tokens || [];
    const exists = isAlternativeSelected(token);

    if (exists) {
      update(
        "accepted_cnt_tokens",
        current.filter(
          (selected) => !(selected.policy_id === token.policy_id && selected.asset_name === token.asset_name)
        )
      );
      return;
    }

    update("accepted_cnt_tokens", [
      ...current,
      {
        ticker: token.ticker,
        policy_id: token.policy_id,
        asset_name: token.asset_name,
        decimals: token.decimals,
      },
    ]);
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
          <Select value={form.amount_mode} onValueChange={(value) => update("amount_mode", value)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed_ada">Fixed amount in ADA</SelectItem>
              <SelectItem value="fixed_cnt">Cardano Native Token (CNT)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {form.amount_mode === "fixed_ada" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Amount (ADA)</Label>
              <Input type="number" step="0.01" value={form.amount_ada} onChange={(e) => update("amount_ada", e.target.value)} placeholder="e.g. 25" />
            </div>

            <div className="space-y-2">
              <Label>Alternative CNTs (optional)</Label>
              <p className="text-xs text-slate-500">
                Keep ADA as the default, but also allow customers to pick one of these CNTs on the dedicated multi-token checkout page.
              </p>
              <div className="flex flex-wrap gap-2">
                {multiCntTokens.map((token) => {
                  const selected = isAlternativeSelected(token);
                  return (
                    <button
                      key={`${token.policy_id}:${token.asset_name}`}
                      type="button"
                      onClick={() => toggleAlternativeToken(token)}
                      className={selected
                        ? "px-3 py-1.5 rounded-lg text-sm font-medium border transition-all bg-indigo-600 text-white border-indigo-600"
                        : "px-3 py-1.5 rounded-lg text-sm font-medium border transition-all bg-white text-slate-700 border-slate-200 hover:border-indigo-400"
                      }
                    >
                      {token.ticker}
                    </button>
                  );
                })}
              </div>
              {(form.accepted_cnt_tokens || []).length > 0 && (
                <p className="text-xs text-slate-500">
                  Multi-token checkout active for: {(form.accepted_cnt_tokens || []).map((token) => token.ticker).join(", ")}
                </p>
              )}
            </div>
          </div>
        )}

        {form.amount_mode === "fixed_fiat" && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={form.fiat_currency} onValueChange={(value) => update("fiat_currency", value)}>
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
                    className={form.cnt_ticker === cnt.ticker
                      ? "px-3 py-1.5 rounded-lg text-sm font-medium border transition-all bg-indigo-600 text-white border-indigo-600"
                      : "px-3 py-1.5 rounded-lg text-sm font-medium border transition-all bg-white text-slate-700 border-slate-200 hover:border-indigo-400"
                    }
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