import React from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const THEMES = [
  { label: "Midnight", bg: "#080c14", accent: "#818cf8", text: "#f1f5f9", card: "#0f172a", cardBorder: "rgba(129,140,248,0.12)" },
  { label: "Soft White", bg: "#f0f4ff", accent: "#6366f1", text: "#0f172a", card: "#ffffff", cardBorder: "rgba(99,102,241,0.12)" },
  { label: "Forest", bg: "#030d07", accent: "#4ade80", text: "#f0fdf4", card: "#071a0f", cardBorder: "rgba(74,222,128,0.12)" },
  { label: "Ocean", bg: "#030c14", accent: "#38bdf8", text: "#f0f9ff", card: "#0a1929", cardBorder: "rgba(56,189,248,0.12)" },
  { label: "Sunset", bg: "#0f0500", accent: "#fb923c", text: "#fff7ed", card: "#1a0a00", cardBorder: "rgba(251,146,60,0.12)" },
  { label: "Rose", bg: "#0f000a", accent: "#f472b6", text: "#fdf2f8", card: "#1a0010", cardBorder: "rgba(244,114,182,0.12)" },
];

const FONTS = [
  { label: "Inter (Modern)", value: "'Inter', sans-serif" },
  { label: "Georgia (Elegant)", value: "Georgia, serif" },
  { label: "Mono (Technical)", value: "'Courier New', monospace" },
  { label: "System Default", value: "system-ui, sans-serif" },
];

export { THEMES, FONTS };

export default function StepShopInfo({ config, onChange, onNext }) {
  const { shopTitle, shopSubtitle, logoText, footerText, theme, customAccent, useCustomAccent, font, showPoweredBy, enableCart, enableCategories, enableSearch } = config;

  const set = (key, val) => onChange({ ...config, [key]: val });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900">Winkelinfo & Design</h2>
        <p className="text-slate-500 mt-1">Stel je winkel in en kies een thema</p>
      </div>

      {/* Store Info */}
      <div className="space-y-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Winkelgegevens</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-500">Logo / Winkelnaam</Label>
            <Input value={logoText} onChange={(e) => set("logoText", e.target.value)} placeholder="🛒 MyShop" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-500">Paginatitel</Label>
            <Input value={shopTitle} onChange={(e) => set("shopTitle", e.target.value)} placeholder="My ADA Shop" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500">Hero Ondertitel</Label>
          <Input value={shopSubtitle} onChange={(e) => set("shopSubtitle", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500">Footer Tekst</Label>
          <Input value={footerText} onChange={(e) => set("footerText", e.target.value)} />
        </div>
      </div>

      {/* Features */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Functies</p>
        {[
          { label: "Winkelwagen & Bulk Checkout", key: "enableCart" },
          { label: "Categorie Filters", key: "enableCategories" },
          { label: "Product Zoeken", key: "enableSearch" },
        ].map(({ label, key }) => (
          <div key={key} className="flex items-center justify-between py-1">
            <Label className="text-sm text-slate-600">{label}</Label>
            <Switch checked={config[key]} onCheckedChange={(v) => set(key, v)} />
          </div>
        ))}
      </div>

      {/* Design */}
      <div className="space-y-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Design</p>
        <div className="space-y-2">
          <Label className="text-xs text-slate-500">Kleurthema</Label>
          <div className="grid grid-cols-6 gap-2">
            {THEMES.map((t) => (
              <button
                key={t.label}
                onClick={() => set("theme", t)}
                title={t.label}
                className={`relative h-10 rounded-xl border-2 transition-all overflow-hidden ${theme.label === t.label ? "border-indigo-500 scale-105 shadow-lg" : "border-slate-200 hover:border-slate-300"}`}
                style={{ background: t.bg }}
              >
                <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full" style={{ background: t.accent }}></span>
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400">Geselecteerd: <span className="font-medium text-slate-600">{theme.label}</span></p>
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-sm text-slate-600">Aangepaste accentkleur</Label>
          <Switch checked={useCustomAccent} onCheckedChange={(v) => set("useCustomAccent", v)} />
        </div>
        {useCustomAccent && (
          <div className="flex items-center gap-2">
            <input type="color" value={customAccent} onChange={(e) => set("customAccent", e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-slate-200" />
            <Input value={customAccent} onChange={(e) => set("customAccent", e.target.value)} className="font-mono text-xs" />
          </div>
        )}

        <div className="space-y-1.5">
          <Label className="text-xs text-slate-500">Lettertype</Label>
          <Select value={font} onValueChange={(v) => set("font", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {FONTS.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-sm text-slate-600">Toon "Powered by PayADA"</Label>
          <Switch checked={showPoweredBy} onCheckedChange={(v) => set("showPoweredBy", v)} />
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onNext}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all hover:brightness-110"
      >
        Doorgaan naar producten →
      </motion.button>
    </div>
  );
}