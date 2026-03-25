import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function GoalTile({ icon: Icon, eyebrow, title, description, to, cta }) {
  return (
    <Card className="group h-full border-slate-200 bg-white/90 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
      <CardContent className="flex h-full flex-col p-6">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
          <Icon className="h-6 w-6" />
        </div>

        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600">
          {eyebrow}
        </p>
        <h3 className="mb-3 text-2xl font-semibold text-slate-900">
          {title}
        </h3>
        <p className="mb-6 flex-1 text-sm leading-6 text-slate-600">
          {description}
        </p>

        <Button asChild className="w-full justify-between rounded-xl bg-slate-900 hover:bg-slate-800">
          <Link to={to}>
            {cta}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}