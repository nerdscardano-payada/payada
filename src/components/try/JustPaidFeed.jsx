import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function JustPaidFeed({ items }) {
  return (
    <Card className="rounded-3xl border-border/70">
      <CardHeader>
        <CardTitle>Just paid</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No payouts yet.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-border/70 bg-muted/40 px-4 py-3">
              <div className="font-medium">+5 ADA → {item.x_handle || "campaign user"}</div>
              <div className="text-xs text-muted-foreground break-all">{item.wallet_address}</div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}