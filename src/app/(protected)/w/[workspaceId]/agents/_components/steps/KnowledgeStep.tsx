"use client";

import { useState, useEffect } from "react";
import { Database, Plus, Check } from "lucide-react";
import {
  getWorkspaceKnowledge,
  type KnowledgeItem,
} from "@/features/knowledge";

export function KnowledgeStep() {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setIsLoading(true);
        // Default workspace knowledge for agent creation configuration
        const data = await getWorkspaceKnowledge("default_workspace");
        if (isMounted) {
          setItems(data);
        }
      } catch (err) {
        console.error("Failed to load knowledge in KnowledgeStep:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div>
        <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
          Configure Knowledge
        </h2>
        <p className="text-sm text-secondary-500 mt-1">
          Select existing Knowledge sources from your Workspace to make them
          available to this Agent.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-16 bg-neutral-100 rounded-2xl w-full border border-neutral-200" />
          <div className="h-16 bg-neutral-100 rounded-2xl w-full border border-neutral-200" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-secondary-500 mb-4 shadow-xs">
            <Database className="w-6 h-6" />
          </div>

          <h3 className="text-base font-bold text-neutral-900 tracking-tight">
            No Knowledge sources attached
          </h3>
          <p className="text-sm text-neutral-600 mt-1.5 max-w-md leading-relaxed">
            Knowledge sources provide contextual information, documentation, and
            reference material for the Agent.
          </p>

          <button
            type="button"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg border border-neutral-300 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-secondary-500" />
            <span>Add Knowledge Source</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => toggleSelect(item.id)}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? "border-secondary-500 bg-neutral-100 shadow-xs ring-1 ring-secondary-500/30"
                    : "border-neutral-200 bg-neutral-50 hover:border-neutral-300 hover:bg-neutral-100/70"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-secondary-500 text-secondary-50 flex items-center justify-center shadow-xs">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-neutral-900 block">
                      {item.name}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {item.type} • {item.source}
                    </span>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                    isSelected
                      ? "bg-secondary-500 text-secondary-50"
                      : "border border-neutral-300 bg-transparent"
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default KnowledgeStep;
