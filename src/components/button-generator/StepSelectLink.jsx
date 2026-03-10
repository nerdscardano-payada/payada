import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Link2, Coins, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

function AmountBadge({ link }) {
  if (link.amount_mode === "fixed_cnt") {
    return <span className="text-xs font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">{link.cnt_amount?.toLocaleString() || "—"} {link.cnt_ticker || "CNT"}</span>;
  }
  if (link.amount_mode === "fixed_fiat") {
    return <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{link.fiat_currency} {link.amount_fiat?.toFixed(2) || "—"}</span>;
  }
  return <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">₳ {link.amount_ada?.toFixed(2) || "—"}</span>;
}

function ModeIcon({ mode }) {
  if (mode === "fixed_cnt") return <Coins className="w-5 h-5 text-violet-500" />;
  if (mode === "fixed_fiat") return <DollarSign className="w-5 h-5 text-emerald-500" />;
  return <span className="text-blue-500 font-bold text-base leading-none">₳</span>;
}

export default function StepSelectLink({ links, selectedLinkId, onSelect, onNext }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900">Choose a payment link</h2>
        <p className="text-slate-500 mt-1">Select the link you want to embed on your website</p>
      </div>

      {links.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Link2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No active payment links found.</p>
          <p className="text-sm mt-1">Create one in Payment Links first.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {links.map((link) => {
            const isSelected = link.id === selectedLinkId;
            return (
              <motion.button
                key={link.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(link.id)}
                className={cn(
                  "relative text-left p-4 rounded-2xl border-2 transition-all duration-200 bg-white shadow-sm",
                  isSelected
                    ? "border-indigo-500 shadow-indigo-100 shadow-lg"
                    : "border-slate-200 hover:border-slate-300"
                )}
              >
                {isSelected && (
                  <CheckCircle2 className="absolute top-3 right-3 w-5 h-5 text-indigo-500" />
                )}
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center",
                    link.amount_mode === "fixed_cnt" ? "bg-violet-100" :
                    link.amount_mode === "fixed_fiat" ? "bg-emerald-100" : "bg-blue-100"
                  )}>
                    <ModeIcon mode={link.amount_mode} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate text-sm">{link.title}</p>
                    <p className="text-xs text-slate-400">/{link.slug}</p>
                  </div>
                </div>
                <AmountBadge link={link} />
              </motion.button>
            );
          })}
        </div>
      )}

      {selectedLinkId && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <button
            onClick={onNext}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all hover:brightness-110"
          >
            Continue to customization →
          </button>
        </motion.div>
      )}
    </div>
  );
}