import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Copy, Check, Code2, Monitor, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import PageHeader from "@/components/shared/PageHeader";

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
  {
    label: "Gift",
    key: "gift",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:7px;margin-bottom:1px"><path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>`,
    jsx: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display:"inline", verticalAlign:"middle", marginRight:"7px", marginBottom:"1px" }}>
        <path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/>
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
      </svg>
    ),
  },
  {
    label: "Wallet",
    key: "wallet",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:7px;margin-bottom:1px"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>`,
    jsx: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display:"inline", verticalAlign:"middle", marginRight:"7px", marginBottom:"1px" }}>
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>
      </svg>
    ),
  },
  {
    label: "Creditcard",
    key: "card",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:7px;margin-bottom:1px"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>`,
    jsx: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display:"inline", verticalAlign:"middle", marginRight:"7px", marginBottom:"1px" }}>
        <rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>
      </svg>
    ),
  },
  {
    label: "Munt / Coin",
    key: "coin",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:7px;margin-bottom:1px"><circle cx="12" cy="12" r="10"/><path d="M12 6v2m0 8v2M9 10h4.5a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3H15"/></svg>`,
    jsx: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display:"inline", verticalAlign:"middle", marginRight:"7px", marginBottom:"1px" }}>
        <circle cx="12" cy="12" r="10"/><path d="M12 6v2m0 8v2M9 10h4.5a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3H15"/>
      </svg>
    ),
  },
  {
    label: "Pijl / Arrow",
    key: "arrow",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:7px;margin-bottom:1px"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`,
    jsx: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display:"inline", verticalAlign:"middle", marginRight:"7px", marginBottom:"1px" }}>
        <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
      </svg>
    ),
  },
  {
    label: "Slot / Lock",
    key: "lock",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:7px;margin-bottom:1px"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    jsx: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display:"inline", verticalAlign:"middle", marginRight:"7px", marginBottom:"1px" }}>
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
  },
  {
    label: "Bliksem / Zap",
    key: "zap",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:7px;margin-bottom:1px"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
    jsx: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display:"inline", verticalAlign:"middle", marginRight:"7px", marginBottom:"1px" }}>
        <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    ),
  },
];

export default function ButtonGenerator() {
  const [selectedLinkId, setSelectedLinkId] = useState("");
  const [buttonText, setButtonText] = useState("Pay with ADA");
  const [colorOption, setColorOption] = useState("#6366f1");
  const [customColor, setCustomColor] = useState("#6366f1");
  const [rounded, setRounded] = useState("lg");
  const [size, setSize] = useState("md");
  const [showAmount, setShowAmount] = useState(true);
  const [showPoweredBy, setShowPoweredBy] = useState(true);
  const [showIcon, setShowIcon] = useState(true);
  const [selectedIcon, setSelectedIcon] = useState("gift");
  const [hoverEffect, setHoverEffect] = useState(true);
  const [shadow, setShadow] = useState(true);
  const [copied, setCopied] = useState(null);

  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: links = [] } = useQuery({
    queryKey: ["paymentLinks", user?.email],
    queryFn: () => base44.entities.PaymentLink.filter({ merchant_id: user.email, status: "active" }, "-created_date", 100),
    enabled: !!user,
  });

  const selectedLink = links.find((l) => l.id === selectedLinkId);
  const baseUrl = window.location.origin;
  const bgColor = colorOption === "custom" ? customColor : colorOption;

  const sizeStyles = {
    sm: { padding: "8px 18px", fontSize: "13px" },
    md: { padding: "12px 28px", fontSize: "15px" },
    lg: { padding: "16px 36px", fontSize: "17px" },
  };

  const borderRadii = { none: "0px", sm: "4px", md: "8px", lg: "12px", full: "9999px" };

  const previewLabel = [
    buttonText || "Pay with ADA",
    showAmount && selectedLink ? ` — ₳ ${selectedLink.amount_ada?.toFixed(2)}` : "",
  ].join("");

  // ---- Embed code generators ----
  const shadowStyle = shadow ? "0 4px 14px rgba(0,0,0,0.25)" : "none";
  const hoverScript = hoverEffect
    ? `
      btn.addEventListener("mouseover", function() {
        btn.style.filter = "brightness(1.12)";
        btn.style.transform = "translateY(-1px)";
      });
      btn.addEventListener("mouseout", function() {
        btn.style.filter = "brightness(1)";
        btn.style.transform = "translateY(0)";
      });`
    : "";

  const activeIcon = ICONS.find((i) => i.key === selectedIcon) || ICONS[0];
  const iconSvg = showIcon ? activeIcon.svg : "";

  const buttonCode = `<!-- PayADA Button -->
<style>
  .payada-btn { transition: filter 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease; }
</style>
<script>
  document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll(".payada-btn").forEach(function(btn) {
      btn.addEventListener("click", function() {
        window.location.href = "${baseUrl}/Pay?slug=" + btn.getAttribute("data-slug");
      });${hoverScript}
    });
  });
</script>

<button
  class="payada-btn"
  data-slug="${selectedLink?.slug || "your-slug"}"
  style="
    background: ${bgColor};
    color: #fff;
    border: none;
    cursor: pointer;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-weight: 700;
    padding: ${sizeStyles[size].padding};
    font-size: ${sizeStyles[size].fontSize};
    border-radius: ${borderRadii[rounded]};
    box-shadow: ${shadowStyle};
    letter-spacing: -0.01em;
    line-height: 1.3;
  "
>${iconSvg}${previewLabel}${showPoweredBy ? '\n  <span style="display:block;font-size:10px;opacity:0.7;margin-top:2px;">Powered by PayADA</span>' : ""}
</button>`;

  const iframeCode = `<iframe
  src="${baseUrl}/Pay?slug=${selectedLink?.slug || "your-slug"}"
  width="400"
  height="540"
  frameborder="0"
  style="border-radius: 16px; box-shadow: 0 4px 32px rgba(0,0,0,0.15);"
  allow="clipboard-write"
></iframe>`;

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    toast.success("Copied!");
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div>
      <PageHeader
        title="Button Generator"
        subtitle="Generate embed code to add ADA payments to any website"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* --- Left: Settings --- */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200/60 p-6 space-y-5">
            <h2 className="text-sm font-semibold text-slate-700">1. Select Payment Link</h2>
            <Select value={selectedLinkId} onValueChange={setSelectedLinkId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a payment link…" />
              </SelectTrigger>
              <SelectContent>
                {links.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.title} — ₳ {l.amount_ada?.toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/60 p-6 space-y-5">
            <h2 className="text-sm font-semibold text-slate-700">2. Customize Button</h2>

            <div className="space-y-2">
              <Label className="text-xs text-slate-500">Button Text</Label>
              <Input
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                placeholder="Pay with ADA"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-slate-500">Color</Label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setColorOption(c.value)}
                    className={`w-8 h-8 rounded-lg border-2 transition-all ${colorOption === c.value ? "border-slate-900 scale-110" : "border-transparent"}`}
                    style={{ background: c.value === "custom" ? "linear-gradient(135deg,#f0f,#0ff)" : c.value }}
                    title={c.label}
                  />
                ))}
              </div>
              {colorOption === "custom" && (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-0"
                  />
                  <Input
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-slate-500">Size</Label>
                <Select value={size} onValueChange={setSize}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sm">Small</SelectItem>
                    <SelectItem value="md">Medium</SelectItem>
                    <SelectItem value="lg">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-slate-500">Rounded</Label>
                <Select value={rounded} onValueChange={setRounded}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Square</SelectItem>
                    <SelectItem value="sm">Slightly</SelectItem>
                    <SelectItem value="md">Medium</SelectItem>
                    <SelectItem value="lg">Rounded</SelectItem>
                    <SelectItem value="full">Pill</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-xs text-slate-500">Show Amount</Label>
              <Switch checked={showAmount} onCheckedChange={setShowAmount} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-slate-500">Show icon</Label>
              <Switch checked={showIcon} onCheckedChange={setShowIcon} />
            </div>
            {showIcon && (
              <div className="space-y-2">
                <Label className="text-xs text-slate-500">Icon kiezen</Label>
                <Select value={selectedIcon} onValueChange={setSelectedIcon}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ICONS.map((ic) => (
                      <SelectItem key={ic.key} value={ic.key}>{ic.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex items-center justify-between">
              <Label className="text-xs text-slate-500">Hover animation</Label>
              <Switch checked={hoverEffect} onCheckedChange={setHoverEffect} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-slate-500">Drop shadow</Label>
              <Switch checked={shadow} onCheckedChange={setShadow} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-slate-500">Show "Powered by PayADA"</Label>
              <Switch checked={showPoweredBy} onCheckedChange={setShowPoweredBy} />
            </div>
          </div>
        </div>

        {/* --- Right: Preview + Code --- */}
        <div className="space-y-5">
          {/* Preview */}
          <div className="bg-white rounded-xl border border-slate-200/60 p-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Monitor className="w-4 h-4 text-slate-400" />
              Live Preview
            </h2>
            <div className="bg-slate-50 rounded-lg flex flex-col items-center justify-center py-12 gap-3">
              <button
                onClick={() => selectedLink ? window.open(`${baseUrl}/Pay?slug=${selectedLink.slug}`, '_blank') : toast.info("Select a payment link first")}
                title={selectedLink ? "Click to test checkout" : "Select a payment link to test"}
                style={{
                  background: bgColor,
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontWeight: 700,
                  padding: sizeStyles[size].padding,
                  fontSize: sizeStyles[size].fontSize,
                  borderRadius: borderRadii[rounded],
                  textAlign: "center",
                  lineHeight: 1.3,
                  letterSpacing: "-0.01em",
                  boxShadow: shadow ? "0 4px 14px rgba(0,0,0,0.25)" : "none",
                  transition: "filter 0.15s ease, transform 0.15s ease",
                  WebkitFontSmoothing: "antialiased",
                }}
                onMouseOver={hoverEffect ? (e) => { e.currentTarget.style.filter = "brightness(1.12)"; e.currentTarget.style.transform = "translateY(-1px)"; } : undefined}
                onMouseOut={hoverEffect ? (e) => { e.currentTarget.style.filter = "brightness(1)"; e.currentTarget.style.transform = "translateY(0)"; } : undefined}
              >
                {showIcon && activeIcon.jsx}
                {previewLabel}
                {showPoweredBy && (
                  <span style={{ display: "block", fontSize: "10px", opacity: 0.7, marginTop: "2px" }}>
                    Powered by PayADA
                  </span>
                )}
              </button>
              {selectedLink && (
                <p className="text-xs text-slate-400">↑ Click to test the checkout page</p>
              )}
            </div>
          </div>

          {/* Embed Code */}
          <div className="bg-white rounded-xl border border-slate-200/60 p-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-slate-400" />
              Embed Code
            </h2>
            <Tabs defaultValue="button">
              <TabsList className="mb-4">
                <TabsTrigger value="button">Button</TabsTrigger>
                <TabsTrigger value="iframe">iFrame</TabsTrigger>
              </TabsList>

              <TabsContent value="button">
                <div className="relative">
                  <pre className="bg-slate-900 text-slate-200 rounded-lg p-4 text-xs overflow-auto max-h-56 leading-relaxed whitespace-pre-wrap break-all">
                    {buttonCode}
                  </pre>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-2 right-2"
                    onClick={() => copy(buttonCode, "button")}
                  >
                    {copied === "button" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>
                </div>
                <p className="text-xs text-slate-400 mt-3">
                  Paste this into any HTML page. Works on WordPress, Webflow, or any static site.
                </p>
              </TabsContent>

              <TabsContent value="iframe">
                <div className="relative">
                  <pre className="bg-slate-900 text-slate-200 rounded-lg p-4 text-xs overflow-auto max-h-56 leading-relaxed whitespace-pre-wrap break-all">
                    {iframeCode}
                  </pre>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute top-2 right-2"
                    onClick={() => copy(iframeCode, "iframe")}
                  >
                    {copied === "iframe" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>
                </div>
                <p className="text-xs text-slate-400 mt-3">
                  Embeds the full checkout page in an iframe — perfect for landing pages.
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}