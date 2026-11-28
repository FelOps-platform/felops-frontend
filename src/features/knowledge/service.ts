import {
  KnowledgeItem,
  CreateKnowledgeInput,
  LegacyCreateKnowledgeInput,
  KnowledgeQueryParams,
  KnowledgeApiError,
} from './types';
import { mapDtoToKnowledgeItem } from './mappers';
import { MAX_FILE_SIZE } from './schema';

const DUMMY_PDF_URL =
  'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

const INITIAL_MOCK_ITEMS: Array<Partial<KnowledgeItem>> = [
  {
    id: 'kn_doc_001',
    name: 'Customer Refund Policy',
    type: 'PDF',
    source: 'refund_policy_2026.pdf',
    openUrl: DUMMY_PDF_URL,
    status: 'Ready',
    assignedAgents: [
      { id: 'agent_1', name: 'Customer Support' },
      { id: 'agent_2', name: 'Billing Assistant' },
    ],
    createdAt: '2026-11-10T08:30:00Z',
    updatedAt: '2026-11-10T08:30:00Z',
  },
  {
    id: 'kn_web_002',
    name: 'Product Documentation',
    type: 'URL',
    source: 'docs.felops.com',
    openUrl: 'https://docs.felops.com',
    status: 'Ready',
    assignedAgents: [
      { id: 'agent_3', name: 'Developer Assistant' },
      { id: 'agent_4', name: 'Technical Support' },
      { id: 'agent_5', name: 'Docs Bot' },
    ],
    createdAt: '2026-11-12T11:45:00Z',
    updatedAt: '2026-11-12T11:45:00Z',
  },
  {
    id: 'kn_faq_003',
    name: 'Support Q&A Database',
    type: 'PDF',
    source: 'support_faq_v2.pdf',
    openUrl: DUMMY_PDF_URL,
    status: 'Processing',
    assignedAgents: [],
    createdAt: '2026-11-14T14:15:00Z',
    updatedAt: '2026-11-14T14:15:00Z',
  },
  {
    id: 'kn_db_004',
    name: 'Enterprise SLA Agreements',
    type: 'URL',
    source: 'notion.so/felops-enterprise-sla',
    openUrl: 'https://notion.so/felops-enterprise-sla',
    status: 'Ready',
    assignedAgents: [
      { id: 'agent_6', name: 'Enterprise Sales' },
      { id: 'agent_7', name: 'Legal Assistant' },
    ],
    createdAt: '2026-11-15T09:20:00Z',
    updatedAt: '2026-11-15T09:20:00Z',
  },
  {
    id: 'kn_doc_005',
    name: 'Billing & Payment Guidelines',
    type: 'PDF',
    source: 'billing_guidelines.pdf',
    status: 'Failed',
    errorMessage:
      "We couldn't process this source. Please try again or upload a different file.",
    assignedAgents: [],
    createdAt: '2026-11-15T16:00:00Z',
    updatedAt: '2026-11-15T16:00:00Z',
  },
];

// Private workspace-scoped store to avoid shared mutable state between tenants or tests
const workspaceStores = new Map<string, KnowledgeItem[]>();

function getOrCreateStore(workspaceId: string): KnowledgeItem[] {
  let store = workspaceStores.get(workspaceId);
  if (!store) {
    store = INITIAL_MOCK_ITEMS.map((item) =>
      mapDtoToKnowledgeItem(item, workspaceId)
    );
    workspaceStores.set(workspaceId, store);
  }
  return store;
}

function clone<T>(val: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(val);
  }
  return JSON.parse(JSON.stringify(val));
}

/**
 * Fetch knowledge sources for a specific workspace with optional query filtering and pagination.
 */
export async function getWorkspaceKnowledge(
  workspaceId: string,
  params?: KnowledgeQueryParams
): Promise<KnowledgeItem[]> {
  const store = getOrCreateStore(workspaceId);
  let result = [...store];

  if (params?.search) {
    const q = params.search.toLowerCase().trim();
    result = result.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.source.toLowerCase().includes(q)
    );
  }

  if (params?.type && params.type !== 'all') {
    result = result.filter((item) => item.type === params.type);
  }

  if (params?.status && params.status !== 'all') {
    result = result.filter((item) => item.status === params.status);
  }

  // Always sorted newest first
  result.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (params?.page && params?.limit) {
    const start = (params.page - 1) * params.limit;
    result = result.slice(start, start + params.limit);
  }

  return clone(result);
}

/**
 * Create a new knowledge source in a workspace. Simulates async 202 ingestion and duplicate checking.
 */
export async function createWorkspaceKnowledge(
  workspaceId: string,
  rawInput: CreateKnowledgeInput | LegacyCreateKnowledgeInput
): Promise<KnowledgeItem> {
  const store = getOrCreateStore(workspaceId);

  // Normalize input if using legacy structure
  const input: CreateKnowledgeInput =
    'kind' in rawInput
      ? rawInput
      : rawInput.file
        ? {
          kind: 'file',
          name: rawInput.name,
          file: rawInput.file,
          description: rawInput.description,
        }
        : {
          kind: 'website',
          name: rawInput.name,
          url: rawInput.source,
          description: rawInput.description,
        };

  const targetIdentifier =
    input.kind === 'file' ? input.file.name.trim() : input.url.trim();

  // 1. Duplicate check (409)
  const existing = store.find(
    (item) =>
      item.name.toLowerCase() === input.name.trim().toLowerCase() ||
      item.source.toLowerCase() === targetIdentifier.toLowerCase()
  );

  if (existing) {
    throw new KnowledgeApiError(
      `Knowledge source "${input.name}" already exists in this workspace.`,
      'DUPLICATE_SOURCE',
      409,
      {
        existingSourceId: existing.id,
        existingName: existing.name,
        existingStatus: existing.status,
      }
    );
  }

  // 2. Payload size check for files (413)
  if (input.kind === 'file' && input.file.size > MAX_FILE_SIZE) {
    throw new KnowledgeApiError(
      'File size exceeds the 10MB limit.',
      'PAYLOAD_TOO_LARGE',
      413
    );
  }

  const now = new Date().toISOString();
  let type: KnowledgeItem['type'] = 'PDF';
  let source = '';
  let openUrl: string | undefined;

  if (input.kind === 'file') {
    const ext = input.file.name.split('.').pop()?.toUpperCase();
    if (ext === 'DOCX') type = 'DOCX';
    else if (ext === 'TXT') type = 'TXT';
    else type = 'PDF';
    source = input.file.name;
  } else {
    type = 'URL';
    source = input.url.replace(/^https?:\/\//i, '').replace(/\/$/, '');
    openUrl = /^https?:\/\//i.test(input.url) ? input.url : `https://${input.url}`;
  }

  const newItem: KnowledgeItem = {
    id: `kn_${Date.now()}`,
    workspaceId,
    name: input.name.trim(),
    type,
    source,
    openUrl,
    status: 'Processing',
    assignedAgents: [],
    createdAt: now,
    updatedAt: now,
  };

  store.unshift(newItem);
  return clone(newItem);
}

/**
 * Retry processing an unavailable or failed knowledge item.
 */
export async function retryKnowledgeProcessing(
  workspaceId: string,
  itemId: string
): Promise<KnowledgeItem> {
  const store = getOrCreateStore(workspaceId);
  const item = store.find((i) => i.id === itemId);

  if (!item) {
    throw new KnowledgeApiError(
      `Knowledge item with id "${itemId}" not found.`,
      'NOT_FOUND',
      404
    );
  }

  item.status = 'Processing';
  delete item.errorMessage;
  item.updatedAt = new Date().toISOString();

  return clone(item);
}

/**
 * Remove a knowledge item from a workspace.
 */
export async function deleteWorkspaceKnowledge(
  workspaceId: string,
  itemId: string
): Promise<void> {
  const store = getOrCreateStore(workspaceId);
  const index = store.findIndex((i) => i.id === itemId);

  if (index === -1) {
    throw new KnowledgeApiError(
      `Knowledge item with id "${itemId}" not found.`,
      'NOT_FOUND',
      404
    );
  }

  store.splice(index, 1);
}
