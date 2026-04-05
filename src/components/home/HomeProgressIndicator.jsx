import React from "react";
import { Check, Wallet, Layers3, Rocket, Copy, UserPlus } from "lucide-react";

const steps = [
  { id: 1, label: "Connect", icon: Wallet },
  { id: 2, label: "Select Type", icon: Layers3 },
  { id: 3, label: "Launch", icon: Rocket },
  { id: 4, label: "Copy", icon: Copy },
  { id: 5, label: "Claim", icon: UserPlus },
];

export default function HomeProgressIndicator({ currentStep = 1 }) {
  return (
    <div className="rounded-2xl border border-border bg-card/70 p-4 sm:p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isDone = currentStep > step.id;

          return (
            <React.Fragment key={step.id}>
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={[
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors",
                    isDone
                      ? "border-primary bg-primary text-primary-foreground"
                      : isActive
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground",
                  ].join(" ")}
                >
                  {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Step {step.id}</p>
                  <p className={[
                    "text-sm font-medium truncate",
                    isActive || isDone ? "text-foreground" : "text-muted-foreground",
                  ].join(" ")}>
                    {step.label}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden h-px flex-1 bg-border sm:block" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}