import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function WalletAssetSelect({ assets, value, onValueChange, label = "NFT uit wallet" }) {
  return (
    <div>
      <Label>{label}</Label>
      <Select value={value || ""} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Selecteer asset uit verbonden wallet" />
        </SelectTrigger>
        <SelectContent>
          {assets.map((asset) => (
            <SelectItem key={asset.unit} value={asset.unit}>
              {asset.asset_label} · qty {asset.quantity}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}