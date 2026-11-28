import { ApiError } from '@/lib/api/errors';

export type KnowledgeStatus = 'Ready' | 'Processing' | 'Failed';

export type KnowledgeType = 'PDF' | 'DOCX' | 'TXT' | 'URL';

export type KnowledgeModalType =
  | 'unavailable'
  | 'processing'
  | 'available'
  | 'remove_confirm';

export interface AssignedAgent {
  id: string;
  name: string;
}

export interface KnowledgeItem {
  id: string;
  workspaceId: string;
  name: string;
  type: KnowledgeType;
  source: string; // Display label (e.g. filename or domain)
  openUrl?: string; // Optional verified web URL or preview URL; omitted for uploaded files
  status: KnowledgeStatus;
  assignedAgents: AssignedAgent[];
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ModalState {
  isOpen: boolean;
  type: KnowledgeModalType;
  selectedItem: KnowledgeItem | null;
}

export interface KnowledgeQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: KnowledgeType | 'all';
  status?: KnowledgeStatus | 'all';
}

export type CreateKnowledgeInput =
  | {
      kind: 'file';
      name: string;
      description?: string;
      file: File;
    }
  | {
      kind: 'website';
      name: string;
      description?: string;
      url: string;
    };

export type LegacyCreateKnowledgeInput = {
  name: string;
  type?: string;
  source: string;
  description?: string;
  file?: File;
};

export type KnowledgeErrorCode =
  | 'DUPLICATE_SOURCE'
  | 'VALIDATION_ERROR'
  | 'PAYLOAD_TOO_LARGE'
  | 'UPSTREAM_UNAVAILABLE'
  | 'NOT_FOUND';

export interface KnowledgeApiErrorDetails {
  existingSourceId?: string;
  existingName?: string;
  existingStatus?: KnowledgeStatus;
  [key: string]: unknown;
}

export class KnowledgeApiError extends ApiError<KnowledgeErrorCode> {
  readonly details?: KnowledgeApiErrorDetails;

  constructor(
    message: string,
    code: KnowledgeErrorCode,
    status: number,
    details?: KnowledgeApiErrorDetails,
    cause?: unknown
  ) {
    super(message, code, status, cause);
    this.name = 'KnowledgeApiError';
    this.details = details;
    Object.setPrototypeOf(this, KnowledgeApiError.prototype);
  }
}
