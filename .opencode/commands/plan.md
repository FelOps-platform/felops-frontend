---
description: Read a feature spec and add an ordered implementation Plan section
agent: build
---

Create an implementation plan for: `$ARGUMENTS`.

1. Locate `docs/features/<feature-slug>.md` for `$ARGUMENTS`. If it does not exist, stop and tell the user to run `/design $ARGUMENTS`.
2. Read the spec, `AGENTS.md`, and relevant guides in `node_modules/next/dist/docs/` if Next.js framework APIs are involved. Verify referenced file paths and tokens against the repo.
3. Flag anything in the spec that is vague or contradicts the codebase before planning around it.
4. Add or update a `## Plan` section in `docs/features/<feature-slug>.md` with:
   - Component tree
   - File-by-file change list with real paths
   - Ordered, single-concern tasks as a `- [ ]` checklist
   - Existing components, schemas, hooks, and services reused
   - Any `src/app/globals.css` token additions needed
5. Set `Status: Planned` in the spec file. Do not edit application source code.
