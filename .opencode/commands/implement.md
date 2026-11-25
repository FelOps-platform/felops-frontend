---
description: Execute a planned feature spec task by task with lint, tsc, and diff review
agent: build
---

Implement the planned feature: `$ARGUMENTS`.

1. Locate `docs/features/<feature-slug>.md` for `$ARGUMENTS` and confirm it contains a `## Plan` section. If missing, stop and ask for `/design` or `/plan`.
2. Delegate the ordered plan tasks to `@implementer` one task at a time, ticking completed plan tasks and acceptance criteria (`- [x]`) in `docs/features/<feature-slug>.md` as each finishes.
3. Run `npm run lint` and `npx tsc --noEmit`. Have `@implementer` fix errors introduced by this work; report pre-existing errors without touching unrelated files.
4. Run `@reviewer` on the full diff (`git diff` and untracked files). Fix all **Blocker** findings with `@implementer`, then re-run `npm run lint` and `npx tsc --noEmit`.
5. Set `Status: Implemented` in `docs/features/<feature-slug>.md`. Do not commit or push.
