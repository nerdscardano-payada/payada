import React from "react";
import { ArrowRight, Clock3, Link2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DemoHero() {
  const scrollToForm = () => {
    document.getElementById("create-link")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_35%)]" />
      <div className="relative px-6 py-14 md:px-10 md:py-20">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
            <Clock3 className="h-3.5 w-3.5" />
            First payment link in under 30 seconds
          </div>

          <h1 className="mt-5 text-4xl font-black tracking-tight text-white md:text-6xl">
            Create a payment link in seconds.
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
            No signup. No setup. Just enter an amount, connect your Cardano wallet, and get a real shareable PayADA link instantly.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button onClick={scrollToForm} size="lg" className="bg-cyan-400 text-slate-950 hover:bg-cyan-300 gap-2 font-semibold">
              Create payment link
              <ArrowRight className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
              <Wallet className="h-4 w-4 text-cyan-300" />
              Wallet = identity
            </div>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {[
              { icon: Link2, title: "Instant link", text: "Generate a live Pay link immediately" },
              { icon: Wallet, title: "No account needed", text: "Connect Lace, Nami, Eternl and more" },
              { icon: Clock3, title: "Low friction", text: "Start with a prefilled 5 ADA test payment" },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <Icon className="h-5 w-5 text-cyan-300" />
                <p className="mt-3 text-sm font-semibold text-white">{title}</p>
                <p className="mt-1 text-sm text-slate-400">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}