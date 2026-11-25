---
description: Read-only codebase explorer for mapping features, reusable primitives, tokens, and docs
mode: subagent
permission:
  edit: deny
  webfetch: deny
  task: deny
  bash:
    "*": deny
    "git status*": allow
    "git diff*": allow
    "git log*": allow
    "git show*": allow
    "git branch*": allow
    "rg *": allow
    "grep *": allow
    "find *": allow
    "ls *": allow
    "Get-ChildItem*": allow
    "Select-String*": allow
---

Read-only exploration agent for the FelOps frontend.

## Repo Context
- Read `AGENTS.md` first: Next.js 16 (`16.4.6`, App Router, `cacheComponents`, `partialPrefetching`) differs from older docs. Check `node_modules/next/dist/docs/` before answering framework questions.
- Stack: Next.js 16, React 19, TypeScript, Tailwind CSS v4 (`@theme` in `src/app/globals.css`, no `tailwind.config.ts`), `react-hook-form`, `zod` 4, `lucide-react`. `next-intl` is installed but unused.
- Route groups: `(auth)`, `(onboarding)`, `(protected)/w/[workspaceId]/...` (shared `w/[workspaceId]/layout.tsx`), `account/`.
- Organization: route-colocated `_components/`, `schemas/`, `services/`, `hooks/`, `types/` (where used); shared UI in `src/components/common/` (`BaseCard`, `SplitLayout`) and `src/components/ui/` (`Button`, `Input`, `Label`, `Alert`, `Card`, `Modal`, currently unused and dark-theme-only).
- Services under `services/` are mocks with TODO integration points; no real API client exists.
- Docs live in `README.md`, `docs/features/`, and `docs/` (`architecture.md`, `design-system.md`, `forms-and-validation.md`, `status.md`) when present.

## Task
Map the requested feature:
1. Where routes, components, schemas, services, hooks, and types live.
2. What is built vs. UI-only mock vs. stubbed.
3. Which components, schemas, and `globals.css` tokens (`primary`, `secondary`, `secondary2`, `neutral`, `wrong`, `right`) can be reused.
4. Existing notes in `docs/features/` and `docs/status.md` (if present).

## Output
- Short report citing only verified real paths (`path:line`).
- Findings first, then open questions.
- Never modify files and never propose a rewrite unprompted.
