import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { Save, CheckCircle, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import StepShopInfo, { THEMES, FONTS } from "@/components/shopping-page-generator/StepShopInfo";
import StepManageProducts, { emptyProduct } from "@/components/shopping-page-generator/StepManageProducts";
import StepPublish from "@/components/shopping-page-generator/StepPublish";

const STEPS = [
  { number: 1, label: "Winkelinfo" },
  { number: 2, label: "Producten" },
  { number: 3, label: "Publiceren" },
];

const DEFAULT_CONFIG = {
  shopTitle: "My ADA Shop",
  shopSubtitle: "Accept payments in Cardano ADA",
  logoText: "🛒 MyShop",
  logoImageUrl: "",
  footerText: "© 2025 MyShop. Powered by PayADA.",
  theme: THEMES[0],
  customAccent: "#6366f1",
  useCustomAccent: false,
  font: FONTS[0].value,
  showPoweredBy: true,
  enableCart: true,
  enableCategories: true,
  enableSearch: true,
};

export default function ShoppingPageGenerator() {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [products, setProducts] = useState([
    { ...emptyProduct(), id: 1, name: "Premium Digital Plan", description: "Full access to all features", price: "25", badge: "Best Seller", category: "digital" },
    { ...emptyProduct(), id: 2, name: "Basic Physical Item", description: "Quality product with fast shipping", price: "15", category: "physical" },
  ]);
  const [user, setUser] = useState(null);
  const [storeId, setStoreId] = useState(null);
  const [storeName, setStoreName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser);
    // Check if editing an existing store
    const params = new URLSearchParams(window.location.search);
    const id = params.get("storeId");
    if (id) {
      setStoreId(id);
      base44.entities.Store.filter({ id }).then((results) => {
        const store = results[0];
        if (store) {
          setStoreName(store.name);
          if (store.config) setConfig({ ...DEFAULT_CONFIG, ...store.config });
          if (store.products?.length) setProducts(store.products);
        }
      });
    }
  }, []);

  const handleSave = async () => {
    if (!user) return;
    const name = storeName || config.shopTitle || "My Store";
    setSaving(true);
    try {
      if (storeId) {
        await base44.entities.Store.update(storeId, { name, config, products, status: "active" });
      } else {
        const created = await base44.entities.Store.create({ merchant_id: user.email, name, config, products, status: "active" });
        setStoreId(created.id);
        window.history.replaceState({}, "", `${window.location.pathname}?storeId=${created.id}`);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const { data: links = [] } = useQuery({
    queryKey: ["paymentLinks", user?.email],
    queryFn: () => base44.entities.PaymentLink.filter({ merchant_id: user.email, status: "active" }, "-created_date", 100),
    enabled: !!user,
  });

  const accent = config.useCustomAccent ? config.customAccent : config.theme.accent;
  const categories = [...new Set(products.map((p) => p.category || "uncategorized"))];
  const baseUrl = window.location.origin;

  const generatePage = () => {
    const { theme, font, shopTitle, shopSubtitle, logoText, logoImageUrl, footerText, showPoweredBy, enableCart, enableCategories, enableSearch } = config;
    const logoHtml = logoImageUrl
      ? `<div style="display:flex;align-items:center;gap:10px;"><img src="${logoImageUrl}" alt="${logoText}" style="height:36px;width:auto;object-fit:contain;border-radius:6px;" /><span style="font-size:18px;font-weight:800;">${logoText}</span></div>`
      : `<span style="font-size:18px;font-weight:800;">${logoText}</span>`;
    const fontImport = font.includes("Inter")
      ? `<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">`
      : "";
    const cardBorder = theme.cardBorder || "rgba(255,255,255,0.07)";

    const categoriesHtml = enableCategories ? `
      <div class="category-filters" style="display:flex;gap:8px;margin-bottom:24px;overflow-x:auto;padding-bottom:8px;">
        <button class="category-filter active" data-category="all" style="padding:8px 16px;border-radius:999px;border:2px solid ${accent};background:${accent};color:#fff;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;transition:all 0.2s;">All Products</button>
        ${categories.map((cat) => `<button class="category-filter" data-category="${cat}" style="padding:8px 16px;border-radius:999px;border:2px solid ${accent}40;background:transparent;color:${theme.text};font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;transition:all 0.2s;text-transform:capitalize;">${cat}</button>`).join("")}
      </div>` : "";

    const searchHtml = enableSearch ? `
      <div style="margin-bottom:24px;position:relative;">
        <input type="text" class="search-input" placeholder="Search products..." style="width:100%;padding:12px 16px 12px 40px;border-radius:12px;border:1px solid ${accent}30;background:${theme.card};color:${theme.text};font-size:14px;font-family:${font};" />
        <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:${accent};">🔍</span>
      </div>` : "";

    const productCards = products.map((p) => {
      const link = links.find((l) => l.id === p.linkId);
      const slug = link?.slug || "";
      const featList = p.features
        ? p.features.split("\n").filter(Boolean).map((f) => `<li style="padding:4px 0;display:flex;align-items:center;gap:8px;font-size:13px;color:${theme.text};opacity:0.8;"><span style="color:${accent};font-size:12px;">✦</span> ${f}</li>`).join("")
        : "";

      return `<div class="product-card" data-category="${p.category || "uncategorized"}" style="background:${theme.card};border:1px solid ${cardBorder};border-radius:20px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 0 0 1px ${cardBorder},0 16px 40px rgba(0,0,0,0.3);transition:transform 0.2s,box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
        ${p.imageUrl ? `<div style="width:100%;height:220px;overflow:hidden;position:relative;"><img src="${p.imageUrl}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;" /><div style="position:absolute;top:8px;right:8px;background:${accent};color:#fff;padding:4px 8px;border-radius:8px;font-size:11px;font-weight:700;">₳ ${p.price}</div></div>` : ""}
        <div style="padding:24px;display:flex;flex-direction:column;flex:1;">
          <h2 style="font-size:18px;font-weight:800;margin:0 0 4px 0;color:${theme.text};letter-spacing:-0.02em;">${p.name || "Product"}</h2>
          <div style="width:32px;height:2px;background:${accent};margin:12px 0;border-radius:2px;opacity:0.6;"></div>
          <p style="color:${theme.text};opacity:0.6;margin:0 0 16px 0;line-height:1.7;font-size:13px;flex:1;">${p.description || ""}</p>
          ${featList ? `<ul style="list-style:none;margin:0 0 16px 0;padding:0;">${featList}</ul>` : ""}
          <div style="display:flex;align-items:baseline;gap:6px;margin-bottom:20px;">
            <span style="font-size:28px;font-weight:900;color:${accent};letter-spacing:-0.03em;">₳ ${p.price || "0"}</span>
            <span style="font-size:12px;color:${theme.text};opacity:0.35;font-weight:500;">ADA</span>
          </div>
          ${enableCart ? `<button class="add-to-cart" data-product='${JSON.stringify({ id: p.id, name: p.name, price: parseFloat(p.price), slug: slug || p.id })}' style="display:flex;align-items:center;justify-content:center;gap:8px;background:${accent};color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 20px;border-radius:12px;border:none;cursor:pointer;box-shadow:0 6px 20px ${accent}40;transition:transform 0.15s;font-family:${font};" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">🛒 Add to Cart</button>`
            : slug ? `<a href="${baseUrl}/Pay?slug=${slug}" style="display:flex;align-items:center;justify-content:center;gap:8px;background:${accent};color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 20px;border-radius:12px;box-shadow:0 6px 20px ${accent}40;transition:transform 0.15s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">🛒 Buy Now</a>`
            : `<div style="color:${theme.text};opacity:0.3;font-size:13px;text-align:center;">Geen betaallink</div>`}
        </div>
      </div>`;
    }).join("");

    const cartHtml = enableCart ? `
      <div id="cart-panel" style="position:fixed;bottom:0;left:0;right:0;background:${theme.card};border-top:1px solid ${cardBorder};padding:20px;z-index:1000;transform:translateY(100%);transition:transform 0.3s ease;">
        <div style="max-width:1100px;margin:0 auto;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
            <h3 style="font-size:18px;font-weight:800;color:${theme.text};margin:0;">Shopping Cart</h3>
            <button id="close-cart" style="background:none;border:none;color:${theme.text};cursor:pointer;font-size:20px;">✕</button>
          </div>
          <div id="cart-items" style="margin-bottom:16px;max-height:200px;overflow-y:auto;"></div>
          <div style="display:flex;justify-content:space-between;align-items:center;padding-top:16px;border-top:1px solid ${cardBorder};">
            <div><span style="color:${theme.text};opacity:0.6;font-size:13px;">Total:</span><div style="font-size:24px;font-weight:900;color:${accent};">₳ <span id="cart-total">0.00</span></div></div>
            <button id="checkout-btn" style="background:${accent};color:#fff;border:none;padding:12px 32px;border-radius:12px;font-weight:700;cursor:pointer;font-size:14px;">Proceed to Pay</button>
          </div>
        </div>
      </div>` : "";

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${shopTitle}</title>
  ${fontImport}
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: ${font}; background: ${theme.bg}; color: ${theme.text}; min-height: 100vh; -webkit-font-smoothing: antialiased; }
    .container { max-width: 1100px; margin: 0 auto; padding: 0 28px; }
    .product-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
    @media (max-width: 900px) { .product-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 600px) { .product-grid { grid-template-columns: 1fr; } }
    .category-filter.active { background: ${accent} !important; color: #fff !important; border-color: ${accent} !important; }
    .product-card.hidden { display: none; }
    .cart-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: ${theme.bg}; margin-bottom: 8px; border-radius: 8px; }
  </style>
</head>
<body>
  <header style="background:${theme.card}cc;border-bottom:1px solid ${cardBorder};padding:16px 0;position:sticky;top:0;z-index:100;backdrop-filter:blur(24px);">
    <div class="container" style="display:flex;align-items:center;justify-content:space-between;">
      ${logoHtml}
      ${enableCart ? `<button id="cart-toggle" style="position:relative;background:none;border:none;cursor:pointer;font-size:24px;">🛒 <span id="cart-count" style="position:absolute;top:-8px;right:-8px;background:${accent};color:#fff;width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;">0</span></button>` : ""}
      <span style="font-size:12px;background:${accent}15;color:${accent};border:1px solid ${accent}30;padding:5px 12px;border-radius:999px;font-weight:600;">✦ Cardano ADA</span>
    </div>
  </header>
  <section style="padding:80px 0 48px;text-align:center;">
    <div class="container">
      <h1 style="font-size:clamp(32px,6vw,60px);font-weight:900;letter-spacing:-0.04em;margin-bottom:16px;line-height:1.05;background:linear-gradient(135deg,${theme.text} 40%,${accent} 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">${shopTitle}</h1>
      <p style="font-size:17px;opacity:0.5;max-width:480px;margin:0 auto;">${shopSubtitle}</p>
    </div>
  </section>
  <main style="padding:16px 0 100px;">
    <div class="container">
      ${searchHtml}
      ${categoriesHtml}
      <div class="product-grid">${productCards}</div>
    </div>
  </main>
  <footer style="border-top:1px solid ${cardBorder};padding:40px 0;text-align:center;">
    <div style="font-size:13px;opacity:0.3;">${footerText}</div>
    ${showPoweredBy ? `<a href="https://payada.io" style="display:inline-flex;align-items:center;gap:6px;color:${accent};text-decoration:none;font-size:12px;font-weight:600;margin-top:10px;opacity:0.6;">✦ Powered by PayADA</a>` : ""}
  </footer>
  ${cartHtml}
  <script>
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const accent = '${accent}';
    function updateCart() {
      const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
      const countEl = document.getElementById('cart-count');
      const totalEl = document.getElementById('cart-total');
      const itemsEl = document.getElementById('cart-items');
      if (countEl) countEl.textContent = cart.length;
      if (totalEl) totalEl.textContent = total.toFixed(2);
      if (itemsEl) itemsEl.innerHTML = cart.map((item, i) => \`<div class="cart-item"><div><div style="font-weight:600;">\${item.name}</div><div style="font-size:12px;opacity:0.6;">₳\${item.price} × \${item.qty}</div></div><button onclick="removeFromCart(\${i})" style="background:none;border:none;color:#f87171;cursor:pointer;">×</button></div>\`).join('');
    }
    function removeFromCart(i) { cart.splice(i, 1); localStorage.setItem('cart', JSON.stringify(cart)); updateCart(); }
    function addToCart(p) { const ex = cart.find(x => x.id === p.id); if (ex) ex.qty++; else cart.push({...p, qty:1}); localStorage.setItem('cart', JSON.stringify(cart)); updateCart(); }
    document.querySelectorAll('.add-to-cart').forEach(btn => btn.addEventListener('click', () => { addToCart(JSON.parse(btn.dataset.product)); const panel = document.getElementById('cart-panel'); if (panel) panel.style.transform = 'translateY(0)'; }));
    const cartToggle = document.getElementById('cart-toggle');
    if (cartToggle) cartToggle.addEventListener('click', () => { const p = document.getElementById('cart-panel'); p.style.transform = p.style.transform === 'translateY(0px)' || p.style.transform === 'translateY(0)' ? 'translateY(100%)' : 'translateY(0)'; });
    const closeCart = document.getElementById('close-cart');
    if (closeCart) closeCart.addEventListener('click', () => { document.getElementById('cart-panel').style.transform = 'translateY(100%)'; });
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) checkoutBtn.addEventListener('click', () => { if (!cart.length) return alert('Cart is empty'); window.location.href = '${baseUrl}/Pay?cartItems=' + btoa(JSON.stringify(cart)); });
    document.querySelectorAll('.category-filter').forEach(btn => btn.addEventListener('click', () => {
      document.querySelectorAll('.category-filter').forEach(b => { b.style.background = b === btn ? accent : 'transparent'; b.style.color = b === btn ? '#fff' : '${config.theme.text}'; b.style.borderColor = b === btn ? accent : accent + '40'; });
      const cat = btn.dataset.category;
      document.querySelectorAll('.product-card').forEach(c => { c.style.display = (cat === 'all' || c.dataset.category === cat) ? 'flex' : 'none'; });
    }));
    document.querySelector('.search-input')?.addEventListener('input', e => {
      const q = e.target.value.toLowerCase();
      document.querySelectorAll('.product-card').forEach(c => c.style.display = c.textContent.toLowerCase().includes(q) ? '' : 'none');
    });
    updateCart();
  </script>
</body>
</html>`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            Shopping Page Generator
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Build your ADA store
          </h1>
          <p className="text-slate-500 mt-2 text-base">
            A complete e-commerce page in 3 easy steps
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-0 mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.number}>
              <div className="flex flex-col items-center gap-1.5">
                <div className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300",
                  step > s.number
                    ? "bg-indigo-500 text-white shadow-md shadow-indigo-200"
                    : step === s.number
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-300 ring-4 ring-indigo-100"
                    : "bg-slate-100 text-slate-400"
                )}>
                  {step > s.number ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : s.number}
                </div>
                <span className={cn(
                  "text-xs font-medium",
                  step === s.number ? "text-indigo-600" : "text-slate-400"
                )}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn(
                  "h-0.5 w-16 mx-2 mb-5 rounded-full transition-all duration-500",
                  step > s.number ? "bg-indigo-400" : "bg-slate-200"
                )} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step content */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-7">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <StepShopInfo config={config} onChange={setConfig} onNext={() => setStep(2)} />
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <StepManageProducts products={products} setProducts={setProducts} links={links} onBack={() => setStep(1)} onNext={() => setStep(3)} />
              </motion.div>
            )}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <StepPublish generatePage={generatePage} shopTitle={config.shopTitle} theme={config.theme} font={config.font} logoText={config.logoText} enableCategories={config.enableCategories} enableCart={config.enableCart} products={products} onBack={() => setStep(2)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}