"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  MoreHorizontal,
  Trash2,
  Shield,
  Search,
  ExternalLink,
} from "lucide-react";
import type { KnowledgeItem } from "@/features/knowledge";
import { useKnowledgeFilters } from "../hooks/use-knowledge-filters";
import { KnowledgeToolbar } from "./knowledge-toolbar";
import {
  getTypeIcon,
  getAvailabilityBadge,
  formatDate,
} from "./knowledge-ui";

export interface KnowledgeTableProps {
  items: KnowledgeItem[];
  onAddKnowledge?: () => void;
  onOpenAvailability: (item: KnowledgeItem) => void;
  onOpenRemove: (item: KnowledgeItem) => void;
}

export function KnowledgeTable({
  items,
  onOpenAvailability,
  onOpenRemove,
}: KnowledgeTableProps) {
  const {
    filteredItems,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    isCategoryMenuOpen,
    setIsCategoryMenuOpen,
    categories,
    clearFilters,
  } = useKnowledgeFilters({ items });

  // Action Menu Portal State & Refs
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const triggerRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const menuRef = useRef<HTMLDivElement>(null);
  const firstMenuItemRef = useRef<HTMLButtonElement>(null);

  const closeMenu = useCallback(() => {
    setActiveMenuId(null);
    setMenuPosition(null);
  }, []);

  const toggleMenu = useCallback(
    (id: string) => {
      if (activeMenuId === id) {
        closeMenu();
        return;
      }

      const btn = triggerRefs.current.get(id);
      if (btn) {
        const rect = btn.getBoundingClientRect();
        const menuWidth = 208; // 13rem = 208px
        const left = Math.max(16, rect.right + window.scrollX - menuWidth);
        const top = rect.bottom + window.scrollY + 6;
        setMenuPosition({ top, left });
        setActiveMenuId(id);
      }
    },
    [activeMenuId, closeMenu],
  );

  // Close menu on scroll or resize to prevent floating detaches
  useEffect(() => {
    if (!activeMenuId) return;

    const handleScrollOrResize = () => {
      closeMenu();
    };

    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [activeMenuId, closeMenu]);

  // Focus management when menu opens
  useEffect(() => {
    if (activeMenuId && firstMenuItemRef.current) {
      firstMenuItemRef.current.focus();
    }
  }, [activeMenuId]);

  // Keyboard navigation within the portal action menu
  const handleMenuKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      const currentId = activeMenuId;
      closeMenu();
      if (currentId) {
        triggerRefs.current.get(currentId)?.focus();
      }
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!menuRef.current) return;
      const buttons = Array.from(
        menuRef.current.querySelectorAll<HTMLButtonElement>(
          'button[role="menuitem"]',
        ),
      );
      const currentIndex = buttons.indexOf(
        document.activeElement as HTMLButtonElement,
      );
      if (e.key === "ArrowDown") {
        const nextIndex = (currentIndex + 1) % buttons.length;
        buttons[nextIndex]?.focus();
      } else {
        const prevIndex =
          (currentIndex - 1 + buttons.length) % buttons.length;
        buttons[prevIndex]?.focus();
      }
    }
  };

  const activeItem = items.find((i) => i.id === activeMenuId) || null;

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
      <div className="rounded-2xl relative overflow-hidden border border-neutral-200">
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
                  <span>Actions</span>
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
                    <p className="font-semibold text-secondary-950 text-base">
                      No knowledge sources found
                    </p>
                    <p className="text-xs text-secondary-500 mt-1">
                      No sources match your search or selected category.
                    </p>
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 bg-secondary-500 text-xs font-semibold text-secondary-50 transition-colors cursor-pointer shadow-2xs hover:bg-secondary-600"
                    >
                      Reset filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const hasValidLink =
                    Boolean(item.openUrl) && item.status === "Ready";

                  const handleRowClick = (e: React.MouseEvent) => {
                    const target = e.target as HTMLElement;
                    if (
                      target.closest("button") ||
                      target.closest("a") ||
                      target.closest("[role='menu']")
                    ) {
                      return;
                    }
                    if (hasValidLink && item.openUrl) {
                      window.open(item.openUrl, "_blank", "noopener,noreferrer");
                    }
                  };

                  return (
                    <tr
                      key={item.id}
                      onClick={handleRowClick}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && hasValidLink && item.openUrl) {
                          e.preventDefault();
                          window.open(
                            item.openUrl,
                            "_blank",
                            "noopener,noreferrer",
                          );
                        }
                      }}
                      tabIndex={hasValidLink ? 0 : undefined}
                      role={hasValidLink ? "link" : undefined}
                      aria-label={
                        hasValidLink ? `Open source: ${item.name}` : undefined
                      }
                      className={`text-secondary-950 transition-colors ${
                        hasValidLink
                          ? "hover:bg-neutral-200/50 cursor-pointer focus:outline-none focus:bg-neutral-200/60"
                          : "hover:bg-neutral-100/60"
                      }`}
                    >
                      {/* Name with icon & source label / semantic link */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="shrink-0 p-2.5 rounded-xl bg-secondary-950 text-secondary-50 flex items-center justify-center shadow-2xs">
                            {getTypeIcon(item.type)}
                          </span>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5">
                              {hasValidLink ? (
                                <a
                                  href={item.openUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="font-medium text-secondary-950 hover:text-secondary-700 hover:underline underline-offset-2 truncate max-w-xs transition-colors flex items-center gap-1 focus:outline-none focus:ring-1 focus:ring-secondary-500 rounded"
                                  title={`Open source: ${item.source}`}
                                >
                                  <span>{item.name}</span>
                                  <ExternalLink className="w-3 h-3 text-secondary-400 shrink-0" />
                                </a>
                              ) : (
                                <span
                                  className="font-medium text-secondary-950 truncate max-w-xs"
                                  title={item.source}
                                >
                                  {item.name}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-neutral-500 truncate max-w-xs">
                              {item.source}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-neutral-200 text-neutral-800 border border-neutral-300">
                          {item.type}
                        </span>
                      </td>

                      {/* Availability Badge */}
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenAvailability(item);
                          }}
                          className="cursor-pointer hover:opacity-85 transition-opacity inline-flex focus:outline-none focus:ring-2 focus:ring-secondary-500/20 rounded-xl"
                          title="View availability details"
                        >
                          {getAvailabilityBadge(item.status)}
                        </button>
                      </td>

                      {/* Created At */}
                      <td className="px-5 py-4 text-neutral-600">
                        {formatDate(item.createdAt)}
                      </td>

                      {/* Actions Button */}
                      <td className="px-5 py-4 text-end relative">
                        <button
                          ref={(el) => {
                            if (el) triggerRefs.current.set(item.id, el);
                            else triggerRefs.current.delete(item.id);
                          }}
                          type="button"
                          id={`trigger-${item.id}`}
                          aria-haspopup="menu"
                          aria-expanded={activeMenuId === item.id}
                          aria-controls={`menu-${item.id}`}
                          aria-label={`Actions for ${item.name}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMenu(item.id);
                          }}
                          className={`p-1.5 rounded-lg text-secondary-950 transition-colors cursor-pointer inline-flex items-center justify-center ${
                            activeMenuId === item.id
                              ? "bg-neutral-300"
                              : "hover:bg-neutral-300/70"
                          }`}
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Menu Rendered via Portal into document.body */}
      {activeMenuId &&
        menuPosition &&
        activeItem &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            {/* Backdrop to dismiss on outside click */}
            <div
              className="fixed inset-0 z-50 bg-transparent"
              onClick={closeMenu}
            />

            {/* Menu Popover Container */}
            <div
              ref={menuRef}
              role="menu"
              id={`menu-${activeMenuId}`}
              aria-labelledby={`trigger-${activeMenuId}`}
              onKeyDown={handleMenuKeyDown}
              style={{
                position: "absolute",
                top: `${menuPosition.top}px`,
                left: `${menuPosition.left}px`,
              }}
              className="z-50 w-52 rounded-xl bg-neutral-50 p-1.5 border border-neutral-300 text-secondary-950 shadow-xl animate-in fade-in zoom-in-95 duration-100"
            >
              {/* Availability Action */}
              <button
                ref={firstMenuItemRef}
                type="button"
                role="menuitem"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  closeMenu();
                  onOpenAvailability(activeItem);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-secondary-950 hover:bg-neutral-200/80 rounded-lg transition-colors cursor-pointer text-left focus:outline-none focus:bg-neutral-200"
              >
                <Shield className="w-3.5 h-3.5 text-secondary-600" />
                <span>View availability</span>
              </button>

              {/* Divider */}
              <div className="h-px bg-neutral-200 my-1" />

              {/* Remove Action */}
              <button
                type="button"
                role="menuitem"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  closeMenu();
                  onOpenRemove(activeItem);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-wrong-600 hover:bg-wrong-50 rounded-lg transition-colors cursor-pointer text-left focus:outline-none focus:bg-wrong-50"
              >
                <Trash2 className="w-3.5 h-3.5 text-wrong-600" />
                <span>Remove source</span>
              </button>
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}

export default KnowledgeTable;
