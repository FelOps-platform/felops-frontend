"use client";

import { useFormContext } from "react-hook-form";
import type { AgentFormData } from "../agent-form.schema";

export function BasicInfoStep() {
  const {
    register,
    formState: { errors },
    clearErrors,
  } = useFormContext<AgentFormData>();

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div>
        <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
          Basic information
        </h2>
        <p className="text-sm text-secondary-500 mt-1">
          Give the Agent a clear name and describe how it should work.
        </p>
      </div>

      <div className="space-y-5">
        {/* Agent Name Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="agent-name"
            className="block text-xs font-semibold text-neutral-900"
          >
            Agent name <span className="text-secondary-500">*</span>
          </label>
          <input
            id="agent-name"
            type="text"
            placeholder="e.g. Customer Support Assistant"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "agent-name-error" : undefined}
            {...register("name", {
              onChange: () => {
                if (errors.name) clearErrors("name");
              },
            })}
            className={`w-full px-4 py-2.5 text-sm rounded-xl transition-all placeholder:text-neutral-400 bg-neutral-50 border text-neutral-900 focus:outline-none focus:ring-2 ${
              errors.name
                ? "border-wrong-500 bg-wrong-500/5 focus:border-wrong-500 focus:ring-wrong-500/20"
                : "border-neutral-300 hover:border-neutral-400 focus:border-secondary-500 focus:ring-secondary-500/20"
            }`}
          />
          {errors.name ? (
            <p
              id="agent-name-error"
              className="text-xs font-medium text-wrong-500 mt-1"
            >
              {String(errors.name.message)}
            </p>
          ) : (
            <p className="text-xs text-secondary-500 mt-1">
              Use a name that reflects the Agent&apos;s primary role or responsibility.
            </p>
          )}
        </div>

        {/* Instructions Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="agent-instructions"
            className="block text-xs font-semibold text-neutral-900"
          >
            Instructions <span className="text-secondary-500">*</span>
          </label>
          <textarea
            id="agent-instructions"
            rows={5}
            placeholder="Describe the Agent’s responsibilities, expected behavior, constraints, and when it should ask for clarification."
            aria-invalid={Boolean(errors.instructions)}
            aria-describedby={
              errors.instructions ? "agent-instructions-error" : undefined
            }
            {...register("instructions", {
              onChange: () => {
                if (errors.instructions) clearErrors("instructions");
              },
            })}
            className={`w-full px-4 py-3 text-sm rounded-xl transition-all placeholder:text-neutral-400 bg-neutral-50 border text-neutral-900 resize-none leading-relaxed focus:outline-none focus:ring-2 ${
              errors.instructions
                ? "border-wrong-500 bg-wrong-500/5 focus:border-wrong-500 focus:ring-wrong-500/20"
                : "border-neutral-300 hover:border-neutral-400 focus:border-secondary-500 focus:ring-secondary-500/20"
            }`}
          />
          {errors.instructions && (
            <p
              id="agent-instructions-error"
              className="text-xs font-medium text-wrong-500 mt-1"
            >
              {String(errors.instructions.message)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default BasicInfoStep;
