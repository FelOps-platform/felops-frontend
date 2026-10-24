"use client";

import { useState } from "react";
import {
  Check,
  ChevronRight,
  FileText,
  Cpu,
  ShieldCheck,
  Sliders,
  Eye,
} from "lucide-react";

const steps = [
  { id: 1, title: "Name & Instructions", description: "Basic information" },
  { id: 2, title: "Knowledge", description: "Connect data sources" },
  { id: 3, title: "Actions", description: "Setup tools & APIs" },
  { id: 4, title: "Channels", description: "Deploy endpoints" },
  { id: 5, title: "Preview & Review", description: "Final checks" },
];

export function AgentStepperForm() {
  const [currentStep, setCurrentStep] = useState(1);

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create agent</h1>
          <p className="text-sm text-slate-500">
            Step {currentStep} of {steps.length} —{" "}
            {steps[currentStep - 1].title}.
          </p>
        </div>
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Save draft
        </button>
      </div>

      <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6 overflow-x-auto">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <div
              key={step.id}
              className="flex items-center gap-3 flex-1 min-w-[180px]"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                  isCompleted
                    ? "bg-slate-900 text-white"
                    : isCurrent
                      ? "bg-orange-600 text-white shadow-md shadow-orange-600/20"
                      : "bg-slate-100 text-slate-400"
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : step.id}
              </div>

              <div className="flex flex-col">
                <span
                  className={`text-sm font-medium ${isCurrent ? "text-slate-900" : "text-slate-500"}`}
                >
                  {step.title}
                </span>
                <span className="text-xs text-slate-400">
                  {step.description}
                </span>
              </div>

              {index < steps.length - 1 && (
                <ChevronRight className="w-4 h-4 text-slate-300 mx-auto hidden md:block" />
              )}
            </div>
          );
        })}
      </div>

      <div className="min-h-[300px] mb-8">
        {currentStep === 1 && (
          <div>
            <h3>1. Name & Instructions</h3>
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <h3>2. Knowledge & Data Sources</h3>
          </div>
        )}

        {currentStep === 3 && (
          <div>
            <h3> 3. Actions & Tools</h3>
          </div>
        )}

        {currentStep === 4 && (
          <div>
            <h3> 4. Channels</h3>
          </div>
        )}

        {currentStep === 5 && (
          <div>
            <h3> 5. Preview & Review</h3>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={handleBack}
          disabled={currentStep === 1}
          className={`px-5 py-2 text-sm font-medium rounded-lg border border-slate-200 transition-colors ${
            currentStep === 1
              ? "opacity-50 cursor-not-allowed bg-slate-50"
              : "hover:bg-slate-50"
          }`}
        >
          Back
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="px-6 py-2 text-sm font-medium bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors shadow-sm"
        >
          {currentStep === steps.length ? "Publish Agent" : "Continue"}
        </button>
      </div>
    </div>
  );
}
