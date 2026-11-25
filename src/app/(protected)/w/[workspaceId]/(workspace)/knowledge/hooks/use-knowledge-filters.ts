"use client";

import { useState, useMemo, useCallback } from "react";
import type { KnowledgeItem, KnowledgeStatus } from "@/features/knowledge";

export interface UseKnowledgeFiltersOptions {
  items: KnowledgeItem[];
}

export function useKnowledgeFilters({ items }: UseKnowledgeFiltersOptions) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<KnowledgeStatus | "all">(
    "all",
  );
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

  // Extract unique categories (types) dynamically from items
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.type) set.add(item.type);
    });
    return Array.from(set);
  }, [items]);

  // Filter items in-memory based on current query and category/status
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.source.toLowerCase().includes(q);

      const matchesCategory =
        selectedCategory === "all" ||
        item.type.toLowerCase() === selectedCategory.toLowerCase();

      const matchesStatus =
        selectedStatus === "all" || item.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [items, searchQuery, selectedCategory, selectedStatus]);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedStatus("all");
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    isCategoryMenuOpen,
    setIsCategoryMenuOpen,
    categories,
    filteredItems,
    clearFilters,
  };
}
