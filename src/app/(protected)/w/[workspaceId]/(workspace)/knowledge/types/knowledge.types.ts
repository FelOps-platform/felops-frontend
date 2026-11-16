export type KnowledgeModalType =
  | "unavailable"
  | "processing"
  | "available"
  | "remove_confirm";

export interface KnowledgeItem {
  id: string;
  name: string;
  type: string;
  source: string;
  status: string;
  assignedAgents?: string[];
  createdAt: string;
}

export interface ModalState {
  isOpen: boolean;
  type: KnowledgeModalType;
  selectedItem: KnowledgeItem | null;
}
