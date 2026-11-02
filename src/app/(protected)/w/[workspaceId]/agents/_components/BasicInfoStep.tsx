"use client";

import { useFormContext } from "react-hook-form";

export function BasicInfoStep() {
    const {
        register,
        formState: { errors },
    } = useFormContext();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
                    Basic information
                </h2>
                <p className="text-sm text-neutral-500 mt-1">
                    Give the Agent a clear name and describe how it should work.
                </p>
            </div>

            <div className="space-y-5">
                {/* Agent Name Field */}
                <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-neutral-900">
                        Agent name <span className="text-secondary-500">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="e.g. Customer Support Assistant"
                        {...register("name", {
                            required: "Enter a name for this Agent.",
                            validate: (val) =>
                                val?.trim().length > 0 || "Enter a name for this Agent.",
                        })}
                        className={`w-full px-4 py-2.5 text-sm  text-neutral-900 border rounded-xl placeholder:text-neutral-400 transition-all ${errors.name
                            ? "border-wrong-500 bg-wrong-50/20 focus:border-wrong-500 focus:ring-2 focus:ring-wrong-500/20 focus:outline-none"
                            : "border-neutral-300 hover:border-neutral-400 focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/20 focus:outline-none"
                            }`}
                    />
                    {errors.name && (
                        <p className="text-xs font-medium text-wrong-500 mt-1">
                            {String(errors.name.message)}
                        </p>
                    )}
                </div>

                {/* Instructions Field */}
                <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-neutral-900">
                        Instructions <span className="text-secondary-500">*</span>
                    </label>
                    <textarea
                        rows={5}
                        placeholder="Describe the Agent’s responsibilities, expected behavior, constraints, and when it should ask for clarification."
                        {...register("instructions", {
                            required: "Enter instructions for this Agent.",
                            validate: (val) =>
                                val?.trim().length > 0 || "Instructions cannot be empty.",
                        })}
                        className={`w-full px-4 py-3 text-sm  text-neutral-900 border rounded-xl placeholder:text-neutral-400 resize-none leading-relaxed transition-all ${errors.instructions
                            ? "border-wrong-500 bg-wrong-50/20 focus:border-wrong-500 focus:ring-2 focus:ring-wrong-500/20 focus:outline-none"
                            : "border-neutral-300 hover:border-neutral-400 focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/20 focus:outline-none"
                            }`}
                    />
                    {errors.instructions && (
                        <p className="text-xs font-medium text-wrong-500 mt-1">
                            {String(errors.instructions.message)}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}



export default BasicInfoStep;
