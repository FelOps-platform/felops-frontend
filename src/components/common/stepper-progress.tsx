"use client";

import React from "react";
import { Check } from "lucide-react";

export interface StepItem {
  id: number;
  title?: string;
  description?: string;
}

export interface StepperProgressProps {
  steps: number | StepItem[];
  currentStep: number;
  onStepClick: (stepId: number) => void;
  orientation?: "horizontal" | "vertical";
  className?: string;
  ariaLabel?: string;
}

export function StepperProgress({
  steps,
  currentStep,
  onStepClick,
  orientation = "horizontal",
  className = "",
  ariaLabel = "Progress",
}: StepperProgressProps) {
  const normalizedSteps: StepItem[] = Array.isArray(steps)
    ? steps
    : Array.from({ length: steps }, (_, i) => ({ id: i + 1 }));

  if (orientation === "vertical") {
    return (
      <nav
        aria-label={ariaLabel}
        className={`flex flex-col gap-2 relative ${className}`}
      >
        {normalizedSteps.map((step, idx) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isClickable = step.id < currentStep;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => {
                if (isClickable) onStepClick(step.id);
              }}
              disabled={!isClickable}
              aria-current={isCurrent ? "step" : undefined}
              className={`relative flex items-center gap-3.5 p-3 rounded-2xl transition-all text-left select-none w-full ${
                isClickable
                  ? "cursor-pointer active:scale-[0.99]"
                  : "cursor-default"
              }`}
            >
              {idx < normalizedSteps.length - 1 && (
                <div
                  aria-hidden="true"
                  className={`absolute left-[29px] top-[48px] w-[2px] h-[calc(100%-24px)] transition-colors pointer-events-none ${
                    currentStep > step.id ? "bg-right-500" : "bg-neutral-800"
                  }`}
                />
              )}

              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs shrink-0 transition-all z-10 ${
                  isCompleted
                    ? "bg-right-600 text-secondary-950 font-bold shadow-xs"
                    : isCurrent
                      ? "bg-secondary-600 text-secondary-50 shadow-md shadow-secondary-500/25 ring-4 ring-secondary-500/20"
                      : "bg-neutral-900 border border-neutral-700 text-neutral-400"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  step.id
                )}
              </div>

              {(step.title || step.description) && (
                <div className="flex flex-col min-w-0">
                  {step.title && (
                    <span
                      className={`text-sm font-semibold truncate transition-colors ${
                        isCurrent
                          ? "text-secondary-50 font-bold"
                          : isCompleted
                            ? "text-secondary-100"
                            : "text-neutral-400"
                      }`}
                    >
                      {step.title}
                    </span>
                  )}
                  {step.description && (
                    <span className="text-xs text-neutral-500 truncate">
                      {step.description}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>
    );
  }

  // Horizontal Stepper
  return (
    <nav
      aria-label={ariaLabel}
      className={`flex items-center justify-center max-w-[280px] sm:max-w-xs mx-auto mb-6 w-full ${className}`}
    >
      <div className="flex items-center w-full">
        {normalizedSteps.map((step, idx) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isClickable = step.id < currentStep;

          return (
            <div
              key={step.id}
              className="flex items-center flex-1 last:flex-none"
            >
              <button
                type="button"
                onClick={() => {
                  if (isClickable) onStepClick(step.id);
                }}
                disabled={!isClickable}
                aria-current={isCurrent ? "step" : undefined}
                className={`w-7 h-7 rounded-full flex items-center justify-center font-medium text-xs shrink-0 transition-all select-none ${
                  isClickable
                    ? "cursor-pointer active:scale-[0.98]"
                    : "cursor-default"
                } ${
                  isCompleted
                    ? "bg-right-600 text-secondary-950 shadow-xs"
                    : isCurrent
                      ? "bg-secondary-500 text-secondary-50 shadow-md shadow-secondary-500/25 ring-2 ring-secondary-500/30"
                      : "bg-neutral-900/60 border border-neutral-700 text-neutral-400"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : (
                  step.id
                )}
              </button>

              {idx < normalizedSteps.length - 1 && (
                <div
                  aria-hidden="true"
                  className={`h-[1.5px] flex-1 mx-2 sm:mx-3 transition-colors ${
                    currentStep > step.id ? "bg-right-600" : "bg-neutral-800"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}

export default StepperProgress;
