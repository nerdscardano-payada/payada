import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const formatRequestDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleString("nl-BE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function MerchantVerificationPanel() {
  const queryClient = useQueryClient();

  const { data: merchants = [], isLoading } = useQuery({
    queryKey: ["merchant-verification-panel"],
    queryFn: () => base44.entities.MerchantProfile.list("-updated_date", 200),
  });

  const toggleVerificationMutation = useMutation({
    mutationFn: ({ merchantId, verified }) => base44.entities.MerchantProfile.update(merchantId, {
      verified_merchant: verified,
      verification_requested: false,
      verification_requested_at: null,
    }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["merchant-verification-panel"] });
      toast.success(variables.verified ? "Merchant verified" : "Merchant verification removed");
    },
  });

  const clearRequestMutation = useMutation({
    mutationFn: (merchantId) => base44.entities.MerchantProfile.update(merchantId, {
      verification_requested: false,
      verification_requested_at: null,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchant-verification-panel"] });
      toast.success("Verification request cleared");
    },
  });

  const sortedMerchants = React.useMemo(() => {
    return [...merchants].sort((a, b) => {
      const requestDiff = Number(Boolean(b.verification_requested)) - Number(Boolean(a.verification_requested));
      if (requestDiff !== 0) return requestDiff;

      const verifiedDiff = Number(Boolean(b.verified_merchant)) - Number(Boolean(a.verified_merchant));
      if (verifiedDiff !== 0) return verifiedDiff;

      return (a.business_name || "").localeCompare(b.business_name || "");
    });
  }, [merchants]);

  const requestedCount = merchants.filter((merchant) => merchant.verification_requested).length;
  const verifiedCount = merchants.filter((merchant) => merchant.verified_merchant).length;

  if (isLoading) {
    return <div className="h-40 rounded-xl bg-slate-100 animate-pulse" />;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Open requests</p>
          <p className="mt-2 text-3xl font-semibold text-amber-950">{requestedCount}</p>
          <p className="mt-1 text-sm text-amber-900">Merchants waiting for manual review.</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Verified merchants</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-950">{verifiedCount}</p>
          <p className="mt-1 text-sm text-emerald-900">Stores currently showing the verified badge.</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="text-sm font-semibold text-slate-800">Merchant verification review</h3>
          <p className="mt-1 text-sm text-slate-500">Review merchant details and manually switch the verified badge on or off.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500">
                <th className="px-5 py-3 font-medium">Business</th>
                <th className="px-5 py-3 font-medium">Website</th>
                <th className="px-5 py-3 font-medium">Requested</th>
                <th className="px-5 py-3 font-medium">Verified</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedMerchants.map((merchant) => (
                <tr key={merchant.id} className="border-b border-slate-50 align-top hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <div className="font-medium text-slate-900">{merchant.business_name}</div>
                    <div className="mt-1 text-xs font-mono text-slate-500">{merchant.user_id}</div>
                    {merchant.nft_store_name && (
                      <div className="mt-1 text-xs text-slate-500">Store: {merchant.nft_store_name}</div>
                    )}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {merchant.website_url ? (
                      <a
                        href={merchant.website_url.startsWith("http") ? merchant.website_url : `https://${merchant.website_url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-700 hover:underline"
                      >
                        {merchant.website_url}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className={merchant.verification_requested
                      ? "inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700"
                      : "inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"}>
                      {merchant.verification_requested ? "Requested" : "No request"}
                    </div>
                    <div className="mt-2 text-xs text-slate-500">{formatRequestDate(merchant.verification_requested_at)}</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={merchant.verified_merchant
                      ? "inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                      : "inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"}>
                      {merchant.verified_merchant ? "Verified" : "Not verified"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={() => toggleVerificationMutation.mutate({
                          merchantId: merchant.id,
                          verified: !merchant.verified_merchant,
                        })}
                        disabled={toggleVerificationMutation.isPending || clearRequestMutation.isPending}
                      >
                        {merchant.verified_merchant ? "Remove verified" : "Verify merchant"}
                      </Button>
                      {merchant.verification_requested && !merchant.verified_merchant && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => clearRequestMutation.mutate(merchant.id)}
                          disabled={toggleVerificationMutation.isPending || clearRequestMutation.isPending}
                        >
                          Clear request
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {sortedMerchants.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-500">
                    No merchants found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}