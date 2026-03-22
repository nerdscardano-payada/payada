import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import DonationPageForm from "@/components/donations/DonationPageForm";
import DonationPageCard from "@/components/donations/DonationPageCard";
import { Heart, Plus } from "lucide-react";
import { toast } from "sonner";

function getStatsForPage(page, payments) {
  const paymentLinkIds = new Set((page.payment_links || []).map((link) => link.payment_link_id));
  const matches = payments.filter((payment) => paymentLinkIds.has(payment.payment_link_id));
  const total = matches.reduce((sum, payment) => sum + Number(payment.received_amount_ada ?? payment.expected_amount_ada ?? 0), 0);
  const count = matches.length;

  return {
    total,
    count,
    average: count ? total / count : 0,
  };
}

export default function DonationPages() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: donationPages = [], isLoading } = useQuery({
    queryKey: ["donationPages", user?.email],
    queryFn: () => base44.entities.DonationPage.filter({ merchant_id: user.email }, "-created_date", 100),
    enabled: !!user,
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["payments", user?.email, "donations"],
    queryFn: () => base44.entities.Payment.filter({ merchant_id: user.email, status: "confirmed" }, "-created_date", 200),
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: async (page) => {
      await Promise.all((page.payment_links || []).map((link) => base44.entities.PaymentLink.delete(link.payment_link_id)));
      return base44.entities.DonationPage.delete(page.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donationPages"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      toast.success("Donation page deleted");
    },
  });

  if (showForm) {
    return <DonationPageForm onBack={() => setShowForm(false)} />;
  }

  return (
    <div>
      <PageHeader
        title="Donation Pages"
        subtitle="Create hosted ADA donation pages, share them anywhere, and track performance."
        action={() => setShowForm(true)}
        actionLabel="New Donation Page"
        actionIcon={Plus}
      />

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-64 rounded-2xl border border-slate-200 bg-white animate-pulse" />
          ))}
        </div>
      ) : donationPages.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No donation pages yet"
          description="Launch a hosted donation page your supporters can use in seconds."
          actionLabel="Create donation page"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {donationPages.map((page) => (
            <DonationPageCard
              key={page.id}
              page={page}
              stats={getStatsForPage(page, payments)}
              onDelete={(currentPage) => deleteMutation.mutate(currentPage)}
            />
          ))}
        </div>
      )}
    </div>
  );
}