"use client";

import {
  Database,
  Plus,
  MoreHorizontal,
  Trash2,
  Shield,
} from "lucide-react";
import type { KnowledgeItem } from "../services/knowledge.service";
import { useKnowledgeTable } from "../hooks/use-knowledge-table";
import { KnowledgeActionModal } from "./KnowledgeActionModal";

interface KnowledgeTableProps {
  items: KnowledgeItem[];
  onAddKnowledge?: () => void;
  onRemoveItem?: (id: string) => void | Promise<void>;
  onRetryProcessing?: (id: string) => void | Promise<void>;
}

export function KnowledgeTable({
  items,
  onAddKnowledge,
  onRemoveItem,
  onRetryProcessing,
}: KnowledgeTableProps) {
  const {
    activeMenuId,
    toggleMenu,
    closeMenu,
    modalState,
    openAvailabilityModal,
    openRemoveModal,
    closeModal,
    handleModalRemoveSource,
    handleRetryProcessing,
    isNearBottom,
    getTypeIcon,
    getAvailabilityBadge,
    formatDate,
  } = useKnowledgeTable({ items, onRemoveItem, onRetryProcessing });

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-neutral-200 rounded-2xl border border-neutral-300">
        <Database className="w-10 h-10 text-secondary-950 mb-3" />
        <h3 className="text-base font-semibold text-secondary-950">
          No Knowledge Sources Found
        </h3>
        <p className="text-xs sm:text-sm text-secondary-800 mt-1 max-w-sm">
          You haven&apos;t added any knowledge documents or URLs to this workspace yet.
        </p>

        <button
          type="button"
          onClick={onAddKnowledge}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary-950 hover:bg-secondary-900 text-secondary-50 font-semibold text-xs sm:text-sm transition-all shadow-md active:scale-[0.99] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Knowledge Source</span>
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl relative overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-secondary-50">
            <tr className="text-neutral-700">
              <th scope="col" className="px-5 py-3.5">
                Source name
              </th>
              <th scope="col" className="px-5 py-3.5">
                Type
              </th>
              <th scope="col" className="px-5 py-3.5">
                Availability
              </th>
              <th scope="col" className="px-5 py-3.5">
                Created At
              </th>
              <th scope="col" className="px-5 py-3.5 text-end">
                <span>More</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 text-xs sm:text-sm bg-neutral-50">
            {items.map((item, index) => {
              const isMenuOpen = activeMenuId === item.id;
              const nearBottom = isNearBottom(index);

              return (
                <tr
                  key={item.id}
                  className="text-secondary-950"
                >
                  {/* Name with icon */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <span className="shrink-0 p-3 rounded-xl bg-secondary-950 text-secondary-50 flex items-center justify-center shadow-xs">
                        {getTypeIcon(item.type)}
                      </span>
                      <span className="truncate max-w-xs">{item.name}</span>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center px-2.5 py-1">
                      {item.type}
                    </span>
                  </td>

                  {/* Availability Badge */}
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => openAvailabilityModal(item)}
                      className="cursor-pointer hover:opacity-80 transition-opacity inline-flex focus:outline-none"
                      title="View availability details"
                    >
                      {getAvailabilityBadge(item.status)}
                    </button>
                  </td>

                  {/* Created At */}
                  <td className="px-5 py-4">
                    {formatDate(item.createdAt)}
                  </td>

                  {/* Actions (...) */}
                  <td className="px-5 py-4 text-end relative">
                    <button
                      type="button"
                      onClick={() => toggleMenu(item.id)}
                      aria-label="Actions"
                      className="p-1.5 rounded-lg text-secondary-950 hover:bg-neutral-300/80 transition-colors cursor-pointer inline-flex items-center justify-center"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>

                    {/* Actions Menu Dropdown */}
                    {isMenuOpen && (
                      <>
                        {/* Backdrop to close menu on click outside */}
                        <div
                          className="fixed inset-0 z-40"
                          onClick={closeMenu}
                        />

                        <div
                          className={`absolute end-5 z-50 w-52 rounded-xl bg-neutral-50 p-1.5 border border-neutral-300 text-secondary-950 ${
                            nearBottom ? "bottom-11" : "top-11"
                          }`}
                        >
                          {/* Availability Action */}
                          <button
                            type="button"
                            onClick={() => openAvailabilityModal(item)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-secondary-950 hover:bg-neutral-200/80 rounded-lg transition-colors cursor-pointer text-left"
                          >
                            <Shield className="w-3.5 h-3.5 text-secondary-700" />
                            <span>Availability</span>
                          </button>

                          {/* Divider */}
                          <div className="h-px bg-neutral-200 my-1" />

                          {/* Remove Item Action */}
                          <button
                            type="button"
                            onClick={() => openRemoveModal(item)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-wrong-600 hover:bg-wrong-50 rounded-lg transition-colors cursor-pointer text-left"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-wrong-600" />
                            <span>Remove item</span>
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Reusable Knowledge Action Modal */}
      <KnowledgeActionModal
        isOpen={modalState.isOpen}
        type={modalState.type}
        assignedAgents={modalState.selectedItem?.assignedAgents}
        onClose={closeModal}
        onRemoveSource={handleModalRemoveSource}
        onRetryProcessing={handleRetryProcessing}
      />
    </div>
  );
}

export default KnowledgeTable;
