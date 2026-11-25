---
description: Run final lint, tsc, build, and review gates and update documentation
agent: build
---

Run final verification and doc sync for: `$ARGUMENTS`.

1. Run `npm run lint`, `npx tsc --noEmit`, and `npm run build` (using only scripts defined in `package.json`). Report any failures verbatim.
2. Run `@reviewer` on the full diff (`git diff` and untracked files).
3. Confirm `docs/features/<feature-slug>.md` matches the implementation.
4. Update `docs/status.md` (if present) by ticking completed items and adding new gaps found. Update `docs/architecture.md`, `docs/design-system.md`, or `docs/forms-and-validation.md` (if present) when this change alters what they describe; if any of those docs don't exist yet, note it in the summary instead of inventing them.
5. Output a short summary: what changed, what is verified, and what remains open.
6. Do NOT commit, push, or open a PR unless explicitly instructed.
