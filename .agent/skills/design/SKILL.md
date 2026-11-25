---
name: design
description: Explore a feature area and create or update its spec in docs/features/. Trigger with /design <feature>.
---

# Design Feature Specification

Explore a feature area and write or update its specification in `docs/features/`.

## Procedure

1. Derive a kebab-case `<feature-slug>` from the requested feature name. Check if `docs/features/<feature-slug>.md` already exists; if so, update it instead of creating a duplicate.
2. Run codebase exploration (following `.agent/agents/explorer.md` guidelines) to inspect where the feature lives, what components, schemas, hooks, services, and `globals.css` design tokens exist, and what `docs/features/` and `docs/status.md` (if present) currently state.
3. Write or update `docs/features/<feature-slug>.md` with the following concise sections:
   - `## Goal and Non-Goals`
   - `## Routes and Files Touched`
   - `## UI States` (loading, empty, error, success)
   - `## Data and Types` (mock service shape and future API TODO)
   - `## Form and Validation` (schema fields, rules, messages, validation mode)
   - `## Components` (reused from `src/components/common`, `src/components/ui`, or colocated vs. new)
   - `## Accessibility Notes` (labels, autocomplete, roles, focus)
   - `## Acceptance Criteria` (`- [ ]` checklist)
   - `Status: Draft`
4. Do not modify application source code.
