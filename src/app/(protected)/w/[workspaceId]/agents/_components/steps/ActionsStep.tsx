"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useFormContext } from "react-hook-form";
import { Bot, Check, Search } from "lucide-react";
import type { AgentFormData } from "../agent-form.schema";
import {
  getWorkspaceActions,
  type WorkspaceAction,
} from "../../services/actions.service";

interface ActionsStepProps {
  workspaceId: string;
}

export function ActionsStep({ workspaceId }: ActionsStepProps) {
  const { watch, setValue } = useFormContext<AgentFormData>();
  const selectedActionIds = watch("actionIds") || [];

  const [actions, setActions] = useState<WorkspaceAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getWorkspaceActions(workspaceId).then((data) => {
      setActions(data);
      setIsLoading(false);
    });
  }, [workspaceId]);

  const filteredActions = actions.filter(
    (action) =>
      action.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      action.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleToggleAction = (actionId: string) => {
    const currentSet = new Set(selectedActionIds);
    if (currentSet.has(actionId)) {
      currentSet.delete(actionId);
    } else {
      currentSet.add(actionId);
    }
    setValue("actionIds", Array.from(currentSet), {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedActionIds.length === actions.length) {
      setValue("actionIds", [], { shouldValidate: true, shouldDirty: true });
    } else {
      setValue(
        "actionIds",
        actions.map((a) => a.id),
        { shouldValidate: true, shouldDirty: true },
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div>
        <h2 className="text-xl font-bold text-secondary-50 tracking-tight">
          Assign Workspace Actions
        </h2>
        <p className="text-sm text-neutral-400 mt-1">
          Choose which available Actions this Agent may request. Policies still
          apply at execution time.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-10 bg-secondary-900/60 rounded-xl w-full max-w-md" />
          <div className="h-20 bg-secondary-900/40 rounded-2xl w-full" />
          <div className="h-20 bg-secondary-900/40 rounded-2xl w-full" />
        </div>
      ) : actions.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 sm:p-14 text-center rounded-2xl border border-secondary-50/10 bg-secondary-950/40 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-secondary-900 border border-secondary-50/15 flex items-center justify-center text-secondary-50 mb-4 shadow-xs">
            <Bot className="w-7 h-7 text-secondary-400" />
          </div>

          <h3 className="text-base sm:text-lg font-bold text-secondary-50 tracking-tight">
            No Workspace Actions available
          </h3>
          <p className="text-sm text-neutral-400 mt-1.5 max-w-sm leading-relaxed w-80">
            Connect and configure Actions at the Workspace level before
            assigning them to an Agent.
          </p>

          <Link
            href={`/w/${workspaceId}/integrations`}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-secondary-500 hover:bg-secondary-600 text-secondary-50 transition-all shadow-xs hover:shadow-sm active:scale-[0.99]"
          >
            <span>Open Integration & Actions</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search actions by name or description..."
                className="w-full pl-10 pr-4 py-2 text-sm text-secondary-50 bg-secondary-950/60 border border-secondary-50/20 rounded-xl placeholder:text-neutral-500 focus:outline-none focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/20 transition-all"
              />
            </div>

            {/* Quick Stats & Select All Toggle */}
            <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-neutral-400">
              <span>
                <strong className="text-secondary-100 font-semibold">
                  {selectedActionIds.length}
                </strong>{" "}
                of {actions.length} selected
              </span>

              <button
                type="button"
                onClick={handleToggleSelectAll}
                className="font-medium text-secondary-400 hover:text-secondary-300 cursor-pointer transition-colors"
              >
                {selectedActionIds.length === actions.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>
          </div>

          {/* Action Cards (Scrollable) */}
          <div className="grid grid-cols-1 gap-3 max-h-[380px] sm:max-h-[320px] overflow-y-auto pr-1.5">
            {filteredActions.length === 0 ? (
              <div className="p-8 text-center border border-secondary-50/10 rounded-2xl text-neutral-400 text-sm">
                No actions match your search &quot;{searchQuery}&quot;.
              </div>
            ) : (
              filteredActions.map((action) => {
                const isSelected = selectedActionIds.includes(action.id);

                return (
                  <div
                    key={action.id}
                    onClick={() => handleToggleAction(action.id)}
                    className={`group relative flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer select-none ${
                      isSelected
                        ? "bg-secondary-500/10 border-secondary-500 shadow-xs ring-1 ring-secondary-500/30"
                        : "bg-secondary-950/40 border-secondary-50/10 hover:border-secondary-50/25 hover:bg-secondary-950/60"
                    }`}
                  >
                    <div className="pt-0.5 shrink-0">
                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-secondary-500 text-secondary-50 shadow-xs"
                            : "border border-secondary-50/30 bg-transparent group-hover:border-secondary-50/50"
                        }`}
                      >
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="text-sm font-semibold text-secondary-50 group-hover:text-white transition-colors tracking-tight">
                        {action.name}
                      </h4>
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        {action.description}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ActionsStep;
