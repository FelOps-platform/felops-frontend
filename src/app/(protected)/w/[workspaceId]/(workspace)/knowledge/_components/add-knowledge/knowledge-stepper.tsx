"use client";

import { StepperProgress } from "@/components/common/stepper-progress";

export interface KnowledgeStepperProps {
  currentStep: number;
  totalSteps?: number;
  onStepClick: (stepId: number) => void;
}

export function KnowledgeStepper({
  currentStep,
  totalSteps = 3,
  onStepClick,
}: KnowledgeStepperProps) {
  return (
    <StepperProgress
      steps={totalSteps}
      currentStep={currentStep}
      onStepClick={onStepClick}
      orientation="horizontal"
      ariaLabel="Add Knowledge Progress"
    />
  );
}

export default KnowledgeStepper;
