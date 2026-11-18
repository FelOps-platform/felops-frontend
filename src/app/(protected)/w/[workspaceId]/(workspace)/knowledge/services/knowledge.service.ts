import type {
  KnowledgeItem,
  CreateKnowledgeInput,
} from "../types/knowledge.types";

export type { KnowledgeItem, CreateKnowledgeInput };

// ---------------------------------------------------------------------------
// Mock Data Simulating Backend Workspace Knowledge Items
// Valid URLs and sample dummy PDF links for preview & interaction
// ---------------------------------------------------------------------------

const DUMMY_PDF_URL =
  "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

export const MOCK_KNOWLEDGE_ITEMS: KnowledgeItem[] = [
  {
    id: "kn_doc_001",
    name: "Customer Refund Policy",
    type: "PDF",
    source: DUMMY_PDF_URL,
    status: "Ready",
    assignedAgents: ["Customer Support", "Billing Assistant"],
    createdAt: "2026-11-10T08:30:00Z",
  },
  {
    id: "kn_web_002",
    name: "Product Documentation",
    type: "Website",
    source: "https://docs.felops.com",
    status: "Ready",
    assignedAgents: ["Developer Assistant", "Technical Support", "Docs Bot"],
    createdAt: "2026-11-12T11:45:00Z",
  },
  {
    id: "kn_faq_003",
    name: "Support Q&A Database",
    type: "PDF",
    source: DUMMY_PDF_URL,
    status: "Processing",
    assignedAgents: [],
    createdAt: "2026-11-14T14:15:00Z",
  },
  {
    id: "kn_db_004",
    name: "Enterprise SLA Agreements",
    type: "Website",
    source: "https://notion.so/felops-enterprise-sla",
    status: "Ready",
    assignedAgents: ["Enterprise Sales", "Legal Assistant"],
    createdAt: "2026-11-15T09:20:00Z",
  },
  {
    id: "kn_doc_005",
    name: "Billing & Payment Guidelines",
    type: "PDF",
    source: DUMMY_PDF_URL,
    status: "Failed",
    assignedAgents: [],
    createdAt: "2026-11-15T16:00:00Z",
  },
];

// ---------------------------------------------------------------------------
// Service Functions & Backend Integration Points
// ---------------------------------------------------------------------------

/**
 * Fetch knowledge sources for a specific workspace.
 * TODO (Backend Integration):
 * 1. Replace with actual HTTP client call: GET /api/workspaces/${workspaceId}/knowledge
 * 2. Handle unauthorized (401/403) and not found (404) states.
 * 3. Validate response data shape using Zod or runtime guards.
 */
export async function getWorkspaceKnowledge(
  workspaceId: string
): Promise<KnowledgeItem[]> {
  return MOCK_KNOWLEDGE_ITEMS;
}

/**
 * Remove a knowledge item from a workspace.
 * TODO (Backend Integration):
 * 1. Call DELETE /api/workspaces/${workspaceId}/knowledge/${itemId}
 * 2. Ensure server invalidates indexing cache for assigned agents.
 */
export async function deleteWorkspaceKnowledge(
  workspaceId: string,
  itemId: string
): Promise<void> {
  return Promise.resolve();
}

/**
 * Retry processing an unavailable or failed knowledge item.
 * TODO (Backend Integration):
 * 1. Call POST /api/workspaces/${workspaceId}/knowledge/${itemId}/retry
 * 2. Server re-queues document ingestion/vectorization job.
 * 3. Set up WebSocket/SSE subscription or polling to receive status updates.
 */
export async function retryKnowledgeProcessing(
  workspaceId: string,
  itemId: string
): Promise<void> {
  return Promise.resolve();
}

/**
 * Create a new knowledge source in a workspace.
 * TODO (Backend Integration):
 * 1. Call POST /api/workspaces/${workspaceId}/knowledge
 * 2. Send multipart/form-data if file is present, or JSON payload for website URL.
 * 3. Return newly created KnowledgeItem.
 */
export async function createWorkspaceKnowledge(
  workspaceId: string,
  input: CreateKnowledgeInput
): Promise<KnowledgeItem> {
  const newItem: KnowledgeItem = {
    id: `kn_${Date.now()}`,
    name: input.name,
    type: input.type,
    source: input.source,
    status: "Processing",
    assignedAgents: [],
    createdAt: new Date().toISOString(),
  };

  MOCK_KNOWLEDGE_ITEMS.unshift(newItem);
  return newItem;
}
