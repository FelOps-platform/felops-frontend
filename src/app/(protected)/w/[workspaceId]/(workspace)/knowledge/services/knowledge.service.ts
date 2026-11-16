export interface KnowledgeItem {
  id: string;
  name: string;
  type: string;
  source: string;
  status: string;
  assignedAgents?: string[];
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Mock Data Simulating Backend Workspace Knowledge Items
// ---------------------------------------------------------------------------

export const MOCK_KNOWLEDGE_ITEMS: KnowledgeItem[] = [
  {
    id: "kn_doc_001",
    name: "Customer Refund & Return Policy",
    type: "PDF",
    source: "refund-policy-2026.pdf",
    status: "Ready",
    assignedAgents: ["Customer Support", "Billing Assistant"],
    createdAt: "2026-11-10T08:30:00Z",
  },
  {
    id: "kn_web_002",
    name: "Product Documentation & API Specs",
    type: "Website",
    source: "https://docs.felops.com/v1",
    status: "Ready",
    assignedAgents: ["Developer Assistant", "Technical Support", "Docs Bot"],
    createdAt: "2026-11-12T11:45:00Z",
  },
  {
    id: "kn_faq_003",
    name: "Support Q&A Knowledge Sheet",
    type: "PDF",
    source: "support-faqs-v3.csv",
    status: "Processing",
    assignedAgents: [],
    createdAt: "2026-11-14T14:15:00Z",
  },
  {
    id: "kn_db_004",
    name: "Enterprise SLA Agreements",
    type: "PDF",
    source: "notion://enterprise-sla",
    status: "Ready",
    assignedAgents: ["Enterprise Sales", "Legal Assistant"],
    createdAt: "2026-11-15T09:20:00Z",
  },
  {
    id: "kn_doc_005",
    name: "Billing & Payment Guidelines",
    type: "PDF",
    source: "billing-guidelines-draft.docx",
    status: "Failed",
    assignedAgents: [],
    createdAt: "2026-11-15T16:00:00Z",
  },
];

export async function getWorkspaceKnowledge(
  workspaceId: string
): Promise<KnowledgeItem[]> {
  // TODO: Replace with actual backend API call (e.g. GET /api/workspaces/${workspaceId}/knowledge)
  return MOCK_KNOWLEDGE_ITEMS;
}

export async function deleteWorkspaceKnowledge(
  workspaceId: string,
  itemId: string
): Promise<void> {
  // TODO: Replace with actual backend API call (e.g. DELETE /api/workspaces/${workspaceId}/knowledge/${itemId})
  return Promise.resolve();
}

export async function retryKnowledgeProcessing(
  workspaceId: string,
  itemId: string
): Promise<void> {
  // TODO: Replace with actual backend API call or WebSocket trigger (e.g. POST /api/workspaces/${workspaceId}/knowledge/${itemId}/retry)
  return Promise.resolve();
}
