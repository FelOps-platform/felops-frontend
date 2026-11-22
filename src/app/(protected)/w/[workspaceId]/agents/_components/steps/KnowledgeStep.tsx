"use client";

import { Database, Plus } from "lucide-react";

export function KnowledgeStep() {
  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div>
        <h2 className="text-xl text-secondary-50 font-bold tracking-tight">
          Configure Knowledge
        </h2>
        <p className="text-sm text-neutral-400 mt-1">
          Select existing Knowledge sources from your Workspace to make them
          available to this Agent.
        </p>
      </div>

      {/* Empty / Initial State Card */}
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-secondary-50/20 bg-secondary-950/40 shadow-2xs">
        <div className="w-12 h-12 rounded-2xl bg-secondary-900 border border-secondary-50/15 flex items-center justify-center text-secondary-400 mb-4 shadow-xs">
          <Database className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-secondary-50 tracking-tight">
          No Knowledge sources attached
        </h3>
        <p className="text-sm text-neutral-400 mt-1.5 max-w-md leading-relaxed">
          Knowledge sources provide contextual information, documentation, and
          reference material for the Agent.
        </p>

        <button
          type="button"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl border border-secondary-50/20 bg-secondary-900/60 hover:bg-secondary-900 text-secondary-50 transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 text-secondary-500" />
          <span>Add Knowledge Source</span>
        </button>
      </div>
    </div>
  );
}

export default KnowledgeStep;
