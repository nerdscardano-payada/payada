import React from "react";
import PageHeader from "@/components/shared/PageHeader";
import NFTStackOverview from "@/components/nfts/NFTStackOverview";
import NFTFeatureCard from "@/components/nfts/NFTFeatureCard";

export default function NFTs() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="NFTs"
        subtitle="Een aparte zone voor NFT utility binnen PayADA, zonder een nieuw minting-systeem toe te voegen."
      />

      <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 text-sm leading-6 text-indigo-950">
        We focussen hier bewust op drie zaken: NFT gating, geautomatiseerde NFT transfer/distributie en eigen marketplace/listings.
        Minting houden we buiten scope zodat deze module helder, haalbaar en commercieel bruikbaar blijft.
      </div>

      <NFTStackOverview />

      <div className="grid gap-6 xl:grid-cols-3">
        <NFTFeatureCard
          title="NFT Gating"
          status="Live"
          tone="green"
          description="Deze richting sluit het snelst aan op wat PayADA al heeft. We kunnen NFT-holders toegang geven tot communities, content, events of premium flows."
          bullets={[
            "Toegang koppelen aan specifieke policy ID en asset name",
            "NFT-holder utility voor Discord, memberships of gated pages",
            "Goede eerste stap met lage technische complexiteit",
          ]}
          ctaLabel="Open NFT Gating"
          to="/NFTGating"
        />

        <NFTFeatureCard
          title="NFT distributie via wallet signing"
          status="Live"
          tone="blue"
          description="Na een bevestigde betaling maakt PayADA een pending transfer request aan, waarna de merchant de uiteindelijke NFT-transfer met zijn eigen wallet ondertekent."
          bullets={[
            "Geen mnemonic-opslag of server-side custody",
            "Confirmed payments komen automatisch in een signing queue",
            "Merchant tekent en verstuurt vanuit eigen wallet",
          ]}
          ctaLabel="Open Distribution"
          to="/NFTDistribution"
        />

        <NFTFeatureCard
          title="NFT Marketplace / Listings"
          status="Live"
          tone="amber"
          description="We kunnen merchants hun eigen NFT-collecties laten tonen en verkopen via PayADA, zonder afhankelijk te zijn van jpg.store voor de listing-ervaring."
          bullets={[
            "Eigen listingpagina's met prijs, media en metadata",
            "Rechtstreekse checkout via PayADA",
            "Custodyless levering via merchant wallet signing",
          ]}
          ctaLabel="Open Marketplace"
          to="/NFTMarketplace"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Aanbevolen volgorde</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Fase 1</p>
            <p className="mt-2 font-medium text-slate-900">NFT gating live zetten</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">Snelste waarde: utility voor holders en communities.</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Fase 2</p>
            <p className="mt-2 font-medium text-slate-900">Automatische distributie toevoegen</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">Van betaling naar levering in één flow.</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Fase 3</p>
            <p className="mt-2 font-medium text-slate-900">Eigen marketplace/listings openen</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">De merchant krijgt een volledige directe verkoopervaring.</p>
          </div>
        </div>
      </div>
    </div>
  );
}