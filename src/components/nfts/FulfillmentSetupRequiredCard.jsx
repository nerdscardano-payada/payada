import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function FulfillmentSetupRequiredCard() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Set up first</p>
      <h2 className="mt-2 text-2xl font-semibold text-amber-950">Choose your fulfillment method first</h2>
      <p className="mt-2 max-w-2xl text-sm text-amber-900">
        Before using NFT Distribution or NFT Marketplace, choose once whether transfers are manual or automatic. The system remembers this choice for both pages.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/NFTFulfillmentSetup">Open fulfillment wizard</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/NFTOperations">Open NFT Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}