import React from "react";
import { Link } from "react-router-dom";
import { Wallet, SlidersHorizontal, Link as LinkIcon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";

const steps = [
  {
    number: "01",
    title: "Connect your wallet",
    description: "Start by connecting your Cardano wallet so PayADA can use your address and prepare your flow.",
    icon: Wallet,
  },
  {
    number: "02",
    title: "Configure your checkout preferences",
    description: "Choose how you want to get paid, set your options, and tailor the checkout experience to your needs.",
    icon: SlidersHorizontal,
  },
  {
    number: "03",
    title: "Generate your payment link",
    description: "Create your payment link instantly and share it with customers, members, or supporters.",
    icon: LinkIcon,
  },
];

function GettingStartedStep({ step }) {
  const Icon = step.icon;

  return (
    <div className="relative rounded-[1.75rem] border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-[0.3em] text-muted-foreground">{step.number}</span>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <h3 className="mt-8 text-xl font-semibold text-foreground">{step.title}</h3>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.description}</p>
    </div>
  );
}

export default function HomeGettingStartedSection() {
  return (
    <section className="hidden px-4 py-16 sm:px-6 lg:block lg:px-8">
      <div className="mx-auto max-w-7xl rounded-[2rem] border border-border bg-gradient-to-br from-card via-card to-primary/5 p-8 shadow-sm xl:p-10">
        <div className="flex items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              Getting Started
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground xl:text-4xl">
              Your first payment flow in three simple steps.
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              This quick desktop guide shows new merchants exactly how to go from wallet connection to a ready-to-share payment link.
            </p>
          </div>

          <Button asChild className="shrink-0">
            <Link to={createPageUrl("Dashboard")}>
              Open dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-10 grid gap-5 xl:grid-cols-3">
          {steps.map((step) => (
            <GettingStartedStep key={step.number} step={step} />
          ))}
        </div>
      </div>
    </section>
  );
}