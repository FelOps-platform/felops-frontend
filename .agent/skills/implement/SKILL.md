---
name: implement
description: Execute a planned feature spec task by task with lint, tsc, and reviewer verification. Trigger with /implement <feature>.
---

# Implement Feature

Execute the ordered plan in `docs/features/<feature-slug>.md` following FelOps engineering standards.

## Procedure

1. Locate `docs/features/<feature-slug>.md` and confirm it contains an approved `## Plan` section. If missing, stop and request `/design` or `/plan`.
2. Execute the ordered tasks one at a time following `.agent/agents/implementer.md` hard rules:
   - Tokens from `src/app/globals.css` only (no raw hex, default Tailwind colors, or unjustified arbitrary values).
   - Colocated Zod schema, `useForm` + `zodResolver`, inferred types, `isSubmitting`, `unknown` in catch blocks (never `any`).
   - Full accessibility (`htmlFor`/`id`, `autoComplete`, semantic elements, modal focus trap).
   - Loading, empty, error, and success states handled.
   - Zero `console.log`.
   - Reuse `src/components/common/` and extend `src/components/ui/` with light-surface support; do not add a fourth modal.
   - Server `page.tsx` awaits `params` in `<Suspense>`.
3. Mark completed tasks and acceptance criteria (`- [x]`) in `docs/features/<feature-slug>.md` as each finishes.
4. Run `npm run lint` and `npx tsc --noEmit`. Fix errors introduced by this work; report pre-existing errors.
5. Review the full diff against `.agent/agents/reviewer.md` checklist and fix all Blocker items.
6. Set `Status: Implemented` in `docs/features/<feature-slug>.md`. Do not commit or push.
