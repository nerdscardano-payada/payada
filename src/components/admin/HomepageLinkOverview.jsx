import React, { useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Globe, Link2, LockOpen, Users } from "lucide-react";

function StatTile({ title, value, subtitle, icon: TileIcon }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
          {subtitle ? <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
        <div className="rounded-xl bg-secondary p-2.5">
          <TileIcon className="h-4 w-4 text-foreground" />
        </div>
      </div>
    </div>
  );
}

export default function HomepageLinkOverview() {
  const { data: paymentLinks = [], isLoading: loadingPayments } = useQuery({
    queryKey: ["admin-homepage-payment-links"],
    queryFn: () => base44.entities.PaymentLink.list("-created_date", 500),
  });

  const { data: accessLinks = [], isLoading: loadingAccess } = useQuery({
    queryKey: ["admin-homepage-access-links"],
    queryFn: () => base44.entities.CommunityAccessLink.list("-created_date", 500),
  });

  const summary = useMemo(() => {
    const homepagePayments = paymentLinks.filter(
      (link) => !link.created_by && (link.creation_source === "manual" || !link.creation_source)
    );
    const homepageAccess = accessLinks.filter((link) => !link.created_by);

    return {
      homepagePayments: homepagePayments.length,
      homepageAccess: homepageAccess.length,
      totalHomepageLinks: homepagePayments.length + homepageAccess.length,
      latestHomepageLinkDate: [...homepagePayments, ...homepageAccess]
        .map((item) => item.created_date)
        .filter(Boolean)
        .sort()
        .reverse()[0],
    };
  }, [paymentLinks, accessLinks]);

  if (loadingPayments || loadingAccess) {
    return <div className="h-44 animate-pulse rounded-2xl bg-muted" />;
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-5 md:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Homepage links zonder login</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Snel zicht op links die publiek vanaf de homepage zijn aangemaakt.
          </p>
        </div>
        <div className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
          Publieke creatie
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatTile title="Totaal homepage-links" value={summary.totalHomepageLinks} subtitle="Payment + access links" icon={Globe} />
        <StatTile title="Payment links" value={summary.homepagePayments} subtitle="Aangemaakt zonder login" icon={Link2} />
        <StatTile title="Access links" value={summary.homepageAccess} subtitle="Aangemaakt zonder login" icon={LockOpen} />
        <StatTile
          title="Laatste publieke link"
          value={summary.latestHomepageLinkDate ? new Date(summary.latestHomepageLinkDate).toLocaleDateString("nl-BE") : "—"}
          subtitle="Laatste creatiedatum"
          icon={Users}
        />
      </div>
    </div>
  );
}