"use client";

import { Search, Filter, ChevronDown, Check, X } from "lucide-react";

interface KnowledgeToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  categories: string[];
  isCategoryMenuOpen: boolean;
  onToggleCategoryMenu: () => void;
  onCloseCategoryMenu: () => void;
}

export function KnowledgeToolbar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategorySelect,
  categories,
  isCategoryMenuOpen,
  onToggleCategoryMenu,
  onCloseCategoryMenu,
}: KnowledgeToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      {/* Search Input Filter */}
      <div className="relative flex-1 max-w-sm">
        <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search sources by name or type..."
          className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm text-secondary-950 bg-secondary-50 border border-neutral-300 rounded-xl placeholder:text-neutral-400 focus:outline-none focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/20 transition-all shadow-2xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
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
          onClick={onToggleCategoryMenu}
          className="w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-2.5 px-3.5 py-2 rounded-xl border border-neutral-300 bg-secondary-50 hover:bg-secondary-100 text-secondary-950 text-xs sm:text-sm font-semibold transition-colors shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-secondary-500/20"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-secondary-700" />
            <span>
              {selectedCategory === "all"
                ? "Filter by category"
                : selectedCategory}
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
            <div className="fixed inset-0 z-30" onClick={onCloseCategoryMenu} />
            <div className="absolute right-0 mt-1.5 z-40 w-48 rounded-xl bg-secondary-50 border border-neutral-300 p-1.5 shadow-xl text-xs sm:text-sm animate-in fade-in zoom-in-95 duration-100">
              <button
                type="button"
                onClick={() => {
                  onCategorySelect("all");
                  onCloseCategoryMenu();
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
                    onCategorySelect(cat);
                    onCloseCategoryMenu();
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
  );
}
