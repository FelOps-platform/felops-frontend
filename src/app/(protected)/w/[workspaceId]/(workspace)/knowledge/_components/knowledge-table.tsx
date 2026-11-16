"use client";

import {
  Database,
  Plus,
  MoreHorizontal,
  Trash2,
  Shield,
  Search,
  Filter,
  ChevronDown,
  Check,
  X,
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
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    isCategoryMenuOpen,
    setIsCategoryMenuOpen,
    categories,
    filteredItems,
    clearFilters,
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
    <div className="space-y-4">
      {/* Search & Category Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input Filter */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sources by name or type..."
            className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm text-secondary-950 bg-secondary-50 border border-neutral-300 rounded-xl placeholder:text-neutral-400 focus:outline-none focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/20 transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-secondary-950 p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter by Category Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
            className="w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-2.5 px-3.5 py-2 rounded-xl border border-neutral-300 bg-secondary-50 hover:bg-secondary-100 text-secondary-950 text-xs sm:text-sm font-semibold transition-colors shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-secondary-500/20"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-secondary-700" />
              <span>
                {selectedCategory === "all" ? "Filter by category" : selectedCategory}
              </span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-neutral-500 transition-transform ${
                isCategoryMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Category Dropdown Menu */}
          {isCategoryMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setIsCategoryMenuOpen(false)}
              />
              <div className="absolute right-0 mt-1.5 z-40 w-48 rounded-xl bg-secondary-50 border border-neutral-300 p-1.5 shadow-xl text-xs sm:text-sm animate-in fade-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("all");
                    setIsCategoryMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                    selectedCategory === "all"
                      ? "bg-secondary-100 font-bold text-secondary-950"
                      : "text-secondary-950 hover:bg-secondary-100/60"
                  }`}
                >
                  <span>All Categories</span>
                  {selectedCategory === "all" && (
                    <Check className="w-3.5 h-3.5 text-secondary-700" />
                  )}
                </button>

                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat);
                      setIsCategoryMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                      selectedCategory.toLowerCase() === cat.toLowerCase()
                        ? "bg-secondary-100 font-bold text-secondary-950"
                        : "text-secondary-950 hover:bg-secondary-100/60"
                    }`}
                  >
                    <span>{cat}</span>
                    {selectedCategory.toLowerCase() === cat.toLowerCase() && (
                      <Check className="w-3.5 h-3.5 text-secondary-700" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

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
                    <Search className="w-6 h-6 mx-auto mb-2 text-neutral-400" />
                    <p className="font-semibold text-secondary-950">
                      No knowledge sources found
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">
                      No sources match your search or selected category.
                    </p>
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 bg-white text-xs font-semibold text-secondary-950 hover:bg-neutral-100 transition-colors cursor-pointer shadow-2xs"
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
                              className={`absolute end-5 z-50 w-52 rounded-xl bg-neutral-50 p-1.5 border border-neutral-300 text-secondary-950 ${nearBottom ? "bottom-11" : "top-11"
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
