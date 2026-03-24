import React from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/shared/PageHeader";
import MarketplaceSettingsForm from "@/components/nfts/MarketplaceSettingsForm";
import NftOperationsSummaryCards from "@/components/nfts/NftOperationsSummaryCards";
import NftControlInstructions from "@/components/nfts/NftControlInstructions";
import TransferQueueTable from "@/components/nfts/TransferQueueTable";
import ManualSigningCard from "@/components/nfts/ManualSigningCard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const initialStoreSettings = { nft_store_name: "", nft_store_slug: "", nft_store_description: "" };
const createSlug = (value = "") => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function NFTOperations() {
  const [user, setUser] = React.useState(null);
  const [storeSettings, setStoreSettings] = React.useState(initialStoreSettings);
  const [walletSession, setWalletSession] = React.useState(null);
  const [signingId, setSigningId] = React.useState(null);
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
  const fulfillmentModeLabel = fulfillmentMode === "automatic" ? "Automatic with hot wallet" : fulfillmentMode === "manual" ? "Manual with signer wallet" : "Not configured yet";
  const resolvedStoreSlug = createSlug(storeSettings.nft_store_slug || merchantProfile?.nft_store_slug || merchantProfile?.business_name || user?.full_name || user?.email?.split("@")[0] || "nft-store");
  const publicStorePath = `/nft/${resolvedStoreSlug}`;
  const paymentLinksById = Object.fromEntries(paymentLinks.map((link) => [link.id, link]));
  const rulesById = Object.fromEntries(rules.map((rule) => [rule.id, rule]));
  const listingsByPaymentLinkId = Object.fromEntries(listings.filter((listing) => listing.payment_link_id).map((listing) => [listing.payment_link_id, listing]));
  const paymentsById = Object.fromEntries(payments.map((payment) => [payment.id, payment]));
  const actionableLogs = [...transferLogs]
    .filter((log) => ["pending", "submitted", "failed"].includes(log.status))
    .sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0));

  const dashboardStats = React.useMemo(() => {
    const successfulStatuses = new Set(["submitted", "confirmed"]);
    const nftPaymentLinkIds = new Set([
      ...listings.map((listing) => listing.payment_link_id).filter(Boolean),
      ...rules.map((rule) => rule.payment_link_id).filter(Boolean),
    ]);
    const nftPayments = payments.filter((payment) => nftPaymentLinkIds.has(payment.payment_link_id));

    return {
      activeListings: listings.filter((listing) => listing.status === "active").length,
      pendingTransfers: transferLogs.filter((log) => log.status === "pending").length,
      successfulTransfers: transferLogs.filter((log) => successfulStatuses.has(log.status)).length,
      confirmedSales: nftPayments.filter((payment) => payment.status === "confirmed").length,
    };
  }, [listings, payments, rules, transferLogs]);

  const openSigningSetup = () => {
    document.getElementById("manual-signing-wallet")?.scrollIntoView({ behavior: "smooth", block: "center" });
    toast.error("Connect your signer wallet first");
  };

  const handleSignTransfer = async (log) => {
    if (!walletSession?.api || !walletSession?.address) {
      openSigningSetup();
      return;
    }

    setSigningId(log.id);
    try {
      const buildResponse = await base44.functions.invoke("buildNftTransferTx", {
        transfer_log_id: log.id,
        wallet_address: walletSession.address,
      });
      const witnessSetCbor = await walletSession.api.signTx(buildResponse.data.txCbor, true);
      const submitResponse = await base44.functions.invoke("submitNftSignedTx", {
        transfer_log_id: log.id,
        tx_cbor: buildResponse.data.txCbor,
        witness_set_cbor: witnessSetCbor,
      });
      await queryClient.invalidateQueries({ queryKey: ["nft-transfer-logs-operations"] });
      toast.success(`NFT transfer sent: ${submitResponse.data.txHash}`);
    } catch (error) {
      await queryClient.invalidateQueries({ queryKey: ["nft-transfer-logs-operations"] });
      toast.error(error?.response?.data?.error || error.message || "NFT signing failed");
    } finally {
      setSigningId(null);
    }
  };

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
      toast.success("NFT settings saved");
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
      <PageHeader title="NFT Control" subtitle="Track paid NFT orders and complete delivery from one place." />

      <NftOperationsSummaryCards
        activeListings={dashboardStats.activeListings}
        confirmedSales={dashboardStats.confirmedSales}
        pendingTransfers={dashboardStats.pendingTransfers}
        successfulTransfers={dashboardStats.successfulTransfers}
      />

      <NftControlInstructions fulfillmentMode={fulfillmentMode || "manual"} pendingTransfers={dashboardStats.pendingTransfers} />

      {fulfillmentMode !== "automatic" && (
        <ManualSigningCard
          configuredAddress={signerWallet?.wallet_address || null}
          connectedAddress={walletSession?.address || null}
          onConnect={setWalletSession}
          onDisconnect={() => setWalletSession(null)}
        />
      )}

      <TransferQueueTable
        logs={actionableLogs}
        signingId={signingId}
        onSign={handleSignTransfer}
        fulfillmentMode={fulfillmentMode}
        rulesById={rulesById}
        listingsByPaymentLinkId={listingsByPaymentLinkId}
        paymentsById={paymentsById}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Current setup</h2>
            <p className="mt-1 text-sm text-slate-500">Keep wallet setup and store access close to the delivery queue.</p>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Fulfillment mode</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{fulfillmentModeLabel}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Store link</p>
              <p className="mt-2 text-sm font-semibold text-slate-900 break-all">{`${window.location.origin}${publicStorePath}`}</p>
            </div>
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
            <Button asChild><Link to="/NFTFulfillmentSetup">Open fulfillment setup</Link></Button>
            <Button asChild variant="outline"><Link to="/NFTDistribution">Manage delivery rules</Link></Button>
            <Button asChild variant="outline"><Link to="/NFTMarketplace">Manage marketplace</Link></Button>
            <Button asChild variant="outline"><a href={`${window.location.origin}${publicStorePath}`} target="_blank" rel="noreferrer">Open store</a></Button>
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