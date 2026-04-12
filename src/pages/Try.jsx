import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import WalletConnect from "@/components/checkout/WalletConnect";
import TryStatsCards from "@/components/try/TryStatsCards";
import JustPaidFeed from "@/components/try/JustPaidFeed";
import TrySubmissionForm from "@/components/try/TrySubmissionForm";
import { Button } from "@/components/ui/button";

export default function Try() {
  const [wallet, setWallet] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const { data: submissions = [] } = useQuery({
    queryKey: ["launch-submissions"],
    queryFn: () => base44.entities.LaunchSubmission.list("-created_date", 200),
    initialData: []
  });

  const claimedCount = submissions.filter((item) => item.status === "pending" || item.status === "paid").length;
  const paidItems = submissions.filter((item) => item.status === "paid");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary">PAYADA V2 LAUNCH</div>
            <h1 className="text-4xl font-bold tracking-tight">We’ll be your first customer.</h1>
            <p className="text-lg text-muted-foreground">Create a payment link. Share it on X. We’ll pay it with 5 ADA after manual review.</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="rounded-2xl"><a href="#submit">Start now</a></Button>
              <Button asChild variant="outline" className="rounded-2xl"><Link to="/">Back to home</Link></Button>
            </div>
          </div>
          {!isMobile && (
            <div className="w-full max-w-sm">
              <WalletConnect onConnected={setWallet} />
            </div>
          )}
        </div>

        <TryStatsCards claimedCount={claimedCount} paidCount={paidItems.length} maxSpots={100} />

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]" id="submit">
          <TrySubmissionForm walletAddress={wallet?.address || localStorage.getItem("payada_connected_wallet_address") || ""} claimedCount={claimedCount} />
          <JustPaidFeed items={paidItems} />
        </div>
      </div>
    </div>
  );
}