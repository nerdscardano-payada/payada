import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link2, Trash2, Copy, UserPlus } from "lucide-react";
import { toast } from "sonner";

function LinkRow({ item, type, walletAddress, onRefresh, canClaim }) {
  const publicUrl = type === "payment"
    ? `${window.location.origin}/Pay?slug=${encodeURIComponent(item.slug)}`
    : `${window.location.origin}/Access?slug=${encodeURIComponent(item.slug)}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(publicUrl);
    toast.success("Link gekopieerd");
  };

  const handleDelete = async () => {
    await base44.functions.invoke("claimOrDeletePublicLink", {
      action: "delete",
      linkType: type,
      linkId: item.id,
      walletAddress,
    });
    toast.success("Link verwijderd");
    onRefresh();
  };

  const handleClaim = async () => {
    await base44.functions.invoke("claimOrDeletePublicLink", {
      action: "claim",
      linkType: type,
      linkId: item.id,
      walletAddress,
    });
    toast.success("Link geclaimd");
    onRefresh();
  };

  return (
    <div className="rounded-xl border border-border bg-background/70 p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <p className="font-medium text-foreground truncate">{item.title}</p>
        <p className="text-sm text-muted-foreground truncate">/{type === "payment" ? "Pay" : "Access"}?slug={item.slug}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={handleCopy}><Copy className="w-4 h-4" />Kopieer</Button>
        <Button variant="outline" size="sm" onClick={() => window.open(publicUrl, "_blank")}><Link2 className="w-4 h-4" />Open</Button>
        {canClaim && <Button size="sm" onClick={handleClaim}><UserPlus className="w-4 h-4" />Claim</Button>}
        <Button variant="destructive" size="sm" onClick={handleDelete}><Trash2 className="w-4 h-4" />Verwijder</Button>
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
        <h3 className="text-xl font-semibold text-foreground mt-1">Beheer links van je wallet</h3>
        <p className="text-sm text-muted-foreground mt-1">Bekijk, kopieer, open, claim of verwijder public homepage links op basis van je verbonden wallet.</p>
      </div>

      {loading ? <p className="text-sm text-muted-foreground">Links laden...</p> : null}
      {!loading && total === 0 ? <p className="text-sm text-muted-foreground">Geen public homepage links gevonden voor dit wallet adres.</p> : null}

      <div className="space-y-3">
        {data.paymentLinks?.map((item) => <LinkRow key={item.id} item={item} type="payment" walletAddress={walletAddress} onRefresh={loadLinks} canClaim={authenticated} />)}
        {data.accessLinks?.map((item) => <LinkRow key={item.id} item={item} type="access" walletAddress={walletAddress} onRefresh={loadLinks} canClaim={authenticated} />)}
      </div>
    </Card>
  );
}