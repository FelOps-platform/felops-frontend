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
    const previousItems = items;
    setItems((prev) => prev.filter((item) => item.id !== id));

    try {
      await deleteWorkspaceKnowledge(workspaceId, id);
    } catch (error) {
      console.error("Failed to delete knowledge item:", error);
      setItems(previousItems);
    }
  };

  const handleRetryProcessing = async (id: string) => {
    const previousItems = items;
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "Processing" as const } : item,
      ),
    );

    try {
      await retryKnowledgeProcessing(workspaceId, id);
    } catch (error) {
      console.error("Failed to retry processing:", error);
      setItems(previousItems);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
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
