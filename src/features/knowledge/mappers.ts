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
