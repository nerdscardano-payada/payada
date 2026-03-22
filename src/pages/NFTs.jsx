import React from "react";
import PageHeader from "@/components/shared/PageHeader";
import NFTStackOverview from "@/components/nfts/NFTStackOverview";
import NFTFeatureCard from "@/components/nfts/NFTFeatureCard";

export default function NFTs() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="NFT Suite"
        subtitle="Production-ready NFT tools for gating, distribution, and storefronts inside PayADA."
      />

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 text-white shadow-sm">
        <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.3fr_0.9fr] lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Live on PayADA</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">Everything you need to make NFTs commercially usable inside one powerful PayADA suite.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              The NFT zone inside PayADA is built around three concrete use cases: gated access, distribution after payment, and a dedicated custodyless storefront.
              Not a collection of experiments, but one unified stack for utility and sales on Cardano.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Modules</p>
              <p className="mt-2 text-2xl font-semibold text-white">3 live</p>
              <p className="mt-1 text-sm text-slate-300">Gating, distribution, and marketplace.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Delivery model</p>
              <p className="mt-2 text-2xl font-semibold text-white">Custodyless</p>
              <p className="mt-1 text-sm text-slate-300">The merchant signs the final transfer directly.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Asset sync</p>
              <p className="mt-2 text-2xl font-semibold text-white">On-chain</p>
              <p className="mt-1 text-sm text-slate-300">Metadata and images sourced from wallet assets.</p>
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
          description="Protect communities, premium content, and private flows by verifying live wallet ownership against policy ID and asset name."
          bullets={[
            "Shareable gate links for holders and communities",
            "Wallet-based verification without manual admin work",
            "Ideal for memberships, Discord, and premium pages",
          ]}
          ctaLabel="Open NFT Gating"
          to="/NFTGating"
        />

        <NFTFeatureCard
          title="NFT Distribution"
          status="Ready"
          tone="blue"
          description="Connect confirmed payments to a transfer queue so NFT delivery stays operational and controlled, with merchant signing at the end."
          bullets={[
            "Automatic queue after confirmed payments",
            "No seed phrase or server-side custody required",
            "Merchant keeps final signing control",
          ]}
          ctaLabel="Open Distribution"
          to="/NFTDistribution"
        />

        <NFTFeatureCard
          title="NFT Marketplace"
          status="Ready"
          tone="amber"
          description="Publish your own storefront with media, metadata, and PayADA checkout so your NFTs are sold directly inside your own flow."
          bullets={[
            "Listing management with pricing, image, and description",
            "Direct checkout through existing PayADA payment links",
            "Storefront without dependence on an external marketplace",
          ]}
          ctaLabel="Open Marketplace"
          to="/NFTMarketplace"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">How the NFT suite works today</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Step 1</p>
            <p className="mt-2 font-medium text-slate-900">Connect your wallet and select assets</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">Wallet assets are loaded automatically with label, metadata, and available image.</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Step 2</p>
            <p className="mt-2 font-medium text-slate-900">Publish utility or sales flows</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">Use gates for access or listings for storefronts and checkout.</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Step 3</p>
            <p className="mt-2 font-medium text-slate-900">Deliver securely through the signing queue</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">Confirmed payments flow into a clear operational queue for signing and delivery.</p>
          </div>
        </div>
      </div>
    </div>
  );
}