/**
 * Fail if Election Plan county UI still emits navigable legacy county workbench hrefs.
 * Run: npm run election-plan:audit:county-links
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SCAN_ROOT = path.join(ROOT, "src/components/election-plan");

const LEGACY_HREF_PATTERNS: RegExp[] = [
  /href=\{[^}]*redDirtCountyHref/,
  /href=\{[^}]*redDirtBriefingV2Href/,
  /href=\{[^}]*workbenchLeaderHref/,
  /href=\{[^}]*workbenchDashboardV2Href/,
  /href=\{[^}]*countyWorkbenchExternalHref/,
  /href=["'`]\/county-briefings\//,
  /href=["'`]\/counties\/[^"'`]+["'`]/,
];

const ALLOWLIST_FILES = new Set([
  path.normalize("src/components/election-plan/LegacyCountySystemsPanel.tsx"),
]);

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) {
      walk(full, out);
      continue;
    }
    if (name.endsWith(".tsx") || name.endsWith(".ts")) out.push(full);
  }
  return out;
}

function main(): void {
  const violations: string[] = [];

  for (const file of walk(SCAN_ROOT)) {
    const rel = path.relative(ROOT, file).replace(/\\/g, "/");
    if (ALLOWLIST_FILES.has(rel)) continue;
    const text = readFileSync(file, "utf8");
    for (const pattern of LEGACY_HREF_PATTERNS) {
      if (pattern.test(text)) {
        violations.push(`${rel} matches ${pattern}`);
      }
    }
  }

  if (violations.length > 0) {
    console.error("County playbook legacy link audit FAILED:\n");
    for (const v of violations) console.error(`  - ${v}`);
    process.exit(1);
  }

  console.log("County playbook legacy link audit OK — no navigable legacy hrefs in election-plan components.");
}

main();
