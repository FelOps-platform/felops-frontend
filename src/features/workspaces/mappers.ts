import { ApiError } from '@/lib/api/errors';
import {
  WorkspaceApiError,
  type Workspace,
  type WorkspaceDto,
  type WorkspaceErrorCode,
  type WorkspaceRole,
} from './types';

const WORKSPACE_ERROR_MESSAGES: Record<WorkspaceErrorCode, string> = {
  DUPLICATE_NAME:
    'A workspace with this name already exists. Please choose a different name.',
  NOT_FOUND: 'This workspace could not be found.',
  FORBIDDEN: 'You do not have permission to access this workspace.',
  NETWORK:
    'Unable to reach the workspace service. Please check your connection and try again.',
  UNKNOWN: 'Something went wrong while loading workspaces. Please try again.',
};

export function normalizeWorkspaceRole(raw?: string | null): WorkspaceRole {
  const normalized = (raw ?? '').trim().toLowerCase();
  if (normalized === 'owner') return 'Owner';
  if (normalized === 'admin') return 'Admin';
  return 'Member';
}

export function getWorkspaceInitials(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 3);

  return initials || 'WS';
}

export function mapWorkspaceDtoToWorkspace(
  dto: WorkspaceDto,
  fallbackOwnerId: string = 'usr_demo_001'
): Workspace {
  const name = (dto.name ?? '').trim() || 'Untitled Workspace';
  return {
    id: dto.id ?? `ws_${Date.now()}`,
    name,
    agentsCount: Number(dto.agentsCount ?? dto.agents_count ?? 0),
    role: normalizeWorkspaceRole(dto.role),
    ownerId: dto.ownerId ?? dto.owner_id ?? fallbackOwnerId,
    createdAt: dto.createdAt ?? dto.created_at ?? new Date().toISOString(),
  };
}

/**
 * Maps WorkspaceApiError, ApiError, and unknown thrown values into safe, sanitized UI copy.
 */
export function mapWorkspaceError(error: unknown): string {
  if (error instanceof WorkspaceApiError) {
    return (
      WORKSPACE_ERROR_MESSAGES[error.code] ?? WORKSPACE_ERROR_MESSAGES.UNKNOWN
    );
  }

  if (error instanceof ApiError) {
    if (error.status === 403) return WORKSPACE_ERROR_MESSAGES.FORBIDDEN;
    if (error.status === 404) return WORKSPACE_ERROR_MESSAGES.NOT_FOUND;
    if (error.status === 409) return WORKSPACE_ERROR_MESSAGES.DUPLICATE_NAME;
    if (error.status === 0 || error.status >= 500) {
      return WORKSPACE_ERROR_MESSAGES.NETWORK;
    }
    return WORKSPACE_ERROR_MESSAGES.UNKNOWN;
  }

  if (error instanceof Error) {
    const lower = error.message.toLowerCase();
    if (
      lower.includes('fetch') ||
      lower.includes('network') ||
      lower.includes('timeout')
    ) {
      return WORKSPACE_ERROR_MESSAGES.NETWORK;
    }
    return WORKSPACE_ERROR_MESSAGES.UNKNOWN;
  }

  return WORKSPACE_ERROR_MESSAGES.UNKNOWN;
}
