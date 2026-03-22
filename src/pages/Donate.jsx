import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { AlertCircle, ArrowRight, Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Donate() {
  const slug = useMemo(() => new URLSearchParams(window.location.search).get("slug") || "", []);
  const [selectedSlug, setSelectedSlug] = useState("");

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ["donationPagePublic", slug],
    queryFn: () => base44.entities.DonationPage.filter({ slug, status: "active" }, "-created_date", 1),
    enabled: !!slug,
  });

  const donationPage = pages[0];
  const paymentLinks = [...(donationPage?.payment_links || [])].sort((a, b) => a.amount_ada - b.amount_ada);
  const selectedLink = paymentLinks.find((link) => link.slug === selectedSlug) || paymentLinks[0];

  useEffect(() => {
    if (paymentLinks[0] && !selectedSlug) {
      setSelectedSlug(paymentLinks[0].slug);
    }
  }, [paymentLinks, selectedSlug]);

  if (!slug) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-white">Donation page not found</h1>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mx-auto mb-4" />
          <p className="text-slate-400">Loading donation page...</p>
        </div>
      </div>
    );
  }

  if (!donationPage) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-white">This donation page is unavailable</h1>
          <p className="text-slate-400 mt-2">It may have been disabled or removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-indigo-500 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-7 h-7 text-white" />
          </div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Powered by PayADA</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-[28px] overflow-hidden shadow-2xl shadow-black/20">
          <div className="p-8 border-b border-slate-800 text-center">
            <h1 className="text-3xl font-bold text-white">{donationPage.title}</h1>
            {donationPage.description && <p className="text-slate-400 mt-3 max-w-xl mx-auto">{donationPage.description}</p>}
          </div>

          <div className="p-8 space-y-6">
            <div>
              <p className="text-sm font-medium text-slate-300 mb-3">Choose an amount</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {paymentLinks.map((link) => {
                  const isSelected = selectedLink?.slug === link.slug;
                  return (
                    <button
                      key={link.payment_link_id}
                      onClick={() => setSelectedSlug(link.slug)}
                      className={isSelected
                        ? "rounded-2xl border border-indigo-500 bg-indigo-500/10 px-4 py-5 text-left transition-colors"
                        : "rounded-2xl border border-slate-700 bg-slate-800/70 hover:bg-slate-800 px-4 py-5 text-left transition-colors"
                      }
                    >
                      <p className="text-2xl font-semibold text-white">₳ {Number(link.amount_ada || 0).toFixed(2)}</p>
                      <p className="text-xs text-slate-400 mt-1">Secure Cardano donation</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-800/60 border border-slate-700 p-5 space-y-2">
              <p className="text-sm text-slate-300">Your supporters will be redirected to a secure PayADA checkout page.</p>
              <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                {donationPage.collect_name && <span className="px-2 py-1 rounded-full bg-slate-700">Name collected</span>}
                {donationPage.collect_email && <span className="px-2 py-1 rounded-full bg-slate-700">Email collected</span>}
                <span className="px-2 py-1 rounded-full bg-slate-700">ADA payments</span>
              </div>
            </div>

            <Button
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white text-base font-semibold gap-2"
              onClick={() => {
                if (selectedLink?.slug) {
                  window.location.href = `/Pay?slug=${encodeURIComponent(selectedLink.slug)}`;
                }
              }}
            >
              {donationPage.embed_button_label || "Support with ADA"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}