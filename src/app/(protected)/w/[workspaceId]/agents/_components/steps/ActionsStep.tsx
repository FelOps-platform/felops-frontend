"use client";

import Link from "next/link";
import { Bot } from "lucide-react";

interface ActionsStepProps {
  workspaceId: string;
}

export function ActionsStep({ workspaceId }: ActionsStepProps) {
  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div>
        <h2 className="text-xl text-secondary-950 font-bold tracking-tight">
          Assign Workspace Actions
        </h2>
        <p className="text-sm text-secondary-400 mt-1">
          Choose which available Actions this Agent may request. Policies still apply at execution time.
        </p>
      </div>

      {/* Empty State Card */}
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border border-neutral-200  shadow-2xs">
        <div className="w-12 h-12 rounded-2xl bg-secondary-950 border border-neutral-800 flex items-center justify-center text-secondary-50 mb-4 shadow-xs">
          <Bot className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-secondary-950 tracking-tight">
          No Workspace Actions available
        </h3>
        <p className="text-sm text-neutral-700 mt-1.5 max-w-md leading-relaxed w-80">
          Connect and configure Actions at the Workspace level before assigning them to an Agent.
        </p>

        <Link
          href={`/w/${workspaceId}/integrations`}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-secondary-500 hover:bg-secondary-600 text-secondary-50 transition-all shadow-xs hover:shadow-sm active:scale-[0.99]"
        >
          <span>Open Integration & Actions</span>
        </Link>
      </div>
    </div>
  );
}

export default ActionsStep;
