import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, GalleryVerticalEnd, PackageSearch, Store } from "lucide-react";

const steps = [
  {
    icon: PackageSearch,
    title: "1. Verbind je NFT wallet setup",
    description: "Ga naar NFT Fulfillment Setup en zorg dat je signer wallet of hot wallet correct gekoppeld is. Daarna leest de marketplace automatisch je beschikbare NFTs in.",
  },
  {
    icon: GalleryVerticalEnd,
    title: "2. Selecteer assets via de Asset Gallery",
    description: "Open NFT Marketplace, bekijk je wallet NFTs visueel en klik of sleep een asset naar de listing form. Metadata, afbeelding en asset-gegevens worden automatisch ingevuld.",
  },
  {
    icon: Store,
    title: "3. Publiceer je storefront",
    description: "Kies je prijs, controleer je beschrijving en activeer de listing. PayADA maakt automatisch de checkout flow aan zodat kopers via wallet connect kunnen afrekenen.",
  },
];

export default function NFTHowTo() {
  return (
    <div className="min-h-screen bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-600">How-to</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">Hoe je NFTs sneller verkoopt met de Asset Gallery</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
            Deze flow is ontworpen voor merchants die hun wallet-assets willen omzetten naar live listings zonder handmatig policy IDs, asset names en metadata over te nemen.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/NFTMarketplace">Open NFT Marketplace</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/NFTs">Terug naar NFT Suite</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="inline-flex rounded-2xl bg-cyan-100 p-3 text-cyan-700">
                <step.icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-slate-900">{step.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-950 p-8 text-white shadow-sm">
          <h2 className="text-2xl font-semibold">Waarom dit belangrijk is</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white/5 p-5">
              <p className="font-semibold">Sneller publiceren</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">Minder handmatig werk tussen wallet, metadata en listing creatie.</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-5">
              <p className="font-semibold">Minder fouten</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">Je voorkomt typefouten in policy IDs en asset name hex velden.</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-5">
              <p className="font-semibold">Meer controle</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">Je verkoopt via je eigen storefront en checkout flow, zonder afhankelijk te zijn van externe marketplaces.</p>
            </div>
          </div>
          <Button asChild className="mt-6 bg-white text-slate-900 hover:bg-slate-100">
            <Link to="/NFTMarketplace" className="inline-flex items-center gap-2">
              Start met je eerste NFT listing
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}