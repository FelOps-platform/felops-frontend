import { ApiError } from '@/lib/api/errors';

export type WorkspaceRole = 'Owner' | 'Admin' | 'Member';

export interface Workspace {
  id: string;
  name: string;
  agentsCount: number;
  role: WorkspaceRole;
  ownerId: string;
  createdAt: string;
}

export interface WorkspaceDto {
  id?: string;
  name?: string;
  agentsCount?: number;
  agents_count?: number;
  role?: string;
  ownerId?: string;
  owner_id?: string;
  createdAt?: string;
  created_at?: string;
}

export interface CreateWorkspaceRequest {
  name: string;
}

export type WorkspaceErrorCode =
  | 'DUPLICATE_NAME'
  | 'NOT_FOUND'
  | 'FORBIDDEN'
  | 'NETWORK'
  | 'UNKNOWN';

export class WorkspaceApiError extends ApiError<WorkspaceErrorCode> {
  constructor(
    message: string,
    code: WorkspaceErrorCode,
    status: number,
    cause?: unknown
  ) {
    super(message, code, status, cause);
    this.name = 'WorkspaceApiError';
    Object.setPrototypeOf(this, WorkspaceApiError.prototype);
  }
}
