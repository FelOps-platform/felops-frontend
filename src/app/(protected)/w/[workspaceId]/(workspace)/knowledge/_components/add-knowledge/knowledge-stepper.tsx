"use client";

import { Check } from "lucide-react";

interface KnowledgeStepperProps {
  currentStep: number;
  totalSteps?: number;
  onStepClick: (stepId: number) => void;
}

export function KnowledgeStepper({
  currentStep,
  totalSteps = 3,
  onStepClick,
}: KnowledgeStepperProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <nav
      aria-label="Add Knowledge Progress"
      className="flex items-center justify-center max-w-xs mx-auto mb-8 w-full"
    >
      <div className="flex items-center w-full">
        {steps.map((stepId, idx) => {
          const isCompleted = currentStep > stepId;
          const isCurrent = currentStep === stepId;
          const isClickable = stepId < currentStep;

          return (
            <div
              key={stepId}
              className="flex items-center flex-1 last:flex-none"
            >
              <button
                type="button"
                onClick={() => {
                  if (isClickable) onStepClick(stepId);
                }}
                disabled={!isClickable}
                aria-current={isCurrent ? "step" : undefined}
                className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs shrink-0 transition-all select-none ${isClickable ? "cursor-pointer active:scale-[0.98]" : "cursor-default"
                  } ${isCompleted
                    ? "bg-right-700 text-secondary-950 shadow-xs"
                    : isCurrent
                      ? "bg-secondary-600 text-secondary-50 shadow-md shadow-secondary-500/25 ring-4 ring-secondary-500/20"
                      : "bg-neutral-900 border border-neutral-700 text-neutral-400"
                  }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  stepId
                )}
              </button>

              {idx < steps.length - 1 && (
                <div
                  aria-hidden="true"
                  className={`h-[2px] flex-1 mx-3 transition-colors ${currentStep > stepId ? "bg-right-600" : "bg-neutral-800"
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

export default KnowledgeStepper;
