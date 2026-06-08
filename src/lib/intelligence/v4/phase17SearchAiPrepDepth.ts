/**
 * Phase 17 — Search v4 + AI prep v4 depth metrics.
 */
import fs from "node:fs";
import path from "node:path";
import { countIntelSearchCorpus } from "@/lib/intelligence/intelligenceSearchCorpus";
import { countRegisteredCopilotTools, CANDIDATE_AI_PREP_V4_QUICK_TOOLS } from "@/lib/intelligence/intelligenceAiPrepV4";
import { INTEL_SEARCH_V4_VERSION } from "@/lib/intelligence/intelligenceSearchV4";

export const SEARCH_AI_PREP_HUB_HREF = "/admin/intelligence/search-ai-prep-hub";
export const PHASE17_UPGRADE_HREF = "/admin/intelligence/phase-17-upgrade";

export const PHASE17_CHECKPOINT_IDS = [
  "search-v4-orchestration",
  "search-sre-corpus",
  "search-copilot-corpus",
  "search-profile-aware",
  "search-ipad-visible",
  "ai-prep-v4-tools",
  "ai-prep-search-bridge",
  "search-ai-prep-hub",
] as const;

export type Phase17CheckpointId = (typeof PHASE17_CHECKPOINT_IDS)[number];

const REQUIRED_FILES = [
  "src/lib/intelligence/intelligenceSearchV4.ts",
  "src/lib/intelligence/intelligenceAiPrepV4.ts",
  "src/app/api/admin/intelligence/search/route.ts",
  "src/components/admin/intelligence/IntelligenceAgentCopilotDock.tsx",
  "src/components/admin/intelligence/IntelligencePrepSearchBar.tsx",
  "src/app/admin/(board)/intelligence/phase-17-upgrade/page.tsx",
  "src/app/admin/(board)/intelligence/search-ai-prep-hub/page.tsx",
  "scripts/test-phase17-search-ai-prep.ts",
] as const;

export function fileExists(rel: string): boolean {
  return fs.existsSync(path.join(process.cwd(), rel));
}

export function countPhase17FilesAtBar(): { atBar: number; total: number } {
  const atBar = REQUIRED_FILES.filter(fileExists).length;
  return { atBar, total: REQUIRED_FILES.length };
}

export function phase17CheckpointMeetsBar(id: Phase17CheckpointId): boolean {
  const corpus = countIntelSearchCorpus("CANDIDATE");
  switch (id) {
    case "search-v4-orchestration":
      return fileExists("src/lib/intelligence/intelligenceSearchV4.ts") && INTEL_SEARCH_V4_VERSION.startsWith("smart-v4");
    case "search-sre-corpus":
      return (corpus.byKind.rehearsal ?? 0) >= 8;
    case "search-copilot-corpus":
      return (corpus.byKind.copilot_tool ?? 0) >= 12;
    case "search-profile-aware":
      return fileExists("src/lib/intelligence/intelligenceSearchV4.ts");
    case "search-ipad-visible":
      return fileExists("src/components/admin/intelligence/IntelligencePrepSearchHeaderButton.tsx");
    case "ai-prep-v4-tools":
      return CANDIDATE_AI_PREP_V4_QUICK_TOOLS.length >= 12;
    case "ai-prep-search-bridge":
      return fileExists("src/lib/intelligence/intelligenceAiPrepV4.ts");
    case "search-ai-prep-hub":
      return fileExists("src/app/admin/(board)/intelligence/search-ai-prep-hub/page.tsx");
    default:
      return false;
  }
}

export function countPhase17CheckpointsAtBar(): { atBar: number; total: number } {
  const atBar = PHASE17_CHECKPOINT_IDS.filter(phase17CheckpointMeetsBar).length;
  return { atBar, total: PHASE17_CHECKPOINT_IDS.length };
}

export function computePhase17SearchAiPrepDepth(): {
  version: string;
  corpusTotal: number;
  rehearsalDocs: number;
  copilotDocs: number;
  registeredTools: number;
  quickTools: number;
  filesAtBar: number;
  fileTotal: number;
  checkpointsAtBar: number;
  checkpointTotal: number;
  completionPct: number;
} {
  const corpus = countIntelSearchCorpus("CANDIDATE");
  const files = countPhase17FilesAtBar();
  const checkpoints = countPhase17CheckpointsAtBar();
  const completionPct = Math.round(
    (files.atBar / files.total) * 35 +
      (checkpoints.atBar / checkpoints.total) * 45 +
      Math.min(100, (corpus.total / 800) * 100) * 0.2,
  );

  return {
    version: INTEL_SEARCH_V4_VERSION,
    corpusTotal: corpus.total,
    rehearsalDocs: corpus.byKind.rehearsal ?? 0,
    copilotDocs: corpus.byKind.copilot_tool ?? 0,
    registeredTools: countRegisteredCopilotTools(),
    quickTools: CANDIDATE_AI_PREP_V4_QUICK_TOOLS.length,
    filesAtBar: files.atBar,
    fileTotal: files.total,
    checkpointsAtBar: checkpoints.atBar,
    checkpointTotal: checkpoints.total,
    completionPct: Math.min(100, completionPct),
  };
}
