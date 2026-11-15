"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { STEPS, agentFormSchema, type AgentFormData } from "./agent-form.schema";
import { StepperProgress } from "./stepper-progress";
import { StepperNavigation } from "./stepper-navigation";
import { BasicInfoStep } from "./steps/BasicInfoStep";
import { ActionsStep } from "./steps/ActionsStep";
import { KnowledgeStep } from "./steps/KnowledgeStep";
import { ReviewStep } from "./steps/ReviewStep";

export interface AgentStepperFormProps {
  workspaceId: string;
}

export function AgentStepperForm({ workspaceId }: AgentStepperFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<AgentFormData>({
    resolver: zodResolver(agentFormSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      name: "",
      instructions: "",
      actionIds: [],
      knowledgeIds: [],
    },
  });

  const handleNext = async () => {
    const currentStepConfig = STEPS.find((step) => step.id === currentStep);

    if (currentStepConfig?.fields && currentStepConfig.fields.length > 0) {
      const isValid = await methods.trigger(currentStepConfig.fields);
      if (!isValid) return;
    }

    if (currentStep < STEPS.length) {
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

  const onSubmit = async (data: AgentFormData) => {
    try {
      setIsSubmitting(true);
      // TODO: Submit agent payload to API endpoint
      console.log("Agent creation payload ready for submission:", data);
    } catch (error) {
      console.error("Failed to create agent:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep />;
      case 2:
        return <ActionsStep workspaceId={workspaceId} />;
      case 3:
        return <KnowledgeStep />;
      case 4:
        return <ReviewStep />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header with Breadcrumb & Step Info */}
      <div className="flex justify-between items-center mb-8 pb-5">
        <div className="flex items-center gap-3.5">
          <Link
            href={`/w/${workspaceId}/agents`}
            className="w-10 h-10 rounded-xl border border-slate-200/80 bg-white flex items-center justify-center text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-xs"
            title="Back to Agents"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={7} />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-secondary-50 tracking-tight">
              Create New Agent
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Step {currentStep} of {STEPS.length} —{" "}
              {STEPS[currentStep - 1]?.title}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar: Step Tracker */}
        <div className="lg:col-span-4">
          <StepperProgress
            steps={STEPS}
            currentStep={currentStep}
            onStepClick={handleStepClick}
          />
        </div>

        {/* Right Content Card Container */}
        <FormProvider {...methods}>
          <div className="lg:col-span-8 bg-neutral-50 border border-neutral-50 rounded-2xl p-6 sm:p-8 shadow-xs">
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              {/* Active Step Content */}
              {renderStepContent()}

              {/* Navigation Action Buttons */}
              <StepperNavigation
                currentStep={currentStep}
                totalSteps={STEPS.length}
                onBack={handleBack}
                onNext={handleNext}
                isSubmitting={isSubmitting}
              />
            </form>
          </div>
        </FormProvider>
      </div>
    </div>
  );
}

export default AgentStepperForm;
