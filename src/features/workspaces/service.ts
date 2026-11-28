import {
  WorkspaceApiError,
  type CreateWorkspaceRequest,
  type Workspace,
  type WorkspaceDto,
  type WorkspaceErrorCode,
} from './types';
import { mapWorkspaceDtoToWorkspace } from './mappers';

const INITIAL_MOCK_WORKSPACES: WorkspaceDto[] = [
  {
    id: 'ws-ai-production',
    name: 'AI Production Hub',
    agentsCount: 8,
    role: 'Owner',
    createdAt: '2026-11-02T09:00:00Z',
  },
  {
    id: 'ws-enterprise-ops',
    name: 'Enterprise Operations',
    agentsCount: 4,
    role: 'Admin',
    createdAt: '2026-11-05T11:30:00Z',
  },
  {
    id: 'ws-customer-fleet',
    name: 'Customer Support Fleet',
    agentsCount: 12,
    role: 'Member',
    createdAt: '2026-11-08T14:15:00Z',
  },
  {
    id: 'ws-ops-sandbox',
    name: 'Operations Sandbox',
    agentsCount: 2,
    role: 'Owner',
    createdAt: '2026-11-12T16:45:00Z',
  },
];

const NETWORK_DELAY_MS = 250;

const globalForWorkspaces = globalThis as typeof globalThis & {
  __felopsWorkspaceStores?: Map<string, Workspace[]>;
};

function getWorkspaceStores(): Map<string, Workspace[]> {
  if (!globalForWorkspaces.__felopsWorkspaceStores) {
    globalForWorkspaces.__felopsWorkspaceStores = new Map<string, Workspace[]>();
  }
  return globalForWorkspaces.__felopsWorkspaceStores;
}

function getOrCreateUserStore(userId: string): Workspace[] {
  const stores = getWorkspaceStores();
  let list = stores.get(userId);
  if (!list) {
    list = INITIAL_MOCK_WORKSPACES.map((dto) =>
      mapWorkspaceDtoToWorkspace(dto, userId)
    );
    stores.set(userId, list);
  }
  return list;
}

function clone<T>(val: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(val);
  }
  return JSON.parse(JSON.stringify(val));
}

function delay(ms: number = NETWORK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function slugifyWorkspaceName(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'workspace';
}

interface WorkspaceApiErrorPayload {
  code?: WorkspaceErrorCode;
  message?: string;
}

async function requestWorkspaceApi<TResponse>(
  path: string,
  options: RequestInit
): Promise<TResponse> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...options,
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
    });
  } catch (err: unknown) {
    throw new WorkspaceApiError(
      'Unable to reach workspace service.',
      'NETWORK',
      0,
      err
    );
  }

  let payload: (TResponse & WorkspaceApiErrorPayload) | null = null;
  try {
    payload = (await response.json()) as TResponse & WorkspaceApiErrorPayload;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new WorkspaceApiError(
      payload?.message || 'Workspace request failed.',
      payload?.code ?? 'UNKNOWN',
      response.status
    );
  }

  return payload as TResponse;
}

/**
 * Retrieve all workspaces accessible to the given user.
 * TODO: Replace mock store with backend GET /workspaces integration.
 */
export async function getUserWorkspaces(userId: string): Promise<Workspace[]> {
  if (isBrowser()) {
    const data = await requestWorkspaceApi<{ workspaces: Workspace[] }>(
      '/api/workspaces',
      { method: 'GET' }
    );
    return data.workspaces;
  }

  await delay(100);
  const store = getOrCreateUserStore(userId);
  return clone(store);
}

/**
 * Retrieve a single workspace by ID, verifying that the user has membership access.
 * TODO: Replace mock store with backend GET /workspaces/:id integration.
 */
export async function getWorkspaceById(
  workspaceId: string,
  userId: string
): Promise<Workspace> {
  if (isBrowser()) {
    const data = await requestWorkspaceApi<{ workspace: Workspace }>(
      `/api/workspaces/${encodeURIComponent(workspaceId)}`,
      { method: 'GET' }
    );
    return data.workspace;
  }

  await delay(50);
  const userStore = getOrCreateUserStore(userId);
  const found = userStore.find((ws) => ws.id === workspaceId);
  if (found) {
    return clone(found);
  }

  // Check whether it belongs to a different user store to distinguish FORBIDDEN vs NOT_FOUND
  for (const [otherUserId, otherList] of getWorkspaceStores().entries()) {
    if (
      otherUserId !== userId &&
      otherList.some((ws) => ws.id === workspaceId)
    ) {
      throw new WorkspaceApiError(
        'Access to this workspace is forbidden.',
        'FORBIDDEN',
        403
      );
    }
  }

  throw new WorkspaceApiError(
    `Workspace "${workspaceId}" was not found.`,
    'NOT_FOUND',
    404
  );
}

/**
 * Create a new workspace owned by the given user with a server-generated ID.
 * Throws WorkspaceApiError('DUPLICATE_NAME') if the user already has a workspace with that name.
 * TODO: Replace mock store with backend POST /workspaces integration.
 */
export async function createWorkspace(
  userId: string,
  payload: CreateWorkspaceRequest
): Promise<Workspace> {
  if (isBrowser()) {
    const data = await requestWorkspaceApi<{ workspace: Workspace }>(
      '/api/workspaces',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
    return data.workspace;
  }

  await delay();
  const userStore = getOrCreateUserStore(userId);
  const trimmedName = payload.name.trim();

  const duplicate = userStore.find(
    (ws) => ws.name.toLowerCase() === trimmedName.toLowerCase()
  );

  if (duplicate) {
    throw new WorkspaceApiError(
      `A workspace named "${trimmedName}" already exists.`,
      'DUPLICATE_NAME',
      409
    );
  }

  const baseId = `ws-${slugifyWorkspaceName(trimmedName)}`;
  const allExistingIds = new Set<string>();
  for (const list of getWorkspaceStores().values()) {
    for (const ws of list) {
      allExistingIds.add(ws.id);
    }
  }

  const generatedId = allExistingIds.has(baseId)
    ? `${baseId}-${Date.now().toString(36)}`
    : baseId;

  const newWorkspace: Workspace = {
    id: generatedId,
    name: trimmedName,
    agentsCount: 0,
    role: 'Owner',
    ownerId: userId,
    createdAt: new Date().toISOString(),
  };

  userStore.unshift(newWorkspace);
  return clone(newWorkspace);
}
