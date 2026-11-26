"use client";

import React from "react";
import {
  AlertCircle,
  AlertTriangle,
  Clock,
  RotateCw,
  Trash2,
  Bot,
  CheckCircle2,
} from "lucide-react";
import {
  type KnowledgeItem,
  type KnowledgeModalType,
  type AssignedAgent,
  formatKnowledgeErrorMessage,
} from "@/features/knowledge";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

export interface KnowledgeActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: "availability" | "remove";
  type?: KnowledgeModalType;
  item?: KnowledgeItem | null;
  assignedAgents?: Array<string | AssignedAgent>;
  onRemoveSource?: (id?: string) => void | Promise<void>;
  onRetryProcessing?: (id?: string) => void | Promise<void>;
  isRemoving?: boolean;
  isRetrying?: boolean;
}

export function KnowledgeActionModal({
  isOpen,
  onClose,
  mode,
  type,
  item,
  assignedAgents: propAssignedAgents,
  onRemoveSource,
  onRetryProcessing,
  isRemoving = false,
  isRetrying = false,
}: KnowledgeActionModalProps) {
  if (!isOpen) return null;

  const isRemove = mode === "remove" || type === "remove_confirm";
  const title = isRemove ? "Remove knowledge source?" : "Source Availability";

  const effectiveAgents: AssignedAgent[] =
    item?.assignedAgents && item.assignedAgents.length > 0
      ? item.assignedAgents
      : (propAssignedAgents || []).map((a, i) =>
        typeof a === "string" ? { id: `agent_${i}`, name: a } : a,
      );

  const status = item?.status
    ? item.status.toLowerCase()
    : type === "unavailable"
      ? "failed"
      : type === "processing"
        ? "processing"
        : "ready";

  const handleRemove = () => {
    onRemoveSource?.(item?.id);
  };

  const handleRetry = () => {
    onRetryProcessing?.(item?.id);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      surface="light"
      title={title}
      showCloseButton={!isRemoving && !isRetrying}
    >
      <div className="space-y-6">
        {/* Modal Body: Remove mode */}
        {isRemove && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-wrong-50 border border-wrong-200 text-wrong-950">
              <AlertTriangle className="w-5 h-5 text-wrong-600 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm leading-relaxed">
                <p className="font-semibold text-wrong-900">Are you sure?</p>
                <p className="mt-0.5 text-wrong-800">
                  Removing{" "}
                  <span className="font-semibold">
                    {item?.name || "this source"}
                  </span>{" "}
                  will delete it permanently from Workspace Shared Knowledge.
                  This action cannot be undone.
                </p>
              </div>
            </div>

            {effectiveAgents.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-neutral-100 border border-neutral-300">
                <p className="text-xs font-semibold text-neutral-900 mb-2 flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-secondary-600" />
                  <span>
                    {effectiveAgents.length} assigned Agent(s) will lose access:
                  </span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {effectiveAgents.map((agent) => (
                    <span
                      key={agent.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-neutral-200 text-neutral-900 border border-neutral-300"
                    >
                      {agent.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Body: Availability mode */}
        {!isRemove && (
          <div className="space-y-4">
            {status === "failed" && (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-wrong-50 border border-wrong-200 text-wrong-950">
                <AlertCircle className="w-5 h-5 text-wrong-600 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm leading-relaxed">
                  <p className="font-semibold text-wrong-900">
                    Source Unavailable
                  </p>
                  <p className="mt-0.5 text-wrong-800">
                    {formatKnowledgeErrorMessage(item?.errorMessage)}
                  </p>
                </div>
              </div>
            )}

            {status === "processing" && (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-secondary2-50 border border-secondary2-200 text-secondary2-950">
                <Clock className="w-5 h-5 text-secondary2-600 shrink-0 mt-0.5 animate-pulse" />
                <div className="text-xs sm:text-sm leading-relaxed">
                  <p className="font-semibold text-secondary2-900">
                    Processing in progress
                  </p>
                  <p className="mt-0.5 text-secondary2-800">
                    This source is currently being vectorized and indexed. It
                    cannot be assigned to Agents until processing completes.
                  </p>
                </div>
              </div>
            )}

            {status === "ready" && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-neutral-100 border border-neutral-300">
                  <p className="text-xs font-semibold text-neutral-900 mb-1.5 flex items-center gap-1.5">
                    <Bot className="w-4 h-4 text-secondary-600" />
                    <span>{effectiveAgents.length} Assigned Agents:</span>
                  </p>
                  {effectiveAgents.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {effectiveAgents.map((agent) => (
                        <span
                          key={agent.id}
                          className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs bg-neutral-200 text-neutral-900 border border-neutral-300"
                        >
                          {agent.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-500">
                      No agents currently assigned to this knowledge source.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer actions */}
        <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          {isRemove ? (
            <div className="flex items-center justify-end gap-3 w-full">
              <Button
                variant="outline"
                surface="light"
                onClick={onClose}
                disabled={isRemoving || isRetrying}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                surface="light"
                onClick={handleRemove}
                isLoading={isRemoving}
                disabled={isRemoving || isRetrying}
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                <span>Remove source</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 w-full">
              {status === "failed" ? (
                <Button
                  variant="outline"
                  surface="light"
                  onClick={handleRetry}
                  isLoading={isRetrying}
                  disabled={isRetrying || isRemoving}
                >
                  <RotateCw className="w-4 h-4 mr-1.5" />
                  <span>Retry processing</span>
                </Button>
              ) : (
                <div />
              )}
              <Button
                variant="danger"
                surface="light"
                onClick={handleRemove}
                disabled={isRemoving || isRetrying}
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                <span>Remove source</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default KnowledgeActionModal;
