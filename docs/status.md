# Project Status & Backlog

Engineering checklist of technical debt, architectural gaps, and unfinished stubs across FelOps.

## Security
- [ ] Remove credential and OTP `console.log` calls in `src/app/(auth)/` (`sign-in`, `sign-up`, `forgot-password`, `reset-password`).
- [ ] Replace insecure query-parameter password reset flow (`/reset-password?email=...`) with verified token validation.
- [ ] Implement authentication session guards and middleware to restrict access to `src/app/(protected)/`.
- [ ] Sanitize and cryptographically validate `invite/[token]` and `reset-password/[token]` parameters.

## Forms & Validation
- [x] Standardize authentication forms on `react-hook-form` + `@hookform/resolvers/zod` (`sign-in`, `sign-up`, `forgot-password`, `reset-password`).
- [x] Extract centralized password complexity schema into `src/lib/validation/password.ts`.
- [ ] Migrate `src/app/(onboarding)/workspaces/new/page.tsx` from manual `useState` to `react-hook-form` + Zod.
- [ ] Author a formal Zod schema for `add-knowledge-form.tsx` replacing `isValidUrl` regex.
- [ ] Enforce the 25MB file upload ceiling and restrict acceptable MIME file types during drag-and-drop.
- [ ] Wire real submission handling, error UI boundaries, and router redirection for `agent-stepper.tsx`.
- [ ] Connect `KnowledgeStep` in `agent-stepper.tsx` to workspace knowledge sources and populate `knowledgeIds`.
- [ ] Fix `ReviewStep.tsx` to display true workspace action names rather than regex-transformed IDs.
- [ ] Restrict `handleToggleSelectAll` in `ActionsStep.tsx` to only select filtered search results.
- [ ] Replace `catch (err: any)` blocks across auth with typed API error handlers.
- [ ] Add explicit `htmlFor` attributes to form labels and add `autoComplete` attributes to auth inputs.

## Design System & Styling
- [x] Migrate styling configuration from legacy `tailwind.config.ts` to native `@theme` in `src/app/globals.css`.
- [x] Configure official application vector icon (`src/app/icon.svg`) and metadata icons.
- [ ] Remove hardcoded `bg-white`, `bg-white/60`, and `text-white` classes in wizard cards and table modals.
- [ ] Refactor `src/components/ui/` primitives to support light surfaces and adopt them across app screens.
- [ ] Unify disparate modal dialogs into a single accessible compound modal primitive.
- [ ] Eliminate arbitrary Tailwind utility classes (`text-[11px]`, `rounded-[24px]`, etc.).
- [ ] Resolve low contrast on subdued labels (`text-neutral-400` / `text-secondary-400`) sitting on `bg-neutral-50`.
- [ ] Install missing Tailwind animation and scrollbar plugins or replace classes with standard CSS utilities.
- [ ] Clean up redundant `--error-200` token definitions in `src/app/globals.css`.
- [ ] Reconcile inconsistent sidebar width utilities (`w-80` fallback vs `w-70` workspace vs `w-80` agent sidebar).

## Accessibility
- [ ] Fix table rows in `knowledge-table.tsx`: remove `role="link"` wrapping interactive nested action buttons.
- [ ] Fix action dropdown clipping caused by table container `overflow-hidden` when only 1–2 rows exist.
- [ ] Add proper keyboard navigation (`Enter` / `Space`) to clickable action card containers in `ActionsStep.tsx`.
- [ ] Implement focus trapping and return-to-trigger focus management in modal components.
- [ ] Decouple OTP countdown display from the resend cooldown state in `VerifyOtpModal.tsx`.

## Data Layer & API
- [x] Centralize `Workspace` TypeScript interface into `src/types/workspace.ts`.
- [x] Consolidate duplicated workspace mock records into `src/data/mock-workspaces.ts`.
- [ ] Implement typed HTTP client and replace mock service methods in `knowledge.service.ts` and `actions.service.ts`.
- [ ] Implement `src/app/(auth)/services/auth.service.ts` for live backend authentication calls.
- [ ] Add SSE or polling updates for knowledge item processing state after retry dispatch.
- [ ] Prevent workspace slug collisions in `workspaces/new/page.tsx` when navigating to uncreated routes.
- [ ] Fix file source storage in `add-knowledge-form.tsx` to prevent broken table row preview URLs.

## Routing & Error Handling
- [x] Hoist workspace application layout to `src/app/(protected)/w/[workspaceId]/layout.tsx` with dynamic sidebar switching.
- [ ] Create `error.tsx`, `loading.tsx`, and `not-found.tsx` boundaries across all route segments.
- [ ] Handle unresolvable `workspaceId` parameters with a proper 404 view instead of fallback placeholder text.
- [ ] Handle knowledge loading failure explicitly rather than defaulting to empty state.
- [ ] Provide user feedback on failed knowledge delete or retry mutations instead of silent rollback.
- [ ] Wire interaction handler to the workspace switcher button in `WorkspaceSidebar.tsx`.

## Config & Build
- [x] Upgrade `next` and `eslint-config-next` to `16.4.6`.
- [ ] Configure `next-intl` runtime routing and dictionary loading, or remove unused dependency.
- [ ] Localize date formatting in `knowledge-table.tsx` currently hardcoded to `en-US`.
- [ ] Deduplicate wizard shell components (header, stepper, footer) shared by Agents and Knowledge wizards.

## Stubs to Build
- [ ] Implement live dashboard analytics and summary cards at `src/app/(protected)/w/[workspaceId]/(workspace)/page.tsx`.
- [ ] Implement agents list view and filter controls at `src/app/(protected)/w/[workspaceId]/agents/(hub)/page.tsx`.
- [ ] Implement agent overview and fix typo ("Agent Overveiw") at `src/app/(protected)/w/[workspaceId]/agents/[agentId]/page.tsx`.
- [ ] Implement agent configuration editor at `src/app/(protected)/w/[workspaceId]/agents/[agentId]/edit/page.tsx`.
- [ ] Implement third-party integrations hub at `src/app/(protected)/w/[workspaceId]/(workspace)/integrations/page.tsx`.
- [ ] Implement agent conversation logs at `src/app/(protected)/w/[workspaceId]/(workspace)/conversations/page.tsx`.
- [ ] Implement security audit trail logs at `src/app/(protected)/w/[workspaceId]/(workspace)/audit-trail/page.tsx`.
- [ ] Implement guardrail policy manager at `src/app/(protected)/w/[workspaceId]/(workspace)/policies/page.tsx`.
- [ ] Implement workspace settings at `src/app/(protected)/w/[workspaceId]/(workspace)/settings/page.tsx`.
- [ ] Implement user profile at `src/app/account/profile/page.tsx` and billing at `src/app/account/billing/page.tsx`.
- [ ] Implement invitation acceptance page and fix typo ("Accept invit -> /dashboeard") at `src/app/(auth)/invite/[token]/page.tsx`.

---

### How to Update This File
- Check off items (`- [x]`) as features land and PRs merge.
- Append new items as concise single-line bullets under the appropriate section when technical debt is identified.
- Move durable engineering rules and architectural patterns into the respective documentation guides (`architecture.md`, `design-system.md`, `forms-and-validation.md`).
