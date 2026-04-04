import React from "react";

export default function AdminAIBuildIntroCard() {
  return (
    <div className="rounded-2xl border bg-card p-5 text-sm text-muted-foreground">
      <p className="font-medium text-foreground">What this prototype does</p>
      <p className="mt-2">Describe a payment flow in plain English and the AI can generate PayADA payment links or subscription plans with the platform fee model included.</p>
      <div className="mt-4 rounded-xl bg-secondary p-4 text-sm">
        <p className="font-medium text-foreground">Example</p>
        <p className="mt-1">Create a monthly plan called Pro Membership for this merchant at 29 ADA, customer pays fee, 7-day trial.</p>
      </div>
    </div>
  );
}