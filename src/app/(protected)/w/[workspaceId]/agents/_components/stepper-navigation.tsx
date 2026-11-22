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
    <div className="flex justify-between items-center pt-6 mt-8 border-t border-neutral-200">
      {/* Back Button: Clean borderless dark text button */}
      <button
        type="button"
        onClick={onBack}
        disabled={isFirstStep || isSubmitting}
        className="px-4 py-2 text-sm font-semibold text-neutral-900 hover:text-neutral-700 bg-transparent transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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
          className="px-6 py-2.5 text-sm font-semibold bg-secondary-500 hover:bg-secondary-600 text-secondary-50 rounded-lg transition-all shadow-sm hover:shadow-md active:scale-[0.99] cursor-pointer"
        >
          Continue
        </button>
      ) : (
        <button
          key="stepper-submit-btn"
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 text-sm font-semibold bg-right-600 text-secondary-950 rounded-lg hover:bg-right-500 transition-all shadow-sm hover:shadow-md active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-bold"
        >
          {isSubmitting ? "Publishing..." : "Publish Agent"}
        </button>
      )}
    </div>
  );
}

export default StepperNavigation;
