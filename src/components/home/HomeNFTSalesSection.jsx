import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarChart3, GalleryVerticalEnd, MousePointerClick } from "lucide-react";

const items = [
  {
    icon: GalleryVerticalEnd,
    title: "Automatische NFT bulk import",
    description: "Laad je wallet-assets in één keer en gebruik ze meteen voor listings zonder telkens policy ID's handmatig over te nemen.",
  },
  {
    icon: MousePointerClick,
    title: "Wallet-first listing flow",
    description: "Klik of sleep een NFT uit je asset gallery en laat titel, image en metadata automatisch invullen in je listing flow.",
  },
  {
    icon: BarChart3,
    title: "NFT verkoop dashboards",
    description: "Bekijk actieve listings, draft pipeline en je publieke store setup vanuit één duidelijk marketplace dashboard.",
  },
];

export default function HomeNFTSalesSection() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-600">NFT commerce</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">Verkoop NFTs rechtstreeks vanuit je eigen wallet workflow.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
              PayADA maakt NFT verkoop praktischer voor merchants: assets uit je wallet visualiseren, listings sneller publiceren en alles beheren vanuit één duidelijke marketplace omgeving.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/NFTMarketplace">Open NFT Marketplace</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/NFTHowTo">Bekijk how-to</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {items.map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-cyan-100 p-3 text-cyan-700">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}