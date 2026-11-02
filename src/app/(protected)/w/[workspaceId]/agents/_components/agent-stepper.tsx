"use client";

import { useState } from "react";
import { Check, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { BasicInfoStep } from "./BasicInfoStep";

const steps = [
  { id: 1, title: "Basic information", description: "Name and instructions" },
  { id: 2, title: "Assign Actions", description: "Choose Workspace Actions" },
  { id: 3, title: "Configure Knowledge", description: "Assign shared or private sources" },
  { id: 4, title: "Review & save", description: "Confirm configuration" },
];

interface AgentStepperFormProps {
  workspaceId?: string;
}

export function AgentStepperForm({ workspaceId }: AgentStepperFormProps) {
  const params = useParams();
  const activeWorkspaceId = workspaceId || (params?.workspaceId as string) || "";
  const [currentStep, setCurrentStep] = useState(1);

  const methods = useForm({
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      instructions: "",
    },
  });

  const handleNext = async () => {
    let isValid = false;

    if (currentStep === 1) {
      isValid = await methods.trigger(["name", "instructions"]);
    } else {
      isValid = true;
    }

    if (isValid && currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    }
  };
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      // TODO: Send agent data to backend 
      console.log("Form data ready for submission:", data);
    } catch (error) {
    }
  };
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
          <Link
            href={`/w/${activeWorkspaceId}/agents`}
            className="w-10 h-10 rounded-xl border border-slate-200 bg-secondary-50 flex items-center justify-center text-secondary-950 hover:bg-slate-50 transition-colors shadow-sm"
            title="Back to Agents"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={5} />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Sidebar Stepper */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          {steps.map((step) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <div
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm shrink-0 transition-all ${isCompleted
                    ? "bg-emerald-500 text-secondary-50"
                    : isCurrent
                      ? "bg-secondary-600 text-secondary-50"
                      : "text-secondary-50 border border-secondary-50"
                    }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : step.id}
                </div>

                <div className="flex flex-col">
                  <span className={`text-sm font-semibold text-secondary-50`}>
                    {step.title}
                  </span>
                  <span className={`text-xs text-secondary-200`}>
                    {step.description}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <FormProvider {...methods}>

          {/* Card */}
            <div className="lg:col-span-8 bg-neutral-50 border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
              <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">

                {/* Step 1: Basic Information */}
                {currentStep === 1 && <BasicInfoStep />}

                {/* Step 2: Assign Actions */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold text-secondary-950">Assign Workspace Actions</h2>
                      <p className="text-sm text-secondary-200 mt-1">Choose which available Actions this Agent may request. Policies still apply at execution time.</p>
                    </div>
                  </div>
                )}

                {/* Step 3: Configure Knowledge */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold text-secondary-950">Configure Knowledge</h2>
                      <p className="text-sm text-secondary-200 mt-1">Select existing Knowledge sources from your Workspace to make them available to this Agent.</p>
                    </div>
                  </div>
                )}

                {/* Step 4: Review & Save */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold text-secondary-950">Review & save</h2>
                      <p className="text-sm text-secondary-200 mt-1">Confirm configuration and publish your new agent.</p>
                    </div>
                  </div>
                )}

                {/*  (Back / Continue) */}
                <div className="flex justify-between items-center pt-6 mt-8 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    className={`px-5 py-2 text-sm font-medium rounded-xl border border-slate-200 transition-colors ${currentStep === 1
                      ? "opacity-40 cursor-not-allowed bg-slate-50 text-slate-400"
                      : "hover:bg-slate-50 text-slate-700 bg-white"
                      }`}
                  >
                    Back
                  </button>

                  {currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-6 py-2.5 text-sm font-medium bg-secondary-500 text-white rounded-xl hover:bg-secondary-600 transition-colors"
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="px-6 py-2.5 text-sm font-medium bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
                    >
                      Publish Agent
                    </button>
                  )}
                </div>

              </form>
            </div>

        </FormProvider>


      </div>
    </div>
  );
}