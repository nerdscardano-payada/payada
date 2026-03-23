import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useProfileCheck } from "@/components/hooks/useProfileCheck";
import PageHeader from "@/components/shared/PageHeader";
import PaymentLinkForm from "@/components/payment-links/PaymentLinkForm";
import PaymentLinksTable from "@/components/payment-links/PaymentLinksTable";
import { Link2, Plus, BookTemplate, Eye, EyeOff } from "lucide-react";
import TemplateSelector from "@/components/payment-links/TemplateSelector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import MerchantProfileBanner from "@/components/shared/MerchantProfileBanner";

export default function PaymentLinks() {
  const { isProfileComplete, profile } = useProfileCheck();
  const [showForm, setShowForm] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [prefillFromTemplate, setPrefillFromTemplate] = useState(null);
  const [user, setUser] = useState(null);
  const [showHiddenLinks, setShowHiddenLinks] = useState(false);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: links = [], isLoading } = useQuery({
    queryKey: ["paymentLinks", user?.email],
    queryFn: () => base44.entities.PaymentLink.filter({ merchant_id: user.email }, "-created_date", 100),
    enabled: !!user,
  });

  const { data: donationPages = [], isLoading: isLoadingDonationPages } = useQuery({
    queryKey: ["paymentLinks-donationPages", user?.email],
    queryFn: () => base44.entities.DonationPage.filter({ merchant_id: user.email }, "-created_date", 100),
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PaymentLink.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentLinks"] });
      toast.success("Payment link deleted");
    },
  });

  const copyCheckoutUrl = (slug) => {
    navigator.clipboard.writeText(`${window.location.origin}/Pay?slug=${slug}`);
    toast.success("Checkout URL copied!");
  };

  const handleSelectTemplate = (tpl) => {
    setPrefillFromTemplate(tpl);
    setEditingLink(null);
    setShowForm(true);
  };

  const donationLinkedIds = new Set(
    donationPages.flatMap((page) => (page.payment_links || []).map((link) => link.payment_link_id))
  );

  const isHiddenLink = (link) => (
    link.is_hidden === true ||
    link.creation_source === "donation" ||
    link.creation_source === "pos" ||
    donationLinkedIds.has(link.id) ||
    link.slug?.startsWith("pos-")
  );

  const visibleLinks = links.filter((link) => !isHiddenLink(link));
  const hiddenLinks = links.filter((link) => isHiddenLink(link));

  if (showForm) {
    return (
      <PaymentLinkForm
        link={editingLink}
        prefill={prefillFromTemplate}
        onBack={() => { setShowForm(false); setEditingLink(null); setPrefillFromTemplate(null); }}
        merchantId={user?.email}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Payment Links"
        subtitle="Create and manage your ADA payment links"
        action={() => { setEditingLink(null); setShowForm(true); }}
        actionLabel="New Link"
        actionIcon={Plus}
      />

      {!isProfileComplete && profile !== undefined && <MerchantProfileBanner />}

      <Tabs defaultValue="links" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="links" className="gap-2"><Link2 className="w-3.5 h-3.5" />Links</TabsTrigger>
          <TabsTrigger value="templates" className="gap-2"><BookTemplate className="w-3.5 h-3.5" />Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          <TemplateSelector merchantId={user?.email} onSelect={handleSelectTemplate} />
        </TabsContent>

        <TabsContent value="links">
          <div className="space-y-4">
            <PaymentLinksTable
              title="Visible payment links"
              description="Only the links you created manually are shown here."
              links={visibleLinks}
              isLoading={isLoading || isLoadingDonationPages}
              emptyTitle="No visible payment links yet"
              emptyDescription="Create your first ADA payment link and start accepting payments instantly."
              emptyActionLabel="Create Payment Link"
              onEmptyAction={() => setShowForm(true)}
              onCopy={copyCheckoutUrl}
              onEdit={(link) => { setEditingLink(link); setShowForm(true); }}
              onDelete={(id) => deleteMutation.mutate(id)}
            />

            <div className="rounded-xl border border-slate-200/60 bg-white overflow-hidden">
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Invisible payment links</h2>
                  <p className="mt-1 text-sm text-slate-500">Auto-generated links from Donation Pages, POS and NFT tools stay hidden until you open them.</p>
                </div>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowHiddenLinks((value) => !value)}>
                  {showHiddenLinks ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showHiddenLinks ? "Hide" : `Show (${hiddenLinks.length})`}
                </Button>
              </div>

              {showHiddenLinks && (
                <PaymentLinksTable
                  links={hiddenLinks}
                  isLoading={isLoading || isLoadingDonationPages}
                  onCopy={copyCheckoutUrl}
                  onEdit={(link) => { setEditingLink(link); setShowForm(true); }}
                  onDelete={(id) => deleteMutation.mutate(id)}
                />
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}