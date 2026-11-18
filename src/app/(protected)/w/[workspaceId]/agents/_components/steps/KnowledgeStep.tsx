"use client";

import { Database, Plus } from "lucide-react";

export function KnowledgeStep() {
  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div>
        <h2 className="text-xl text-secondary-950 font-bold tracking-tight">
          Configure Knowledge
        </h2>
        <p className="text-sm text-secondary-400 mt-1">
          Select existing Knowledge sources from your Workspace to make them
          available to this Agent.
        </p>
      </div>

      {/* Empty / Initial State Card */}
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-neutral-300 bg-white shadow-2xs">
        <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-secondary-400 mb-4 shadow-xs">
          <Database className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-neutral-900 tracking-tight">
          No Knowledge sources attached
        </h3>
        <p className="text-sm text-neutral-500 mt-1.5 max-w-md leading-relaxed">
          Knowledge sources provide contextual information, documentation, and
          reference material for the Agent.
        </p>

        <button
          type="button"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 text-secondary-500" />
          <span>Add Knowledge Source</span>
        </button>
      </div>
    </div>
  );
}

export default KnowledgeStep;
