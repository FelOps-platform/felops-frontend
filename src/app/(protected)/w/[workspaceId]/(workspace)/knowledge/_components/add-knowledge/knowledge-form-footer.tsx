"use client";

import Link from "next/link";

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
    <div className="flex justify-between items-center pt-6 mt-6 border-t border-neutral-200/80">
      {/* Cancel on step 1, or Back on subsequent steps */}
      {isFirstStep ? (
        <Link
          href={`/w/${workspaceId}/knowledge`}
          className="px-5 py-2.5 text-sm font-semibold rounded-xl border border-neutral-300 bg-white hover:bg-neutral-100 text-secondary-950 transition-all shadow-xs cursor-pointer active:scale-[0.99] inline-flex items-center justify-center"
        >
          Cancel
        </Link>
      ) : (
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="px-5 py-2.5 text-sm font-semibold rounded-xl border border-neutral-300  hover:bg-neutral-100 text-secondary-950 transition-all shadow-xs cursor-pointer active:scale-[0.99] inline-flex items-center justify-center disabled:opacity-50"
        >
          Back
        </button>
      )}

      {/* Continue on steps 1-2, or Finish on last step */}
      <button
        type="button"
        onClick={onNext}
        disabled={isNextDisabled || isSubmitting}
        className={`px-6 py-2.5 text-sm font-semibold rounded-xl transition-all shadow-sm ${
          isNextDisabled || isSubmitting
            ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
            : "bg-secondary-500 hover:bg-secondary-600 text-secondary-50 hover:shadow-md active:scale-[0.99] cursor-pointer"
        }`}
      >
        {isLastStep
          ? isSubmitting
            ? "Adding Source..."
            : "Finish"
          : "Continue"}
      </button>
    </div>
  );
}

export default KnowledgeFormFooter;
