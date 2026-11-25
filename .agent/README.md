# Antigravity Workflow Guide

Workflow: `/design` -> `/plan` -> `/implement` -> `/ship`

## Agents & Skills

| Name | Type | Does | Won't Do |
| :--- | :--- | :--- | :--- |
| `explorer` | Agent | Maps routes, components, schemas, tokens, and docs | Edit files, run mutating commands, or propose rewrites |
| `implementer` | Agent | Implements planned tasks, runs lint and `tsc` | Work without a spec, use raw hex/`any`/`console.log`, or commit |
| `reviewer` | Agent | Reviews diffs against specs/rules, runs lint/tsc/build | Edit files, rewrite code, or praise |
| `/design` | Skill | Runs `explorer` and writes `docs/features/<slug>.md` | Edit or create application code |
| `/plan` | Skill | Adds `## Plan` to the spec, flags contradictions | Edit or create application code |
| `/implement` | Skill | Runs `implementer`, lint/tsc, and `reviewer` fixes | Commit or push changes |
| `/ship` | Skill | Runs lint/tsc/build, full review, and doc sync | Commit, push, or open a PR unless asked |

## Rules & Hooks

- **Rules**: `.agent/rules/engineering-standards.md` enforces FelOps design tokens (`src/app/globals.css`), forms (`react-hook-form` + `zod`), accessibility, state handling, and zero `console.log`.
- **Hooks**: `.agent/hooks.json` monitors file modifications (`edit_file|write_file`) and runs `.agent/scripts/doc-reminder.mjs` to remind agents when `src/` changes without matching `docs/` updates.

## Worked Example (`agent-edit`)

1. `/design agent-edit`
   - Runs `explorer` on `src/app/(protected)/w/[workspaceId]/agents/[agentId]/edit/page.tsx` and `agent-stepper.tsx`.
   - Creates `docs/features/agent-edit.md` with `Status: Draft`.
2. `/plan agent-edit`
   - Verifies paths, reusable stepper/UI components, and `globals.css` tokens.
   - Adds `## Plan` to `docs/features/agent-edit.md` and sets `Status: Planned`.
3. `/implement agent-edit`
   - Runs `implementer` task-by-task, ticking `- [x]` items in `docs/features/agent-edit.md`.
   - Runs `npm run lint` and `npx tsc --noEmit`, then `reviewer` on the diff, fixes Blockers, and sets `Status: Implemented`.
4. `/ship agent-edit`
   - Runs `npm run lint`, `npx tsc --noEmit`, and `npm run build`.
   - Runs `reviewer`, updates `docs/features/agent-edit.md` and `docs/status.md` (when present).

## Extending

- **Add an agent**: Create `.agent/agents/<name>.md` with `name`, `description`, and `tools` YAML frontmatter.
- **Add a skill / slash command**: Create `.agent/skills/<name>/SKILL.md` with `name` and `description` YAML frontmatter.
- **Add a rule**: Create `.agent/rules/<name>.md`.

## Rules

- Specs in `docs/features/` are the source of truth before coding.
- Agents never commit, push, or open PRs.
- Update `docs/status.md` (when present) whenever an audit item or stub is closed.
