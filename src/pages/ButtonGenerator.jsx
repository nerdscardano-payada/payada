import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Copy, Check, Code2, Monitor } from "lucide-react";
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
  { label: "Blue", value: "#3b82f6" },
  { label: "Teal", value: "#14b8a6" },
  { label: "Black", value: "#0f172a" },
  { label: "Custom", value: "custom" },
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
  const [copied, setCopied] = useState(null);

  const { data: links = [] } = useQuery({
    queryKey: ["paymentLinks"],
    queryFn: () => base44.entities.PaymentLink.filter({ status: "active" }, "-created_date", 100),
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
  const buttonCode = `<!-- PayADA Button -->
<script>
  document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll(".payada-btn").forEach(function(btn) {
      btn.addEventListener("click", function() {
        window.location.href = "${baseUrl}/Pay?slug=" + btn.getAttribute("data-slug");
      });
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
    font-family: sans-serif;
    font-weight: 600;
    padding: ${sizeStyles[size].padding};
    font-size: ${sizeStyles[size].fontSize};
    border-radius: ${borderRadii[rounded]};
  "
>${previewLabel}${showPoweredBy ? '\n  <span style="display:block;font-size:10px;opacity:0.7;margin-top:2px;">Powered by PayADA</span>' : ""}
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
            <div className="bg-slate-50 rounded-lg flex items-center justify-center py-12">
              <button
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
                  WebkitFontSmoothing: "antialiased",
                  textRendering: "optimizeLegibility",
                }}
              >
                {previewLabel}
                {showPoweredBy && (
                  <span style={{ display: "block", fontSize: "10px", opacity: 0.7, marginTop: "2px" }}>
                    Powered by PayADA
                  </span>
                )}
              </button>
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