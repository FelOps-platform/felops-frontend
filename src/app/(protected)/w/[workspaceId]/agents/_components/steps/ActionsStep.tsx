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

  // ---------------------------------------------------------------------------
  // Load Actions from Service
  // ---------------------------------------------------------------------------
  useEffect(() => {
    getWorkspaceActions(workspaceId).then((data) => {
      setActions(data);
      setIsLoading(false);
    });
  }, [workspaceId]);

  const filteredActions = actions.filter(
    (action) =>
      action.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      action.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ---------------------------------------------------------------------------
  // Handlers for Multi-Selection
  // ---------------------------------------------------------------------------
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
        { shouldValidate: true, shouldDirty: true }
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div>
        <h2 className="text-xl text-secondary-950  tracking-tight">
          Assign Workspace Actions
        </h2>
        <p className="text-sm text-secondary-400 mt-1">
          Choose which available Actions this Agent may request. Policies still apply at execution time.
        </p>
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* LOADING STATE                                                */}
      {/* ---------------------------------------------------------------------- */}
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-10 bg-neutral-200/70 rounded-xl w-full max-w-md" />
          <div className="h-20 bg-neutral-200/60 rounded-2xl w-full" />
          <div className="h-20 bg-neutral-200/60 rounded-2xl w-full" />
          <div className="h-20 bg-neutral-200/60 rounded-2xl w-full" />
        </div>
      ) : actions.length === 0 ? (
        /* ---------------------------------------------------------------------- */
        /* STATE 1: EMPTY STATE                                                   */
        /* ---------------------------------------------------------------------- */
        <div className="flex flex-col items-center justify-center p-8 sm:p-14 text-center rounded-2xl border border-neutral-200 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-secondary-950 border border-neutral-800 flex items-center justify-center text-secondary-50 mb-4 shadow-xs">
            <Bot className="w-7 h-7" />
          </div>

          <h3 className="text-base sm:text-lg font-bold text-secondary-950 tracking-tight">
            No Workspace Actions available
          </h3>
          <p className="text-sm text-neutral-600 mt-1.5 max-w-sm leading-relaxed w-80">
            Connect and configure Actions at the Workspace level before assigning them to an Agent.
          </p>

          <Link
            href={`/w/${workspaceId}/integrations`}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-secondary-500 hover:bg-secondary-600 text-white transition-all shadow-xs hover:shadow-sm active:scale-[0.99]"
          >
            <span>Open Integration & Actions</span>
          </Link>
        </div>
      ) : (
        /* ---------------------------------------------------------------------- */
        /* STATE 2: WITH DATA                                                     */
        /* ---------------------------------------------------------------------- */
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
                className="w-full pl-10 pr-4 py-2 text-sm text-secondary-950 border border-neutral-300 rounded-xl placeholder:text-neutral-400 focus:outline-none focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/20 transition-all"
              />
            </div>

            {/* Quick Stats & Select All Toggle */}
            <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-neutral-500">
              <span>
                <strong className="text-secondary-950 font-semibold">
                  {selectedActionIds.length}
                </strong>{" "}
                of {actions.length} selected
              </span>

              <button
                type="button"
                onClick={handleToggleSelectAll}
                className="font-medium text-secondary-600 hover:text-secondary-700 cursor-pointer transition-colors"
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
              <div className="p-8 text-center  border border-neutral-200 rounded-2xl text-neutral-500 text-sm">
                No actions match your search &quot;{searchQuery}&quot;.
              </div>
            ) : (
              filteredActions.map((action) => {
                const isSelected = selectedActionIds.includes(action.id);

                return (
                  <div
                    key={action.id}
                    onClick={() => handleToggleAction(action.id)}
                    className={`group relative flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer select-none ${isSelected
                      ? "bg-secondary-50/20 border-secondary-500 shadow-xs ring-1 ring-secondary-500/30"
                      : "border-neutral-200/90 hover:border-neutral-300 hover:shadow-2xs"
                      }`}
                  >
                    {/*Checkbox */}
                    <div className="pt-0.5 shrink-0">
                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${isSelected
                          ? "bg-secondary-500 text-white shadow-xs"
                          : "border border-neutral-300 group-hover:border-neutral-400"
                          }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>

                    {/* Action Name & Description */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="text-sm  text-secondary-950 tracking-tight">
                        {action.name}
                      </h4>
                      <p className="text-xs text-secondary-200 leading-relaxed">
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
