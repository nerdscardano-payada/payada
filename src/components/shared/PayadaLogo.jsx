import React from "react";

export default function PayadaLogo({ className = "" }) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`.trim()}>
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
        <div className="h-6 w-6 rounded-xl bg-gradient-to-br from-cyan-300 via-sky-400 to-blue-500" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Powered by</p>
        <p className="text-xl font-semibold text-white">PayADA</p>
      </div>
    </div>
  );
}