"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import {
  getWorkspaceKnowledge,
  deleteWorkspaceKnowledge,
  retryKnowledgeProcessing,
  type KnowledgeItem,
} from "../services/knowledge.service";
import { KnowledgeTable } from "./knowledge-table";

interface KnowledgeViewProps {
  workspaceId: string;
}

export function KnowledgeView({ workspaceId }: KnowledgeViewProps) {
  const router = useRouter();
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setIsLoading(true);
        const data = await getWorkspaceKnowledge(workspaceId);
        if (isMounted) {
          setItems(data);
        }
      } catch (error) {
        console.error("Failed to load knowledge items:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [workspaceId]);

  const handleRemoveItem = async (id: string) => {
    // Optimistic UI update: Remove immediately from list
    const previousItems = items;
    setItems((prev) => prev.filter((item) => item.id !== id));

    try {
      // TODO (Backend Integration):
      // 1. Await DELETE /api/workspaces/${workspaceId}/knowledge/${id}
      await deleteWorkspaceKnowledge(workspaceId, id);
    } catch (error) {
      console.error("Failed to delete knowledge item:", error);
      // Rollback on failure
      setItems(previousItems);
      // TODO (Backend Integration): Show error toast notification
    }
  };

  const handleRetryProcessing = async (id: string) => {
    // Optimistically set status to Processing
    const previousItems = items;
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "Processing" } : item,
      ),
    );

    try {
      // TODO (Backend Integration):
      // 1. Call POST /api/workspaces/${workspaceId}/knowledge/${id}/retry
      await retryKnowledgeProcessing(workspaceId, id);
      // 2. Subscribe to WebSocket or SSE to listen for job status update (Ready / Failed)
    } catch (error) {
      console.error("Failed to retry processing:", error);
      // Rollback status on failure
      setItems(previousItems);
      // TODO (Backend Integration): Show error toast notification
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-secondary-50/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-secondary-50">
            Knowledge
          </h1>
          <p className="text-xs sm:text-sm text-secondary-100 mt-1 w-2/3">
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

      {/* Content Area */}
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-12 bg-secondary-900/40 rounded-2xl w-full border border-secondary-50/10" />
          <div className="h-16 bg-secondary-900/30 rounded-2xl w-full border border-secondary-50/10" />
          <div className="h-16 bg-secondary-900/30 rounded-2xl w-full border border-secondary-50/10" />
          <div className="h-16 bg-secondary-900/30 rounded-2xl w-full border border-secondary-50/10" />
        </div>
      ) : (
        <KnowledgeTable
          items={items}
          onAddKnowledge={() => {
            router.push(`/w/${workspaceId}/knowledge/new`);
          }}
          onRemoveItem={handleRemoveItem}
          onRetryProcessing={handleRetryProcessing}
        />
      )}
    </div>
  );
}

export default KnowledgeView;
