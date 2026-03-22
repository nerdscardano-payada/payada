import React from "react";
import PageHeader from "@/components/shared/PageHeader";
import NFTStackOverview from "@/components/nfts/NFTStackOverview";
import NFTFeatureCard from "@/components/nfts/NFTFeatureCard";

export default function NFTs() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="NFT Suite"
        subtitle="Production-ready NFT tools voor gating, distributie en storefronts binnen PayADA."
      />

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 text-white shadow-sm">
        <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.3fr_0.9fr] lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Live on PayADA</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">Alles om NFTs commercieel inzetbaar te maken, zonder dat het als demo aanvoelt.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              De NFT-zone van PayADA is opgebouwd rond drie concrete use-cases: gated access, automatische distributie na betaling en een eigen custodyless storefront.
              Geen losse experimenten, maar één samenhangende stack voor utility en sales op Cardano.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Modules</p>
              <p className="mt-2 text-2xl font-semibold text-white">3 live</p>
              <p className="mt-1 text-sm text-slate-300">Gating, distribution en marketplace.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Delivery model</p>
              <p className="mt-2 text-2xl font-semibold text-white">Custodyless</p>
              <p className="mt-1 text-sm text-slate-300">De merchant tekent zelf de finale transfer.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Asset sync</p>
              <p className="mt-2 text-2xl font-semibold text-white">On-chain</p>
              <p className="mt-1 text-sm text-slate-300">Metadata en afbeeldingen uit wallet-assets.</p>
            </div>
          </div>
        </div>
      </div>

      <NFTStackOverview />

      <div className="grid gap-6 xl:grid-cols-3">
        <NFTFeatureCard
          title="NFT Gating"
          status="Ready"
          tone="green"
          description="Bescherm communities, premium content en private flows door walletbezit live te verifiëren tegen policy ID en asset name."
          bullets={[
            "Shareable gate links voor holders en communities",
            "Wallet-based verificatie zonder handmatig beheer",
            "Geschikt voor memberships, Discord en premium pagina's",
          ]}
          ctaLabel="Open NFT Gating"
          to="/NFTGating"
        />

        <NFTFeatureCard
          title="NFT Distribution"
          status="Ready"
          tone="blue"
          description="Koppel bevestigde betalingen aan een transfer queue zodat NFT-levering operationeel en controleerbaar blijft, met merchant signing op het einde."
          bullets={[
            "Automatische queue na confirmed payments",
            "Geen seed phrase of server-side custody nodig",
            "Merchant houdt finale controle over ondertekening",
          ]}
          ctaLabel="Open Distribution"
          to="/NFTDistribution"
        />

        <NFTFeatureCard
          title="NFT Marketplace"
          status="Ready"
          tone="amber"
          description="Publiceer je eigen storefront met media, metadata en PayADA checkout, zodat je NFT's direct vanuit je eigen flow verkocht worden."
          bullets={[
            "Listingbeheer met prijs, image en beschrijving",
            "Directe checkout via bestaande PayADA payment links",
            "Storefront zonder externe marketplace afhankelijkheid",
          ]}
          ctaLabel="Open Marketplace"
          to="/NFTMarketplace"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Hoe de NFT suite vandaag werkt</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Stap 1</p>
            <p className="mt-2 font-medium text-slate-900">Verbind je wallet en selecteer assets</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">Wallet-assets worden automatisch ingeladen met label, metadata en beschikbare afbeelding.</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Stap 2</p>
            <p className="mt-2 font-medium text-slate-900">Publiceer utility of verkoopflow</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">Gebruik gates voor toegang of listings voor storefronts en checkout.</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Stap 3</p>
            <p className="mt-2 font-medium text-slate-900">Lever veilig af via signing queue</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">Confirmed payments monden uit in een duidelijke operationele queue voor ondertekening en verzending.</p>
          </div>
        </div>
      </div>
    </div>
  );
}