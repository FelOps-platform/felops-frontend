"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import {
  getWorkspaceKnowledge,
  type KnowledgeItem,
} from "../services/knowledge.service";
import { KnowledgeTable } from "./knowledge-table";

interface KnowledgeViewProps {
  workspaceId: string;
}

export function KnowledgeView({ workspaceId }: KnowledgeViewProps) {
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

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };


  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-secondary-50/10">
        <div>
          <h1 className="text-2xl sm:text-3xl text-semibold tracking-tight text-secondary-50">
            Knowledge
          </h1>
          <p className="text-xs sm:text-sm text-secondary-100 mt-1">
            Manage shared knowledge sources that your Workspace Agents can use to understand your business and perform tasks.
          </p>
        </div>

        {/* Add Knowledge Source Button */}
        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary-500 hover:bg-secondary-600 text-secondary-50 font-semibold text-xs sm:text-sm transition-all shadow-md active:scale-[0.99] cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Knowledge Source</span>
        </button>
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
            // TODO: Open modal or navigate to add knowledge source flow
          }}
          onRemoveItem={handleRemoveItem}
        />
      )}
    </div>
  );
}

export default KnowledgeView;
