import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function TryStatsCards({ claimedCount, paidCount, maxSpots = 100 }) {
  const progress = Math.min(100, (claimedCount / maxSpots) * 100);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="rounded-3xl border-border/70">
        <CardContent className="p-6 space-y-3">
          <p className="text-sm text-muted-foreground">Spots claimed</p>
          <div className="text-3xl font-bold">{claimedCount} / {maxSpots}</div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>
      <Card className="rounded-3xl border-border/70">
        <CardContent className="p-6 space-y-2">
          <p className="text-sm text-muted-foreground">We’ll send</p>
          <div className="text-3xl font-bold">5 ADA</div>
          <p className="text-sm text-muted-foreground">Directly to your payment link after review.</p>
        </CardContent>
      </Card>
      <Card className="rounded-3xl border-border/70">
        <CardContent className="p-6 space-y-2">
          <p className="text-sm text-muted-foreground">Already paid</p>
          <div className="text-3xl font-bold">{paidCount}</div>
          <p className="text-sm text-muted-foreground">Manual payouts sent from the campaign wallet.</p>
        </CardContent>
      </Card>
    </div>
  );
}