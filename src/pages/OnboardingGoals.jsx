import React from "react";
import { CreditCard, Users, Wallet, Sparkles } from "lucide-react";
import GoalTile from "@/components/onboarding/GoalTile";

const goals = [
  {
    icon: Wallet,
    eyebrow: "Wallet-first start",
    title: "Connect Wallet",
    description:
      "Connect your Cardano wallet first so you can create links and get paid with the simplest possible setup.",
    to: "/MerchantProfile",
    cta: "Connect your wallet"
  },
  {
    icon: CreditCard,
    eyebrow: "Get paid fast",
    title: "Payment Links",
    description:
      "Create simple Cardano payment links for products, services, invoices, and one-off requests.",
    to: "/PaymentLinks",
    cta: "Start with payment links"
  },
  {
    icon: Users,
    eyebrow: "Unlock after payment",
    title: "Access Links",
    description:
      "Sell access to private content, downloads, communities, or hidden pages with one simple flow.",
    to: "/AccessLinks",
    cta: "Create access links"
  },
  {
    icon: Sparkles,
    eyebrow: "Custom build request",
    title: "Tool Builder Request",
    description:
      "Send your wensen to an admin with your account data already filled in, so a custom setup can be built and tested for you.",
    to: "/AIBuilderRequest",
    cta: "Open tool builder"
  }
];

export default function OnboardingGoals() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-cyan-50/40">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full border border-cyan-100 bg-cyan-50 px-4 py-1 text-sm font-medium text-cyan-700">
            Wallet-first PayADA
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Start with wallet, payment links, or access links
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            We’ve simplified the platform so you can focus on the two core flows first.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {goals.map((goal) => (
            <GoalTile key={goal.title} {...goal} />
          ))}
        </div>
      </div>
    </div>
  );
}