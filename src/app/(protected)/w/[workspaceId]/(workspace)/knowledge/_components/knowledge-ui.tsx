import React from "react";
import {
  FileText,
  Globe,
  FileCode,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import type { KnowledgeStatus, KnowledgeType } from "@/features/knowledge";
import { formatKnowledgeDate } from "@/features/knowledge";

export function getTypeIcon(type: KnowledgeType | string) {
  const normalized = (type || "").toUpperCase().trim();
  switch (normalized) {
    case "PDF":
      return <FileText className="w-4 h-4 text-secondary-50" />;
    case "URL":
    case "WEBSITE":
      return <Globe className="w-4 h-4 text-secondary-50" />;
    default:
      return <FileCode className="w-4 h-4 text-secondary-50" />;
  }
}

export function getAvailabilityBadge(status: KnowledgeStatus | string) {
  const normalized = (status || "").toLowerCase().trim();
  const key =
    normalized === "indexed" || normalized === "ready"
      ? "ready"
      : normalized === "syncing" ||
          normalized === "processing" ||
          normalized === "pending"
        ? "processing"
        : normalized === "failed" ||
            normalized === "unavailable" ||
            normalized === "error"
          ? "failed"
          : "default";

  const config = {
    ready: {
      label: "Ready",
      bg: "bg-right-100 text-right-950 border-right-400",
      icon: <CheckCircle2 className="w-3 h-3 text-right-700" />,
    },
    processing: {
      label: "Processing",
      bg: "bg-secondary2-200 text-secondary2-950 border-secondary2-400",
      icon: <Clock className="w-3 h-3 text-secondary2-700 animate-pulse" />,
    },
    failed: {
      label: "Failed",
      bg: "bg-wrong-200 text-wrong-950 border-wrong-400",
      icon: <AlertCircle className="w-3 h-3 text-wrong-700" />,
    },
    default: {
      label: status,
      bg: "bg-neutral-200 text-neutral-900 border-neutral-400",
      icon: null,
    },
  }[key];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border ${config.bg}`}
    >
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
}

export { formatKnowledgeDate as formatDate };
