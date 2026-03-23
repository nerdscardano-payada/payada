import React from "react";
import { cn } from "@/lib/utils";

export default function FulfillmentMethodBadge({ mode, className }) {
  const isAutomatic = mode === "automatic";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        isAutomatic ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800",
        className,
      )}
    >
      {isAutomatic ? "Automatic NFT delivery" : "Manual NFT delivery"}
    </span>
  );
}