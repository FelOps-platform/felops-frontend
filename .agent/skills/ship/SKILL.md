---
name: ship
description: Run final lint, tsc, build, diff review, and documentation synchronization. Trigger with /ship <feature>.
---

# Ship Feature Verification & Sync

Run final quality gates and synchronize documentation for a completed feature.

## Procedure

1. Run verification commands using scripts defined in `package.json`:
   - `npm run lint`
   - `npx tsc --noEmit`
   - `npm run build`
   Report any failures verbatim.
2. Review the full diff (`git diff` and untracked files) against `.agent/agents/reviewer.md` standards.
3. Confirm `docs/features/<feature-slug>.md` accurately reflects the final implementation.
4. Update `docs/status.md` (if present) by checking off completed items and logging any new gaps found.
5. Update `docs/architecture.md`, `docs/design-system.md`, or `docs/forms-and-validation.md` (if present) if the change alters what they describe.
6. Output a concise summary: what changed, what was verified, and what remains open.
7. Do NOT commit, push, or open a pull request unless explicitly requested by the user.
