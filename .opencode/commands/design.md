---
description: Explore a feature area and create or update its spec in docs/features/
agent: build
---

Create or update the feature specification for: `$ARGUMENTS`.

1. Derive a kebab-case `<feature-slug>` from `$ARGUMENTS`. Check `docs/features/<feature-slug>.md`; if it exists, update it instead of creating a duplicate.
2. Run `@explorer` on `$ARGUMENTS` to map existing routes, components, schemas, mock services, `src/app/globals.css` tokens, and any related notes in `docs/features/` or `docs/status.md` (if present).
3. Write `docs/features/<feature-slug>.md` using these concise sections:
   - `## Goal and Non-Goals`
   - `## Routes and Files Touched`
   - `## UI States` (loading, empty, error, success)
   - `## Data and Types` (mock service shape and future API TODO)
   - `## Form and Validation` (schema fields, rules, messages, validation mode)
   - `## Components` (reuse vs. new)
   - `## Accessibility Notes`
   - `## Acceptance Criteria` (`- [ ]` checklist)
   - `Status: Draft`
4. Do not write or edit application source code.
