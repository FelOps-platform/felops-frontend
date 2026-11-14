"use client";

import { useState } from "react";
import { Check, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useForm, FormProvider } from "react-hook-form";
import { BasicInfoStep } from "./BasicInfoStep";

const steps = [
  { id: 1, title: "Basic information", description: "Name and instructions" },
  { id: 2, title: "Assign Actions", description: "Choose Workspace Actions" },
  { id: 3, title: "Configure Knowledge", description: "Assign shared or private sources" },
  { id: 4, title: "Review & save", description: "Confirm configuration" },
];

interface AgentStepperFormProps {
  workspaceId: string;
}

export function AgentStepperForm({ workspaceId }: AgentStepperFormProps) {
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
          {/* Header with Breadcrumb & Status */}
          <div className="flex justify-between items-center mb-8 pb-5 ">
            <div className="flex items-center gap-3.5">
              <Link
                href={`/w/${workspaceId}/agents`}
                className="w-10 h-10 rounded-xl border border-slate-200/80 bg-white flex items-center justify-center text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-xs"
                title="Back to Agents"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-secondary-50 tracking-tight">
                    Create New Agent
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-neutral-900 border border-neutral-800 text-neutral-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary-500 animate-pulse" />
                    Draft
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Step {currentStep} of {steps.length} — {steps[currentStep - 1].title}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Sidebar Stepper */}
                <div className="lg:col-span-4 flex flex-col gap-2 relative">
                  {steps.map((step, idx) => {
                    const isCompleted = currentStep > step.id;
                    const isCurrent = currentStep === step.id;

                    return (
              <div
                key={step.id}
                onClick={() => {
                  if (step.id < currentStep) {
                    setCurrentStep(step.id);
                  }
                }}
                className={`relative flex items-center gap-3.5 p-3 rounded-2xl transition-all select-none ${
                  step.id < currentStep
                    ? "cursor-pointer hover:bg-white/5"
                    : "cursor-default"
                } ${
                  isCurrent
                    ? "bg-white/10 border border-secondary-500/30 shadow-xs"
                    : "border border-transparent"
                }`}
              >
                {/* Connecting Line between steps */}
                {idx < steps.length - 1 && (
                  <div
                    className={`absolute left-[29px] top-[48px] w-[2px] h-[calc(100%-24px)] transition-colors ${
                      currentStep > step.id ? "bg-emerald-500" : "bg-neutral-800"
                    }`}
                  />
                )}

                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs shrink-0 transition-all z-10 ${
                    isCompleted
                      ? "bg-emerald-500 text-white shadow-xs"
                      : isCurrent
                        ? "bg-secondary-500 text-white shadow-md shadow-secondary-500/25 ring-4 ring-secondary-500/20"
                        : "bg-neutral-900 border border-neutral-700 text-neutral-400"
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[2.5]" /> : step.id}
                </div>

                <div className="flex flex-col min-w-0">
                  <span
                    className={`text-sm font-semibold truncate transition-colors ${
                      isCurrent
                        ? "text-secondary-50 font-bold"
                        : isCompleted
                          ? "text-secondary-100"
                          : "text-neutral-400"
                    }`}
                  >
                    {step.title}
                  </span>
                  <span className="text-xs text-neutral-400 truncate mt-0.5">
                    {step.description}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <FormProvider {...methods}>
          {/* Right Content Card Container */}
          <div className="lg:col-span-8 bg-neutral-50 border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
              {/* Step 1: Basic Information */}
              {currentStep === 1 && <BasicInfoStep />}

              {/* Step 2: Assign Actions */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-secondary-950">
                      Assign Workspace Actions
                    </h2>
                    <p className="text-sm text-neutral-500 mt-1">
                      Choose which available Actions this Agent may request. Policies still apply at execution time.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Configure Knowledge */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-secondary-950">
                      Configure Knowledge
                    </h2>
                    <p className="text-sm text-neutral-500 mt-1">
                      Select existing Knowledge sources from your Workspace to make them available to this Agent.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 4: Review & Save */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-secondary-950">
                      Review & save
                    </h2>
                    <p className="text-sm text-neutral-500 mt-1">
                      Confirm configuration and publish your new agent.
                    </p>
                  </div>
                </div>
              )}

              {/* Bottom Actions Bar (Back / Continue) */}
              <div className="flex justify-between items-center pt-6 mt-8 border-t border-slate-200/80">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className={`px-5 py-2.5 text-sm font-medium rounded-xl border border-slate-200 transition-all shadow-xs ${
                    currentStep === 1
                      ? "opacity-40 cursor-not-allowed bg-slate-50 text-slate-400"
                      : "hover:bg-slate-50 text-slate-700 bg-white hover:border-slate-300 cursor-pointer"
                  }`}
                >
                  Back
                </button>

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2.5 text-sm font-semibold bg-secondary-500 text-white rounded-xl hover:bg-secondary-600 transition-all shadow-sm hover:shadow-md active:scale-[0.99] cursor-pointer"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-sm font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md active:scale-[0.99] cursor-pointer"
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