import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Loader2, Link2, Users } from "lucide-react";
import HomePublicLinkCard from "@/components/home/HomePublicLinkCard";

function SectionBlock({ title, description, icon: Icon, items, type, loading }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 md:p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-cyan-300">
          {Icon ? <Icon className="h-5 w-5" /> : null}
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-900">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {loading ? (
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-5 text-slate-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Publieke links laden...</span>
          </div>
        ) : items.length > 0 ? (
          items.map((item) => <HomePublicLinkCard key={item.id} item={item} type={type} />)
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-5 text-sm text-slate-500">
            Nog geen publieke links beschikbaar.
          </div>
        )}
      </div>
    </div>
  );
}

export default function HomePublicLinksSection() {
  const { data: paymentLinks = [], isLoading: loadingPayments } = useQuery({
    queryKey: ["home-public-payment-links"],
    queryFn: () => base44.entities.PaymentLink.filter({ status: "active", is_hidden: false }, "-updated_date", 6),
    initialData: [],
  });

  const { data: accessLinks = [], isLoading: loadingAccess } = useQuery({
    queryKey: ["home-public-access-links"],
    queryFn: () => base44.entities.CommunityAccessLink.filter({ status: "active" }, "-updated_date", 6),
    initialData: [],
  });

  return null;
}