/**
 * Phase 19 — Professor showcase v6 closure test.
 */
import fs from "node:fs";
import path from "node:path";
import { PROFESSOR_SHOWCASE_V6_VERSION } from "../src/lib/intelligence/v4/debatePrepProfessorShowcaseV6";

const ROOT = process.cwd();
const CHECKPOINTS = [
  { id: "showcase-v6-chrome", file: "src/lib/intelligence/v4/debatePrepProfessorShowcaseV6.ts", needle: PROFESSOR_SHOWCASE_V6_VERSION },
  { id: "seminar-hero-banner", file: "src/components/admin/intelligence/v4/ProfessorSeminarShowcase.tsx", needle: "ShowcaseHeroBanner" },
  { id: "professor-mode-skins", file: "src/lib/intelligence/v4/debatePrepProfessorShowcaseV6.ts", needle: "office-hours-10" },
  { id: "lecture-panel-cinematic", file: "src/components/admin/intelligence/v4/ProfessorSeminarShowcase.tsx", needle: "ShowcaseLecturePanel" },
  { id: "rubric-showcase-panel", file: "src/components/admin/intelligence/v4/ProfessorSeminarShowcase.tsx", needle: "ShowcaseRubricPanel" },
  { id: "search-brief-showcase", file: "src/components/admin/intelligence/v4/ProfessorSearchBriefPanel.tsx", needle: "showcase v6" },
  { id: "tutor-showcase-integration", file: "src/components/admin/intelligence/DebatePrepTutorClient.tsx", needle: "v6-showcase" },
  { id: "sandbox-suite-runner", file: "scripts/test-sandbox-intelligence-suite.ts", needle: "SANDBOX SUITE" },
] as const;

function has(file: string, needle: string) {
  const p = path.join(ROOT, file);
  return fs.existsSync(p) && fs.readFileSync(p, "utf8").includes(needle);
}

function main() {
  let pass = 0;
  console.log(`=== Phase 19 — ${PROFESSOR_SHOWCASE_V6_VERSION} ===`);
  for (const c of CHECKPOINTS) {
    const ok = has(c.file, c.needle);
    if (ok) pass++;
    console.log(`  ${ok ? "✓" : "✗"} ${c.id}`);
  }
  if (pass < 7) {
    console.error(`\nFAIL: ${pass}/${CHECKPOINTS.length} checkpoints`);
    process.exit(1);
  }
  console.log("\nPASS: Phase 19 bar met");
}

main();
