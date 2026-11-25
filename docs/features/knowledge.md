# Knowledge Base Management

Status: Draft

## Goal and Non-Goals
- **Goal**:
  - Establish a clean, shared domain architecture for Knowledge Base operations (`src/features/knowledge/`) shared between the Knowledge dashboard (`/w/[workspaceId]/knowledge`), the Add Knowledge wizard (`/w/[workspaceId]/knowledge/new`), and the Agent creation wizard (`KnowledgeStep`).
  - Align frontend data structures and operations with the backend REST API contract (`/workspaces/{workspace_id}/knowledge`, async 202 ingestion, query filtering, and typed errors).
  - Modernize wizard forms using `react-hook-form` and `@hookform/resolvers/zod` with a discriminated union on `sourceType` (supporting PDF, DOCX, TXT files `<= 10MB`, and normalized URLs).
  - Provide complete UI states (loading skeleton, empty CTA, error with retry, success), optimistic rollbacks, toast notifications, accessible keyboard navigation, portal-based action menus, and conditional 3–5s polling for background ingestion.
  - Extend shared UI primitives (`Button`, `Input`, `Modal`) with clean light-surface tokens (`surface="light"`), eliminating raw hex and arbitrary styles.
- **Non-Goals**:
  - Implementing actual backend API routes or server-side database storage (frontend service retains a workspace-scoped mock store with TODO integration points).
  - In-browser document chunk editing or full-text vector viewer.
  - Modifying unrelated workspace routes, sidebars, or schemas.

## Routes and Files Touched
- **Route(s)**:
  - `/w/[workspaceId]/knowledge`: Main knowledge table, category filter toolbar, action modals.
  - `/w/[workspaceId]/knowledge/new`: Multi-step Add Knowledge wizard.
  - `/w/[workspaceId]/agents/new`: Agent wizard (`KnowledgeStep`) referencing shared knowledge domain.
- **Files**:
  - *Domain Layer (`src/features/knowledge/`)*:
    - `src/features/knowledge/types.ts`: Strict unions (`KnowledgeStatus`, `KnowledgeType`), models (`KnowledgeItem`, `AssignedAgent`), error types, and query params.
    - `src/features/knowledge/schema.ts`: Zod validation schemas for forms, source types, and filters.
    - `src/features/knowledge/mappers.ts`: DTO-to-domain normalization and status/type mappers.
    - `src/features/knowledge/service.ts`: Workspace-scoped private mock store, immutable copies, async 202 simulation, and typed errors.
    - `src/features/knowledge/index.ts`: Public barrel exports for feature consumption.
  - *Shared UI Primitives (`src/components/`)*:
    - `src/components/common/wizard-shell.tsx`: Reusable wizard container with back button, step heading, and subtitle.
    - `src/components/common/stepper-progress.tsx`: Reusable stepper progress component.
    - `src/components/ui/button.tsx`: Extended with `surface="light" | "dark"`.
    - `src/components/ui/input.tsx`: Extended with `surface="light" | "dark"`.
    - `src/components/ui/modal.tsx`: Extended with `surface="light" | "dark"`.
  - *Route UI & Components (`src/app/(protected)/w/[workspaceId]/(workspace)/knowledge/`)*:
    - `page.tsx`: Server component awaiting `params` and passing `workspaceId`.
    - `_components/knowledge-view.tsx`: Root view orchestrating query, polling, toast feedback, and UI states.
    - `_components/knowledge-table.tsx`: Accessible table with portal-based menus and safe row links.
    - `_components/knowledge-toolbar.tsx`: Search and category filter controls.
    - `_components/KnowledgeActionModal.tsx`: Availability details & remove confirmation dialogs.
    - `_components/knowledge-ui.tsx`: Pure presentation helpers (`getTypeIcon`, `getAvailabilityBadge`, `formatDate`).
    - `hooks/use-knowledge-filters.ts`: Search, category, and debounced query state.
    - `hooks/use-knowledge-modal.ts`: Discriminated union modal manager (`{ status: 'closed' | 'availability' | 'remove'; itemId?: string }`).
    - `hooks/use-knowledge-polling.ts`: 3–5s conditional polling paused on document visibility change.
    - `new/page.tsx`: Server page for wizard.
    - `_components/add-knowledge/add-knowledge-form.tsx`: RHF + Zod wizard with discriminated union.
    - `_components/add-knowledge/knowledge-form-footer.tsx`: Standardized footer with cancel and continue/submit actions.
    - `_components/add-knowledge/knowledge-stepper.tsx`: Migrated to shared `StepperProgress`.
  - *Cross-Feature Consumers*:
    - `src/app/(protected)/w/[workspaceId]/agents/_components/steps/KnowledgeStep.tsx`: Updated to consume `src/features/knowledge`.

## UI States
- **Loading**:
  - Knowledge table: 4 full-width skeleton placeholder rows (`animate-pulse`) with matching column widths during initial load or filter re-queries.
  - Add wizard: Submit button shows loading spinner (`Loader2`) and disabled state when `formState.isSubmitting` is true.
  - Action modal: Retry button displays spinning `RotateCw` during retry submission; Remove button displays "Removing..." when action is in flight.
- **Empty**:
  - No workspace items: Centered illustration/icon (`Database`), "No Knowledge Sources Found", explanatory copy, and "Add Knowledge Source" primary CTA button.
  - Filter/search zero results: `Search` icon, "No knowledge sources found", helpful explanation, and "Reset filters" button that clears query and category.
- **Error**:
  - Fetch failure: Dedicated error banner with retry trigger.
  - Mutation failure: Optimistic state rollback on delete or retry failure, paired with an informative toast notification.
  - Wizard form errors: Inline field-level error messages in `text-wrong-500` under inputs, plus toast on server/mock rejection (`409 DUPLICATE_SOURCE` displaying existing source name & status, `413 PAYLOAD_TOO_LARGE`, `422 VALIDATION_ERROR`, `503 UPSTREAM_UNAVAILABLE`).
- **Success**:
  - Knowledge table: Displays items sorted newest first, showing source type icon, name, source label / preview link, type badge, availability badge, formatted date, and action menu.
  - Add wizard: Displays completed steps, redirects to `/w/[workspaceId]/knowledge`, shows success toast, and lists the new source in `Processing` state.

## Data and Types

### Backend API Contract
- `GET /workspaces/{workspace_id}/knowledge?page=1&limit=20&search=&type=&status=`
  - Returns paginated list sorted newest first (`createdAt: desc`).
- `POST /workspaces/{workspace_id}/knowledge`
  - Creates source, returns HTTP `202 Accepted` with initial status `Processing`.
- `POST /workspaces/{workspace_id}/knowledge/{source_id}/retry`
  - Re-triggers processing for a failed source, returns HTTP `200 OK` or `202 Accepted` with status reset to `Processing`.
- `DELETE /workspaces/{workspace_id}/knowledge/{source_id}`
  - Deletes source and invalidates agent indexing, returns HTTP `204 No Content`.

### TypeScript Domain Models (`src/features/knowledge/types.ts`)
```ts
export type KnowledgeStatus = 'Ready' | 'Processing' | 'Failed';

export type KnowledgeType = 'PDF' | 'DOCX' | 'TXT' | 'URL';

export interface AssignedAgent {
  id: string;
  name: string;
}

export interface KnowledgeItem {
  id: string;
  workspaceId: string;
  name: string;
  type: KnowledgeType;
  source: string;          // Display label (e.g. filename or cleaned domain)
  openUrl?: string;        // Optional verified web URL or preview URL; omitted for uploaded files
  status: KnowledgeStatus;
  assignedAgents: AssignedAgent[];
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
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

export type KnowledgeErrorCode =
  | 'DUPLICATE_SOURCE'
  | 'VALIDATION_ERROR'
  | 'PAYLOAD_TOO_LARGE'
  | 'UPSTREAM_UNAVAILABLE'
  | 'NOT_FOUND';

export interface KnowledgeApiError {
  code: KnowledgeErrorCode;
  message: string;
  status: number;
  details?: {
    existingSourceId?: string;
    existingName?: string;
    existingStatus?: KnowledgeStatus;
  };
}
```

### Mock Service Architecture (`src/features/knowledge/service.ts`)
- **Scoped Store**: Private in-memory store keyed by `workspaceId` (preventing state collision across workspaces).
- **Immutability**: All read methods return deep immutable clones (`structuredClone`) so UI consumers cannot mutate internal store state.
- **Query Support**: Supports in-memory filtering for `search` (case-insensitive substring on name and source), `type`, and `status`, sorted newest first.
- **Typed Error Throwing**: Throws typed `KnowledgeApiError` instances matching backend specifications:
  - `409 DUPLICATE_SOURCE` with existing item metadata if a matching URL or filename already exists.
  - `413 PAYLOAD_TOO_LARGE` if file size exceeds 10MB.
  - `422 VALIDATION_ERROR` for malformed input payloads.
  - `503 UPSTREAM_UNAVAILABLE` when website URL resolution fails.

## Form and Validation

### Schema (`src/features/knowledge/schema.ts`)
```ts
import { z } from 'zod';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
] as const;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

const fileSourceSchema = z.object({
  sourceType: z.literal('file'),
  file: z
    .custom<File>((val) => typeof window !== 'undefined' && val instanceof File, 'File is required')
    .refine((f) => ALLOWED_MIME_TYPES.includes(f.type as any), 'Supported file types: PDF, DOCX, TXT')
    .refine((f) => f.size <= MAX_FILE_SIZE, 'File size must not exceed 10MB'),
  name: z.string().trim().min(1, 'Source name is required').max(100, 'Name must be 100 characters or fewer'),
  description: z.string().trim().max(500, 'Description must be 500 characters or fewer').optional(),
});

const websiteSourceSchema = z.object({
  sourceType: z.literal('website'),
  url: z
    .string()
    .trim()
    .min(1, 'Website URL is required')
    .transform(normalizeUrl)
    .pipe(z.string().url('Please enter a valid website URL (e.g. https://example.com)')),
  name: z.string().trim().min(1, 'Source name is required').max(100, 'Name must be 100 characters or fewer'),
  description: z.string().trim().max(500, 'Description must be 500 characters or fewer').optional(),
});

export const addKnowledgeSchema = z.discriminatedUnion('sourceType', [
  fileSourceSchema,
  websiteSourceSchema,
]);

export type AddKnowledgeFormData = z.infer<typeof addKnowledgeSchema>;
```

### Form Handling Rules
- **Form Engine**: `react-hook-form` with `@hookform/resolvers/zod` and `addKnowledgeSchema`.
- **Validation Mode**: `mode: 'onChange'` with step-based validation triggers:
  - Step 1: `trigger(['sourceType'])`
  - Step 2: `trigger(sourceType === 'file' ? ['file'] : ['url'])`
  - Step 3: `trigger(['name', 'description'])`
- **Auto-Fill & Reset Logic**:
  - When transitioning from Step 2 to Step 3, auto-fill `name` if currently blank (stripping extension from files, or deriving host from website URL).
  - Reset auto-filled name if the user navigates back to Step 1 and changes `sourceType` to prevent mismatched names.
- **Drag-and-Drop Enforcement**:
  - Dropzone validates `File` type and `<= 10MB` limit immediately on drop, setting the form value and triggering instant field validation.

## Components

### Reused UI Components
- `src/components/ui/button.tsx`: Extended with `surface="light" | "dark"`, using `globals.css` neutral and secondary tokens.
- `src/components/ui/input.tsx`: Extended with `surface="light" | "dark"`.
- `src/components/ui/modal.tsx`: Extended with `surface="light" | "dark"`, removing arbitrary styles.
- `src/components/common/wizard-shell.tsx`: Extracted shared layout with back navigation and responsive headers.
- `src/components/common/stepper-progress.tsx`: Extracted shared horizontal step progress indicator.

### Colocated Knowledge Components
- `src/app/(protected)/w/[workspaceId]/(workspace)/knowledge/_components/knowledge-view.tsx`: Root view orchestrating query, polling, toast feedback, and UI states.
- `src/app/(protected)/w/[workspaceId]/(workspace)/knowledge/_components/knowledge-table.tsx`: Semantic table with portal-based menus and safe row links.
- `src/app/(protected)/w/[workspaceId]/(workspace)/knowledge/_components/knowledge-toolbar.tsx`: Search and category filter controls.
- `src/app/(protected)/w/[workspaceId]/(workspace)/knowledge/_components/KnowledgeActionModal.tsx`: Availability details & remove confirmation dialogs.
- `src/app/(protected)/w/[workspaceId]/(workspace)/knowledge/_components/knowledge-ui.tsx`: Pure presentation helpers (`getTypeIcon`, `getAvailabilityBadge`, `formatDate`).

### Hooks & State Management
- `src/app/(protected)/w/[workspaceId]/(workspace)/knowledge/hooks/use-knowledge-filters.ts`: Encapsulates search query, category selection, and debounced query params.
- `src/app/(protected)/w/[workspaceId]/(workspace)/knowledge/hooks/use-knowledge-modal.ts`: Manages discriminated union modal state `{ status: 'closed' | 'availability' | 'remove'; itemId?: string }`.
- `src/app/(protected)/w/[workspaceId]/(workspace)/knowledge/hooks/use-knowledge-polling.ts`: Polls every 3–5s while any item is `Processing`, pausing when document visibility is hidden.

## Accessibility Notes
- **Semantic Labels & Controls**:
  - Every form input and textarea has an explicit `<label htmlFor="...">` matching `<input id="...">`.
  - Source type selector in Step 1 implemented as an accessible radio group (`role="radiogroup"`, `role="radio"`, `aria-checked`, with arrow key support).
  - Drag-and-drop zone is keyboard focusable (`tabIndex={0}`, responds to `Enter` and `Space` to open file dialog), with visual drag-over state indicator and `aria-live="polite"` feedback.
- **Table Navigation & Row Actions**:
  - Row navigation uses real `<a>` tag on source title when `openUrl` exists and status is `Ready`.
  - Row click handler verifies `e.target === e.currentTarget` to ensure clicking inner buttons, badges, or menus does not trigger row navigation.
  - Disable link opening when `openUrl` is missing or status is `Processing`/`Failed`.
  - Action menu dropdown is rendered via Portal/Popover to eliminate clipping caused by container `overflow-hidden`.
  - Action menu implements full ARIA menu semantics (`aria-haspopup="menu"`, `aria-expanded`, `role="menu"`, `role="menuitem"`), `Escape` key dismissal, and returns focus to trigger button.
- **Design Tokens & Contrast**:
  - All colors strictly use tokens from `src/app/globals.css` (`@theme`).
  - No raw hex values (`#fff`, `#000`, etc.), `bg-white`, or `text-white` on light surfaces; replaced with semantic tokens (`bg-neutral-50`, `border-neutral-200`, `text-neutral-900`, `text-secondary-500`).
  - All text on `neutral-50` cards meets WCAG AA contrast ratio (>= 4.5:1 for body, >= 3:1 for large text).
  - No `console.log` statements in production code.

## Acceptance Criteria

### Phase 1 (PR #2): Domain Layer & UI Primitives
- [x] Create domain directory `src/features/knowledge/` with `types.ts`, `schema.ts`, `service.ts`, `mappers.ts`, and `index.ts`.
- [x] Implement strict union types `KnowledgeStatus` (`'Ready' | 'Processing' | 'Failed'`) and `KnowledgeType` (`'PDF' | 'DOCX' | 'TXT' | 'URL'`) in `types.ts`.
- [x] Implement `KnowledgeItem` with separated `source` label and optional `openUrl`, and `assignedAgents` as `{ id: string; name: string }[]`.
- [x] Refactor mock service to a private, workspace-scoped store returning immutable deep copies, supporting query parameters, and throwing typed errors (409, 413, 422, 503, 404).
- [x] Extend `src/components/ui/button.tsx`, `input.tsx`, and `modal.tsx` with `surface="light" | "dark"` using `globals.css` tokens only.
- [x] Extract shared `WizardShell` and `StepperProgress` components to `src/components/common/`.
- [x] Update `src/app/(protected)/w/[workspaceId]/agents/_components/steps/KnowledgeStep.tsx` to consume `src/features/knowledge`.

### Phase 2 (PR #3): Table A11y, States & Error Handling
- [x] Split `use-knowledge-table.tsx` into `knowledge-ui.tsx`, `use-knowledge-filters.ts`, and `use-knowledge-modal.ts`.
- [x] Refactor modal state to a discriminated union `{ status: 'closed' | 'availability' | 'remove'; itemId?: string }`.
- [x] Render action dropdown menus via portal/popover, resolving table container `overflow-hidden` clipping.
- [x] Implement accessible keyboard navigation for action menu (`Escape` to close, arrow keys, focus return) and ARIA attributes (`role="menu"`, `role="menuitem"`).
- [x] Fix row click behavior: prevent opening when clicking inner elements (`e.target === e.currentTarget`), use real `<a>` for title, and disable opening when `openUrl` is missing or status is `Processing`/`Failed`.
- [x] Implement all 4 UI states in `knowledge-view.tsx` (Loading skeleton, Empty CTA, Error with retry, Success).
- [x] Implement optimistic rollbacks with toast notifications on delete and retry failures.
- [x] Update `KnowledgeActionModal` to show affected `assignedAgents` in remove mode and richer error details in availability mode.

### Phase 3 (PR #4): Wizard RHF/Zod & Polling
- [ ] Refactor `add-knowledge-form.tsx` to use `react-hook-form` and `@hookform/resolvers/zod` with `addKnowledgeSchema` discriminated union.
- [ ] Validate file upload MIME types (`application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `text/plain`) and `<= 10MB` size limit for both file picker and drag-and-drop.
- [ ] Validate and normalize website URLs with shared `normalizeUrl()` and `z.string().url()`.
- [ ] Implement step-based field array validation with `trigger(fields)` and disabled submit on `formState.isSubmitting`.
- [ ] Auto-fill source name on Step 2 -> 3 transition and reset auto-filled name when toggling `sourceType` in Step 1.
- [ ] Implement accessible radio group for Step 1 source type selection cards.
- [ ] Make dropzone keyboard-focusable (`tabIndex={0}`, `Enter`/`Space`) with visual drag-over state indicator.
- [ ] Implement `use-knowledge-polling.ts` to poll every 3–5s while items are `Processing`, pausing when tab is hidden.
- [ ] Implement toast feedback for `409 DUPLICATE_SOURCE` errors showing existing source name and status.
- [ ] Remove all hardcoded hex values, arbitrary classes, unused animations, and `console.log` calls across all knowledge components.
