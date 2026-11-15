"use client";

import { Check } from "lucide-react";
import type { StepConfig } from "./agent-form.schema";

interface StepperProgressProps {
  steps: StepConfig[];
  currentStep: number;
  onStepClick: (stepId: number) => void;
}

export function StepperProgress({
  steps,
  currentStep,
  onStepClick,
}: StepperProgressProps) {
  return (
    <nav
      aria-label="Agent Creation Progress"
      className="flex flex-col gap-2 relative"
    >
      {steps.map((step, idx) => {
        const isCompleted = currentStep > step.id;
        const isCurrent = currentStep === step.id;
        const isClickable = step.id < currentStep;

        return (
          <button
            key={step.id}
            type="button"
            onClick={() => {
              if (isClickable) {
                onStepClick(step.id);
              }
            }}
            disabled={!isClickable}
            aria-current={isCurrent ? "step" : undefined}
            className={`relative flex items-center gap-3.5 p-3 rounded-2xl transition-all text-left select-none w-full ${isClickable
                ? "cursor-pointer active:scale-[0.99]"
                : "cursor-default"
              }`}
          >
            {/* Connecting Line between steps */}
            {idx < steps.length - 1 && (
              <div
                aria-hidden="true"
                className={`absolute left-[29px] top-[48px] w-[2px] h-[calc(100%-24px)] transition-colors pointer-events-none ${currentStep > step.id ? "bg-emerald-500" : "bg-neutral-800"
                  }`}
              />
            )}

            {/* Step Number or Check Icon */}
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs shrink-0 transition-all z-10 ${isCompleted
                  ? "bg-right-700 text-secondary-950 shadow-xs"
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

            {/* Step Title & Description */}
            <div className="flex flex-col min-w-0">
              <span
                className={`text-sm font-semibold truncate transition-colors ${isCurrent
                    ? "text-secondary-50 font-bold"
                    : isCompleted
                      ? "text-secondary-100"
                      : "text-neutral-400"
                  }`}
              >
                {step.title}
              </span>
              <span className="text-xs text-neutral-500 truncate">
                {step.description}
              </span>
            </div>
          </button>
        );
      })}
    </nav>
  );
}

export default StepperProgress;
