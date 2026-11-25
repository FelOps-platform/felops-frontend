# OpenCode Workflow Guide

Workflow: `/design` -> `/plan` -> `/implement` -> `/ship`

## Agents & Commands

| Name | Type | Does | Won't Do |
| :--- | :--- | :--- | :--- |
| `explorer` | Agent | Maps routes, components, schemas, tokens, and docs | Edit files, run mutating commands, or propose rewrites |
| `implementer` | Agent | Implements planned tasks, runs lint and `tsc` | Work without a spec, use raw hex/`any`/`console.log`, or commit |
| `reviewer` | Agent | Reviews diffs against specs/rules, runs lint/tsc/build | Edit files, rewrite code, or praise |
| `/design` | Command | Runs `explorer` and writes `docs/features/<slug>.md` | Edit or create application code |
| `/plan` | Command | Adds `## Plan` to the spec, flags contradictions | Edit or create application code |
| `/implement` | Command | Runs `implementer`, lint/tsc, and `reviewer` fixes | Commit or push changes |
| `/ship` | Command | Runs lint/tsc/build, full review, and doc sync | Commit, push, or open a PR unless asked |

## Worked Example (`agent-edit`)

1. `/design agent-edit`
   - Runs `@explorer` on `src/app/(protected)/w/[workspaceId]/agents/[agentId]/edit/page.tsx` and `agent-stepper.tsx`.
   - Creates `docs/features/agent-edit.md` with `Status: Draft`.
2. `/plan agent-edit`
   - Verifies paths, reusable stepper/UI components, and `globals.css` tokens.
   - Adds `## Plan` to `docs/features/agent-edit.md` and sets `Status: Planned`.
3. `/implement agent-edit`
   - Runs `@implementer` task-by-task, ticking `- [x]` items in `docs/features/agent-edit.md`.
   - Runs `npm run lint` and `npx tsc --noEmit`, then `@reviewer` on the diff, fixes Blockers, and sets `Status: Implemented`.
4. `/ship agent-edit`
   - Runs `npm run lint`, `npx tsc --noEmit`, and `npm run build`.
   - Runs `@reviewer`, updates `docs/features/agent-edit.md` and `docs/status.md` (when present).

## Doc Reminder Plugin

- File: `.opencode/plugins/doc-reminder.mjs`
- Runs on `session.idle`. Checks `git diff --name-only HEAD` and untracked files.
- If `src/` changed and `docs/` did not, prints a non-blocking reminder listing mapped doc files.
- Edit `DOC_MAP` at the top of `doc-reminder.mjs` to map new path prefixes or file patterns to docs.

## Extending

- **Add an agent**: Create `.opencode/agents/<name>.md` with `description`, `mode`, and `permission` YAML frontmatter.
- **Add a command**: Create `.opencode/commands/<name>.md` with `description` and `agent` YAML frontmatter and `$ARGUMENTS` in the body.

## Rules

- Specs in `docs/features/` are the source of truth before coding.
- Agents never commit, push, or open PRs.
- Update `docs/status.md` (when present) whenever an audit item or stub is closed.
