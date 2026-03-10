import React, { useState } from "react";
import { Copy, Check, Code2, Monitor, ExternalLink } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ICONS_SVG, ICONS_JSX } from "./iconData";

const sizeStyles = {
  sm: { padding: "8px 18px", fontSize: "13px" },
  md: { padding: "12px 28px", fontSize: "15px" },
  lg: { padding: "16px 36px", fontSize: "17px" },
};
const borderRadii = { none: "0px", sm: "4px", md: "8px", lg: "12px", full: "9999px" };

export default function StepGetCode({ config, selectedLink, onBack }) {
  const [copied, setCopied] = useState(null);

  const baseUrl = window.location.origin;
  const { buttonText, colorOption, customColor, rounded, size, showAmount, showPoweredBy, showIcon, selectedIcon, hoverEffect, shadow } = config;

  const bgColor = colorOption === "custom" ? customColor : colorOption;
  const shadowStyle = shadow ? "0 4px 14px rgba(0,0,0,0.25)" : "none";

  const amountSuffix = showAmount && selectedLink
    ? selectedLink.amount_mode === "fixed_cnt"
      ? ` — ${selectedLink.cnt_amount?.toLocaleString() || "—"} ${selectedLink.cnt_ticker || "CNT"}`
      : selectedLink.amount_mode === "fixed_fiat"
      ? ` — ${selectedLink.fiat_currency} ${selectedLink.amount_fiat?.toFixed(2) || "—"}`
      : ` — ₳ ${selectedLink.amount_ada?.toFixed(2) || "—"}`
    : "";

  const previewLabel = (buttonText || "Pay with ADA") + amountSuffix;
  const activeIcon = ICONS_JSX[showIcon ? selectedIcon : "none"] || null;
  const iconSvg = showIcon ? (ICONS_SVG[selectedIcon] || "") : "";

  const hoverScript = hoverEffect
    ? `
      btn.addEventListener("mouseover",function(){btn.style.filter="brightness(1.12)";btn.style.transform="translateY(-1px)";});
      btn.addEventListener("mouseout",function(){btn.style.filter="brightness(1)";btn.style.transform="translateY(0)";});`
    : "";

  const buttonCode = `<!-- PayADA Button -->
<style>.payada-btn{transition:filter .15s ease,transform .15s ease;}</style>
<script>
  document.addEventListener("DOMContentLoaded",function(){
    document.querySelectorAll(".payada-btn").forEach(function(btn){
      btn.addEventListener("click",function(){window.location.href="${baseUrl}/Pay?slug="+btn.getAttribute("data-slug");});${hoverScript}
    });
  });
</script>
<button class="payada-btn" data-slug="${selectedLink?.slug || "your-slug"}" style="background:${bgColor};color:#fff;border:none;cursor:pointer;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-weight:700;padding:${sizeStyles[size].padding};font-size:${sizeStyles[size].fontSize};border-radius:${borderRadii[rounded]};box-shadow:${shadowStyle};letter-spacing:-0.01em;line-height:1.3;">${iconSvg}${previewLabel}${showPoweredBy ? '<span style="display:block;font-size:10px;opacity:0.7;margin-top:2px;">Powered by PayADA</span>' : ""}
</button>`;

  const iframeCode = `<iframe src="${baseUrl}/Pay?slug=${selectedLink?.slug || "your-slug"}" width="400" height="540" frameborder="0" style="border-radius:16px;box-shadow:0 4px 32px rgba(0,0,0,0.15);" allow="clipboard-write"></iframe>`;

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900">Your button is ready 🎉</h2>
        <p className="text-slate-500 mt-1">Copy the code below and paste it on your website</p>
      </div>

      {/* Live Preview */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 p-8 flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium uppercase tracking-wider">
          <Monitor className="w-3.5 h-3.5" /> Live Preview
        </div>
        <button
          onClick={() => selectedLink && (window.location.href = `${baseUrl}/Pay?slug=${selectedLink.slug}`)}
          title="Click to test checkout"
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
          }}
          onMouseOver={hoverEffect ? (e) => { e.currentTarget.style.filter = "brightness(1.12)"; e.currentTarget.style.transform = "translateY(-1px)"; } : undefined}
          onMouseOut={hoverEffect ? (e) => { e.currentTarget.style.filter = "brightness(1)"; e.currentTarget.style.transform = "translateY(0)"; } : undefined}
        >
          {activeIcon}
          {previewLabel}
          {showPoweredBy && (
            <span style={{ display: "block", fontSize: "10px", opacity: 0.7, marginTop: "2px" }}>
              Powered by PayADA
            </span>
          )}
        </button>
        {selectedLink && (
          <a
            href={`${baseUrl}/Pay?slug=${selectedLink.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-700 font-medium"
          >
            <ExternalLink className="w-3 h-3" /> Open checkout page
          </a>
        )}
      </div>

      {/* Code */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-4">
          <Code2 className="w-4 h-4 text-slate-400" />
          Embed Code
        </div>
        <Tabs defaultValue="button">
          <TabsList className="mb-4 bg-slate-100 p-1 rounded-xl">
            <TabsTrigger value="button" className="rounded-lg">Button</TabsTrigger>
            <TabsTrigger value="iframe" className="rounded-lg">iFrame</TabsTrigger>
          </TabsList>

          <TabsContent value="button">
            <div className="relative">
              <pre className="bg-slate-900 text-slate-200 rounded-xl p-4 text-xs overflow-auto max-h-52 leading-relaxed whitespace-pre-wrap break-all">
                {buttonCode}
              </pre>
              <button
                className="absolute top-2.5 right-2.5 bg-white/10 hover:bg-white/20 text-white text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
                onClick={() => copy(buttonCode, "button")}
              >
                {copied === "button" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied === "button" ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-3">Paste into any HTML page — works on WordPress, Webflow, or any static site.</p>
          </TabsContent>

          <TabsContent value="iframe">
            <div className="relative">
              <pre className="bg-slate-900 text-slate-200 rounded-xl p-4 text-xs overflow-auto max-h-52 leading-relaxed whitespace-pre-wrap break-all">
                {iframeCode}
              </pre>
              <button
                className="absolute top-2.5 right-2.5 bg-white/10 hover:bg-white/20 text-white text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
                onClick={() => copy(iframeCode, "iframe")}
              >
                {copied === "iframe" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied === "iframe" ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-3">Embeds the full checkout page in an iframe — perfect for landing pages.</p>
          </TabsContent>
        </Tabs>
      </div>

      <button
        onClick={onBack}
        className="w-full py-3 rounded-2xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all"
      >
        ← Edit button
      </button>
    </div>
  );
}