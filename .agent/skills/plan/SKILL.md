---
name: plan
description: Read a feature spec in docs/features/ and add an ordered implementation Plan section. Trigger with /plan <feature>.
---

# Plan Feature Implementation

Read a feature spec and write an ordered, actionable implementation plan into `docs/features/<feature-slug>.md`.

## Procedure

1. Locate `docs/features/<feature-slug>.md` for the specified feature. If it does not exist, stop and instruct the user to run `/design <feature>` first.
2. Read the spec, `AGENTS.md`, and relevant guides in `node_modules/next/dist/docs/` if Next.js 16 framework conventions are involved. Verify referenced paths and tokens against the codebase.
3. Flag anything in the spec that is vague or contradicts the codebase before planning around it.
4. Add or update a `## Plan` section in `docs/features/<feature-slug>.md` containing:
   - Component tree
   - File-by-file change list with verified real paths
   - Ordered, single-concern tasks as a `- [ ]` checklist
   - Existing components, schemas, hooks, and services to reuse
   - Any design tokens needed from or to be added to `src/app/globals.css`
5. Set `Status: Planned` in the spec file. Do not edit application source code.
