import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function HomeActionGrid({ title, description, items }) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
      <div className="mb-8 md:mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900">{title}</h2>
        <p className="mt-3 max-w-3xl text-lg text-slate-600">{description}</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-cyan-300">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
              <Link to={item.href}>
                <Button variant="outline" className="mt-5 border-slate-200 bg-white">
                  {item.cta || "Open"}
                </Button>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}