import React, { useState } from "react";
import { Link } from "react-router-dom";
import { addHours } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Toaster } from "sonner";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DemoHero from "@/components/demo/DemoHero";
import InstantLinkForm from "@/components/demo/InstantLinkForm";
import InstantLinkSuccess from "@/components/demo/InstantLinkSuccess";
import { createPageUrl } from "@/utils";

function getDemoMerchantId() {
  const key = "payada_demo_session_id";
  let sessionId = sessionStorage.getItem(key);
  if (!sessionId) {
    sessionId = "demo-" + Math.random().toString(36).slice(2, 10);
    sessionStorage.setItem(key, sessionId);
  }
  return sessionId + "@demo.payada.io";
}

const DEMO_MERCHANT_ID = getDemoMerchantId();

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function Demo() {
  const [createdLink, setCreatedLink] = useState(null);

  const createLinkMutation = useMutation({
    mutationFn: async ({ amount, description, wallet }) => {
      const title = description || "Test payment";
      const slugBase = slugify(title) || "test-payment";
      const slug = `${slugBase}-${Math.random().toString(36).slice(2, 8)}`;

      return base44.entities.PaymentLink.create({
        merchant_id: DEMO_MERCHANT_ID,
        title,
        description: description || "",
        slug,
        amount_mode: "fixed_ada",
        amount_ada: Number(amount),
        receive_address: wallet.address,
        fee_model: "merchant_pays",
        confirmations_required: 2,
        status: "active",
        expires_at: addHours(new Date(), 1).toISOString(),
      });
    },
    onSuccess: (link) => {
      setCreatedLink(link);
      toast.success("Your payment link is live.");
      setTimeout(() => {
        window.location.href = `/Pay?slug=${link.slug}`;
      }, 400);
    },
    onError: () => {
      toast.error("Could not create the payment link.");
    },
  });

  const linkUrl = createdLink ? `${window.location.origin}/Pay?slug=${createdLink.slug}` : "";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(linkUrl);
    toast.success("Link copied.");
  };

  const handleShareX = () => {
    const text = `I just created a Cardano payment link on PayADA — ${linkUrl}`;
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-right" />

      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69999e4306b9e4632bd7d454/1b4bc7fb6_be2b2b99e_1000069668.jpg"
              alt="PayADA"
              className="h-8 w-8 rounded-xl"
            />
            <div>
              <p className="font-bold text-slate-900">
                Pay<span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">ADA</span>
              </p>
              <p className="text-xs text-slate-400">Instant demo checkout</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Badge className="hidden border-0 bg-emerald-100 text-emerald-700 sm:inline-flex">No signup required</Badge>
            <Button variant="outline" onClick={() => base44.auth.redirectToLogin(createPageUrl("Dashboard"))}>
              Login
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 md:py-10">
        <DemoHero />

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <InstantLinkForm
            onGenerate={(payload) => createLinkMutation.mutate(payload)}
            isPending={createLinkMutation.isPending}
          />

          <div className="space-y-6">
            {createdLink ? (
              <InstantLinkSuccess
                linkUrl={linkUrl}
                amount={createdLink.amount_ada}
                description={createdLink.description}
                onCopy={handleCopy}
                onCreateAnother={() => setCreatedLink(null)}
                onClaimDashboard={() => base44.auth.redirectToLogin(createPageUrl("Dashboard"))}
                onShareX={handleShareX}
              />
            ) : (
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50">
                  <BadgeCheck className="h-6 w-6 text-cyan-500" />
                </div>
                <h3 className="mt-4 text-2xl font-bold text-slate-900">What happens next?</h3>
                <div className="mt-5 space-y-4">
                  {[
                    "Enter an amount and optional description",
                    "Connect your Cardano wallet in one click",
                    "Generate a live link you can copy and share instantly",
                    "Claim your dashboard only after you see value",
                  ].map((step, index) => (
                    <div key={step} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                        {index + 1}
                      </div>
                      <p className="text-sm text-slate-700">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-[2rem] bg-slate-950 px-6 py-6 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Why this converts</p>
              <h3 className="mt-3 text-2xl font-bold">Try first. Commit later.</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                This page is built to remove signup friction and get users to their first real payment link as fast as possible.
              </p>
              <Button
                onClick={() => document.getElementById("create-link")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className="mt-5 gap-2 bg-white text-slate-950 hover:bg-slate-100"
              >
                Create payment link
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}