"use client";

import { useEffect, useRef } from "react";
import type { KnowledgeItem } from "@/features/knowledge";

export interface UseKnowledgePollingOptions {
  items: KnowledgeItem[];
  onPoll: () => Promise<void> | void;
  intervalMs?: number;
}

export function useKnowledgePolling({
  items,
  onPoll,
  intervalMs = 4000,
}: UseKnowledgePollingOptions) {
  const onPollRef = useRef(onPoll);
  onPollRef.current = onPoll;

  const hasProcessing = items.some((item) => item.status === "Processing");

  useEffect(() => {
    if (!hasProcessing) return;

    let timer: NodeJS.Timeout | null = null;

    const runPoll = () => {
      if (
        typeof document !== "undefined" &&
        document.visibilityState === "hidden"
      ) {
        return;
      }
      onPollRef.current();
    };

    timer = setInterval(runPoll, intervalMs);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        runPoll();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (timer) clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [hasProcessing, intervalMs]);
}
