import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminSubmissionTable({ items, onMarkPaid, onReject, onExport }) {
  return (
    <Card className="rounded-3xl border-border/70">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Pending submissions</CardTitle>
        <Button variant="outline" onClick={onExport}>Export addresses</Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pending entries.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-border/70 p-4 space-y-3">
              <div className="grid gap-2 md:grid-cols-2 text-sm">
                <div><span className="text-muted-foreground">Wallet:</span><div className="break-all">{item.wallet_address}</div></div>
                <div><span className="text-muted-foreground">X post:</span><div className="break-all">{item.x_post_url}</div></div>
                <div><span className="text-muted-foreground">Link:</span><div className="break-all">{item.payment_link_url}</div></div>
                <div><span className="text-muted-foreground">Handle:</span><div>{item.x_handle || "—"}</div></div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => onMarkPaid(item)} className="rounded-xl">Mark paid</Button>
                <Button variant="destructive" onClick={() => onReject(item)} className="rounded-xl">Reject</Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}