"use client";

interface StepperNavigationProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  isSubmitting?: boolean;
}

export function StepperNavigation({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  isSubmitting = false,
}: StepperNavigationProps) {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="flex justify-between items-center pt-6 mt-8 border-t border-slate-200/80">
      {/* Back Button */}
      <button
        type="button"
        onClick={onBack}
        disabled={isFirstStep || isSubmitting}
        className={`px-5 py-2.5 text-sm font-medium rounded-xl border border-slate-200 transition-all shadow-xs ${
          isFirstStep || isSubmitting
            ? "opacity-40 cursor-not-allowed bg-slate-50 text-slate-400"
            : "hover:bg-slate-50 text-slate-700 bg-white hover:border-slate-300 cursor-pointer active:scale-[0.99]"
        }`}
      >
        Back
      </button>

      {/* Next / Submit Button */}
      {!isLastStep ? (
        <button
          type="button"
          onClick={onNext}
          disabled={isSubmitting}
          className="px-6 py-2.5 text-sm font-semibold bg-secondary-500 text-white rounded-xl hover:bg-secondary-600 transition-all shadow-sm hover:shadow-md active:scale-[0.99] cursor-pointer"
        >
          Continue
        </button>
      ) : (
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 text-sm font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Publishing..." : "Publish Agent"}
        </button>
      )}
    </div>
  );
}

export default StepperNavigation;
