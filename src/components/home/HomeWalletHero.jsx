import React from "react";
import { Button } from "@/components/ui/button";
import WalletConnect from "@/components/checkout/WalletConnect";
import PayadaLogo from "@/components/shared/PayadaLogo";

export default function HomeWalletHero({ onLogin, onWalletConnected }) {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_35%)]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div>
            <PayadaLogo className="mb-6" />
            <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-300">
              Wallet connect + merchant tools
            </div>
            <h1 className="mt-6 text-4xl md:text-6xl font-bold tracking-tight leading-tight">
              Start from the homepage, then move straight into your PayADA workspace.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-300">
              Connect your Cardano wallet, discover the core merchant tools, and jump directly into payment links, access links, customer tracking and developer features.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button onClick={onLogin} size="lg" className="bg-cyan-400 text-slate-950 hover:bg-cyan-300">
                Login to dashboard
              </Button>
              <a href="#workspace-overview">
                <Button size="lg" variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                  Explore tools
                </Button>
              </a>
            </div>

            <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur-sm shadow-2xl lg:hidden">
              <div className="mb-5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">Wallet connect</p>
                <h2 className="mt-3 text-2xl font-bold text-white">Connect your Cardano wallet</h2>
                <p className="mt-2 text-sm text-slate-300">
                  Use wallet connect here, then continue into your merchant setup and dashboard tools.
                </p>
              </div>
              <WalletConnect onConnected={onWalletConnected} />
            </div>
          </div>

          <div className="hidden lg:block" />
        </div>

        <div className="mt-8 lg:mt-10 rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur-sm shadow-2xl">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">Wallet connect</p>
            <h2 className="mt-3 text-2xl font-bold text-white">Connect your Cardano wallet</h2>
            <p className="mt-2 text-sm text-slate-300">
              Use wallet connect here, then continue into your merchant setup and dashboard tools.
            </p>
          </div>
          <WalletConnect onConnected={onWalletConnected} />
        </div>
        </div>
      </div>
    </section>
  );
}