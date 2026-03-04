"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { FORM_SECTIONS, StepState } from "@/types/form";

interface StepIndicatorProps {
  steps: StepState[];
  currentStep: number;
  onStepClick: (index: number) => void;
}

export function StepIndicator({
  steps,
  currentStep,
  onStepClick,
}: StepIndicatorProps) {
  return (
    <nav aria-label="Form progress" className="w-full">
      {/* Mobile: compact display */}
      <div className="flex items-center justify-between sm:hidden px-2">
        <span className="text-sm font-medium text-foreground">
          Step {currentStep + 1} of {steps.length}
        </span>
        <span className="text-sm text-muted-foreground">
          {FORM_SECTIONS[currentStep].title}
        </span>
      </div>

      {/* Desktop: full step indicators */}
      <ol className="hidden sm:flex items-center w-full">
        {steps.map((step, index) => {
          const section = FORM_SECTIONS[index];
          const isClickable =
            step.status !== "locked" && index !== currentStep;

          return (
            <li
              key={step.sectionId}
              className={cn("flex items-center", index < steps.length - 1 && "flex-1")}
            >
              <button
                type="button"
                onClick={() => isClickable && onStepClick(index)}
                disabled={step.status === "locked"}
                className={cn(
                  "flex items-center gap-2 group",
                  isClickable && "cursor-pointer",
                  step.status === "locked" && "cursor-not-allowed opacity-50"
                )}
                aria-current={step.status === "active" ? "step" : undefined}
                aria-label={`${section.title}${
                  step.status === "completed" ? " (completed)" : ""
                }${step.status === "active" ? " (current)" : ""}`}
              >
                <span
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium shrink-0 transition-all",
                    step.status === "active" &&
                      "border-primary bg-primary text-primary-foreground",
                    step.status === "completed" &&
                      "border-primary bg-primary/10 text-primary",
                    step.status === "visited" &&
                      "border-muted-foreground/50 text-muted-foreground",
                    step.status === "available" &&
                      "border-border text-muted-foreground group-hover:border-primary/50",
                    step.status === "locked" &&
                      "border-border/50 text-muted-foreground/50"
                  )}
                >
                  {step.status === "completed" ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span
                  className={cn(
                    "text-sm font-medium hidden lg:block transition-colors",
                    step.status === "active" && "text-foreground",
                    step.status === "completed" && "text-primary",
                    (step.status === "visited" || step.status === "available") &&
                      "text-muted-foreground group-hover:text-foreground",
                    step.status === "locked" && "text-muted-foreground/50"
                  )}
                >
                  {section.title}
                </span>
              </button>

              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-3 transition-colors",
                    step.status === "completed"
                      ? "bg-primary"
                      : "bg-border"
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
