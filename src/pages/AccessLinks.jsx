import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import AccessLinkForm from "@/components/access-links/AccessLinkForm";
import MembersDashboard from "@/components/access-links/MembersDashboard";
import { Users, Plus, Copy, MoreHorizontal, Pencil, Trash2, ExternalLink, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const PLATFORM_LABELS = { discord: "Discord", telegram: "Telegram", whatsapp: "WhatsApp", website: "Website", other: "Other" };
const PLATFORM_COLORS = { discord: "bg-indigo-100 text-indigo-700", telegram: "bg-sky-100 text-sky-700", whatsapp: "bg-green-100 text-green-700", website: "bg-slate-100 text-slate-700", other: "bg-slate-100 text-slate-600" };

export default function AccessLinks() {
  const [showForm, setShowForm] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [user, setUser] = React.useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => { base44.auth.me().then(setUser); }, []);

  const { data: links = [], isLoading } = useQuery({
    queryKey: ["accessLinks", user?.email],
    queryFn: () => base44.entities.CommunityAccessLink.filter({ merchant_id: user.email }, "-created_date", 100),
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CommunityAccessLink.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["accessLinks"] }); toast.success("Access link deleted"); },
  });

  const copyCheckoutUrl = (slug) => {
    navigator.clipboard.writeText(`${window.location.origin}/Access?slug=${slug}`);
    toast.success("Checkout URL copied!");
  };

  if (showForm) {
    return <AccessLinkForm link={editingLink} user={user} onBack={() => { setShowForm(false); setEditingLink(null); }} />;
  }

  return (
    <div>
      <PageHeader
        title="Access Links"
        subtitle="Sell access to your Discord, Telegram or private community with ADA"
        action={() => { setEditingLink(null); setShowForm(true); }}
        actionLabel="New Access Link"
        actionIcon={Plus}
      />

      <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
        {isLoading ? (
          <div className="p-5 space-y-3">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
        ) : links.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No access links yet"
            description="Create your first Access Link to start selling community memberships with ADA."
            actionLabel="Create Access Link"
            onAction={() => setShowForm(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Community</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Platform</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Price</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Members</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Status</th>
                  <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {links.map((link) => (
                  <tr key={link.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{link.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">/access/{link.slug}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${PLATFORM_COLORS[link.platform] || PLATFORM_COLORS.other}`}>
                        {PLATFORM_LABELS[link.platform] || link.platform}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-semibold text-slate-900 tabular-nums">₳ {link.price_ada?.toFixed(2)}</span>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="text-sm text-slate-600">{link.payment_count || 0}</span>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <Badge variant={link.status === "active" ? "default" : "secondary"} className={link.status === "active" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : ""}>
                        {link.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyCheckoutUrl(link.slug)}>
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setEditingLink(link); setShowForm(true); }}>
                              <Pencil className="w-3.5 h-3.5 mr-2" />Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => copyCheckoutUrl(link.slug)}>
                              <Copy className="w-3.5 h-3.5 mr-2" />Copy URL
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => deleteMutation.mutate(link.id)}>
                              <Trash2 className="w-3.5 h-3.5 mr-2" />Delete
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
    </div>
  );
}