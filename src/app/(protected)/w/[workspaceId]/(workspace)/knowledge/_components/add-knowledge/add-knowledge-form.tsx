"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { KnowledgeStepper } from "./knowledge-stepper";
import { KnowledgeWizardFooter } from "./knowledge-wizard-footer";

export interface AddKnowledgeWizardProps {
  workspaceId: string;
}

export function AddKnowledgeWizard({ workspaceId }: AddKnowledgeWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleStepClick = (stepId: number) => {
    if (stepId < currentStep) {
      setCurrentStep(stepId);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex items-center gap-3.5 mb-8 pb-5">
        <Link
          href={`/w/${workspaceId}/knowledge`}
          className="w-10 h-10 rounded-xl border border-slate-200/80 bg-white flex items-center justify-center text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-xs shrink-0 cursor-pointer"
          title="Back to Knowledge"
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={3} />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-secondary-50 tracking-tight">
            Add Knowledge Source
          </h1>
          <p className="text-xs text-secondary-100 mt-0.5">
            Add a source to your Workspace. It can be assigned to eligible Agents after processing.          </p>
        </div>
      </div>

      <KnowledgeStepper
        currentStep={currentStep}
        totalSteps={totalSteps}
        onStepClick={handleStepClick}
      />

      <div className="bg-neutral-50 border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="min-h-[260px] flex items-center justify-center border-2 border-dashed border-neutral-200 rounded-xl p-8 text-center">
          {currentStep === 1 && (
            <div className="text-neutral-400 text-sm">
              <span className="font-semibold text-secondary-950 block mb-1">
                Step 1 Placeholder
              </span>
              Content for Step 1 will be added here.
            </div>
          )}
          {currentStep === 2 && (
            <div className="text-neutral-400 text-sm">
              <span className="font-semibold text-secondary-950 block mb-1">
                Step 2 Placeholder
              </span>
              Content for Step 2 will be added here.
            </div>
          )}
          {currentStep === 3 && (
            <div className="text-neutral-400 text-sm">
              <span className="font-semibold text-secondary-950 block mb-1">
                Step 3 Placeholder
              </span>
              Content for Step 3 will be added here.
            </div>
          )}
        </div>

        <KnowledgeWizardFooter
          workspaceId={workspaceId}
          currentStep={currentStep}
          totalSteps={totalSteps}
          onBack={handleBack}
          onNext={handleNext}
        />
      </div>
    </div>
  );
}

export default AddKnowledgeWizard;
