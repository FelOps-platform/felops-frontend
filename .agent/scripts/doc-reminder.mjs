import { execSync } from "node:child_process";
import path from "node:path";
import fs from "node:fs";

// Determine git repository root
let rootDir = process.cwd();
if (!fs.existsSync(path.join(rootDir, ".git")) && fs.existsSync(path.join(rootDir, "..", ".git"))) {
  rootDir = path.resolve(rootDir, "..");
}

const DOC_MAP = [
  { match: (p) => p.startsWith("src/app/(protected)/w/[workspaceId]/agents/"), doc: "docs/features/agents.md" },
  { match: (p) => p.includes("/(workspace)/knowledge/"), doc: "docs/features/knowledge.md" },
  { match: (p) => p.startsWith("src/app/(auth)/"), doc: "docs/features/auth.md" },
  { match: (p) => p.startsWith("src/app/(onboarding)/"), doc: "docs/features/workspaces.md" },
  { match: (p) => p === "src/app/globals.css" || p.startsWith("src/components/ui/"), doc: "docs/design-system.md" },
  { match: (p) => p.includes("/schemas/"), doc: "docs/forms-and-validation.md" },
];

const gitLines = (cmd, cwd) => {
  try {
    return execSync(cmd, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })
      .split(/\r?\n/)
      .map((s) => s.trim().replace(/\\/g, "/"))
      .filter(Boolean);
  } catch {
    return [];
  }
};

try {
  const changed = [
    ...gitLines("git diff --name-only HEAD", rootDir),
    ...gitLines("git ls-files --others --exclude-standard", rootDir),
  ];
  const srcFiles = changed.filter((p) => p.startsWith("src/"));
  if (srcFiles.length > 0 && !changed.some((p) => p.startsWith("docs/"))) {
    const docs = new Set();
    for (const file of srcFiles) {
      const hits = DOC_MAP.filter((rule) => rule.match(file));
      if (hits.length) hits.forEach((h) => docs.add(h.doc));
      else docs.add("docs/status.md");
    }
    console.log(
      `[doc-reminder] Changes in src/ (${srcFiles.length} file(s)), no docs/ updated. Check: ${[...docs].join(", ")}`
    );
  }
} catch {
  // Fail silently if git is unavailable.
}
