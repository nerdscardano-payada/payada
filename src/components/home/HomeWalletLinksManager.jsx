import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link2, Trash2, Copy, UserPlus, BarChart3, Settings, Layers3, ArrowRight } from "lucide-react";
import { toast } from "sonner";

function LinkRow({ item, type, walletAddress, onRefresh, authenticated }) {
  const publicUrl = type === "payment"
    ? `${window.location.origin}/Pay?slug=${encodeURIComponent(item.slug)}`
    : `${window.location.origin}/Access?slug=${encodeURIComponent(item.slug)}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(publicUrl);
    toast.success("Link copied");
  };

  const handleDelete = async () => {
    try {
      await base44.functions.invoke("claimOrDeletePublicLink", {
        action: "delete",
        linkType: type,
        linkId: item.id,
        walletAddress,
      });
      toast.success("Link deleted");
      onRefresh();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Delete failed");
    }
  };

  const handleClaim = async () => {
    if (!authenticated) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }

    try {
      await base44.functions.invoke("claimOrDeletePublicLink", {
        action: "claim",
        linkType: type,
        linkId: item.id,
        walletAddress,
      });
      toast.success("Link claimed");
      onRefresh();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Claim failed");
    }
  };

  return (
    <div className="rounded-xl border border-border bg-background/70 p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <p className="font-medium text-foreground truncate">{item.title}</p>
        <p className="text-sm text-muted-foreground truncate">/{type === "payment" ? "Pay" : "Access"}?slug={item.slug}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={handleCopy}><Copy className="w-4 h-4" />Copy</Button>
        <Button variant="outline" size="sm" onClick={() => window.open(publicUrl, "_blank")}><Link2 className="w-4 h-4" />Open</Button>
        <Button size="sm" onClick={handleClaim}><UserPlus className="w-4 h-4" />{authenticated ? "Claim" : "Claim with login"}</Button>
        <Button variant="destructive" size="sm" onClick={handleDelete}><Trash2 className="w-4 h-4" />Delete</Button>
      </div>
    </div>
  );
}

export default function HomeWalletLinksManager({ walletAddress }) {
  const [data, setData] = React.useState({ paymentLinks: [], accessLinks: [] });
  const [loading, setLoading] = React.useState(false);
  const [authenticated, setAuthenticated] = React.useState(false);

  const loadLinks = async () => {
    if (!walletAddress) return;
    setLoading(true);
    const response = await base44.functions.invoke("getPublicLinksByWallet", { walletAddress });
    setData(response.data || { paymentLinks: [], accessLinks: [] });
    setLoading(false);
  };

  React.useEffect(() => {
    base44.auth.isAuthenticated().then(setAuthenticated);
  }, []);

  React.useEffect(() => {
    loadLinks();
  }, [walletAddress]);

  if (!walletAddress) return null;

  const total = (data.paymentLinks?.length || 0) + (data.accessLinks?.length || 0);

  return (
    <Card className="p-5 sm:p-6 border border-border bg-card space-y-4 shadow-sm">
      <div>
        <p className="text-sm text-muted-foreground">Wallet links</p>
        <h3 className="text-xl font-semibold text-foreground mt-1">Manage your wallet links</h3>
        <p className="text-sm text-muted-foreground mt-1">View, copy, open, claim, or delete public homepage links based on your connected wallet.</p>
      </div>

      {!authenticated ? (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Unlock more with an account</p>
                <p className="text-sm text-muted-foreground mt-1">Sign in to claim links and manage them with more control.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-background/80 p-3">
                  <BarChart3 className="w-4 h-4 text-primary mb-2" />
                  <p className="text-sm font-medium text-foreground">Detailed stats</p>
                  <p className="text-xs text-muted-foreground mt-1">Track payments, link activity, and performance over time.</p>
                </div>
                <div className="rounded-xl border border-border bg-background/80 p-3">
                  <Settings className="w-4 h-4 text-primary mb-2" />
                  <p className="text-sm font-medium text-foreground">Advanced tools</p>
                  <p className="text-xs text-muted-foreground mt-1">Edit links, manage flows, and use more merchant controls.</p>
                </div>
                <div className="rounded-xl border border-border bg-background/80 p-3">
                  <Layers3 className="w-4 h-4 text-primary mb-2" />
                  <p className="text-sm font-medium text-foreground">More link types</p>
                  <p className="text-xs text-muted-foreground mt-1">Create subscriptions, donation pages, terminals, and more.</p>
                </div>
              </div>
            </div>
            <Button onClick={() => base44.auth.redirectToLogin(window.location.href)} className="sm:shrink-0">
              Log in or sign up
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      ) : null}

      {loading ? <p className="text-sm text-muted-foreground">Loading links...</p> : null}
      {!loading && total === 0 ? <p className="text-sm text-muted-foreground">No public homepage links found for this wallet address.</p> : null}

      <div className="space-y-3">
        {data.paymentLinks?.map((item) => <LinkRow key={item.id} item={item} type="payment" walletAddress={walletAddress} onRefresh={loadLinks} authenticated={authenticated} />)}
        {data.accessLinks?.map((item) => <LinkRow key={item.id} item={item} type="access" walletAddress={walletAddress} onRefresh={loadLinks} authenticated={authenticated} />)}
      </div>
    </Card>
  );
}