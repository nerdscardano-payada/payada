import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useProfileCheck } from "@/components/hooks/useProfileCheck";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import PaymentLinkForm from "@/components/payment-links/PaymentLinkForm";
import { Link2, Plus, Copy, ExternalLink, MoreHorizontal, Pencil, Trash2, QrCode, BookTemplate, AlertCircle } from "lucide-react";
import TemplateSelector from "@/components/payment-links/TemplateSelector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function PaymentLinks() {
  const { isProfileComplete, profile } = useProfileCheck();
  const [showForm, setShowForm] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [prefillFromTemplate, setPrefillFromTemplate] = useState(null);
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  // Show profile warning banner if not complete
  if (!isProfileComplete && profile !== undefined) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-blue-50 border border-blue-300 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-blue-900">Complete Your Profile</h2>
          </div>
          <p className="text-sm text-blue-800 mb-4">
            To access PayADA tools, please complete your merchant profile first. You need to provide your business name and a receiving wallet address.
          </p>
          <button
            onClick={() => window.location.href = '/MerchantProfile'}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
            Go to Profile
          </button>
        </div>
      </div>
    );
  }

  React.useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: links = [], isLoading } = useQuery({
    queryKey: ["paymentLinks", user?.email],
    queryFn: () => base44.entities.PaymentLink.filter({ merchant_id: user.email }, "-created_date", 100),
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

      <Tabs defaultValue="links" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="links" className="gap-2"><Link2 className="w-3.5 h-3.5" />Links</TabsTrigger>
          <TabsTrigger value="templates" className="gap-2"><BookTemplate className="w-3.5 h-3.5" />Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          <TemplateSelector merchantId={user?.email} onSelect={handleSelectTemplate} />
        </TabsContent>

        <TabsContent value="links">
      <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
        {isLoading ? (
          <div className="p-5 space-y-3">
            {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : links.length === 0 ? (
          <EmptyState
            icon={Link2}
            title="No payment links yet"
            description="Create your first ADA payment link and start accepting payments instantly."
            actionLabel="Create Payment Link"
            onAction={() => setShowForm(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Title</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Amount</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Created</th>
                  <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {links.map((link) => (
                  <tr key={link.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{link.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">/{link.slug}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-semibold text-slate-900 tabular-nums">
                        {link.amount_mode === "fixed_ada"
                          ? `₳ ${link.amount_ada?.toFixed(2) || "—"}`
                          : link.amount_mode === "fixed_cnt"
                          ? `${link.cnt_amount?.toLocaleString() || "—"} ${link.cnt_ticker || "CNT"}`
                          : `${link.fiat_currency} ${link.amount_fiat?.toFixed(2) || "—"}`
                        }
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={link.status} />
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="text-xs text-slate-500">
                        {format(new Date(link.created_date), "MMM d, yyyy")}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => copyCheckoutUrl(link.slug)}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setEditingLink(link); setShowForm(true); }}>
                              <Pencil className="w-3.5 h-3.5 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => copyCheckoutUrl(link.slug)}>
                              <Copy className="w-3.5 h-3.5 mr-2" />
                              Copy URL
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => deleteMutation.mutate(link.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}