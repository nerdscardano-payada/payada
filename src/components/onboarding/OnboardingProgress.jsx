import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function OnboardingProgress({ steps, currentStep }) {
  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-600 transition-all duration-300"
          style={{ width: `${((currentStep) / steps.length) * 100}%` }}
        ></div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div key={step.id} className="flex items-center gap-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                  isCompleted && "bg-green-600 text-white",
                  isCurrent && "bg-indigo-600 text-white ring-2 ring-indigo-300",
                  !isCompleted && !isCurrent && "bg-slate-200 text-slate-600"
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  idx + 1
                )}
              </div>
              <div className="hidden md:block">
                <p
                  className={cn(
                    "text-sm font-medium",
                    isCurrent && "text-slate-900",
                    !isCurrent && "text-slate-600"
                  )}
                >
                  {step.title}
                </p>
              </div>

              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    "hidden md:block w-12 h-0.5",
                    isCompleted || isCurrent ? "bg-indigo-600" : "bg-slate-200"
                  )}
                ></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Step description */}
      <div className="mt-6">
        <p className="text-sm text-slate-500">
          Step {currentStep + 1} of {steps.length}
        </p>
      </div>
    </div>
  );
}