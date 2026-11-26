import type {
  KnowledgeItem,
  KnowledgeStatus,
  KnowledgeType,
  AssignedAgent,
} from './types';

export function normalizeKnowledgeStatus(raw?: string | null): KnowledgeStatus {
  if (!raw) return 'Ready';
  const s = raw.toLowerCase().trim();
  if (['ready', 'indexed', 'available', 'active'].includes(s)) {
    return 'Ready';
  }
  if (['processing', 'syncing', 'pending', 'in_progress'].includes(s)) {
    return 'Processing';
  }
  if (['failed', 'unavailable', 'error'].includes(s)) {
    return 'Failed';
  }
  return 'Ready';
}

export function normalizeKnowledgeType(raw?: string | null): KnowledgeType {
  if (!raw) return 'PDF';
  const t = raw.toUpperCase().trim();
  if (t === 'PDF') return 'PDF';
  if (t === 'DOCX' || t === 'DOC') return 'DOCX';
  if (t === 'TXT' || t === 'TEXT') return 'TXT';
  if (t === 'URL' || t === 'WEBSITE' || t === 'WEB' || t === 'LINK') return 'URL';
  return 'PDF';
}

export function formatKnowledgeDate(dateStr?: string | null): string {
  if (!dateStr) return '';
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) {
    return dateStr;
  }
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Sanitizes raw backend or technical errors into user-friendly, actionable UI messages.
 * Prevents internal pipeline jargon (e.g. OCR, vectorization, stack traces) from leaking to end users.
 */
export function formatKnowledgeErrorMessage(rawError?: string | null): string {
  const fallback = 'Processing failed. Please retry or check your source.';
  if (!rawError) return fallback;

  const lower = rawError.toLowerCase().trim();

  // Ingestion / Vectorization / Pipeline internals
  if (
    lower.includes('ocr') ||
    lower.includes('vector') ||
    lower.includes('ingestion') ||
    lower.includes('pipeline')
  ) {
    return "We couldn't process this source. Please try again or upload a different file.";
  }

  // Timeouts
  if (lower.includes('timeout') || lower.includes('timed out')) {
    return 'Processing took longer than expected. Please try again in a few moments.';
  }

  // Connectivity / Upstream issues
  if (
    lower.includes('network') ||
    lower.includes('connection') ||
    lower.includes('upstream') ||
    lower.includes('503')
  ) {
    return 'Unable to connect to the processing service. Please try again shortly.';
  }

  // File parsing / corruption
  if (
    lower.includes('corrupt') ||
    lower.includes('unreadable') ||
    lower.includes('parse') ||
    lower.includes('invalid format')
  ) {
    return 'The document could not be read. Please check the file format and try uploading again.';
  }

  // Payload size
  if (
    lower.includes('size') ||
    lower.includes('10mb') ||
    lower.includes('413') ||
    lower.includes('payload too large')
  ) {
    return 'This document exceeds the 10MB limit. Please upload a smaller file.';
  }

  // Duplicate conflicts
  if (
    lower.includes('duplicate') ||
    lower.includes('409') ||
    lower.includes('already exists')
  ) {
    return 'A knowledge source with this name or URL already exists in this workspace.';
  }

  // Code or stack trace heuristics
  if (
    /[{}<>\\]|stack\s*trace|exception|error:|internal\s*server/i.test(rawError)
  ) {
    return fallback;
  }

  return rawError.trim();
}

export function normalizeAssignedAgents(
  agents?: Array<string | AssignedAgent> | null
): AssignedAgent[] {
  if (!agents || !Array.isArray(agents)) return [];
  return agents.map((agent, index) => {
    if (typeof agent === 'string') {
      return {
        id: `agent_${index}_${agent.toLowerCase().replace(/\s+/g, '_')}`,
        name: agent,
      };
    }
    return agent;
  });
}

export function mapDtoToKnowledgeItem(
  dto: Partial<KnowledgeItem> & { assignedAgents?: Array<string | AssignedAgent> },
  workspaceId: string
): KnowledgeItem {
  const normalizedType = normalizeKnowledgeType(dto.type);
  const normalizedStatus = normalizeKnowledgeStatus(dto.status);
  const source = dto.source || dto.name || 'Untitled Source';
  const isWebUrl = /^https?:\/\//i.test(source);

  return {
    id: dto.id || `kn_${Date.now()}`,
    workspaceId: dto.workspaceId || workspaceId,
    name: dto.name || 'Untitled Source',
    type: normalizedType,
    source,
    openUrl: dto.openUrl || (isWebUrl ? source : undefined),
    status: normalizedStatus,
    assignedAgents: normalizeAssignedAgents(dto.assignedAgents),
    errorMessage: dto.errorMessage,
    createdAt: dto.createdAt || new Date().toISOString(),
    updatedAt: dto.updatedAt || new Date().toISOString(),
  };
}
