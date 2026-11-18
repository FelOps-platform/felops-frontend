"use client";

import Link from "next/link";

interface KnowledgeWizardFooterProps {
  workspaceId: string;
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
}

export function KnowledgeWizardFooter({
  workspaceId,
  currentStep,
  totalSteps,
  onBack,
  onNext,
}: KnowledgeWizardFooterProps) {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="flex justify-between items-center pt-6 mt-8 border-t border-slate-200/80">
      {isFirstStep ? (
        <Link
          href={`/w/${workspaceId}/knowledge`}
          className="px-5 py-2.5 text-sm font-medium rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs cursor-pointer text-center active:scale-[0.99]"
        >
          Cancel
        </Link>
      ) : (
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 text-sm font-medium rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs cursor-pointer active:scale-[0.99]"
        >
          Back
        </button>
      )}

      <button
        type="button"
        onClick={onNext}
        className="px-6 py-2.5 text-sm font-semibold bg-secondary-500 hover:bg-secondary-600 text-secondary-50 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-[0.99] cursor-pointer"
      >
        {isLastStep ? "Finish" : "Continue"}
      </button>
    </div>
  );
}

export default KnowledgeWizardFooter;
