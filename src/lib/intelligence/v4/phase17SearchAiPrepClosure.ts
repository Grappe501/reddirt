/**
 * Phase 17 — Search v4 + AI prep v4 closure pass.
 */
import { flattenCandidateCommandNavLinks, buildCandidateCommandNavSections } from "@/lib/intelligence/v4/candidateCommandNav";
import { getFieldBookArticle } from "@/lib/intelligence/fieldBookRegistry";
import { resolveCanonBinding } from "@/lib/intelligence/fieldBookCanonRegistry";
import { listStrategyMigrationRoutes } from "@/lib/intelligence/v4/strategyMigrationBridge";
import {
  computePhase17SearchAiPrepDepth,
  PHASE17_CHECKPOINT_IDS,
  PHASE17_UPGRADE_HREF,
  SEARCH_AI_PREP_HUB_HREF,
  phase17CheckpointMeetsBar,
  type Phase17CheckpointId,
} from "@/lib/intelligence/v4/phase17SearchAiPrepDepth";

const MIN_CHECKPOINTS_AT_BAR = 7;
const MIN_COMPLETION_PCT = 90;

export type Phase17SearchAiPrepProgress = {
  checkpointsAtBar: number;
  checkpointTotal: number;
  completionPct: number;
  corpusTotal: number;
  rehearsalDocs: number;
  copilotDocs: number;
  quickTools: number;
  hubInCandidateNav: boolean;
  fieldBookReady: boolean;
  canonReady: boolean;
  migrationRouteBound: boolean;
  searchV4Ready: boolean;
};

export function computePhase17SearchAiPrepProgress(): Phase17SearchAiPrepProgress {
  const depth = computePhase17SearchAiPrepDepth();
  const candidateHrefs = new Set(
    flattenCandidateCommandNavLinks(buildCandidateCommandNavSections("CANDIDATE")).map((l) => l.href),
  );

  return {
    checkpointsAtBar: depth.checkpointsAtBar,
    checkpointTotal: depth.checkpointTotal,
    completionPct: depth.completionPct,
    corpusTotal: depth.corpusTotal,
    rehearsalDocs: depth.rehearsalDocs,
    copilotDocs: depth.copilotDocs,
    quickTools: depth.quickTools,
    hubInCandidateNav: candidateHrefs.has(SEARCH_AI_PREP_HUB_HREF),
    fieldBookReady: Boolean(getFieldBookArticle("search-ai-prep-command")),
    canonReady: Boolean(resolveCanonBinding(SEARCH_AI_PREP_HUB_HREF)),
    migrationRouteBound: listStrategyMigrationRoutes().some(
      (r) => r.intelligenceHref === SEARCH_AI_PREP_HUB_HREF,
    ),
    searchV4Ready: depth.checkpointsAtBar >= MIN_CHECKPOINTS_AT_BAR,
  };
}

export type Phase17UpgradePassReport = {
  title: string;
  summary: string;
  completionPct: number;
  progress: Phase17SearchAiPrepProgress;
  checkpoints: { id: Phase17CheckpointId; atBar: boolean }[];
};

export function computePhase17UpgradePass(): Phase17UpgradePassReport {
  const progress = computePhase17SearchAiPrepProgress();
  const checkpoints = PHASE17_CHECKPOINT_IDS.map((id) => ({
    id,
    atBar: phase17CheckpointMeetsBar(id),
  }));

  return {
    title: "Search v4 + AI prep v4 — unified command",
    summary:
      "Massive upgrade: smart search v4 fuses SRE rehearsal stack + 37 copilot tools into one searchable corpus; AI prep dock expands to 12 quick tools with search-integrated routing.",
    completionPct: progress.completionPct,
    progress,
    checkpoints,
  };
}

export function assertPhase17Bar(): { ok: boolean; message: string } {
  const p = computePhase17SearchAiPrepProgress();
  if (p.checkpointsAtBar < MIN_CHECKPOINTS_AT_BAR) {
    return {
      ok: false,
      message: `${p.checkpointsAtBar}/${p.checkpointTotal} checkpoints at bar — need ${MIN_CHECKPOINTS_AT_BAR}`,
    };
  }
  if (p.completionPct < MIN_COMPLETION_PCT) {
    return { ok: false, message: `Completion ${p.completionPct}% — need ≥${MIN_COMPLETION_PCT}%` };
  }
  return { ok: true, message: "Phase 17 bar met — search v4 + AI prep v4 ready for main merge" };
}

export { SEARCH_AI_PREP_HUB_HREF, PHASE17_UPGRADE_HREF };
