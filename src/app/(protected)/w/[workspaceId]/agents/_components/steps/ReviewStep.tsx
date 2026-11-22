"use client";

import { useFormContext } from "react-hook-form";
import { Bot, Zap, Database } from "lucide-react";
import type { AgentFormData } from "../agent-form.schema";

export function ReviewStep() {
  const { watch } = useFormContext<AgentFormData>();
  const values = watch();

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div>
        <h2 className="text-xl text-secondary-50 font-bold tracking-tight">
          Review & save
        </h2>
        <p className="text-sm text-neutral-400 mt-1">
          Confirm configuration and publish your new agent.
        </p>
      </div>

      {/* Review Details Card */}
      <div className="space-y-4">
        {/* Basic Info Summary */}
        <div className="p-5 rounded-2xl border border-secondary-50/10 bg-secondary-950/40 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-secondary-50/10">
            <Bot className="w-5 h-5 text-secondary-500" />
            <h3 className="text-sm font-bold text-secondary-50">
              Basic Information
            </h3>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs font-semibold text-neutral-400 block uppercase tracking-wider">
                Agent Name
              </span>
              <p className="text-secondary-100 font-medium mt-0.5">
                {values.name || "—"}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-neutral-400 block uppercase tracking-wider">
                Instructions
              </span>
              <p className="text-secondary-200 whitespace-pre-wrap leading-relaxed mt-0.5 text-xs sm:text-sm bg-secondary-950/80 p-3 rounded-xl border border-secondary-50/10 max-h-40 overflow-y-auto">
                {values.instructions || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Workspace Actions Summary */}
        <div className="p-5 rounded-2xl border border-secondary-50/10 bg-secondary-950/40 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Zap className="w-5 h-5 text-secondary-500" />
              <div>
                <h3 className="text-sm font-bold text-secondary-50">
                  Workspace Actions
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {values.actionIds?.length || 0} Actions selected
                </p>
              </div>
            </div>
          </div>

          {values.actionIds && values.actionIds.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-secondary-50/10 max-h-36 overflow-y-auto pr-1">
              {values.actionIds.map((id) => (
                <span
                  key={id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-secondary-900/80 text-secondary-100 border border-secondary-50/15 capitalize"
                >
                  <Zap className="w-3 h-3 text-secondary-500" />
                  {id.replace("act_", "").replace(/_/g, " ")}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Knowledge Sources Summary */}
        <div className="p-5 rounded-2xl border border-secondary-50/10 bg-secondary-950/40 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Database className="w-5 h-5 text-secondary-500" />
              <div>
                <h3 className="text-sm font-bold text-secondary-50">
                  Knowledge Sources
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {values.knowledgeIds?.length || 0} Sources connected
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReviewStep;
