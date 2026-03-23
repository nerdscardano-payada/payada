import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import FulfillmentMethodBadge from "@/components/nfts/FulfillmentMethodBadge";

export default function DeliveryInfoDialog({ mode }) {
  const isAutomatic = mode === "automatic";
  const triggerLabel = isAutomatic ? "Automatic delivery" : "Manual delivery";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-cyan-400/40 bg-cyan-400/10 text-cyan-200 hover:bg-cyan-400/20 hover:text-white">
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Marketplace delivery</DialogTitle>
          <DialogDescription>
            How this merchant handles NFT delivery after payment confirmation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <FulfillmentMethodBadge mode={mode} />
          <p className="text-sm leading-6 text-slate-600">
            {isAutomatic
              ? "This merchant uses automatic NFT fulfillment. After a confirmed payment, buyers can expect delivery without manual follow-up in normal conditions."
              : "This merchant uses manual NFT fulfillment. After a confirmed payment, the NFT still needs to be sent manually by the merchant, so delivery may take longer."}
          </p>
          <p className="text-sm leading-6 text-slate-600">
            Merchants on PayADA NFT marketplaces are registered with PayADA using email contact details to help reduce fraud and scam risk. This helps with accountability, but buyers should still do their own checks before purchasing.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}