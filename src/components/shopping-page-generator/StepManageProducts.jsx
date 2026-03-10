import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, ChevronDown, ChevronUp, ShoppingCart, Image } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

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

export { emptyProduct };

export default function StepManageProducts({ products, setProducts, links, onBack, onNext }) {
  const [expanded, setExpanded] = useState(products[0]?.id || null);

  const add = () => {
    const p = emptyProduct();
    setProducts((prev) => [...prev, p]);
    setExpanded(p.id);
  };

  const remove = (id) => setProducts((prev) => prev.filter((p) => p.id !== id));

  const update = (id, field, value) =>
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900">Manage Products</h2>
        <p className="text-slate-500 mt-1">Add your products and link payment links</p>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-600">{products.length} product{products.length !== 1 ? "s" : ""}</span>
        <Button size="sm" variant="outline" onClick={add} className="gap-1.5 text-xs">
          <Plus className="w-3.5 h-3.5" /> Add Product
        </Button>
      </div>

      <div className="space-y-3">
        {products.map((p) => (
          <div key={p.id} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
            <div
              className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => setExpanded(expanded === p.id ? null : p.id)}
            >
              <div className="flex items-center gap-2.5">
                {p.imageUrl
                  ? <img src={p.imageUrl} alt="" className="w-7 h-7 rounded-lg object-cover flex-shrink-0" />
                  : <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0"><ShoppingCart className="w-3.5 h-3.5 text-slate-400" /></div>
                }
                <div>
                  <p className="text-sm font-semibold text-slate-800">{p.name || "Unnamed product"}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {p.price && <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">₳ {p.price}</span>}
                    {p.category && <span className="text-xs bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded capitalize">{p.category}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={(e) => { e.stopPropagation(); remove(p.id); }} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                {expanded === p.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </div>

            {expanded === p.id && (
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-500">Product Name</Label>
                    <Input value={p.name} onChange={(e) => update(p.id, "name", e.target.value)} placeholder="My Product" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-500">Price (ADA)</Label>
                    <Input value={p.price} onChange={(e) => update(p.id, "price", e.target.value)} placeholder="10" type="number" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-500">Category</Label>
                    <Input value={p.category} onChange={(e) => update(p.id, "category", e.target.value.toLowerCase())} placeholder="digital, physical, ..." />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-500">Payment Link</Label>
                    <Select value={p.linkId} onValueChange={(v) => update(p.id, "linkId", v)}>
                      <SelectTrigger><SelectValue placeholder="Select link…" /></SelectTrigger>
                      <SelectContent>
                        {links.map((l) => (
                          <SelectItem key={l.id} value={l.id}>
                            {l.title} — {
                              l.amount_mode === "fixed_cnt"
                                ? `${l.cnt_amount?.toLocaleString() || "—"} ${l.cnt_ticker || "CNT"}`
                                : l.amount_mode === "fixed_fiat"
                                ? `${l.fiat_currency} ${l.amount_fiat?.toFixed(2) || "—"}`
                                : `₳${l.amount_ada || "—"}`
                            }
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-500">Description</Label>
                  <Textarea value={p.description} onChange={(e) => update(p.id, "description", e.target.value)} placeholder="Describe your product…" rows={2} />
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
                          reader.onload = (ev) => update(p.id, "imageUrl", ev.target.result);
                          reader.readAsDataURL(file);
                        }}
                      />
                      <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-500 hover:bg-slate-100 transition-colors">
                        <Image className="w-3.5 h-3.5" />
                        {p.imageUrl ? "Change image" : "Upload image"}
                      </div>
                    </label>
                    {p.imageUrl && <img src={p.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover border border-slate-200" />}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-500">Badge (e.g. Best Seller)</Label>
                    <Input value={p.badge} onChange={(e) => update(p.id, "badge", e.target.value)} placeholder="Best Seller" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-slate-500">Feature Bullets (one per line)</Label>
                  <Textarea value={p.features} onChange={(e) => update(p.id, "features", e.target.value)} placeholder={"Fast delivery\nSecure checkout\n30-day guarantee"} rows={3} />
                </div>
              </div>
            )}
          </div>
        ))}

        {products.length === 0 && (
          <div className="text-center py-10 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
            <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No products yet. Click "Add Product" to get started.</p>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-3 rounded-2xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all">
          ← Back
        </button>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onNext}
          className="flex-[2] py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-200 hover:brightness-110 transition-all"
        >
          Continue to export →
        </motion.button>
      </div>
    </div>
  );
}