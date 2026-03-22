import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const toneClasses = {
  green: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
    accent: "from-emerald-500/20 to-transparent",
  },
  blue: {
    badge: "border-blue-200 bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
    accent: "from-blue-500/20 to-transparent",
  },
  amber: {
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
    accent: "from-amber-500/20 to-transparent",
  },
};

export default function NFTFeatureCard({ title, description, bullets, status, tone = "blue", ctaLabel, to }) {
  const theme = toneClasses[tone] || toneClasses.blue;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${theme.accent}`} />

      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${theme.badge}`}>
            {status}
          </span>
        </div>

        <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>

        <ul className="mt-5 space-y-3 text-sm text-slate-700">
          {bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-3">
              <span className={`mt-2 h-2 w-2 rounded-full ${theme.dot}`} />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>

        {ctaLabel && to && (
          <Button asChild variant="outline" className="mt-6 w-full justify-between rounded-xl">
            <Link to={to}>
              {ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}