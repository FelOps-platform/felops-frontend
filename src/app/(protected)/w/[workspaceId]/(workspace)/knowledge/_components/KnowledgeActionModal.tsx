"use client";

import React, { useEffect, useCallback } from "react";
import {
  X,
  AlertTriangle,
  Clock,
  BotMessageSquare,
  RotateCw,
  Trash2,
} from "lucide-react";

export type KnowledgeModalType =
  | "unavailable"
  | "processing"
  | "available"
  | "remove_confirm";

export interface KnowledgeActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: KnowledgeModalType;
  assignedAgents?: string[];
  onRemoveSource?: () => void;
  onRetryProcessing?: () => void;
  isRemoving?: boolean;
  isRetrying?: boolean;
}

export function KnowledgeActionModal({
  isOpen,
  onClose,
  type,
  assignedAgents = [],
  onRemoveSource,
  onRetryProcessing,
  isRemoving = false,
  isRetrying = false,
}: KnowledgeActionModalProps) {
  // Handle ESC key press to close modal
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isRemoving && !isRetrying) {
        onClose();
      }
    },
    [isOpen, isRemoving, isRetrying, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const isRemoveConfirm = type === "remove_confirm";
  const title = isRemoveConfirm
    ? "Remove knowledge source?"
    : "Source Availability";

  // Reusable Remove Button to avoid repeating across states
  const renderRemoveButton = () => (
    <button
      type="button"
      onClick={onRemoveSource}
      disabled={isRemoving || isRetrying}
      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-wrong-600 hover:bg-wrong-700 text-white font-semibold text-xs sm:text-sm transition-all shadow-xs cursor-pointer disabled:opacity-50 active:scale-[0.99]"
    >
      <Trash2 className="w-4 h-4" />
      <span>{isRemoving ? "Removing..." : "Remove source"}</span>
    </button>
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      className="fixed inset-0 z-50 flex items-center justify-center bg-secondary-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isRemoving && !isRetrying) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-lg bg-neutral-50 border border-neutral-300 rounded-3xl p-6 sm:p-7 shadow-2xl relative text-secondary-950 animate-in zoom-in-95 duration-150">
        {/* Close 'X' Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isRemoving || isRetrying}
          aria-label="Close modal"
          className="absolute top-5 right-5 text-neutral-400 hover:text-secondary-950 p-1.5 rounded-xl hover:bg-neutral-200/60 transition-colors disabled:opacity-50 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-5 pr-8">
          <h2
            id="modal-title"
            className="text-lg sm:text-xl font-bold tracking-tight text-secondary-950"
          >
            {title}
          </h2>
        </div>

        {/* Modal Body: 4 Distinct States */}
        <div id="modal-description" className="mb-6">
          {type === "unavailable" && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-wrong-50 border border-wrong-200 text-wrong-950">
              <AlertTriangle className="w-5 h-5 text-wrong-700 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm leading-relaxed">
                <p className="font-semibold text-wrong-900">This source is unavailable</p>
                <p className="mt-0.5 text-wrong-400">
                  This source is unavailable. Retry processing before assigning
                  this source to Agents.
                </p>
              </div>
            </div>
          )}

          {type === "processing" && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-secondary2-50 border border-secondary2-200 text-secondary2-950">
              <Clock className="w-5 h-5 text-secondary2-600 shrink-0 mt-0.5 animate-pulse" />
              <div className="text-xs sm:text-sm leading-relaxed">
                <p className="font-semibold text-secondary2-700">
                  Processing in progress
                </p>
                <p className="mt-0.5 text-secondary2-300">
                  This source is still processing. It cannot be used by Agents
                  until processing is complete.
                </p>
              </div>
            </div>
          )}

          {type === "available" && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-secondary-50/70 border border-secondary-200 text-secondary-950">
              <BotMessageSquare className="w-5 h-5 text-secondary-700 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm leading-relaxed">
                <p className="font-semibold text-secondary-950">
                  {assignedAgents.length} Assigned Agents
                </p>
                <p className="mt-0.5 text-neutral-700">
                  {assignedAgents.length > 0 ? assignedAgents.join(", ") : "No agents assigned"}
                </p>
              </div>
            </div>
          )}

          {type === "remove_confirm" && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-wrong-50 border border-wrong-200 text-wrong-950">
              <AlertTriangle className="w-5 h-5 text-wrong-700 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm leading-relaxed">
                <p className="font-semibold text-wrong-700">Are you sure?</p>
                <p className="mt-0.5 text-wrong-300">
                  This action cannot be undone. Removing this source deletes it
                  from Workspace Shared Knowledge.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Buttons Footer */}
        <div className="pt-2">
          {type === "unavailable" && (
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={onRetryProcessing}
                disabled={isRetrying || isRemoving}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-100 text-secondary-950 font-semibold text-xs sm:text-sm transition-all shadow-xs cursor-pointer disabled:opacity-50 active:scale-[0.99]"
              >
                <RotateCw className={`w-4 h-4 text-secondary-700 ${isRetrying ? "animate-spin" : ""}`} />
                <span>{isRetrying ? "Retrying..." : "Retry processing"}</span>
              </button>
              {renderRemoveButton()}
            </div>
          )}

          {type === "remove_confirm" && (
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isRemoving || isRetrying}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-100 text-secondary-950 font-semibold text-xs sm:text-sm transition-all shadow-xs cursor-pointer disabled:opacity-50 active:scale-[0.99]"
              >
                Cancel
              </button>
              {renderRemoveButton()}
            </div>
          )}

          {(type === "processing" || type === "available") && (
            <div className="flex justify-end">
              {renderRemoveButton()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default KnowledgeActionModal;
