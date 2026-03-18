import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Users, ChevronDown, ChevronRight, ExternalLink, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const PLATFORM_ICONS = {
  discord: "🎮",
  telegram: "✈️",
  whatsapp: "💬",
  website: "🌐",
  other: "🔗",
};

const PLATFORM_COLORS = {
  discord: "bg-indigo-100 text-indigo-700 border-indigo-200",
  telegram: "bg-sky-100 text-sky-700 border-sky-200",
  whatsapp: "bg-green-100 text-green-700 border-green-200",
  website: "bg-slate-100 text-slate-700 border-slate-200",
  other: "bg-slate-100 text-slate-600 border-slate-200",
};

const STATUS_STYLES = {
  confirmed: "bg-emerald-100 text-emerald-700",
  detected: "bg-amber-100 text-amber-700",
  pending: "bg-slate-100 text-slate-700",
  failed: "bg-red-100 text-red-700",
  expired: "bg-slate-100 text-slate-500",
};

function MemberRow({ payment }) {
  return (
    <tr className="hover:bg-slate-50/50 transition-colors">
      <td className="px-4 py-3">
        <div>
          <p className="text-sm font-medium text-slate-900">{payment.payer_name || <span className="text-slate-400 italic">Unknown</span>}</p>
          {payment.payer_email && <p className="text-xs text-slate-400">{payment.payer_email}</p>}
          {payment.payer_discord_username && (
            <p className="text-xs text-indigo-500">@{payment.payer_discord_username}</p>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm font-semibold text-slate-800 tabular-nums">₳ {payment.received_amount_ada?.toFixed(2) || payment.expected_amount_ada?.toFixed(2)}</span>
      </td>
      <td className="px-4 py-3">
        <Badge className={`${STATUS_STYLES[payment.status] || STATUS_STYLES.pending} hover:bg-inherit border-0 text-xs`}>
          {payment.status || "pending"}
        </Badge>
      </td>
      <td className="px-4 py-3 text-xs text-slate-400">
        {payment.confirmed_at ? format(new Date(payment.confirmed_at), "dd MMM yyyy") : payment.created_date ? format(new Date(payment.created_date), "dd MMM yyyy") : "—"}
      </td>
    </tr>
  );
}

function PlatformGroup({ platform, links, payments }) {
  const [expanded, setExpanded] = useState(true);
  const [search, setSearch] = useState("");

  const platformPayments = payments.filter((payment) =>
    links.some((link) => link.id === payment.access_link_id)
  );

  const filteredBySearch = platformPayments.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.payer_name?.toLowerCase().includes(q) ||
      p.payer_email?.toLowerCase().includes(q) ||
      p.payer_discord_username?.toLowerCase().includes(q)
    );
  });

  // Group by access link
  const byLink = {};
  links.forEach(l => { byLink[l.id] = { link: l, members: [] }; });
  filteredBySearch.forEach(p => {
    const linkId = p.access_link_id || p.payment_link_id;
    if (byLink[linkId]) byLink[linkId].members.push(p);
  });

  const totalMembers = platformPayments.length;

  return (
    <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
      {/* Platform header */}
      <button
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{PLATFORM_ICONS[platform]}</span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${PLATFORM_COLORS[platform]}`}>
            {platform.charAt(0).toUpperCase() + platform.slice(1)}
          </span>
          <span className="text-sm text-slate-500">{links.length} community{links.length !== 1 ? "s" : ""}</span>
          <span className="text-sm font-semibold text-slate-700">{totalMembers} member{totalMembers !== 1 ? "s" : ""}</span>
        </div>
        {expanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
      </button>

      {expanded && (
        <div className="border-t border-slate-100">
          {/* Search */}
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
            <div className="relative max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search members..."
                className="pl-8 h-8 text-sm border-slate-200"
              />
            </div>
          </div>

          {/* Per community */}
          {Object.values(byLink).map(({ link, members }) => (
            <div key={link.id}>
              <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-slate-800">{link.title}</span>
                  <span className="ml-2 text-xs text-slate-400">{formatLinkPrice(link)} / access</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">{members.length} member{members.length !== 1 ? "s" : ""}</span>
                  <a
                    href={`/Access?slug=${link.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-500 hover:text-indigo-700"
                    onClick={e => e.stopPropagation()}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {members.length === 0 ? (
                <div className="px-5 py-4 text-sm text-slate-400 italic">No members yet.</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-50">
                      <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-2">Member</th>
                      <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-2">Amount</th>
                      <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-2">Status</th>
                      <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-4 py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {members.map(p => <MemberRow key={p.id} payment={p} />)}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MembersDashboard({ links, user }) {
  const linkIds = links.map(l => l.id);

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["accessPayments", user?.email, linkIds],
    queryFn: async () => {
      if (!linkIds.length) return [];
      const allPayments = await base44.entities.Payment.filter({ merchant_id: user.email }, "-created_date", 500);
      return allPayments
        .filter((payment) => linkIds.includes(payment.access_link_id))
        .sort((a, b) => new Date(b.confirmed_at || b.created_date).getTime() - new Date(a.confirmed_at || a.created_date).getTime());
    },
    enabled: !!user && linkIds.length > 0,
    staleTime: 0,
  });

  // Group links by platform
  const byPlatform = {};
  links.forEach(l => {
    if (!byPlatform[l.platform]) byPlatform[l.platform] = [];
    byPlatform[l.platform].push(l);
  });

  if (isLoading) {
    return (
      <div className="space-y-3 mt-6">
        {[1, 2].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-6">
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-slate-600" />
        <h2 className="text-base font-semibold text-slate-800">Members by Platform</h2>
        <span className="text-sm text-slate-400">({payments.length} total)</span>
      </div>
      {Object.entries(byPlatform).map(([platform, platformLinks]) => (
        <PlatformGroup
          key={platform}
          platform={platform}
          links={platformLinks}
          payments={payments}
        />
      ))}
    </div>
  );
}