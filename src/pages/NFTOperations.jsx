import React from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/shared/PageHeader";
import MarketplaceSettingsForm from "@/components/nfts/MarketplaceSettingsForm";
import DistributionOverviewCards from "@/components/nfts/DistributionOverviewCards";
import TransferStatusChart from "@/components/nfts/TransferStatusChart";
import TopFulfillmentRulesChart from "@/components/nfts/TopFulfillmentRulesChart";
import NftOperationsSummaryCards from "@/components/nfts/NftOperationsSummaryCards";
import NftPaymentsStatusChart from "@/components/nfts/NftPaymentsStatusChart";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const initialStoreSettings = { nft_store_name: "", nft_store_slug: "", nft_store_description: "" };
const createSlug = (value = "") => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function NFTOperations() {
  const [user, setUser] = React.useState(null);
  const [storeSettings, setStoreSettings] = React.useState(initialStoreSettings);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: merchantProfile } = useQuery({
    queryKey: ["merchant-profile-nft-operations", user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.MerchantProfile.filter({ user_id: user.email }, "-created_date", 1);
      return profiles[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: paymentLinks = [] } = useQuery({
    queryKey: ["payment-links-nft-operations", user?.email],
    queryFn: () => base44.entities.PaymentLink.filter({ merchant_id: user.email }, "-created_date", 200),
    enabled: !!user?.email,
  });

  const { data: listings = [] } = useQuery({
    queryKey: ["nft-listings-operations", user?.email],
    queryFn: () => base44.entities.NftListing.filter({ merchant_id: user.email }, "-created_date", 200),
    enabled: !!user?.email,
  });

  const { data: rules = [] } = useQuery({
    queryKey: ["nft-fulfillment-rules-operations", user?.email],
    queryFn: () => base44.entities.NftFulfillmentRule.filter({ merchant_id: user.email }, "-created_date", 200),
    enabled: !!user?.email,
  });

  const { data: transferLogs = [] } = useQuery({
    queryKey: ["nft-transfer-logs-operations", user?.email],
    queryFn: () => base44.entities.NftTransferLog.filter({ merchant_id: user.email }, "-created_date", 200),
    enabled: !!user?.email,
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["payments-nft-operations", user?.email],
    queryFn: () => base44.entities.Payment.filter({ merchant_id: user.email }, "-created_date", 200),
    enabled: !!user?.email,
  });

  const { data: signerWallet } = useQuery({
    queryKey: ["merchant-signer-wallet", user?.email],
    queryFn: async () => {
      const wallets = await base44.entities.MerchantSignerWallet.filter({ merchant_id: user.email }, "-updated_date", 1);
      return wallets[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: hotWallet } = useQuery({
    queryKey: ["merchant-hot-wallet", user?.email],
    queryFn: async () => {
      const wallets = await base44.entities.MerchantHotWallet.filter({ merchant_id: user.email }, "-updated_date", 1);
      return wallets[0] || null;
    },
    enabled: !!user?.email,
  });

  React.useEffect(() => {
    if (!user?.email) return;
    setStoreSettings({
      nft_store_name: merchantProfile?.nft_store_name || merchantProfile?.business_name || user.full_name || "",
      nft_store_slug: merchantProfile?.nft_store_slug || createSlug(merchantProfile?.business_name || user.full_name || user.email.split("@")[0]),
      nft_store_description: merchantProfile?.nft_store_description || "",
    });
  }, [merchantProfile?.id, user?.email]);

  const fulfillmentMode = merchantProfile?.nft_fulfillment_mode || null;
  const fulfillmentModeLabel = fulfillmentMode === "automatic" ? "Automatisch met hot wallet" : fulfillmentMode === "manual" ? "Manueel met signer wallet" : "Nog niet ingesteld";
  const resolvedStoreSlug = createSlug(storeSettings.nft_store_slug || merchantProfile?.nft_store_slug || merchantProfile?.business_name || user?.full_name || user?.email?.split("@")[0] || "nft-store");
  const publicStorePath = `/nft/${resolvedStoreSlug}`;
  const paymentLinksById = Object.fromEntries(paymentLinks.map((link) => [link.id, link]));

  const dashboardStats = React.useMemo(() => {
    const successfulStatuses = new Set(["submitted", "confirmed"]);
    const failedStatuses = new Set(["failed"]);
    const rulesById = Object.fromEntries(rules.map((rule) => [rule.id, rule]));
    const nftPaymentLinkIds = new Set([
      ...listings.map((listing) => listing.payment_link_id).filter(Boolean),
      ...rules.map((rule) => rule.payment_link_id).filter(Boolean),
    ]);
    const nftPayments = payments.filter((payment) => nftPaymentLinkIds.has(payment.payment_link_id));
    const confirmedSales = nftPayments.filter((payment) => payment.status === "confirmed");

    const topRules = Object.values(
      transferLogs.reduce((acc, log) => {
        const key = log.nft_rule_id || `${log.policy_id}-${log.asset_name_hex || ""}`;
        const rule = rulesById[log.nft_rule_id];
        const fallbackName = paymentLinksById[rule?.payment_link_id]?.title || `${log.policy_id.slice(0, 10)}…`;

        if (!acc[key]) {
          acc[key] = { name: rule?.asset_label || fallbackName, transfers: 0, volume: 0 };
        }

        acc[key].transfers += 1;
        acc[key].volume += Number(log.quantity || 1);
        return acc;
      }, {})
    )
      .sort((a, b) => b.volume - a.volume || b.transfers - a.transfers)
      .slice(0, 5)
      .map((item) => ({ ...item, shortName: item.name.length > 14 ? `${item.name.slice(0, 14)}…` : item.name }));

    return {
      activeListings: listings.filter((listing) => listing.status === "active").length,
      pendingTransfers: transferLogs.filter((log) => log.status === "pending").length,
      totalVolume: transferLogs.reduce((sum, log) => sum + Number(log.quantity || 1), 0),
      successfulCount: transferLogs.filter((log) => successfulStatuses.has(log.status)).length,
      failedCount: transferLogs.filter((log) => failedStatuses.has(log.status)).length,
      confirmedSales: confirmedSales.length,
      totalSalesAda: confirmedSales.reduce((sum, payment) => sum + Number(payment.received_amount_ada || payment.expected_amount_ada || 0), 0),
      paymentStatusData: [
        { name: "Confirmed", value: nftPayments.filter((payment) => payment.status === "confirmed").length },
        { name: "Pending", value: nftPayments.filter((payment) => payment.status === "pending").length },
        { name: "Detected", value: nftPayments.filter((payment) => payment.status === "detected").length },
        { name: "Failed", value: nftPayments.filter((payment) => payment.status === "failed").length },
      ],
      transferStatusData: [
        { name: "Successful", value: transferLogs.filter((log) => successfulStatuses.has(log.status)).length },
        { name: "Failed", value: transferLogs.filter((log) => failedStatuses.has(log.status)).length },
      ],
      topRules,
    };
  }, [listings, paymentLinksById, payments, rules, transferLogs]);

  const settingsMutation = useMutation({
    mutationFn: (payload) => {
      if (merchantProfile?.id) {
        return base44.entities.MerchantProfile.update(merchantProfile.id, payload);
      }
      return base44.entities.MerchantProfile.create({
        user_id: user.email,
        business_name: payload.nft_store_name || user.full_name || user.email.split("@")[0],
        status: "active",
        ...payload,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchant-profile-nft-operations"] });
      queryClient.invalidateQueries({ queryKey: ["merchant-profile"] });
      toast.success("NFT instellingen opgeslagen");
    },
  });

  const saveMarketplaceSettings = () => {
    if (!user?.email) return;
    settingsMutation.mutate({
      nft_store_name: storeSettings.nft_store_name || merchantProfile?.business_name || user.full_name || "NFT Store",
      nft_store_slug: resolvedStoreSlug,
      nft_store_description: storeSettings.nft_store_description || "",
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="NFT Control" subtitle="Eén centrale plek voor NFT verkoop en gedeelde instellingen, met fulfillment via een aparte wizard." />

      <NftOperationsSummaryCards
        activeListings={dashboardStats.activeListings}
        confirmedSales={dashboardStats.confirmedSales}
        totalSalesAda={dashboardStats.totalSalesAda}
        pendingTransfers={dashboardStats.pendingTransfers}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <TransferStatusChart data={dashboardStats.transferStatusData} />
        <NftPaymentsStatusChart data={dashboardStats.paymentStatusData} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <TopFulfillmentRulesChart data={dashboardStats.topRules} />
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Wallets & snelle acties</h3>
            <p className="mt-1 text-sm text-slate-500">Gebruik deze pagina als centraal overzicht en ga daarna gericht verder per workflow.</p>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Signer wallet</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{signerWallet?.wallet_address ? "Configured" : "Not configured"}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Hot wallet</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{hotWallet?.wallet_address ? "Configured" : "Not configured"}</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild variant="outline"><Link to="/NFTMarketplace">Marketplace beheren</Link></Button>
            <Button asChild variant="outline"><Link to="/NFTDistribution">Transfers beheren</Link></Button>
            <Button asChild><a href={`${window.location.origin}${publicStorePath}`} target="_blank" rel="noreferrer">Open store</a></Button>
          </div>
        </div>
      </div>

      <DistributionOverviewCards
        totalVolume={dashboardStats.totalVolume}
        successfulCount={dashboardStats.successfulCount}
        failedCount={dashboardStats.failedCount}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Fulfillment wizard</h2>
            <p className="mt-1 text-sm text-slate-500">Deze instelling staat nu op een aparte pagina en wordt daarna onthouden voor zowel marketplace als distributie.</p>
          </div>
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Huidige status</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{fulfillmentModeLabel}</p>
            <p className="mt-1 text-sm text-slate-600">{fulfillmentMode ? "Je kan deze keuze altijd aanpassen via de wizard." : "Stel deze eerst in voor je NFT Distribution of Marketplace gebruikt."}</p>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild><Link to="/NFTFulfillmentSetup">Open fulfillment wizard</Link></Button>
            <Button asChild variant="outline"><Link to="/NFTDistribution">Open distribution</Link></Button>
          </div>
        </div>
        <MarketplaceSettingsForm
          value={storeSettings}
          onChange={setStoreSettings}
          onSave={saveMarketplaceSettings}
          isSaving={settingsMutation.isPending}
          publicUrl={`${window.location.origin}${publicStorePath}`}
        />
      </div>
    </div>
  );
}