import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function CoreActionCard({ title, description, icon: Icon, href }) {
  return (
    <Link to={href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all">
      <div className="w-11 h-11 rounded-2xl bg-slate-900 flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-cyan-300" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 mb-4">{description}</p>
      <div className="flex items-center gap-2 text-sm font-medium text-blue-600 group-hover:text-blue-700">
        Open <ArrowRight className="w-4 h-4" />
      </div>
    </Link>
  );
}