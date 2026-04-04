import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function FeeSelector({ form, update }) {
  return (
    <div className="space-y-1.5">
      <Label>Who pays the fee?</Label>
      <Select value={form.fee_model || "merchant_pays"} onValueChange={(v) => update("fee_model", v)}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="customer_pays">Customer pays fee</SelectItem>
          <SelectItem value="merchant_pays">I pay the fee</SelectItem>
          <SelectItem value="split">Split the fee</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-xs text-slate-400">
        {(form.fee_model || "merchant_pays") === "customer_pays" && "You receive the full amount."}
        {form.fee_model === "merchant_pays" && "Customer pays the exact amount."}
        {form.fee_model === "split" && "Fee is shared between you and the customer."}
      </p>
    </div>
  );
}