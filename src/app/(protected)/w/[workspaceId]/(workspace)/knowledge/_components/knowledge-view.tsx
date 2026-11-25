"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  RotateCw,
  AlertCircle,
  Database,
  CheckCircle2,
  X,
} from "lucide-react";
import {
  getWorkspaceKnowledge,
  deleteWorkspaceKnowledge,
  retryKnowledgeProcessing,
  type KnowledgeItem,
} from "@/features/knowledge";
import { Button } from "@/components/ui/button";
import { KnowledgeTable } from "./knowledge-table";
import { KnowledgeActionModal } from "./KnowledgeActionModal";
import { useKnowledgeModal } from "../hooks/use-knowledge-modal";
import { useKnowledgePolling } from "../hooks/use-knowledge-polling";

interface KnowledgeViewProps {
  workspaceId: string;
}

interface ToastNotification {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

export function KnowledgeView({ workspaceId }: KnowledgeViewProps) {
  const router = useRouter();

  // Data & View States (All 4 States: Loading, Empty, Error, Success)
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Modal & Mutation in-flight states
  const { modalState, openAvailabilityModal, openRemoveModal, closeModal } =
    useKnowledgeModal();

  const [isRemoving, setIsRemoving] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  // Toast feedback state
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = useCallback(
    (type: ToastNotification["type"], message: string) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      setToasts((prev) => [...prev, { id, type, message }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    [],
  );

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch knowledge data
  const loadData = useCallback(
    async (showLoadingSpinner = true) => {
      try {
        if (showLoadingSpinner) {
          setIsLoading(true);
          setIsError(false);
        }
        const data = await getWorkspaceKnowledge(workspaceId);
        setItems(data);
        setIsError(false);
      } catch (err) {
        setIsError(true);
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "Failed to load knowledge sources. Please try again.",
        );
      } finally {
        if (showLoadingSpinner) {
          setIsLoading(false);
        }
      }
    },
    [workspaceId],
  );

  useEffect(() => {
    let ignore = false;
    getWorkspaceKnowledge(workspaceId)
      .then((data) => {
        if (!ignore) {
          setItems(data);
          setIsError(false);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setIsError(true);
          setErrorMessage(
            err instanceof Error
              ? err.message
              : "Failed to load knowledge sources. Please try again.",
          );
          setIsLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, [workspaceId]);

  // Background polling for items in "Processing" state (pauses when document is hidden)
  useKnowledgePolling({
    items,
    onPoll: () => loadData(false),
    intervalMs: 4000,
  });

  // Selected item for modal
  const selectedItem =
    modalState.status !== "closed"
      ? items.find((i) => i.id === modalState.itemId) || null
      : null;

  // Optimistic Remove with State Rollback
  const handleRemoveItem = async (id?: string) => {
    const targetId = id || (modalState.status !== "closed" ? modalState.itemId : null);
    if (!targetId) return;

    const previousItems = items;
    const itemToRemove = items.find((i) => i.id === targetId);

    // 1. Optimistic UI update
    setItems((prev) => prev.filter((item) => item.id !== targetId));
    setIsRemoving(true);

    try {
      await deleteWorkspaceKnowledge(workspaceId, targetId);
      closeModal();
      addToast(
        "success",
        `"${itemToRemove?.name || "Knowledge source"}" removed successfully.`,
      );
    } catch (err) {
      // 2. Rollback state on failure
      setItems(previousItems);
      addToast(
        "error",
        err instanceof Error
          ? err.message
          : "Failed to remove knowledge source. Changes have been reverted.",
      );
    } finally {
      setIsRemoving(false);
    }
  };

  // Optimistic Retry with State Rollback
  const handleRetryProcessing = async (id?: string) => {
    const targetId = id || (modalState.status !== "closed" ? modalState.itemId : null);
    if (!targetId) return;

    const previousItems = items;
    const itemToRetry = items.find((i) => i.id === targetId);

    // 1. Optimistic UI update: Set to Processing and clear error
    setItems((prev) =>
      prev.map((item) =>
        item.id === targetId
          ? { ...item, status: "Processing", errorMessage: undefined }
          : item,
      ),
    );
    setIsRetrying(true);

    try {
      await retryKnowledgeProcessing(workspaceId, targetId);
      closeModal();
      addToast(
        "success",
        `Processing re-queued for "${itemToRetry?.name || "source"}".`,
      );
    } catch (err) {
      // 2. Rollback state on failure
      setItems(previousItems);
      addToast(
        "error",
        err instanceof Error
          ? err.message
          : "Failed to retry processing. Changes have been reverted.",
      );
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-secondary-50/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-secondary-50">
            Knowledge
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
            Manage shared knowledge sources that your Workspace Agents can use
            to understand your business and perform tasks.
          </p>
        </div>

        {/* Add Knowledge Source Button */}
        <Link
          href={`/w/${workspaceId}/knowledge/new`}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary-500 hover:bg-secondary-600 text-secondary-50 font-semibold text-xs sm:text-sm transition-all shadow-md active:scale-[0.99] cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Knowledge Source</span>
        </Link>
      </div>

      {/* STATE 1: LOADING SKELETON */}
      {isLoading && (
        <div
          aria-label="Loading knowledge sources"
          className="space-y-4 animate-pulse"
        >
          {/* Toolbar skeleton */}
          <div className="flex justify-between items-center gap-4">
            <div className="h-10 bg-secondary-900/60 rounded-xl w-64 border border-secondary-50/10" />
            <div className="h-10 bg-secondary-900/40 rounded-xl w-36 border border-secondary-50/10" />
          </div>

          {/* Table container skeleton */}
          <div className="rounded-2xl border border-secondary-50/10 bg-secondary-950/40 p-4 space-y-3">
            <div className="h-10 bg-secondary-900/40 rounded-xl w-full" />
            <div className="h-14 bg-secondary-900/20 rounded-xl w-full" />
            <div className="h-14 bg-secondary-900/20 rounded-xl w-full" />
            <div className="h-14 bg-secondary-900/20 rounded-xl w-full" />
          </div>
        </div>
      )}

      {/* STATE 2: ERROR STATE WITH WORKING RETRY */}
      {!isLoading && isError && (
        <div
          role="alert"
          className="flex flex-col items-center justify-center p-10 sm:p-14 text-center bg-neutral-50 rounded-2xl border border-wrong-300 shadow-sm"
        >
          <div className="w-12 h-12 rounded-2xl bg-wrong-100 flex items-center justify-center text-wrong-600 mb-3 shadow-2xs">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900">
            Failed to Load Knowledge Sources
          </h3>
          <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-md">
            {errorMessage ||
              "An unexpected error occurred while fetching your workspace knowledge sources. Please retry."}
          </p>

          <Button
            variant="primary"
            surface="light"
            onClick={() => loadData(true)}
            className="mt-5"
          >
            <RotateCw className="w-4 h-4 mr-2" />
            <span>Retry Connection</span>
          </Button>
        </div>
      )}

      {/* STATE 3: EMPTY STATE (0 items in workspace) */}
      {!isLoading && !isError && items.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-neutral-50 rounded-2xl border border-neutral-200 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-secondary-500 mb-4 shadow-xs">
            <Database className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-neutral-900">
            No Knowledge Sources Found
          </h3>
          <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-sm">
            You haven&apos;t added any knowledge documents or URLs to this
            workspace yet. Add your first source to train Agents.
          </p>

          <Button
            variant="primary"
            surface="light"
            onClick={() => router.push(`/w/${workspaceId}/knowledge/new`)}
            className="mt-6"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span>Add Knowledge Source</span>
          </Button>
        </div>
      )}

      {/* STATE 4: SUCCESS STATE (Toolbar & Table) */}
      {!isLoading && !isError && items.length > 0 && (
        <KnowledgeTable
          items={items}
          onAddKnowledge={() => router.push(`/w/${workspaceId}/knowledge/new`)}
          onOpenAvailability={(item) => openAvailabilityModal(item.id)}
          onOpenRemove={(item) => openRemoveModal(item.id)}
        />
      )}

      {/* Action Dialog (Discriminated union: availability vs remove) */}
      <KnowledgeActionModal
        isOpen={modalState.status !== "closed"}
        mode={modalState.status === "remove" ? "remove" : "availability"}
        item={selectedItem}
        onClose={closeModal}
        onRemoveSource={handleRemoveItem}
        onRetryProcessing={handleRetryProcessing}
        isRemoving={isRemoving}
        isRetrying={isRetrying}
      />

      {/* Toast Notifications */}
      {toasts.length > 0 && (
        <div
          aria-live="polite"
          aria-atomic="true"
          className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none"
        >
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`pointer-events-auto p-3.5 rounded-xl border text-xs sm:text-sm shadow-xl flex items-start gap-2.5 animate-in slide-in-from-bottom-2 duration-150 ${
                toast.type === "error"
                  ? "bg-wrong-50 border-wrong-200 text-wrong-950"
                  : toast.type === "success"
                    ? "bg-right-50 border-right-200 text-right-950"
                    : "bg-secondary-50 border-secondary-200 text-secondary-950"
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {toast.type === "error" ? (
                  <AlertCircle className="w-4 h-4 text-wrong-600" />
                ) : toast.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-right-600" />
                ) : (
                  <Database className="w-4 h-4 text-secondary-600" />
                )}
              </div>
              <div className="flex-1 leading-snug">{toast.message}</div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                aria-label="Dismiss notification"
                className="shrink-0 text-neutral-400 hover:text-neutral-700 p-0.5 cursor-pointer rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default KnowledgeView;
