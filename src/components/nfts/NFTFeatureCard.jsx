import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const toneClasses = {
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function NFTFeatureCard({ title, description, bullets, status, tone = "blue", ctaLabel, to }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${toneClasses[tone]}`}>
          {status}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>

      <ul className="mt-4 space-y-2 text-sm text-slate-700">
        {bullets.map((bullet) => (
          <li key={bullet} className="flex items-start gap-2">
            <span className="mt-1 h-2 w-2 rounded-full bg-slate-300" />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>

      {ctaLabel && to && (
        <Button asChild variant="outline" className="mt-5 gap-2">
          <Link to={to}>
            {ctaLabel}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      )}
    </div>
  );
}