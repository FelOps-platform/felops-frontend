# Architecture

Routing, shells, component patterns, and mock service architecture across the FelOps frontend.

## Route Groups

- `src/app/(auth)`: Unauthenticated entry flows (sign-in, sign-up, password recovery).
- `src/app/(onboarding)`: Workspace discovery and creation screens prior to workspace entry.
- `src/app/(protected)/w/[workspaceId]`: Main multi-tenant application shell scoped to a workspace ID.
- `src/app/account`: User settings (profile, billing) outside the workspace application shell.

```text
src/app/
├── (auth)/
│   ├── forgot-password/
│   ├── invite/[token]/
│   ├── reset-password/ (and [token]/)
│   ├── sign-in/
│   └── sign-up/
├── (onboarding)/
│   └── workspaces/ (and new/)
├── (protected)/w/[workspaceId]/
│   ├── (workspace)/
│   │   ├── audit-trail/
│   │   ├── conversations/
│   │   ├── integrations/
│   │   ├── knowledge/ (and new/)
│   │   ├── policies/
│   │   ├── settings/
│   │   └── page.tsx (Dashboard)
│   └── agents/
│       ├── (hub)/ (list and new/)
│       └── [agentId]/ (overview and edit/)
└── account/
    ├── billing/
    └── profile/
```

## Layouts

- **Auth & Onboarding Shell**: Pages in `(auth)` and `(onboarding)` share `SplitLayout` and `BaseCard` (`src/components/common/`), rendering a branded dark side banner alongside centered form cards.
- **Workspace Shell**: `src/app/(protected)/w/[workspaceId]/layout.tsx` wraps all workspace pages inside `AppFrame` (`_components/app-frame.tsx`) with `WorkspaceDynamicSidebar` (`_components/workspace-dynamic-sidebar.tsx`).
- **Dynamic Sidebar Switching**: `WorkspaceDynamicSidebar` inspects `pathname` via regex:
  ```text
  ^/w/${workspaceId}/agents/([^/]+)(?:/.*)?$
  ```
  If the route targets an agent detail route and the ID is not `"new"`, it swaps the sidebar to `AgentSidebar`. Otherwise, it renders `WorkspaceSidebar`.

## Folder Conventions

- **Colocated route modules**: Place `_components/`, `schemas/`, `services/`, `hooks/`, and `types/` directly alongside the route directories that consume them (e.g., `knowledge/_components/`, `agents/services/`).
- **Shared application code**:
  - `src/components/ui/`: Base UI primitives.
  - `src/components/common/`: Common structural layout components (`BaseCard`, `SplitLayout`).
  - `src/data/`: Centralized mock fixtures (`mock-workspaces.ts`).
  - `src/lib/`: Reusable validation utilities and helpers (`lib/validation/password.ts`).
  - `src/types/`: Global domain TypeScript interfaces (`types/workspace.ts`).

## Page Pattern

Server `page.tsx` files await dynamic route `params` inside a `<Suspense>` boundary before passing data to client view components:

```tsx
interface KnowledgePageProps {
  params: Promise<{ workspaceId: string }>;
}

async function KnowledgeContent({ params }: KnowledgePageProps) {
  const { workspaceId } = await params;
  return <KnowledgeView workspaceId={workspaceId} />;
}

export default function KnowledgePage({ params }: KnowledgePageProps) {
  return (
    <Suspense fallback={<div className="space-y-6 max-w-6xl animate-pulse" />}>
      <KnowledgeContent params={params} />
    </Suspense>
  );
}
```

## Data Layer Today

All service files currently return mock data with inline TODO markers for backend integration:
- `knowledge.service.ts`: Returns `MOCK_KNOWLEDGE_ITEMS` array. Integration targets: `GET`, `POST`, `DELETE`, and retry endpoints on `/api/workspaces/${workspaceId}/knowledge`.
- `actions.service.ts`: Returns `MOCK_WORKSPACE_ACTIONS` (Slack, HubSpot, GitHub, Linear, Stripe). Integration target: fetch available integrations for workspace.
- `data/mock-workspaces.ts`: Provides `mockWorkspaces` fixture and `getWorkspaceInitials` helper.
- `auth.service.ts`: Empty placeholder file.

## Real vs Stubbed Implementation

| Route / Surface | Path | Implementation State |
| :--- | :--- | :--- |
| Sign In | `(auth)/sign-in` | UI only (mock submit) |
| Sign Up | `(auth)/sign-up` | UI only (mock submit + OTP modal) |
| Forgot Password | `(auth)/forgot-password` | UI only (mock submit + OTP modal) |
| Reset Password | `(auth)/reset-password` | UI only (mock submit + redirect) |
| Reset Password (Token) | `(auth)/reset-password/[token]` | Stub (static link) |
| Invite Accept | `(auth)/invite/[token]` | Stub (static link) |
| Workspace Picker | `(onboarding)/workspaces` | UI only (mock workspaces) |
| Workspace Create | `(onboarding)/workspaces/new` | UI only (slug generator) |
| App Frame & Sidebar | `w/[workspaceId]/layout.tsx` | Built (dynamic sidebar switcher) |
| Dashboard | `w/[workspaceId]/(workspace)` | Stub (header only) |
| Agents Hub | `w/[workspaceId]/agents/(hub)` | UI only (header + create button, no list) |
| Agent Create Wizard | `w/[workspaceId]/agents/new` | UI only (4-step RHF stepper, mock submit) |
| Agent Overview | `w/[workspaceId]/agents/[agentId]` | Stub (header with typo) |
| Agent Edit | `w/[workspaceId]/agents/[agentId]/edit` | Stub (header only) |
| Knowledge Hub | `w/[workspaceId]/knowledge` | UI only (interactive table, mock service) |
| Knowledge Add Wizard | `w/[workspaceId]/knowledge/new` | UI only (3-step stepper, mock creation) |
| Integrations | `w/[workspaceId]/integrations` | Stub (header only) |
| Conversations | `w/[workspaceId]/conversations` | Stub (header only) |
| Audit Trail | `w/[workspaceId]/audit-trail` | Stub (header only) |
| Policies | `w/[workspaceId]/policies` | Stub (header only) |
| Settings | `w/[workspaceId]/settings` | Stub (header only) |
| Account Profile | `account/profile` | Stub (header only) |
| Account Billing | `account/billing` | Stub (header only) |

## Status / Known Gaps

- No authentication session guard or route middleware protects `(protected)` routes.
- Unknown `workspaceId` values render fallback text instead of triggering a 404 response.
- Missing `error.tsx` and `loading.tsx` across all nested route segments.
- Workspace switcher button in `WorkspaceSidebar` lacks an interaction handler.
- Delete and retry actions in `KnowledgeView` roll back silently on simulated failure.
- See [status.md](status.md) for the active engineering backlog.
