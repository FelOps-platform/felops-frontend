"use client";

import { useState } from "react";
import { FileText, Globe, FileCode } from "lucide-react";
import type { KnowledgeItem } from "../services/knowledge.service";

interface UseKnowledgeTableProps {
  items: KnowledgeItem[];
  onRemoveItem?: (id: string) => void;
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
  const normalizedStatus = status.toLowerCase();
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
  }[normalizedStatus] || {
    label: status,
    bg: "bg-neutral-300/80 text-secondary-950 border-neutral-400/50",
  };

  return (
    <span
      className={`items-center gap-1.5 px-1.5 py-1 rounded-xl font-semibold border ${config.bg}`}
    >
      <span className="w-1.5 h-1.5" />
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
}: UseKnowledgeTableProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const toggleMenu = (id: string) => {
    setActiveMenuId((prev) => (prev === id ? null : id));
  };

  const closeMenu = () => {
    setActiveMenuId(null);
  };

  const handleRemove = (id: string) => {
    onRemoveItem?.(id);
    closeMenu();
  };

  const isNearBottom = (index: number) => {
    return index >= items.length - 2 && items.length > 2;
  };

  return {
    activeMenuId,
    toggleMenu,
    closeMenu,
    handleRemove,
    isNearBottom,
    getTypeIcon,
    getAvailabilityBadge,
    formatDate,
  };
}
