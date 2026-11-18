"use client";

import { useState, useMemo } from "react";
import { FileText, Globe, FileCode } from "lucide-react";
import type {
  KnowledgeItem,
  KnowledgeModalType,
  ModalState,
} from "../types/knowledge.types";

interface UseKnowledgeTableProps {
  items: KnowledgeItem[];
  onRemoveItem?: (id: string) => void | Promise<void>;
  onRetryProcessing?: (id: string) => void | Promise<void>;
}

export function getTypeIcon(type: string) {
  switch (type.toLowerCase()) {
    case "pdf":
      return <FileText className="w-4 h-4 text-secondary-50" />;
    case "website":
      return <Globe className="w-4 h-4 text-secondary-50" />;
    default:
      return <FileCode className="w-4 h-4 text-secondary-50" />;
  }
}

export function getAvailabilityBadge(status: string = "ready") {
  const normalized = status.toLowerCase();
  const key =
    normalized === "indexed"
      ? "ready"
      : normalized === "syncing"
        ? "processing"
        : normalized;

  const config = {
    ready: {
      label: "Ready",
      bg: "bg-right-100 text-right-950 border-right-400",
    },
    processing: {
      label: "Processing",
      bg: "bg-secondary2-200 text-secondary2-950 border-secondary2-400",
    },
    failed: {
      label: "Failed",
      bg: "bg-wrong-200 text-wrong-950 border-wrong-400",
    },
  }[key] || {
    label: status,
    bg: "bg-neutral-300/80 text-secondary-950 border-neutral-400/50",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-xl text-xs font-semibold border ${config.bg}`}
    >
      {config.label}
    </span>
  );
}

export function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function useKnowledgeTable({
  items,
  onRemoveItem,
  onRetryProcessing,
}: UseKnowledgeTableProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    type: "available",
    selectedItem: null,
  });

  // Search & Category Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);

  // Filter items by search query (matching name) and category
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || item.name.toLowerCase().includes(q);

      const matchesCategory =
        selectedCategory === "all" ||
        item.type.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, selectedCategory]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
  };

  const openAvailabilityModal = (item: KnowledgeItem) => {
    closeMenu();
    const s = item.status.toLowerCase();
    const type: KnowledgeModalType =
      s === "failed" || s === "unavailable"
        ? "unavailable"
        : s === "processing" || s === "syncing"
          ? "processing"
          : "available";

    setModalState({
      isOpen: true,
      type,
      selectedItem: item,
    });
  };
  const closeMenu = () => {
    setActiveMenuId(null);
  };
  // Extract unique categories dynamically from items
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.type) set.add(item.type);
    });
    return Array.from(set);
  }, [items]);

  const toggleMenu = (id: string) => {
    setActiveMenuId((prev) => (prev === id ? null : id));
  };

  const openRemoveModal = (item: KnowledgeItem) => {
    closeMenu();
    setModalState({
      isOpen: true,
      type: "remove_confirm",
      selectedItem: item,
    });
  };

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleModalRemoveSource = () => {
    if (modalState.type !== "remove_confirm") {
      setModalState((prev) => ({ ...prev, type: "remove_confirm" }));
      return;
    }

    if (modalState.selectedItem) {
      onRemoveItem?.(modalState.selectedItem.id);
    }
    closeModal();
  };

  const handleRetryProcessing = () => {
    if (modalState.selectedItem) {
      onRetryProcessing?.(modalState.selectedItem.id);
    }
    closeModal();
  };

  const isNearBottom = (index: number) => {
    return index >= filteredItems.length - 2 && filteredItems.length > 2;
  };

  return {
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
  };
}
