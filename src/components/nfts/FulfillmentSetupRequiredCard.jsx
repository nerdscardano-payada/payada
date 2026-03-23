import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function FulfillmentSetupRequiredCard() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Eerst instellen</p>
      <h2 className="mt-2 text-2xl font-semibold text-amber-950">Kies eerst je fulfillment methode</h2>
      <p className="mt-2 max-w-2xl text-sm text-amber-900">
        Voor je NFT Distribution of NFT Marketplace gebruikt, moet je eerst één keer kiezen of je NFT’s manueel of automatisch verstuurt. Daarna onthoudt het systeem deze keuze voor beide pagina’s.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/NFTFulfillmentSetup">Open fulfillment wizard</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/NFTOperations">Open NFT Control</Link>
        </Button>
      </div>
    </div>
  );
}