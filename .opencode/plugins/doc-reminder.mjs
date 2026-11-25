import { execSync } from "node:child_process";

// Edit DOC_MAP to customize path-to-doc reminder rules (checked in order; matching rules accumulate).
const DOC_MAP = [
  { match: (p) => p.startsWith("src/app/(protected)/w/[workspaceId]/agents/"), doc: "docs/features/agents.md" },
  { match: (p) => p.includes("/(workspace)/knowledge/"), doc: "docs/features/knowledge.md" },
  { match: (p) => p.startsWith("src/app/(auth)/"), doc: "docs/features/auth.md" },
  { match: (p) => p.startsWith("src/app/(onboarding)/"), doc: "docs/features/workspaces.md" },
  { match: (p) => p === "src/app/globals.css" || p.startsWith("src/components/ui/"), doc: "docs/design-system.md" },
  { match: (p) => p.includes("/schemas/"), doc: "docs/forms-and-validation.md" },
];

const gitLines = (cmd, cwd) =>
  execSync(cmd, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })
    .split(/\r?\n/)
    .map((s) => s.trim().replace(/\\/g, "/"))
    .filter(Boolean);

export const DocReminderPlugin = async ({ directory }) => ({
  event: async ({ event }) => {
    if (event?.type !== "session.idle") return;
    try {
      const cwd = directory || process.cwd();
      const changed = [
        ...gitLines("git diff --name-only HEAD", cwd),
        ...gitLines("git ls-files --others --exclude-standard", cwd),
      ];
      const srcFiles = changed.filter((p) => p.startsWith("src/"));
      if (srcFiles.length === 0 || changed.some((p) => p.startsWith("docs/"))) return;

      const docs = new Set();
      for (const file of srcFiles) {
        const hits = DOC_MAP.filter((rule) => rule.match(file));
        if (hits.length) hits.forEach((h) => docs.add(h.doc));
        else docs.add("docs/status.md");
      }
      console.log(
        `[doc-reminder] Changes in src/ (${srcFiles.length} file(s)), no docs/ updated. Check: ${[...docs].join(", ")}`
      );
    } catch {
      // Fail silently if git is unavailable or repo has no commits.
    }
  },
});
