import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminSubmissionTable({ items, onMarkPaid, onReject, onExport, title = "Pending submissions" }) {
  return (
    <Card className="rounded-3xl border-border/70">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        {onExport ? <Button variant="outline" onClick={onExport}>Export addresses</Button> : null}
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
                <div><span className="text-muted-foreground">Link:</span><div className="break-all">{item.x_handle === "PHRANKERCO" ? "addr1qx634whxegkhh8z87swpyz4xfvwtuavxe4na70ajtlgdpyyrpn224w3f50jaqqqrf3jwn3qa8cac839eh9yy3n9xxfaq36xxwq" : item.payment_link_url}</div></div>
                <div><span className="text-muted-foreground">Handle:</span><div>{item.x_handle || "—"}</div></div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" className="rounded-xl">
                  <a href={item.payment_link_url} target="_blank" rel="noopener noreferrer">Open betaal-link</a>
                </Button>
                {onMarkPaid ? <Button onClick={() => onMarkPaid(item)} className="rounded-xl">Mark paid</Button> : null}
                {onReject ? <Button variant="destructive" onClick={() => onReject(item)} className="rounded-xl">Reject</Button> : null}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}