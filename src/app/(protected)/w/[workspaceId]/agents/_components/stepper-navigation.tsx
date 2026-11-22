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
    <div className="flex justify-between items-center pt-6 mt-8 border-t border-secondary-50/10">
      {/* Back Button */}
      <button
        type="button"
        onClick={onBack}
        disabled={isFirstStep || isSubmitting}
        className={`px-5 py-2.5 text-sm font-semibold rounded-xl border transition-all shadow-xs ${
          isFirstStep || isSubmitting
            ? "opacity-40 cursor-not-allowed bg-secondary-950/40 text-neutral-600 border-secondary-50/5"
            : "hover:bg-secondary-900 text-secondary-200 bg-secondary-900/60 hover:text-secondary-50 border-secondary-50/20 hover:border-secondary-50/40 cursor-pointer active:scale-[0.99]"
        }`}
      >
        Back
      </button>

      {/* Next / Submit Button */}
      {!isLastStep ? (
        <button
          key="stepper-continue-btn"
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onNext();
          }}
          disabled={isSubmitting}
          className="px-6 py-2.5 text-sm font-semibold bg-secondary-500 text-secondary-50 rounded-xl hover:bg-secondary-600 transition-all shadow-sm hover:shadow-md active:scale-[0.99] cursor-pointer"
        >
          Continue
        </button>
      ) : (
        <button
          key="stepper-submit-btn"
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 text-sm font-semibold bg-right-600 text-secondary-950 rounded-xl hover:bg-right-500 transition-all shadow-sm hover:shadow-md active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-bold"
        >
          {isSubmitting ? "Publishing..." : "Publish Agent"}
        </button>
      )}
    </div>
  );
}

export default StepperNavigation;
