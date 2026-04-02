import React, { useState } from "react";
import { ArrowRight, CreditCard, LockKeyhole, Wallet, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import GlobalWalletConnect from "@/components/wallet/GlobalWalletConnect";

const cards = [
  {
    icon: CreditCard,
    badge: "Mainnet payment links",
    title: "Create payment links on mainnet",
    description: "Connect your Cardano wallet and start creating real payment links immediately. Login is only needed later for tracking and dashboard access.",
    button: "Create payment link",
    href: "/PaymentLinks"
  },
  {
    icon: LockKeyhole,
    badge: "Mainnet access links",
    title: "Create access links on mainnet",
    description: "Sell access to private communities, downloads or pages with the same low-friction wallet-first flow.",
    button: "Create access link",
    href: "/AccessLinks"
  }
];

export default function HomeMainnetLinksSection() {
  const [connectedWallet, setConnectedWallet] = useState(null);

  const scrollToDemo = () => {
    document.getElementById("mainnet-links")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="mainnet-links" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
      <div className="rounded-[2rem] bg-slate-950 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_35%)]" />
        <div className="relative px-6 py-10 md:px-10 md:py-14">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
              <Sparkles className="h-3.5 w-3.5" />
              Mainnet wallet-first flow
            </div>
            <h2 className="mt-5 text-3xl font-black tracking-tight text-white md:text-5xl">
              Start on the homepage.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
              Let visitors connect their wallet right away and choose between a payment link or an access link. Ask for login only when they want tracking and dashboard features.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button onClick={scrollToDemo} size="lg" className="bg-cyan-400 text-slate-950 hover:bg-cyan-300 gap-2 font-semibold">
                Explore mainnet flows
                <ArrowRight className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                <Wallet className="h-4 w-4 text-cyan-300" />
                Wallet first, login later
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="grid gap-6 md:grid-cols-2">
              {cards.map((card) => {
                const CardIcon = card.icon;
                return (
                  <div key={card.title} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                        <CardIcon className="h-5 w-5 text-cyan-300" />
                      </div>
                      <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300">
                        {card.badge}
                      </div>
                    </div>
                    <h3 className="mt-5 text-2xl font-bold text-white">{card.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{card.description}</p>
                    <a href={card.href}>
                      <Button className="mt-6 gap-2 bg-white text-slate-950 hover:bg-slate-100">
                        {card.button}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                );
              })}
            </div>

            <GlobalWalletConnect
              onConnected={setConnectedWallet}
              onDisconnected={() => setConnectedWallet(null)}
              title={connectedWallet ? "Wallet connected" : "Connect wallet from homepage"}
              description={connectedWallet?.address ? `Connected: ${connectedWallet.address.slice(0, 18)}...` : "Users can connect Nami, Eternl or Lace right here before creating a payment or access flow."}
            />
          </div>
        </div>
      </div>
    </section>
  );
}