import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Copy, Check, Monitor, ShoppingCart, Plus, Trash2, Image, Palette,
  Type, Layout, Code2, Eye, ChevronDown, ChevronUp, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import PageHeader from "@/components/shared/PageHeader";

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

const LAYOUTS = [
  { label: "Product Left", value: "left" },
  { label: "Product Right", value: "right" },
  { label: "Centered Hero", value: "center" },
];

const emptyProduct = () => ({
  id: Date.now(),
  name: "",
  description: "",
  price: "",
  imageUrl: "",
  linkId: "",
  badge: "",
  features: "",
});

export default function ShoppingPageGenerator() {
  const [shopTitle, setShopTitle] = useState("My ADA Shop");
  const [shopSubtitle, setShopSubtitle] = useState("Accept payments in Cardano ADA");
  const [logoText, setLogoText] = useState("🛒 MyShop");
  const [theme, setTheme] = useState(THEMES[0]);
  const [customAccent, setCustomAccent] = useState("#6366f1");
  const [useCustomAccent, setUseCustomAccent] = useState(false);
  const [font, setFont] = useState(FONTS[0].value);
  const [layout, setLayout] = useState("left");
  const [showReviews, setShowReviews] = useState(true);
  const [showBadges, setShowBadges] = useState(true);
  const [showPoweredBy, setShowPoweredBy] = useState(true);
  const [footerText, setFooterText] = useState("© 2025 MyShop. Powered by PayADA.");
  const [products, setProducts] = useState([{ ...emptyProduct(), id: 1, name: "Product 1", description: "Describe your product here.", price: "10", badge: "Best Seller" }]);
  const [expandedProduct, setExpandedProduct] = useState(1);
  const [copied, setCopied] = useState(null);
  const [activeTab, setActiveTab] = useState("page");

  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: links = [] } = useQuery({
    queryKey: ["paymentLinks", user?.email],
    queryFn: () => base44.entities.PaymentLink.filter({ merchant_id: user.email, status: "active" }, "-created_date", 100),
    enabled: !!user,
  });

  const baseUrl = window.location.origin;
  const accent = useCustomAccent ? customAccent : theme.accent;

  const addProduct = () => {
    const newP = { ...emptyProduct() };
    setProducts((prev) => [...prev, newP]);
    setExpandedProduct(newP.id);
  };

  const removeProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const updateProduct = (id, field, value) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  // ── Generate full standalone HTML page ──
  const generatePage = () => {
    const fontImport = font.includes("Inter")
      ? `<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">`
      : "";

    const cardBorder = theme.cardBorder || "rgba(255,255,255,0.07)";

    const productCards = products.map((p) => {
      const link = links.find((l) => l.id === p.linkId);
      const slug = link?.slug || "";
      const featList = p.features
        ? p.features.split("\n").filter(Boolean).map((f) => `<li style="padding:6px 0;display:flex;align-items:center;gap:10px;font-size:14px;color:${theme.text};opacity:0.8;"><span style="color:${accent};font-size:16px;">✦</span> ${f}</li>`).join("")
        : "";
      const badgeHtml = showBadges && p.badge
        ? `<span style="display:inline-flex;align-items:center;gap:5px;background:${accent}18;color:${accent};border:1px solid ${accent}40;font-size:10px;font-weight:700;padding:4px 12px;border-radius:999px;margin-bottom:16px;letter-spacing:0.08em;text-transform:uppercase;">${p.badge}</span>`
        : "";
      const reviewHtml = showReviews
        ? `<div style="display:flex;align-items:center;gap:6px;margin:12px 0 4px;">
            <div style="display:flex;gap:2px;">${'<span style="color:#fbbf24;font-size:14px;">★</span>'.repeat(5)}</div>
            <span style="color:${theme.text};opacity:0.35;font-size:12px;">5.0 · ${Math.floor(Math.random() * 80) + 20} reviews</span>
           </div>`
        : "";
      const flexDir = layout === "right" ? "row-reverse" : "row";

      return `
      <div class="product-card" style="
        background:${theme.card};
        border:1px solid ${cardBorder};
        border-radius:24px;
        overflow:hidden;
        margin-bottom:48px;
        display:flex;
        flex-wrap:wrap;
        flex-direction:${flexDir};
        gap:0;
        box-shadow:0 0 0 1px ${cardBorder},0 32px 64px rgba(0,0,0,0.4);
        backdrop-filter:blur(20px);
      ">
        ${p.imageUrl ? `<div style="flex:1;min-width:280px;max-width:${layout === 'center' ? '100%' : '460px'};position:relative;overflow:hidden;">
          <img src="${p.imageUrl}" alt="${p.name}" style="width:100%;height:100%;min-height:340px;object-fit:cover;display:block;" />
          <div style="position:absolute;inset:0;background:linear-gradient(to right,transparent 60%,${theme.card}22);pointer-events:none;"></div>
        </div>` : ""}
        <div style="flex:1;min-width:280px;padding:48px;display:flex;flex-direction:column;justify-content:center;">
          ${badgeHtml}
          <h2 style="font-size:clamp(22px,3vw,32px);font-weight:800;margin:0 0 4px 0;color:${theme.text};letter-spacing:-0.03em;line-height:1.15;">${p.name || "Product Name"}</h2>
          ${reviewHtml}
          <div style="width:40px;height:2px;background:${accent};margin:20px 0;border-radius:2px;opacity:0.6;"></div>
          <p style="color:${theme.text};opacity:0.6;margin:0 0 24px 0;line-height:1.8;font-size:15px;">${p.description || ""}</p>
          ${featList ? `<ul style="list-style:none;margin:0 0 28px 0;padding:0;">${featList}</ul>` : ""}
          <div style="display:flex;align-items:baseline;gap:10px;margin-bottom:32px;">
            <span style="font-size:42px;font-weight:900;color:${accent};letter-spacing:-0.04em;line-height:1;">₳ ${p.price || "0"}</span>
            <span style="font-size:13px;color:${theme.text};opacity:0.35;font-weight:500;">ADA</span>
          </div>
          ${slug ? `<div>
            <a href="${baseUrl}/Pay?slug=${slug}" style="
              display:inline-flex;align-items:center;gap:10px;
              background:${accent};color:#fff;
              text-decoration:none;font-weight:700;font-size:15px;
              padding:16px 36px;border-radius:14px;
              letter-spacing:-0.01em;
              box-shadow:0 8px 32px ${accent}50;
              transition:transform 0.15s,box-shadow 0.15s;
            " onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 12px 40px ${accent}70'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 8px 32px ${accent}50'">
              🛒 Buy with Cardano ADA
            </a>
          </div>` : `<div style="color:${theme.text};opacity:0.3;font-size:13px;font-style:italic;">No payment link selected</div>`}
        </div>
      </div>`;
    }).join("");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${shopTitle}</title>
  ${fontImport}
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: ${font};
      background: ${theme.bg};
      color: ${theme.text};
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }
    a { color: inherit; }
    .container { max-width: 920px; margin: 0 auto; padding: 0 28px; }
    @media (max-width: 640px) {
      .product-card > div { min-width: 100% !important; flex-direction: column !important; }
    }
    /* Noise overlay for depth */
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
      pointer-events: none;
      z-index: 0;
      opacity: 0.4;
    }
    body > * { position: relative; z-index: 1; }
  </style>
</head>
<body>
  <!-- Ambient glow -->
  <div style="position:fixed;top:-200px;left:50%;transform:translateX(-50%);width:600px;height:400px;background:radial-gradient(ellipse,${accent}18 0%,transparent 70%);pointer-events:none;z-index:0;"></div>

  <!-- Header -->
  <header style="background:${theme.card}cc;border-bottom:1px solid ${cardBorder};padding:16px 0;position:sticky;top:0;z-index:100;backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);">
    <div class="container" style="display:flex;align-items:center;justify-content:space-between;">
      <span style="font-size:18px;font-weight:800;letter-spacing:-0.03em;">${logoText}</span>
      <span style="display:inline-flex;align-items:center;gap:6px;font-size:12px;background:${accent}15;color:${accent};border:1px solid ${accent}30;padding:5px 12px;border-radius:999px;font-weight:600;">
        ✦ Cardano ADA
      </span>
    </div>
  </header>

  <!-- Hero -->
  <section style="padding:100px 0 64px;text-align:center;position:relative;overflow:hidden;">
    <div class="container" style="position:relative;z-index:1;">
      <div style="display:inline-flex;align-items:center;gap:6px;background:${accent}12;color:${accent};border:1px solid ${accent}25;padding:6px 16px;border-radius:999px;font-size:12px;font-weight:600;margin-bottom:24px;letter-spacing:0.04em;">
        ✦ POWERED BY CARDANO
      </div>
      <h1 style="font-size:clamp(36px,6vw,64px);font-weight:900;letter-spacing:-0.04em;margin-bottom:20px;line-height:1.05;background:linear-gradient(135deg,${theme.text} 40%,${accent} 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">${shopTitle}</h1>
      <p style="font-size:17px;opacity:0.5;max-width:480px;margin:0 auto;line-height:1.7;">${shopSubtitle}</p>
    </div>
  </section>

  <!-- Products -->
  <main style="padding:16px 0 100px;position:relative;z-index:1;">
    <div class="container">
      ${productCards}
    </div>
  </main>

  <!-- Footer -->
  <footer style="border-top:1px solid ${cardBorder};padding:40px 0;text-align:center;position:relative;z-index:1;">
    <div style="font-size:13px;opacity:0.3;">${footerText}</div>
    ${showPoweredBy ? `<a href="https://payada.io" style="display:inline-flex;align-items:center;gap:6px;color:${accent};text-decoration:none;font-size:12px;font-weight:600;margin-top:10px;opacity:0.6;transition:opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.6'">✦ Powered by PayADA</a>` : ""}
  </footer>
</body>
</html>`;
    return html;
  };

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(null), 2000);
  };

  const openPreview = () => {
    const html = generatePage();
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  return (
    <div>
      <PageHeader
        title="Shopping Page Generator"
        subtitle="Build a complete, copy-pasteable ADA-powered product page"
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_480px] gap-6">
        {/* ── LEFT: Settings ── */}
        <div className="space-y-5">

          {/* Store Info */}
          <div className="bg-white rounded-xl border border-slate-200/60 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Type className="w-4 h-4 text-slate-400" /> Store Info
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500">Logo / Store Name</Label>
                <Input value={logoText} onChange={(e) => setLogoText(e.target.value)} placeholder="🛒 MyShop" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500">Page Title</Label>
                <Input value={shopTitle} onChange={(e) => setShopTitle(e.target.value)} placeholder="My ADA Shop" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500">Hero Subtitle</Label>
              <Input value={shopSubtitle} onChange={(e) => setShopSubtitle(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500">Footer Text</Label>
              <Input value={footerText} onChange={(e) => setFooterText(e.target.value)} />
            </div>
          </div>

          {/* Design */}
          <div className="bg-white rounded-xl border border-slate-200/60 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Palette className="w-4 h-4 text-slate-400" /> Design
            </h2>

            <div className="space-y-2">
              <Label className="text-xs text-slate-500">Color Theme</Label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.label}
                    onClick={() => setTheme(t)}
                    className={`relative h-10 rounded-lg border-2 transition-all overflow-hidden ${theme.label === t.label ? "border-indigo-500 scale-105" : "border-slate-200"}`}
                    title={t.label}
                    style={{ background: t.bg }}
                  >
                    <span className="absolute bottom-0.5 right-1 text-[8px] font-bold" style={{ color: t.accent }}>●</span>
                  </button>
                ))}
              </div>
              <div className="text-xs text-slate-400">Selected: {theme.label}</div>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-xs text-slate-500">Custom Accent Color</Label>
              <Switch checked={useCustomAccent} onCheckedChange={setUseCustomAccent} />
            </div>
            {useCustomAccent && (
              <div className="flex items-center gap-2">
                <input type="color" value={customAccent} onChange={(e) => setCustomAccent(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                <Input value={customAccent} onChange={(e) => setCustomAccent(e.target.value)} className="font-mono text-xs" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500">Font</Label>
                <Select value={font} onValueChange={setFont}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FONTS.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500">Product Layout</Label>
                <Select value={layout} onValueChange={setLayout}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LAYOUTS.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-slate-500">Show Star Reviews</Label>
                <Switch checked={showReviews} onCheckedChange={setShowReviews} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs text-slate-500">Show Badges</Label>
                <Switch checked={showBadges} onCheckedChange={setShowBadges} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs text-slate-500">Show "Powered by PayADA"</Label>
                <Switch checked={showPoweredBy} onCheckedChange={setShowPoweredBy} />
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="bg-white rounded-xl border border-slate-200/60 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-slate-400" /> Products ({products.length})
              </h2>
              <Button size="sm" variant="outline" onClick={addProduct} className="gap-1.5 text-xs">
                <Plus className="w-3.5 h-3.5" /> Add Product
              </Button>
            </div>

            <div className="space-y-3">
              {products.map((p) => (
                <div key={p.id} className="border border-slate-200 rounded-lg overflow-hidden">
                  {/* Product header */}
                  <div
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setExpandedProduct(expandedProduct === p.id ? null : p.id)}
                  >
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-sm font-medium text-slate-700">{p.name || "Unnamed Product"}</span>
                      {p.price && <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">₳ {p.price}</span>}
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => { e.stopPropagation(); removeProduct(p.id); }} className="p-1 hover:text-red-500 text-slate-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {expandedProduct === p.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>

                  {expandedProduct === p.id && (
                    <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50/50">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-slate-500">Product Name</Label>
                          <Input value={p.name} onChange={(e) => updateProduct(p.id, "name", e.target.value)} placeholder="My Product" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-slate-500">Price (ADA)</Label>
                          <Input value={p.price} onChange={(e) => updateProduct(p.id, "price", e.target.value)} placeholder="10" type="number" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-slate-500">Description</Label>
                        <Textarea value={p.description} onChange={(e) => updateProduct(p.id, "description", e.target.value)} placeholder="Describe your product…" rows={2} />
                      </div>
                      <div className="space-y-1.5">
                       <Label className="text-xs text-slate-500">Product Image</Label>
                       <div className="flex items-center gap-2">
                         <label className="flex-1 cursor-pointer">
                           <input
                             type="file"
                             accept="image/*"
                             className="hidden"
                             onChange={(e) => {
                               const file = e.target.files[0];
                               if (!file) return;
                               const reader = new FileReader();
                               reader.onload = (ev) => updateProduct(p.id, "imageUrl", ev.target.result);
                               reader.readAsDataURL(file);
                             }}
                           />
                           <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-500 hover:bg-slate-50 transition-colors">
                             <Image className="w-3.5 h-3.5" />
                             {p.imageUrl ? "Change image" : "Upload image"}
                           </div>
                         </label>
                         {p.imageUrl && (
                           <img src={p.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                         )}
                       </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-slate-500">Badge (e.g. Best Seller)</Label>
                          <Input value={p.badge} onChange={(e) => updateProduct(p.id, "badge", e.target.value)} placeholder="Best Seller" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-slate-500">Payment Link</Label>
                          <Select value={p.linkId} onValueChange={(v) => updateProduct(p.id, "linkId", v)}>
                            <SelectTrigger><SelectValue placeholder="Select link…" /></SelectTrigger>
                            <SelectContent>
                              {links.map((l) => (
                                <SelectItem key={l.id} value={l.id}>{l.title} — ₳{l.amount_ada}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-slate-500">Feature Bullets (one per line)</Label>
                        <Textarea value={p.features} onChange={(e) => updateProduct(p.id, "features", e.target.value)} placeholder={"Fast delivery\nSecure checkout\n30-day guarantee"} rows={3} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Preview + Export ── */}
        <div className="space-y-5">
          {/* Live Preview */}
          <div className="bg-white rounded-xl border border-slate-200/60 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-slate-400" /> Preview
              </h2>
              <Button size="sm" variant="outline" onClick={openPreview} className="gap-1.5 text-xs">
                <Eye className="w-3.5 h-3.5" /> Open Full Preview
              </Button>
            </div>
            {/* Mini visual preview */}
            <div
              className="rounded-lg overflow-hidden"
              style={{ background: theme.bg, fontFamily: font, minHeight: 240 }}
            >
              {/* Mini header */}
              <div style={{ background: theme.card, padding: "10px 16px", borderBottom: `1px solid rgba(255,255,255,0.06)`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ color: theme.text, fontWeight: 800, fontSize: 13 }}>{logoText}</span>
                <span style={{ color: accent, fontSize: 10, fontWeight: 700 }}>Cardano ADA</span>
              </div>
              {/* Mini hero */}
              <div style={{ padding: "20px 16px 12px", textAlign: "center", background: `linear-gradient(160deg,${theme.bg} 0%,${theme.card} 100%)` }}>
                <div style={{ color: theme.text, fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{shopTitle}</div>
                <div style={{ color: theme.text, opacity: 0.5, fontSize: 10 }}>{shopSubtitle}</div>
              </div>
              {/* Mini products */}
              <div style={{ padding: "12px 16px" }}>
                {products.slice(0, 2).map((p) => (
                  <div key={p.id} style={{ background: theme.card, borderRadius: 10, marginBottom: 10, padding: 12, display: "flex", gap: 10 }}>
                    {p.imageUrl && <img src={p.imageUrl} alt="" style={{ width: 60, height: 60, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {showBadges && p.badge && <span style={{ background: accent, color: "#fff", fontSize: 8, fontWeight: 700, padding: "2px 6px", borderRadius: 99, display: "inline-block", marginBottom: 4 }}>{p.badge.toUpperCase()}</span>}
                      <div style={{ color: theme.text, fontWeight: 700, fontSize: 12, marginBottom: 2 }}>{p.name || "Product"}</div>
                      {showReviews && <div style={{ color: "#f59e0b", fontSize: 9, marginBottom: 4 }}>★★★★★</div>}
                      <div style={{ color: accent, fontWeight: 800, fontSize: 14 }}>₳ {p.price || "0"}</div>
                    </div>
                  </div>
                ))}
                {products.length > 2 && <div style={{ color: theme.text, opacity: 0.3, fontSize: 10, textAlign: "center" }}>+{products.length - 2} more products</div>}
              </div>
            </div>
          </div>

          {/* Export */}
          <div className="bg-white rounded-xl border border-slate-200/60 p-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-slate-400" /> Export Code
            </h2>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4 w-full">
                <TabsTrigger value="page" className="flex-1">Full HTML Page</TabsTrigger>
                <TabsTrigger value="section" className="flex-1">Section Embed</TabsTrigger>
              </TabsList>

              <TabsContent value="page">
                <div className="relative">
                  <pre className="bg-slate-900 text-slate-200 rounded-lg p-4 text-xs overflow-auto max-h-64 leading-relaxed whitespace-pre-wrap break-all">
                    {generatePage()}
                  </pre>
                  <Button size="sm" variant="secondary" className="absolute top-2 right-2" onClick={() => copy(generatePage(), "page")}>
                    {copied === "page" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>
                </div>
                <p className="text-xs text-slate-400 mt-3">Complete standalone HTML page. Save as <code className="bg-slate-100 px-1 rounded">.html</code> and host anywhere — Netlify, GitHub Pages, Vercel, etc.</p>
              </TabsContent>

              <TabsContent value="section">
                <div className="relative">
                  <pre className="bg-slate-900 text-slate-200 rounded-lg p-4 text-xs overflow-auto max-h-64 leading-relaxed whitespace-pre-wrap break-all">
                    {`<iframe
  src="data:text/html;charset=utf-8,${encodeURIComponent(generatePage()).slice(0, 200)}…"
  width="100%"
  height="800"
  frameborder="0"
  style="border-radius:16px;border:none;"
></iframe>

<!-- OR host the HTML file and use: -->
<iframe
  src="https://your-domain.com/shop.html"
  width="100%"
  height="800"
  frameborder="0"
  style="border-radius:16px;border:none;"
></iframe>`}
                  </pre>
                  <Button size="sm" variant="secondary" className="absolute top-2 right-2" onClick={() => copy(`<iframe src="https://your-domain.com/shop.html" width="100%" height="800" frameborder="0" style="border-radius:16px;border:none;"></iframe>`, "section")}>
                    {copied === "section" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>
                </div>
                <p className="text-xs text-slate-400 mt-3">Embed your shop on any existing website using an iframe. First host the generated HTML file, then use the iframe snippet above.</p>
              </TabsContent>
            </Tabs>

            <Button
              className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 gap-2"
              onClick={() => {
                const html = generatePage();
                const blob = new Blob([html], { type: "text/html" });
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = `${shopTitle.toLowerCase().replace(/\s+/g, "-")}-shop.html`;
                a.click();
              }}
            >
              <Code2 className="w-4 h-4" />
              Download HTML File
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}