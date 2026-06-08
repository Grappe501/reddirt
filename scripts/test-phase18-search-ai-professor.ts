/**
 * Phase 18 — Search v5 professor + debate prep professor v2 closure test.
 * File + version bar only (avoids server-only import chain in tsx scripts).
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const MIN_CHECKPOINTS_AT_BAR = 7;

const REQUIRED_FILES = [
  "src/lib/intelligence/intelligenceSearchV5.ts",
  "src/lib/intelligence/intelligenceProfessorBrief.ts",
  "src/lib/intelligence/v4/debatePrepProfessorV5.ts",
  "src/lib/intelligence/v4/debatePrepProfessorOrchestrator.ts",
  "src/lib/intelligence/v4/debatePrepTutorGuideV5.ts",
  "src/app/api/admin/intelligence/search/route.ts",
  "src/app/api/admin/intelligence/debate-prep-tutor/route.ts",
  "src/components/admin/intelligence/IntelligencePrepSearchBar.tsx",
  "src/components/admin/intelligence/DebatePrepTutorClient.tsx",
  "src/app/admin/(board)/intelligence/phase-18-upgrade/page.tsx",
];

const CHECKPOINTS = [
  { id: "search-v5-professor-brief", check: () => fileHas("src/lib/intelligence/intelligenceSearchV5.ts", "smart-v5") },
  { id: "search-v5-professor-lens", check: () => exists("src/lib/intelligence/intelligenceProfessorBrief.ts") },
  { id: "search-api-v5", check: () => fileHas("src/app/api/admin/intelligence/search/route.ts", "INTEL_SEARCH_V5_VERSION") },
  { id: "professor-brief-engine", check: () => fileHas("src/lib/intelligence/intelligenceProfessorBrief.ts", "generateIntelProfessorBrief") },
  { id: "debate-prep-professor-v2", check: () => fileHas("src/lib/intelligence/v4/debatePrepTutorGuideV5.ts", "tutor-v5.0-conversational") },
  { id: "professor-moot-rubric", check: () => fileHas("src/lib/intelligence/v4/debatePrepProfessorV5.ts", "deliversMoot") },
  { id: "search-ui-professor-panel", check: () => fileHas("src/components/admin/intelligence/IntelligencePrepSearchBar.tsx", "professorBrief") },
  { id: "tutor-ui-professor-modes", check: () => fileHas("src/components/admin/intelligence/DebatePrepTutorClient.tsx", "TUTOR_HUB_WELCOME") },
] as const;

function exists(rel: string): boolean {
  return fs.existsSync(path.join(ROOT, rel));
}

function fileHas(rel: string, needle: string): boolean {
  if (!exists(rel)) return false;
  return fs.readFileSync(path.join(ROOT, rel), "utf8").includes(needle);
}

function main() {
  const filesAtBar = REQUIRED_FILES.filter(exists).length;
  const checkpointsAtBar = CHECKPOINTS.filter((c) => c.check()).length;
  const completionPct = Math.round(
    (filesAtBar / REQUIRED_FILES.length) * 50 + (checkpointsAtBar / CHECKPOINTS.length) * 50,
  );
  const barOk = checkpointsAtBar >= MIN_CHECKPOINTS_AT_BAR && completionPct >= 90;

  console.log("=== Phase 18 — Search v5 + professor tutor v2 ===");
  console.log(`Files: ${filesAtBar}/${REQUIRED_FILES.length}`);
  console.log(`Completion: ${completionPct}%`);
  console.log(`Checkpoints: ${checkpointsAtBar}/${CHECKPOINTS.length}`);

  for (const c of CHECKPOINTS) {
    console.log(`  ${c.check() ? "✓" : "✗"} ${c.id}`);
  }

  if (!barOk) {
    console.error(
      `\nFAIL: ${checkpointsAtBar}/${CHECKPOINTS.length} checkpoints — need ${MIN_CHECKPOINTS_AT_BAR}; completion ${completionPct}% — need ≥90%`,
    );
    process.exit(1);
  }

  console.log("\nPASS: Phase 18 bar met");
}

main();
