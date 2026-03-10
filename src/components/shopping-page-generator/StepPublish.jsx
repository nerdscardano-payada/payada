import React, { useState } from "react";
import { Copy, Check, Code2, Monitor, Eye, Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function StepPublish({ generatePage, shopTitle, theme, font, logoText, enableCategories, enableCart, products, onBack }) {
  const [copied, setCopied] = useState(null);
  const accent = theme.accent;
  const categories = [...new Set(products.map((p) => p.category || "uncategorized"))];

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    toast.success("Gekopieerd!");
    setTimeout(() => setCopied(null), 2000);
  };

  const openPreview = () => {
    const html = generatePage();
    const blob = new Blob([html], { type: "text/html" });
    window.open(URL.createObjectURL(blob), "_blank");
  };

  const download = () => {
    const html = generatePage();
    const blob = new Blob([html], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${shopTitle.toLowerCase().replace(/\s+/g, "-")}-shop.html`;
    a.click();
  };

  const iframeCode = `<iframe src="https://jouw-domein.com/shop.html" width="100%" height="800" frameborder="0" style="border-radius:16px;border:none;"></iframe>`;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900">Your store is ready 🎉</h2>
        <p className="text-slate-500 mt-1">Preview, download or embed your shop page</p>
      </div>

      {/* Mini Preview */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium uppercase tracking-wider">
            <Monitor className="w-3.5 h-3.5" /> Live Preview
          </div>
          <button
            onClick={openPreview}
            className="flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-700 font-semibold"
          >
            <Eye className="w-3 h-3" /> Open full preview
          </button>
        </div>

        {/* Thumbnail preview */}
        <div className="rounded-xl overflow-hidden shadow-inner" style={{ background: theme.bg, fontFamily: font, minHeight: 180 }}>
          <div style={{ background: theme.card, padding: "10px 16px", borderBottom: `1px solid rgba(255,255,255,0.06)`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ color: theme.text, fontWeight: 800, fontSize: 13 }}>{logoText}</span>
            {enableCart && <span style={{ fontSize: 14 }}>🛒</span>}
          </div>
          <div style={{ padding: "16px 16px 8px", textAlign: "center" }}>
            <div style={{ color: theme.text, fontWeight: 900, fontSize: 14, marginBottom: 4 }}>{shopTitle}</div>
            {enableCategories && (
              <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 10 }}>
                <span style={{ background: accent, color: "#fff", padding: "2px 8px", borderRadius: 99, fontSize: 9, fontWeight: 700 }}>All</span>
                {categories.slice(0, 2).map((c) => (
                  <span key={c} style={{ background: accent + "30", color: theme.text, padding: "2px 8px", borderRadius: 99, fontSize: 9, textTransform: "capitalize" }}>{c}</span>
                ))}
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {products.slice(0, 3).map((p) => (
                <div key={p.id} style={{ background: theme.card, borderRadius: 10, overflow: "hidden" }}>
                  {p.imageUrl
                    ? <img src={p.imageUrl} alt="" style={{ width: "100%", height: 50, objectFit: "cover", display: "block" }} />
                    : <div style={{ height: 50, background: accent + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🛍️</div>
                  }
                  <div style={{ padding: "6px 8px" }}>
                    <div style={{ color: theme.text, fontSize: 9, fontWeight: 700, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name || "Product"}</div>
                    <div style={{ color: accent, fontSize: 10, fontWeight: 900 }}>₳ {p.price || "0"}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Code Export */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-4">
          <Code2 className="w-4 h-4 text-slate-400" /> Export Code
        </div>
        <Tabs defaultValue="page">
          <TabsList className="mb-4 bg-slate-100 p-1 rounded-xl">
            <TabsTrigger value="page" className="rounded-lg">Full HTML Page</TabsTrigger>
            <TabsTrigger value="iframe" className="rounded-lg">iFrame Embed</TabsTrigger>
          </TabsList>

          <TabsContent value="page">
            <div className="relative">
              <pre className="bg-slate-900 text-slate-200 rounded-xl p-4 text-xs overflow-auto max-h-44 leading-relaxed whitespace-pre-wrap break-all">
                {generatePage().slice(0, 600)}...
              </pre>
              <button
                className="absolute top-2.5 right-2.5 bg-white/10 hover:bg-white/20 text-white text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
                onClick={() => copy(generatePage(), "page")}
                >
                {copied === "page" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied === "page" ? "Copied!" : "Copy"}
                </button>
                </div>
                <p className="text-xs text-slate-400 mt-3">Save as <code className="bg-slate-100 px-1 rounded">.html</code> and host anywhere, or download below.</p>
          </TabsContent>

          <TabsContent value="iframe">
            <div className="relative">
              <pre className="bg-slate-900 text-slate-200 rounded-xl p-4 text-xs overflow-auto max-h-44 leading-relaxed whitespace-pre-wrap break-all">
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
                <p className="text-xs text-slate-400 mt-3">Embed your shop on any existing website via iframe.</p>
          </TabsContent>
        </Tabs>

        <Button
          className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 gap-2"
          onClick={download}
        >
          <Download className="w-4 h-4" />
          Download HTML File
        </Button>
      </div>

      <button
        onClick={onBack}
        className="w-full py-3 rounded-2xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all"
      >
        ← Edit products
      </button>
    </div>
  );
}