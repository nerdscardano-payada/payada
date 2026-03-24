import React from "react";

const logoUrl = "https://media.base44.com/images/public/69999e4306b9e4632bd7d454/69c3a597d_be2b2b99e_1000069668.jpg";

export default function PayadaLogo({ className = "" }) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`.trim()}>
      <img
        src={logoUrl}
        alt="PayADA logo"
        className="h-11 w-11 rounded-2xl object-cover ring-1 ring-white/15"
      />
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Powered by</p>
        <p className="text-xl font-semibold text-white">PayADA</p>
      </div>
    </div>
  );
}