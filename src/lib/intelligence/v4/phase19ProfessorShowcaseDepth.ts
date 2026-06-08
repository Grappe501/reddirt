/**
 * Phase 19 — Professor showcase v6 cinematic upgrade depth metrics.
 */
import fs from "node:fs";
import path from "node:path";
import { PROFESSOR_SHOWCASE_V6_VERSION } from "@/lib/intelligence/v4/debatePrepProfessorShowcaseV6";

export const PHASE19_UPGRADE_HREF = "/admin/intelligence/phase-19-upgrade";

export const PHASE19_CHECKPOINT_IDS = [
  "showcase-v6-chrome",
  "seminar-hero-banner",
  "professor-mode-skins",
  "lecture-panel-cinematic",
  "rubric-showcase-panel",
  "search-brief-showcase",
  "tutor-showcase-integration",
  "sandbox-suite-runner",
] as const;

export type Phase19CheckpointId = (typeof PHASE19_CHECKPOINT_IDS)[number];

const REQUIRED_FILES = [
  "src/components/admin/intelligence/v4/ProfessorSeminarShowcase.tsx",
  "src/components/admin/intelligence/v4/ProfessorSearchBriefPanel.tsx",
  "src/lib/intelligence/v4/debatePrepProfessorShowcaseV6.ts",
  "src/components/admin/intelligence/DebatePrepTutorClient.tsx",
  "src/components/admin/intelligence/IntelligencePrepSearchBar.tsx",
  "src/app/admin/(board)/intelligence/phase-19-upgrade/page.tsx",
  "scripts/test-phase19-professor-showcase.ts",
  "scripts/test-sandbox-intelligence-suite.ts",
] as const;

export function fileExists(rel: string): boolean {
  return fs.existsSync(path.join(process.cwd(), rel));
}

export function fileHas(rel: string, needle: string): boolean {
  if (!fileExists(rel)) return false;
  return fs.readFileSync(path.join(process.cwd(), rel), "utf8").includes(needle);
}

export function phase19CheckpointMeetsBar(id: Phase19CheckpointId): boolean {
  switch (id) {
    case "showcase-v6-chrome":
      return fileHas("src/lib/intelligence/v4/debatePrepProfessorShowcaseV6.ts", PROFESSOR_SHOWCASE_V6_VERSION);
    case "seminar-hero-banner":
      return fileHas("src/components/admin/intelligence/v4/ProfessorSeminarShowcase.tsx", "ShowcaseHeroBanner");
    case "professor-mode-skins":
      return fileHas("src/lib/intelligence/v4/debatePrepProfessorShowcaseV6.ts", "PROFESSOR_SHOWCASE_SKINS");
    case "lecture-panel-cinematic":
      return fileHas("src/components/admin/intelligence/v4/ProfessorSeminarShowcase.tsx", "ShowcaseLecturePanel");
    case "rubric-showcase-panel":
      return fileHas("src/components/admin/intelligence/v4/ProfessorSeminarShowcase.tsx", "ShowcaseRubricPanel");
    case "search-brief-showcase":
      return fileExists("src/components/admin/intelligence/v4/ProfessorSearchBriefPanel.tsx");
    case "tutor-showcase-integration":
      return fileHas("src/components/admin/intelligence/DebatePrepTutorClient.tsx", "v6-showcase");
    case "sandbox-suite-runner":
      return fileExists("scripts/test-sandbox-intelligence-suite.ts");
    default:
      return false;
  }
}

export function computePhase19ProfessorShowcaseDepth() {
  const atBar = PHASE19_CHECKPOINT_IDS.filter(phase19CheckpointMeetsBar).length;
  const filesAtBar = REQUIRED_FILES.filter(fileExists).length;
  const completionPct = Math.round(
    (filesAtBar / REQUIRED_FILES.length) * 45 + (atBar / PHASE19_CHECKPOINT_IDS.length) * 55,
  );
  return {
    version: PROFESSOR_SHOWCASE_V6_VERSION,
    filesAtBar,
    fileTotal: REQUIRED_FILES.length,
    checkpointsAtBar: atBar,
    checkpointTotal: PHASE19_CHECKPOINT_IDS.length,
    completionPct: Math.min(100, completionPct),
  };
}
