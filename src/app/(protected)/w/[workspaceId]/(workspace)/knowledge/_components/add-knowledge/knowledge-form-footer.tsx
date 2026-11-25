"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface KnowledgeFormFooterProps {
  workspaceId: string;
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  isNextDisabled?: boolean;
  isSubmitting?: boolean;
}

export function KnowledgeFormFooter({
  workspaceId,
  currentStep,
  totalSteps,
  onBack,
  onNext,
  isNextDisabled = false,
  isSubmitting = false,
}: KnowledgeFormFooterProps) {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="flex justify-between items-center pt-6 mt-8 border-t border-neutral-200">
      {/* Cancel on step 1, or Back on subsequent steps */}
      {isFirstStep ? (
        <Link
          href={`/w/${workspaceId}/knowledge`}
          className="px-4 py-2 text-sm font-semibold text-neutral-900 hover:text-neutral-700 bg-transparent transition-colors cursor-pointer active:scale-[0.99] inline-flex items-center justify-center rounded-xl"
        >
          Cancel
        </Link>
      ) : (
        <Button
          type="button"
          variant="ghost"
          surface="light"
          onClick={onBack}
          disabled={isSubmitting}
        >
          Back
        </Button>
      )}

      {/* Continue on steps 1-2, or Finish on last step */}
      <Button
        type="button"
        variant="primary"
        surface="light"
        onClick={onNext}
        disabled={isNextDisabled || isSubmitting}
        isLoading={isSubmitting}
      >
        {isLastStep
          ? isSubmitting
            ? "Adding Source..."
            : "Finish"
          : "Continue"}
      </Button>
    </div>
  );
}

export default KnowledgeFormFooter;
