import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 10;

export default function JustPaidFeed({ items }) {
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const currentItems = useMemo(() => {
    const start = page * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  }, [items, page]);

  return (
    <Card className="rounded-3xl border-border/70">
      <CardHeader>
        <CardTitle>Just paid</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No payouts yet.</p>
        ) : (
          <>
            {currentItems.map((item) => (
              <div key={item.id} className="rounded-2xl border border-border/70 bg-muted/40 px-4 py-3 space-y-1">
                <div className="font-medium">+5 ADA paid</div>
                <div className="text-sm">X: {item.x_handle || "@campaign_user"}</div>
                <div className="text-xs text-muted-foreground break-all">{item.payment_link_url}</div>
              </div>
            ))}

            <div className="flex items-center justify-between gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((current) => Math.max(0, current - 1))}
              >
                Previous
              </Button>
              <div className="text-xs text-muted-foreground">
                Page {page + 1} of {totalPages}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
              >
                Next page
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}