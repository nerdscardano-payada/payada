import React from "react";
import { CreditCard, Users, TrendingUp } from "lucide-react";
import GoalTile from "@/components/onboarding/GoalTile";

const goals = [
  {
    icon: CreditCard,
    eyebrow: "Get paid fast",
    title: "Collect Payments",
    description:
      "Create simple payment links for products, services, invoices, or one-off requests in just a few clicks.",
    to: "/PaymentLinks",
    cta: "Start with payment links"
  },
  {
    icon: Users,
    eyebrow: "Build your audience",
    title: "Engage Communities",
    description:
      "Launch access flows for members, gated experiences, and community offers around your brand or project.",
    to: "/AccessLinks",
    cta: "Set up community access"
  },
  {
    icon: TrendingUp,
    eyebrow: "Grow recurring revenue",
    title: "Grow Revenue",
    description:
      "Add donation pages, subscriptions, and other revenue streams that help your business scale over time.",
    to: "/DonationPages",
    cta: "Explore revenue tools"
  }
];

export default function OnboardingGoals() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-cyan-50/40">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full border border-cyan-100 bg-cyan-50 px-4 py-1 text-sm font-medium text-cyan-700">
            Welcome to PayADA
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            What do you want to achieve first?
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Pick a goal and we’ll guide you into the right part of the platform.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {goals.map((goal) => (
            <GoalTile key={goal.title} {...goal} />
          ))}
        </div>
      </div>
    </div>
  );
}