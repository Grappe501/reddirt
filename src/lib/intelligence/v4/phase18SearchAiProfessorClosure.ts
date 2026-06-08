/**
 * Phase 18 — Search v5 professor + debate prep professor v2 closure pass.
 */
import { flattenCandidateCommandNavLinks, buildCandidateCommandNavSections } from "@/lib/intelligence/v4/candidateCommandNav";
import { getFieldBookArticle } from "@/lib/intelligence/fieldBookRegistry";
import { resolveCanonBinding } from "@/lib/intelligence/fieldBookCanonRegistry";
import { listStrategyMigrationRoutes } from "@/lib/intelligence/v4/strategyMigrationBridge";
import { SEARCH_AI_PREP_HUB_HREF } from "@/lib/intelligence/v4/phase17SearchAiPrepDepth";
import {
  computePhase18SearchAiProfessorDepth,
  PHASE18_CHECKPOINT_IDS,
  PHASE18_UPGRADE_HREF,
  phase18CheckpointMeetsBar,
  type Phase18CheckpointId,
} from "@/lib/intelligence/v4/phase18SearchAiProfessorDepth";

const MIN_CHECKPOINTS_AT_BAR = 7;
const MIN_COMPLETION_PCT = 90;

export type Phase18SearchAiProfessorProgress = {
  checkpointsAtBar: number;
  checkpointTotal: number;
  completionPct: number;
  corpusTotal: number;
  professorModes: number;
  searchV5Ready: boolean;
  tutorV2Ready: boolean;
  hubInCandidateNav: boolean;
  fieldBookReady: boolean;
  canonReady: boolean;
  migrationRouteBound: boolean;
};

export function computePhase18SearchAiProfessorProgress(): Phase18SearchAiProfessorProgress {
  const depth = computePhase18SearchAiProfessorDepth();
  const candidateHrefs = new Set(
    flattenCandidateCommandNavLinks(buildCandidateCommandNavSections("CANDIDATE")).map((l) => l.href),
  );

  return {
    checkpointsAtBar: depth.checkpointsAtBar,
    checkpointTotal: depth.checkpointTotal,
    completionPct: depth.completionPct,
    corpusTotal: depth.corpusTotal,
    professorModes: depth.professorModes,
    searchV5Ready: depth.checkpointsAtBar >= MIN_CHECKPOINTS_AT_BAR,
    tutorV2Ready: depth.tutorVersion.startsWith("tutor-v2"),
    hubInCandidateNav: candidateHrefs.has(SEARCH_AI_PREP_HUB_HREF),
    fieldBookReady: Boolean(getFieldBookArticle("search-ai-prep-command")),
    canonReady: Boolean(resolveCanonBinding(SEARCH_AI_PREP_HUB_HREF)),
    migrationRouteBound: listStrategyMigrationRoutes().some(
      (r) => r.intelligenceHref === SEARCH_AI_PREP_HUB_HREF,
    ),
  };
}

export type Phase18UpgradePassReport = {
  title: string;
  summary: string;
  completionPct: number;
  progress: Phase18SearchAiProfessorProgress;
  checkpoints: { id: Phase18CheckpointId; atBar: boolean }[];
};

export function computePhase18UpgradePass(): Phase18UpgradePassReport {
  const progress = computePhase18SearchAiProfessorProgress();
  const checkpoints = PHASE18_CHECKPOINT_IDS.map((id) => ({
    id,
    atBar: phase18CheckpointMeetsBar(id),
  }));

  return {
    title: "Search v5 + debate prep professor v2 — collegiate depth",
    summary:
      "Professor-level upgrade: smart search v5 adds seminar briefs, Socratic questions, and evidence-tier lectures; debate prep tutor v2 adds office hours, seminar, moot court, and forensic rubric grading.",
    completionPct: progress.completionPct,
    progress,
    checkpoints,
  };
}

export function assertPhase18Bar(): { ok: boolean; message: string } {
  const p = computePhase18SearchAiProfessorProgress();
  if (p.checkpointsAtBar < MIN_CHECKPOINTS_AT_BAR) {
    return {
      ok: false,
      message: `${p.checkpointsAtBar}/${p.checkpointTotal} checkpoints at bar — need ${MIN_CHECKPOINTS_AT_BAR}`,
    };
  }
  if (p.completionPct < MIN_COMPLETION_PCT) {
    return { ok: false, message: `Completion ${p.completionPct}% — need ≥${MIN_COMPLETION_PCT}%` };
  }
  return { ok: true, message: "Phase 18 bar met — search v5 + professor tutor v2 ready for main merge" };
}

export { SEARCH_AI_PREP_HUB_HREF, PHASE18_UPGRADE_HREF };
