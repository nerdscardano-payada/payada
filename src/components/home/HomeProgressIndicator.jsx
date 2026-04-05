import React from "react";
import { Check, Wallet, Layers3, Rocket, Copy, UserPlus } from "lucide-react";

const steps = [
  { id: 1, label: "Connect Wallet", icon: Wallet },
  { id: 2, label: "Select Type", icon: Layers3 },
  { id: 3, label: "Launch Flow", icon: Rocket },
  { id: 4, label: "Copy Link", icon: Copy },
  { id: 5, label: "Claim Access", icon: UserPlus },
];

export default function HomeProgressIndicator({ currentStep = 1 }) {
  return (
    <div className="grid gap-3 md:grid-cols-5 md:gap-4">
      {steps.map((step) => {
        const Icon = step.icon;
        const isActive = currentStep === step.id;
        const isDone = currentStep > step.id;

        return (
          <div
            key={step.id}
            className={[
              "rounded-2xl border p-4 transition-colors",
              isDone
                ? "border-primary/30 bg-primary/5"
                : isActive
                  ? "border-primary bg-primary/10"
                  : "border-border bg-background",
            ].join(" ")}
          >
            <div className="flex items-start gap-3">
              <div
                className={[
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors",
                  isDone
                    ? "border-primary bg-primary text-primary-foreground"
                    : isActive
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground",
                ].join(" ")}
              >
                {isDone ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Step {step.id}</p>
                <p className={[
                  "mt-1 text-base sm:text-lg font-semibold leading-tight",
                  isActive || isDone ? "text-foreground" : "text-muted-foreground",
                ].join(" ")}>
                  {step.label}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}