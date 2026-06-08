/**
 * Phase 18 — Search v5 professor brief + debate prep professor v2 depth metrics.
 */
import fs from "node:fs";
import path from "node:path";
import { countIntelSearchCorpus } from "@/lib/intelligence/intelligenceSearchCorpus";
import { INTEL_SEARCH_V5_VERSION } from "@/lib/intelligence/intelligenceSearchV5";
import { DEBATE_PREP_TUTOR_V2_VERSION } from "@/lib/intelligence/v4/debatePrepProfessorOrchestrator";
import { listProfessorModes } from "@/lib/intelligence/v4/debatePrepProfessorV5";

export const PHASE18_UPGRADE_HREF = "/admin/intelligence/phase-18-upgrade";

export const PHASE18_CHECKPOINT_IDS = [
  "search-v5-professor-brief",
  "search-v5-professor-lens",
  "search-api-v5",
  "professor-brief-engine",
  "debate-prep-professor-v2",
  "professor-moot-rubric",
  "search-ui-professor-panel",
  "tutor-ui-professor-modes",
] as const;

export type Phase18CheckpointId = (typeof PHASE18_CHECKPOINT_IDS)[number];

const REQUIRED_FILES = [
  "src/lib/intelligence/intelligenceSearchV5.ts",
  "src/lib/intelligence/intelligenceProfessorBrief.ts",
  "src/lib/intelligence/v4/debatePrepProfessorV5.ts",
  "src/lib/intelligence/v4/debatePrepProfessorOrchestrator.ts",
  "src/app/api/admin/intelligence/search/route.ts",
  "src/app/api/admin/intelligence/debate-prep-tutor/route.ts",
  "src/components/admin/intelligence/IntelligencePrepSearchBar.tsx",
  "src/components/admin/intelligence/DebatePrepTutorClient.tsx",
  "src/app/admin/(board)/intelligence/phase-18-upgrade/page.tsx",
  "scripts/test-phase18-search-ai-professor.ts",
] as const;

export function fileExists(rel: string): boolean {
  return fs.existsSync(path.join(process.cwd(), rel));
}

export function countPhase18FilesAtBar(): { atBar: number; total: number } {
  const atBar = REQUIRED_FILES.filter(fileExists).length;
  return { atBar, total: REQUIRED_FILES.length };
}

export function phase18CheckpointMeetsBar(id: Phase18CheckpointId): boolean {
  switch (id) {
    case "search-v5-professor-brief":
      return fileExists("src/lib/intelligence/intelligenceSearchV5.ts") && INTEL_SEARCH_V5_VERSION.startsWith("smart-v5");
    case "search-v5-professor-lens":
      return fileExists("src/lib/intelligence/intelligenceProfessorBrief.ts");
    case "search-api-v5":
      return fileExists("src/app/api/admin/intelligence/search/route.ts");
    case "professor-brief-engine":
      return fileExists("src/lib/intelligence/intelligenceProfessorBrief.ts");
    case "debate-prep-professor-v2":
      return (
        fileExists("src/lib/intelligence/v4/debatePrepProfessorOrchestrator.ts") &&
        DEBATE_PREP_TUTOR_V2_VERSION.startsWith("tutor-v2")
      );
    case "professor-moot-rubric":
      return listProfessorModes().some((m) => m.deliversMoot);
    case "search-ui-professor-panel":
      return fileExists("src/components/admin/intelligence/IntelligencePrepSearchBar.tsx");
    case "tutor-ui-professor-modes":
      return fileExists("src/components/admin/intelligence/DebatePrepTutorClient.tsx");
    default:
      return false;
  }
}

export function countPhase18CheckpointsAtBar(): { atBar: number; total: number } {
  const atBar = PHASE18_CHECKPOINT_IDS.filter(phase18CheckpointMeetsBar).length;
  return { atBar, total: PHASE18_CHECKPOINT_IDS.length };
}

export function computePhase18SearchAiProfessorDepth(): {
  version: string;
  tutorVersion: string;
  professorModes: number;
  corpusTotal: number;
  filesAtBar: number;
  fileTotal: number;
  checkpointsAtBar: number;
  checkpointTotal: number;
  completionPct: number;
} {
  const corpus = countIntelSearchCorpus("CANDIDATE");
  const files = countPhase18FilesAtBar();
  const checkpoints = countPhase18CheckpointsAtBar();
  const completionPct = Math.round(
    (files.atBar / files.total) * 40 +
      (checkpoints.atBar / checkpoints.total) * 50 +
      Math.min(100, listProfessorModes().length * 25) * 0.1,
  );

  return {
    version: INTEL_SEARCH_V5_VERSION,
    tutorVersion: DEBATE_PREP_TUTOR_V2_VERSION,
    professorModes: listProfessorModes().length,
    corpusTotal: corpus.total,
    filesAtBar: files.atBar,
    fileTotal: files.total,
    checkpointsAtBar: checkpoints.atBar,
    checkpointTotal: checkpoints.total,
    completionPct: Math.min(100, completionPct),
  };
}
