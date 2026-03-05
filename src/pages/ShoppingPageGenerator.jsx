import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Copy, Check, Monitor, ShoppingCart, Plus, Trash2, Image, Palette,
  Type, Layout, Code2, Eye, ChevronDown, ChevronUp, Star, Tag, Grid3x3, 
  Search, Filter, X
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

const emptyProduct = () => ({
  id: Date.now(),
  name: "",
  description: "",
  price: "",
  imageUrl: "",
  linkId: "",
  badge: "",
  features: "",
  category: "uncategorized",
});

export default function ShoppingPageGenerator() {
  const [shopTitle, setShopTitle] = useState("My ADA Shop");
  const [shopSubtitle, setShopSubtitle] = useState("Accept payments in Cardano ADA");
  const [logoText, setLogoText] = useState("🛒 MyShop");
  const [theme, setTheme] = useState(THEMES[0]);
  const [customAccent, setCustomAccent] = useState("#6366f1");
  const [useCustomAccent, setUseCustomAccent] = useState(false);
  const [font, setFont] = useState(FONTS[0].value);
  const [showPoweredBy, setShowPoweredBy] = useState(true);
  const [footerText, setFooterText] = useState("© 2025 MyShop. Powered by PayADA.");
  const [enableCart, setEnableCart] = useState(true);
  const [enableCategories, setEnableCategories] = useState(true);
  const [enableSearch, setEnableSearch] = useState(true);
  const [products, setProducts] = useState([
    { ...emptyProduct(), id: 1, name: "Premium Digital Plan", description: "Full access to all features", price: "25", badge: "Best Seller", category: "digital" },
    { ...emptyProduct(), id: 2, name: "Basic Physical Item", description: "Quality product with fast shipping", price: "15", category: "physical" }
  ]);
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
  const categories = [...new Set(products.map(p => p.category || "uncategorized"))];

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

  // ── Generate full e-commerce HTML page ──
  const generatePage = () => {
    const fontImport = font.includes("Inter")
      ? `<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">`
      : "";

    const cardBorder = theme.cardBorder || "rgba(255,255,255,0.07)";

    // Generate category filters
    const categoriesHtml = enableCategories ? `
      <div class="category-filters" style="display:flex;gap:8px;margin-bottom:24px;overflow-x:auto;padding-bottom:8px;">
        <button class="category-filter active" data-category="all" style="
          padding:8px 16px;border-radius:999px;border:2px solid ${accent};
          background:${accent};color:#fff;font-size:13px;font-weight:600;
          cursor:pointer;white-space:nowrap;transition:all 0.2s;
        ">All Products</button>
        ${categories.map(cat => `
          <button class="category-filter" data-category="${cat}" style="
            padding:8px 16px;border-radius:999px;border:2px solid ${accent}40;
            background:transparent;color:${theme.text};font-size:13px;font-weight:600;
            cursor:pointer;white-space:nowrap;transition:all 0.2s;text-transform:capitalize;
          ">${cat}</button>
        `).join('')}
      </div>
    ` : '';

    // Generate search bar
    const searchHtml = enableSearch ? `
      <div class="search-wrapper" style="margin-bottom:24px;">
        <div style="position:relative;display:flex;align-items:center;">
          <input type="text" class="search-input" placeholder="Search products..." style="
            width:100%;padding:12px 16px 12px 40px;border-radius:12px;
            border:1px solid ${accent}30;background:${theme.card};
            color:${theme.text};font-size:14px;font-family:${font};
            transition:border-color 0.2s;
          " />
          <span style="position:absolute;left:12px;color:${accent};">🔍</span>
        </div>
      </div>
    ` : '';

    const productCards = products.map((p) => {
      const link = links.find((l) => l.id === p.linkId);
      const slug = link?.slug || "";
      const featList = p.features
        ? p.features.split("\n").filter(Boolean).map((f) => `<li style="padding:4px 0;display:flex;align-items:center;gap:8px;font-size:13px;color:${theme.text};opacity:0.8;"><span style="color:${accent};font-size:12px;">✦</span> ${f}</li>`).join("")
        : "";
      const badgeHtml = "";
      const reviewHtml = "";

      return `
      <div class="product-card" data-category="${p.category || 'uncategorized'}" style="
        background:${theme.card};border:1px solid ${cardBorder};
        border-radius:20px;overflow:hidden;display:flex;
        flex-direction:column;cursor:pointer;
        box-shadow:0 0 0 1px ${cardBorder},0 16px 40px rgba(0,0,0,0.3);
        backdrop-filter:blur(20px);transition:transform 0.2s,box-shadow 0.2s;
      " onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 0 0 1px ${cardBorder},0 24px 48px rgba(0,0,0,0.4)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 0 0 1px ${cardBorder},0 16px 40px rgba(0,0,0,0.3)'">
        ${p.imageUrl ? `<div style="width:100%;height:220px;overflow:hidden;flex-shrink:0;position:relative;">
          <img src="${p.imageUrl}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;display:block;" />
          <div style="position:absolute;top:8px;right:8px;background:${accent};color:#fff;padding:4px 8px;border-radius:8px;font-size:11px;font-weight:700;">₳ ${p.price}</div>
        </div>` : ''}
        <div style="padding:24px;display:flex;flex-direction:column;flex:1;">
          ${badgeHtml}
          <h2 style="font-size:18px;font-weight:800;margin:0 0 4px 0;color:${theme.text};letter-spacing:-0.02em;line-height:1.2;">${p.name || "Product Name"}</h2>
          ${reviewHtml}
          <div style="width:32px;height:2px;background:${accent};margin:12px 0;border-radius:2px;opacity:0.6;"></div>
          <p style="color:${theme.text};opacity:0.6;margin:0 0 16px 0;line-height:1.7;font-size:13px;flex:1;">${p.description || ""}</p>
          ${featList ? `<ul style="list-style:none;margin:0 0 16px 0;padding:0;">${featList}</ul>` : ""}
          <div style="display:flex;align-items:baseline;gap:6px;margin-bottom:20px;">
            <span style="font-size:28px;font-weight:900;color:${accent};letter-spacing:-0.03em;line-height:1;">₳ ${p.price || "0"}</span>
            <span style="font-size:12px;color:${theme.text};opacity:0.35;font-weight:500;">ADA</span>
          </div>
          ${enableCart ? `
            <button class="add-to-cart" data-product='${JSON.stringify({id: p.id, name: p.name, price: parseFloat(p.price), slug})}' style="
              display:flex;align-items:center;justify-content:center;gap:8px;
              background:${accent};color:#fff;
              text-decoration:none;font-weight:700;font-size:14px;
              padding:12px 20px;border-radius:12px;border:none;cursor:pointer;
              letter-spacing:-0.01em;
              box-shadow:0 6px 20px ${accent}40;
              transition:transform 0.15s,box-shadow 0.15s;
              font-family:${font};
            " onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 10px 28px ${accent}60'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 6px 20px ${accent}40'">
              🛒 Add to Cart
            </button>
          ` : slug ? `
            <a href="${baseUrl}/Pay?slug=${slug}" style="
              display:flex;align-items:center;justify-content:center;gap:8px;
              background:${accent};color:#fff;
              text-decoration:none;font-weight:700;font-size:14px;
              padding:12px 20px;border-radius:12px;
              letter-spacing:-0.01em;
              box-shadow:0 6px 20px ${accent}40;
              transition:transform 0.15s,box-shadow 0.15s;
            " onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 10px 28px ${accent}60'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 6px 20px ${accent}40'">
              🛒 Buy Now
            </a>
          ` : `<div style="color:${theme.text};opacity:0.3;font-size:13px;font-style:italic;text-align:center;">No payment link</div>`}
        </div>
      </div>`;
    }).join("");

    const cartHtml = enableCart ? `
      <div id="cart-panel" style="position:fixed;bottom:0;left:0;right:0;background:${theme.card};border-top:1px solid ${cardBorder};padding:20px;z-index:1000;transform:translateY(100%);transition:transform 0.3s ease;">
        <div class="container" style="max-width:1100px;margin:0 auto;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
            <h3 style="font-size:18px;font-weight:800;color:${theme.text};margin:0;">Shopping Cart</h3>
            <button id="close-cart" style="background:none;border:none;color:${theme.text};cursor:pointer;font-size:20px;">✕</button>
          </div>
          <div id="cart-items" style="margin-bottom:16px;max-height:200px;overflow-y:auto;"></div>
          <div style="display:flex;justify-content:space-between;align-items:center;padding-top:16px;border-top:1px solid ${cardBorder};">
            <div>
              <span style="color:${theme.text};opacity:0.6;font-size:13px;">Total:</span>
              <div style="font-size:24px;font-weight:900;color:${accent};margin-top:2px;">₳ <span id="cart-total">0.00</span></div>
            </div>
            <button id="checkout-btn" style="
              background:${accent};color:#fff;border:none;padding:12px 32px;
              border-radius:12px;font-weight:700;cursor:pointer;font-size:14px;
              box-shadow:0 6px 20px ${accent}40;transition:transform 0.2s;
            " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
              Proceed to Pay
            </button>
          </div>
        </div>
      </div>
    ` : '';

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
    .container { max-width: 1100px; margin: 0 auto; padding: 0 28px; }
    .product-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
    @media (max-width: 900px) { .product-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 600px) { .product-grid { grid-template-columns: 1fr; } }
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
    .category-filter.active { background: ${accent} !important; color: #fff !important; border-color: ${accent} !important; }
    .product-card.hidden { display: none; }
    .cart-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: ${theme.bg}; margin-bottom: 8px; border-radius: 8px; }
  </style>
</head>
<body>
  <div style="position:fixed;top:-200px;left:50%;transform:translateX(-50%);width:600px;height:400px;background:radial-gradient(ellipse,${accent}18 0%,transparent 70%);pointer-events:none;z-index:0;"></div>

  <header style="background:${theme.card}cc;border-bottom:1px solid ${cardBorder};padding:16px 0;position:sticky;top:0;z-index:100;backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);">
    <div class="container" style="display:flex;align-items:center;justify-content:space-between;">
      <div style="display:flex;align-items:center;gap:12px;">
        <span style="font-size:18px;font-weight:800;letter-spacing:-0.03em;">${logoText}</span>
        ${enableCart ? `<button id="cart-toggle" style="
          position:relative;background:none;border:none;cursor:pointer;font-size:24px;
          transition:transform 0.2s;
        " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
          🛒 <span id="cart-count" style="
            position:absolute;top:-8px;right:-8px;background:${accent};
            color:#fff;width:20px;height:20px;border-radius:50%;
            display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;
          ">0</span>
        </button>` : ''}
      </div>
      <span style="display:inline-flex;align-items:center;gap:6px;font-size:12px;background:${accent}15;color:${accent};border:1px solid ${accent}30;padding:5px 12px;border-radius:999px;font-weight:600;">
        ✦ Cardano ADA
      </span>
    </div>
  </header>

  <section style="padding:100px 0 64px;text-align:center;position:relative;overflow:hidden;">
    <div class="container" style="position:relative;z-index:1;">
      <div style="display:inline-flex;align-items:center;gap:6px;background:${accent}12;color:${accent};border:1px solid ${accent}25;padding:6px 16px;border-radius:999px;font-size:12px;font-weight:600;margin-bottom:24px;letter-spacing:0.04em;">
        ✦ POWERED BY CARDANO
      </div>
      <h1 style="font-size:clamp(36px,6vw,64px);font-weight:900;letter-spacing:-0.04em;margin-bottom:20px;line-height:1.05;background:linear-gradient(135deg,${theme.text} 40%,${accent} 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">${shopTitle}</h1>
      <p style="font-size:17px;opacity:0.5;max-width:480px;margin:0 auto;line-height:1.7;">${shopSubtitle}</p>
    </div>
  </section>

  <main style="padding:16px 0 100px;position:relative;z-index:1;">
    <div class="container">
      ${searchHtml}
      ${categoriesHtml}
      <div class="product-grid">
        ${productCards}
      </div>
    </div>
  </main>

  <footer style="border-top:1px solid ${cardBorder};padding:40px 0;text-align:center;position:relative;z-index:1;">
    <div style="font-size:13px;opacity:0.3;">${footerText}</div>
    ${showPoweredBy ? `<a href="https://payada.io" style="display:inline-flex;align-items:center;gap:6px;color:${accent};text-decoration:none;font-size:12px;font-weight:600;margin-top:10px;opacity:0.6;transition:opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.6'">✦ Powered by PayADA</a>` : ""}
  </footer>

  ${cartHtml}

  <script>
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const accent = '${accent}';
    const baseUrl = '${baseUrl}';

    function updateCart() {
      const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
      document.getElementById('cart-count').textContent = cart.length;
      document.getElementById('cart-total').textContent = total.toFixed(2);
      
      const itemsDiv = document.getElementById('cart-items');
      itemsDiv.innerHTML = cart.map((item, i) => \`
        <div class="cart-item">
          <div>
            <div style="font-weight:600;margin-bottom:4px;">\${item.name}</div>
            <div style="font-size:12px;opacity:0.6;">₳\${item.price} × \${item.qty}</div>
          </div>
          <button onclick="removeFromCart(\${i})" style="background:none;border:none;color:#f87171;cursor:pointer;font-size:14px;">×</button>
        </div>
      \`).join('');
    }

    function removeFromCart(index) {
      cart.splice(index, 1);
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCart();
    }

    function addToCart(product) {
      const existing = cart.find(item => item.id === product.id);
      if (existing) existing.qty++;
      else cart.push({...product, qty: 1});
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCart();
    }

    document.querySelectorAll('.add-to-cart').forEach(btn => {
      btn.addEventListener('click', () => {
        const product = JSON.parse(btn.dataset.product);
        addToCart(product);
        document.getElementById('cart-panel').style.transform = 'translateY(0)';
      });
    });

    document.getElementById('cart-toggle').addEventListener('click', () => {
      const panel = document.getElementById('cart-panel');
      panel.style.transform = panel.style.transform === 'translateY(0%)' ? 'translateY(100%)' : 'translateY(0)';
    });

    document.getElementById('close-cart').addEventListener('click', () => {
      document.getElementById('cart-panel').style.transform = 'translateY(100%)';
    });

    document.getElementById('checkout-btn').addEventListener('click', () => {
      if (cart.length === 0) return alert('Cart is empty');
      
      // Check if all items have the same slug
      const slugs = [...new Set(cart.map(item => item.slug))];
      if (slugs.length === 0 || !slugs[0]) {
        return alert('No payment link configured for items in cart');
      }
      if (slugs.length > 1) {
        return alert('All items in cart must be from the same product (different payment link)');
      }
      
      // Redirect to Pay page with the slug
      window.location.href = '${baseUrl}/Pay?slug=' + slugs[0];
    });

    document.querySelectorAll('.category-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.category-filter').forEach(b => {
          b.style.background = b === btn ? accent : 'transparent';
          b.style.color = b === btn ? '#fff' : '${theme.text}';
          b.style.borderColor = b === btn ? accent : accent + '40';
        });
        const category = btn.dataset.category;
        document.querySelectorAll('.product-card').forEach(card => {
          card.classList.toggle('hidden', category !== 'all' && card.dataset.category !== category);
        });
      });
    });

    document.querySelector('.search-input')?.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      document.querySelectorAll('.product-card').forEach(card => {
        const matches = card.textContent.toLowerCase().includes(query);
        card.style.display = matches ? '' : 'none';
      });
    });

    updateCart();
  </script>
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
        subtitle="Build a modern 2026 ADA-powered e-commerce platform"
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

          {/* Features */}
          <div className="bg-white rounded-xl border border-slate-200/60 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Grid3x3 className="w-4 h-4 text-slate-400" /> Features
            </h2>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-slate-500">Shopping Cart & Bulk Checkout</Label>
                <Switch checked={enableCart} onCheckedChange={setEnableCart} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs text-slate-500">Category Filters</Label>
                <Switch checked={enableCategories} onCheckedChange={setEnableCategories} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs text-slate-500">Product Search</Label>
                <Switch checked={enableSearch} onCheckedChange={setEnableSearch} />
              </div>
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

            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500">Font</Label>
              <Select value={font} onValueChange={setFont}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FONTS.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-xs text-slate-500">Show "Powered by PayADA"</Label>
              <Switch checked={showPoweredBy} onCheckedChange={setShowPoweredBy} />
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
                  <div
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setExpandedProduct(expandedProduct === p.id ? null : p.id)}
                  >
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-sm font-medium text-slate-700">{p.name || "Unnamed Product"}</span>
                      {p.price && <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">₳ {p.price}</span>}
                      {p.category && <span className="text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded">{p.category}</span>}
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
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-slate-500">Category</Label>
                          <Input value={p.category} onChange={(e) => updateProduct(p.id, "category", e.target.value.toLowerCase())} placeholder="digital, physical, etc" />
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
            <div
              className="rounded-lg overflow-hidden"
              style={{ background: theme.bg, fontFamily: font, minHeight: 240 }}
            >
              <div style={{ background: theme.card, padding: "10px 16px", borderBottom: `1px solid rgba(255,255,255,0.06)`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ color: theme.text, fontWeight: 800, fontSize: 13 }}>{logoText}</span>
                {enableCart && <span style={{ fontSize: 14 }}>🛒</span>}
              </div>
              <div style={{ padding: "20px 16px 12px", textAlign: "center", background: `linear-gradient(160deg,${theme.bg} 0%,${theme.card} 100%)` }}>
                <div style={{ color: theme.text, fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{shopTitle}</div>
                <div style={{ color: theme.text, opacity: 0.5, fontSize: 10 }}>{shopSubtitle}</div>
              </div>
              <div style={{ padding: "12px 16px" }}>
                {enableCategories && <div style={{ display: "flex", gap: "6px", marginBottom: "10px", fontSize: "9px" }}>
                  <span style={{ background: accent, color: "#fff", padding: "2px 6px", borderRadius: 4 }}>All</span>
                  {categories.slice(0, 2).map(cat => <span key={cat} style={{ background: accent + "40", color: theme.text, padding: "2px 6px", borderRadius: 4, fontSize: "8px" }}>{cat}</span>)}
                </div>}
                {products.slice(0, 2).map((p) => (
                  <div key={p.id} style={{ background: theme.card, borderRadius: 10, marginBottom: 10, padding: 12, display: "flex", gap: 10 }}>
                    {p.imageUrl && <img src={p.imageUrl} alt="" style={{ width: 60, height: 60, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: theme.text, fontWeight: 700, fontSize: 12, marginBottom: 2 }}>{p.name || "Product"}</div>
                      <div style={{ color: accent, fontWeight: 800, fontSize: 14 }}>₳ {p.price || "0"}</div>
                    </div>
                  </div>
                ))}
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
                    {generatePage().slice(0, 500)}...
                  </pre>
                  <Button size="sm" variant="secondary" className="absolute top-2 right-2" onClick={() => copy(generatePage(), "page")}>
                    {copied === "page" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>
                </div>
                <p className="text-xs text-slate-400 mt-3">Complete standalone HTML with cart & filtering. Save as <code className="bg-slate-100 px-1 rounded">.html</code> and host anywhere.</p>
              </TabsContent>

              <TabsContent value="section">
                <div className="relative">
                  <pre className="bg-slate-900 text-slate-200 rounded-lg p-4 text-xs overflow-auto max-h-64 leading-relaxed whitespace-pre-wrap break-all">
                    {`<iframe src="https://your-domain.com/shop.html" width="100%" height="800" frameborder="0" style="border-radius:16px;border:none;"></iframe>`}
                  </pre>
                  <Button size="sm" variant="secondary" className="absolute top-2 right-2" onClick={() => copy(`<iframe src="https://your-domain.com/shop.html" width="100%" height="800" frameborder="0" style="border-radius:16px;border:none;"></iframe>`, "section")}>
                    {copied === "section" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>
                </div>
                <p className="text-xs text-slate-400 mt-3">Embed your shop on any existing website using an iframe.</p>
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