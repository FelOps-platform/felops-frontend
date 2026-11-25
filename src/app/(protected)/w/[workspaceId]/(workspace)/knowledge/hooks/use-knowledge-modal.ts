"use client";

import { useState, useCallback } from "react";

export type KnowledgeModalState =
  | { status: "closed" }
  | { status: "availability"; itemId: string }
  | { status: "remove"; itemId: string };

export function useKnowledgeModal() {
  const [modalState, setModalState] = useState<KnowledgeModalState>({
    status: "closed",
  });

  const openAvailabilityModal = useCallback((itemId: string) => {
    setModalState({ status: "availability", itemId });
  }, []);

  const openRemoveModal = useCallback((itemId: string) => {
    setModalState({ status: "remove", itemId });
  }, []);

  const closeModal = useCallback(() => {
    setModalState({ status: "closed" });
  }, []);

  return {
    modalState,
    openAvailabilityModal,
    openRemoveModal,
    closeModal,
  };
}
