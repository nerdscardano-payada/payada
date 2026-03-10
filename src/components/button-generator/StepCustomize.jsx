import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const COLORS = [
  { label: "Indigo", value: "#6366f1" },
  { label: "Purple", value: "#8b5cf6" },
  { label: "Violet", value: "#7c3aed" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Sky", value: "#0ea5e9" },
  { label: "Cyan", value: "#06b6d4" },
  { label: "Teal", value: "#14b8a6" },
  { label: "Emerald", value: "#10b981" },
  { label: "Green", value: "#22c55e" },
  { label: "Orange", value: "#f97316" },
  { label: "Rose", value: "#f43f5e" },
  { label: "Pink", value: "#ec4899" },
  { label: "Slate", value: "#475569" },
  { label: "Black", value: "#0f172a" },
  { label: "Gold", value: "#d97706" },
  { label: "Custom", value: "custom" },
];

const ICONS = [
  { label: "Gift", key: "gift" },
  { label: "Wallet", key: "wallet" },
  { label: "Credit Card", key: "card" },
  { label: "Coin", key: "coin" },
  { label: "Arrow", key: "arrow" },
  { label: "Lock", key: "lock" },
  { label: "Zap", key: "zap" },
  { label: "None", key: "none" },
];

function OptionRow({ label, children }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-600 font-medium">{label}</span>
      <div>{children}</div>
    </div>
  );
}

export default function StepCustomize({ config, onChange, onBack, onNext }) {
  const { buttonText, colorOption, customColor, rounded, size, showAmount, showPoweredBy, showIcon, selectedIcon, hoverEffect, shadow } = config;

  const set = (key, val) => onChange({ ...config, [key]: val });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900">Customize your button</h2>
        <p className="text-slate-500 mt-1">Make it match your brand perfectly</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-1">
        <div className="mb-3">
          <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Button Text</Label>
          <Input
            value={buttonText}
            onChange={(e) => set("buttonText", e.target.value)}
            placeholder="Pay with ADA"
            className="mt-1.5"
          />
        </div>

        <div className="mb-4">
          <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Color</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => set("colorOption", c.value)}
                className={cn(
                  "w-8 h-8 rounded-xl border-2 transition-all",
                  colorOption === c.value ? "border-slate-800 scale-115 shadow-md" : "border-transparent hover:scale-105"
                )}
                style={{ background: c.value === "custom" ? "linear-gradient(135deg,#f0f,#0ff)" : c.value }}
                title={c.label}
              />
            ))}
          </div>
          {colorOption === "custom" && (
            <div className="flex items-center gap-2 mt-3">
              <input
                type="color"
                value={customColor}
                onChange={(e) => set("customColor", e.target.value)}
                className="w-9 h-9 rounded-lg cursor-pointer border border-slate-200"
              />
              <Input
                value={customColor}
                onChange={(e) => set("customColor", e.target.value)}
                className="font-mono text-xs"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 py-3 border-t border-slate-100">
          <div>
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Size</Label>
            <Select value={size} onValueChange={(v) => set("size", v)}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sm">Small</SelectItem>
                <SelectItem value="md">Medium</SelectItem>
                <SelectItem value="lg">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Shape</Label>
            <Select value={rounded} onValueChange={(v) => set("rounded", v)}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Square</SelectItem>
                <SelectItem value="sm">Slight</SelectItem>
                <SelectItem value="md">Medium</SelectItem>
                <SelectItem value="lg">Rounded</SelectItem>
                <SelectItem value="full">Pill</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {showIcon && (
          <div className="py-2">
            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Icon</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {ICONS.map((ic) => (
                <button
                  key={ic.key}
                  onClick={() => set("selectedIcon", ic.key)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-medium border transition-all",
                    selectedIcon === ic.key
                      ? "bg-indigo-500 text-white border-indigo-500 shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                  )}
                >
                  {ic.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <OptionRow label="Show Amount">
          <Switch checked={showAmount} onCheckedChange={(v) => set("showAmount", v)} />
        </OptionRow>
        <OptionRow label="Show Icon">
          <Switch checked={showIcon} onCheckedChange={(v) => set("showIcon", v)} />
        </OptionRow>
        <OptionRow label="Hover Animation">
          <Switch checked={hoverEffect} onCheckedChange={(v) => set("hoverEffect", v)} />
        </OptionRow>
        <OptionRow label="Drop Shadow">
          <Switch checked={shadow} onCheckedChange={(v) => set("shadow", v)} />
        </OptionRow>
        <OptionRow label='Show "Powered by PayADA"'>
          <Switch checked={showPoweredBy} onCheckedChange={(v) => set("showPoweredBy", v)} />
        </OptionRow>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3.5 rounded-2xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          className="flex-[2] py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-200 hover:brightness-110 transition-all"
        >
          Get the code →
        </button>
      </div>
    </div>
  );
}