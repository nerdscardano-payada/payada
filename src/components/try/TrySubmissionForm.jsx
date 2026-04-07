import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const CAMPAIGN_RECEIVE_ADDRESS = "addr1q974n3yf96aylrjuddrkqg6j9hlqnf3ax3xjzjfg2f6enlu88h5q6gnlr40hlx9htep4la63fd9hz63vjre7a73j0w3s05v8lm";
const MAX_SPOTS = 100;

const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40);
const extractHandle = (url) => {
  const match = url.match(/x\.com\/([^\/\?]+)/i) || url.match(/twitter\.com\/([^\/\?]+)/i);
  return match ? `@${match[1]}` : "";
};

export default function TrySubmissionForm({ walletAddress, claimedCount }) {
  const queryClient = useQueryClient();
  const [description, setDescription] = useState("");
  const [xPostUrl, setXPostUrl] = useState("");
  const paymentLinkUrl = useMemo(() => {
    if (!description.trim()) return "";
    return `${window.location.origin}/Pay?link=v2-${slugify(description)}-${Math.random().toString(36).slice(2, 6)}`;
  }, [description]);

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!walletAddress) throw new Error("Connect eerst een wallet.");
      if (!xPostUrl.trim()) throw new Error("Voeg je X post URL toe.");
      if (claimedCount >= MAX_SPOTS) throw new Error("Alle spots zijn geclaimd.");

      const existing = await base44.entities.LaunchSubmission.filter({ wallet_address: walletAddress });
      if (existing.length > 0) throw new Error("Deze wallet deed al mee.");

      const slug = `v2-${slugify(description || "launch")}-${Math.random().toString(36).slice(2, 6)}`;
      const link = await base44.entities.PaymentLink.create({
        merchant_id: "launch-campaign",
        slug,
        title: "Payada V2 Launch",
        description: description || "We’ll be your first customer",
        amount_mode: "fixed_ada",
        amount_ada: 5,
        receive_address: CAMPAIGN_RECEIVE_ADDRESS,
        fee_model: "merchant_pays",
        confirmations_required: 2,
        status: "active",
        is_hidden: false,
        creation_source: "manual"
      });

      if (link.amount_ada !== 5) throw new Error("Alleen 5 ADA links zijn toegestaan.");

      const linkUrl = `${window.location.origin}/Pay?link=${link.slug}`;
      await base44.entities.LaunchSubmission.create({
        wallet_address: walletAddress,
        payment_link_id: link.id,
        payment_link_url: linkUrl,
        x_post_url: xPostUrl,
        x_handle: extractHandle(xPostUrl),
        status: "pending",
        paid_amount_ada: 5
      });

      return { linkUrl };
    },
    onSuccess: ({ linkUrl }) => {
      queryClient.invalidateQueries({ queryKey: ["launch-submissions"] });
      setDescription("");
      setXPostUrl("");
      navigator.clipboard.writeText(`I just created my first Payada link 🚀\n\nSomeone can pay me 5 ADA here:\n${linkUrl}\n\nBuilt on Cardano`);
      toast.success("Je deelname is ingediend.");
    },
    onError: (error) => toast.error(error.message)
  });

  return (
    <Card className="rounded-3xl border-border/70">
      <CardHeader>
        <CardTitle>Create your 5 ADA launch link</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Connected wallet</Label>
            <Input value={walletAddress || "Connect a Cardano wallet"} readOnly />
          </div>
          <div className="space-y-2">
            <Label>Amount</Label>
            <Input value="5 ADA" readOnly />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short note for your launch link" rows={3} />
        </div>

        <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-4 space-y-2">
          <p className="text-sm font-medium">Suggested X post</p>
          <p className="text-sm text-muted-foreground whitespace-pre-line">I just created my first Payada link 🚀{"\n\n"}Someone can pay me 5 ADA here:{"\n"}[your link]{"\n\n"}Built on Cardano</p>
        </div>

        <div className="space-y-2">
          <Label>X post URL</Label>
          <Input value={xPostUrl} onChange={(e) => setXPostUrl(e.target.value)} placeholder="https://x.com/username/status/..." />
        </div>

        <Button onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending} className="w-full rounded-2xl h-12">
          {submitMutation.isPending ? "Submitting..." : "Submit for 5 ADA"}
        </Button>
      </CardContent>
    </Card>
  );
}