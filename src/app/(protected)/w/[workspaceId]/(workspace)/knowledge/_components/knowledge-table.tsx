"use client";

import {
  Database,
  Plus,
  MoreHorizontal,
  Trash2,
  Shield,
  Search,
  ExternalLink,
} from "lucide-react";
import type { KnowledgeItem } from "@/features/knowledge";
import { useKnowledgeTable } from "../hooks/use-knowledge-table";
import { KnowledgeToolbar } from "./knowledge-toolbar";
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
    filteredItems,
    clearFilters,
    getTypeIcon,
    getAvailabilityBadge,
    openAvailabilityModal,
    activeMenuId,
    modalState,
    closeModal,
    handleModalRemoveSource,
    handleRetryProcessing,
    formatDate,
    closeMenu,
    toggleMenu,
    openRemoveModal,
    isNearBottom,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    isCategoryMenuOpen,
    setIsCategoryMenuOpen,
    categories,
  } = useKnowledgeTable({ items, onRemoveItem, onRetryProcessing });

  const handleOpenSource = (url: string) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleRowClick = (item: KnowledgeItem, e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Don't trigger if clicked directly on or inside interactive buttons/menus
    if (
      target.closest("button") ||
      target.closest("a") ||
      target.closest("[role='menu']")
    ) {
      return;
    }
    handleOpenSource(item.source);
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-neutral-50 rounded-2xl border border-neutral-50">
        <Database className="w-10 h-10 text-secondary-950 mb-3" />
        <h3 className="text-base font-bold text-secondary-950">
          No Knowledge Sources Found
        </h3>
        <p className="text-xs sm:text-sm text-secondary-300 mt-1 max-w-sm">
          You haven&apos;t added any knowledge documents or URLs to this
          workspace yet.
        </p>

        <button
          type="button"
          onClick={onAddKnowledge}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary-500 hover:bg-secondary-700 text-secondary-50 font-semibold text-xs sm:text-sm transition-all shadow-md active:scale-[0.99] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Knowledge Source</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search & Category Filter Toolbar */}
      <KnowledgeToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
        categories={categories}
        isCategoryMenuOpen={isCategoryMenuOpen}
        onToggleCategoryMenu={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
        onCloseCategoryMenu={() => setIsCategoryMenuOpen(false)}
      />

      {/* Table Container */}
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
              {filteredItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-neutral-500 text-xs sm:text-sm"
                  >
                    <Search className="w-8 h-8 mx-auto mb-2 text-secondary-950" />
                    <p className="font-semibold text-secondary-950 text-lg ">
                      No knowledge sources found
                    </p>
                    <p className="text-xs text-secondary-400 mt-1">
                      No sources match your search or selected category.
                    </p>
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 bg-secondary-500 text-xs font-semibold text-secondary-50 transition-colors cursor-pointer shadow-2xs"
                    >
                      Reset filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, index) => {
                  const isMenuOpen = activeMenuId === item.id;
                  const nearBottom = isNearBottom(index);

                  return (
                    <tr
                      key={item.id}
                      onClick={(e) => handleRowClick(item, e)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleOpenSource(item.source);
                        }
                      }}
                      tabIndex={0}
                      role="link"
                      aria-label={`Open source: ${item.name}`}
                      className="text-secondary-950 hover:bg-neutral-200/50 transition-colors cursor-pointer group focus:outline-none focus:bg-neutral-200/60"
                      title={`Click to open source (${item.source})`}
                    >
                      {/* Name with icon & source preview */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <span className="shrink-0 p-3 rounded-xl bg-secondary-950 text-secondary-50 flex items-center justify-center shadow-xs">
                            {getTypeIcon(item.type)}
                          </span>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="truncate max-w-xs font-medium group-hover:text-secondary-700 transition-colors">
                                {item.name}
                              </span>
                            </div>
                            <span className="text-[11px] text-secondary-400 truncate max-w-xs">
                              {item.source}
                            </span>
                          </div>
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
                          onClick={(e) => {
                            e.stopPropagation();
                            openAvailabilityModal(item);
                          }}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMenu(item.id);
                          }}
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
                              onClick={(e) => {
                                e.stopPropagation();
                                closeMenu();
                              }}
                            />

                            <div
                              onClick={(e) => e.stopPropagation()}
                              className={`absolute end-5 z-50 w-52 rounded-xl bg-neutral-50 p-1.5 border border-neutral-300 text-secondary-950 shadow-lg ${
                                nearBottom ? "bottom-11" : "top-11"
                              }`}
                            >
                              {/* Availability Action */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openAvailabilityModal(item);
                                }}
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
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openRemoveModal(item);
                                }}
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
                })
              )}
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
    </div>
  );
}

export default KnowledgeTable;
