/**
 * Phase 15 P3 — Stage-safe filter closure.
 */
import {
  countStageSafeSurfacesAtBar,
  countSosQuestionsWithCandidateGating,
  countTrapLanesWithCandidateGating,
  COACHING_SCRIPT_SURFACE_IDS,
  getCoachingScriptStageSafeOverlay,
  getSosQuestionStageSafeOverlay,
  getTrapLaneStageSafeOverlay,
  listStageSafeSurfaceOverlays,
  PHASE15_P3_COACHING_SCRIPT_TOTAL,
  PHASE15_P3_STAGE_SAFE_FILTER_HUB_HREF,
  PHASE15_P3_TRAP_LANE_TOTAL,
  stageSafeSurfaceMeetsPhase15P3Bar,
  type StageSafeSurfaceOverlay,
} from "@/lib/intelligence/v4/phase15P3StageSafeFilterDepth";
import { getAllTrapLaneIds } from "@/lib/intelligence/v4/trapLaneDrillDowns";
import { getAllSosDebateQuestionIds } from "@/lib/intelligence/v4/sosDebateQuestionBank";
import { flattenCandidateCommandNavLinks, buildCandidateCommandNavSections } from "@/lib/intelligence/v4/candidateCommandNav";
import { getFieldBookArticle } from "@/lib/intelligence/fieldBookRegistry";
import { resolveCanonBinding } from "@/lib/intelligence/fieldBookCanonRegistry";
import { listStrategyMigrationRoutes } from "@/lib/intelligence/v4/strategyMigrationBridge";
import { profileUsesStageSafeFilter } from "@/lib/intelligence/v4/roleBasedNavProfile";

const MIN_SURFACES_AT_BAR = 38;

export type Phase15P3Progress = {
  trapLaneTotal: number;
  trapLanesGated: number;
  sosQuestionTotal: number;
  sosQuestionsGated: number;
  coachingScriptTotal: number;
  surfacesAtBar: number;
  surfaceTotal: number;
  candidateBlockedCount: number;
  hubInCandidateNav: boolean;
  fieldBookReady: boolean;
  canonReady: boolean;
  migrationRouteBound: boolean;
  filterWiredForCandidateProfile: boolean;
  overallPct: number;
};

export function computePhase15P3Progress(): Phase15P3Progress {
  const bar = countStageSafeSurfacesAtBar();
  const trapLanesGated = countTrapLanesWithCandidateGating();
  const sosQuestionsGated = countSosQuestionsWithCandidateGating();

  const candidateHrefs = new Set(
    flattenCandidateCommandNavLinks(buildCandidateCommandNavSections("CANDIDATE")).map((l) => l.href),
  );
  const hubInCandidateNav = candidateHrefs.has(PHASE15_P3_STAGE_SAFE_FILTER_HUB_HREF);

  const fieldBookReady = Boolean(getFieldBookArticle("stage-safe-filter-command"));
  const canonReady = Boolean(resolveCanonBinding(PHASE15_P3_STAGE_SAFE_FILTER_HUB_HREF));
  const migrationRouteBound = listStrategyMigrationRoutes().some(
    (r) => r.intelligenceHref === PHASE15_P3_STAGE_SAFE_FILTER_HUB_HREF,
  );

  const trapScore =
    getAllTrapLaneIds().length >= PHASE15_P3_TRAP_LANE_TOTAL && trapLanesGated >= 1 ? 100 : 75;
  const sosScore =
    getAllSosDebateQuestionIds().length >= 24 && sosQuestionsGated >= 5 ? 100 : 80;
  const surfaceScore =
    bar.atBar >= MIN_SURFACES_AT_BAR ? 100 : Math.round((bar.atBar / MIN_SURFACES_AT_BAR) * 100);
  const wireChecks = [hubInCandidateNav, fieldBookReady, canonReady, migrationRouteBound];
  const wireScore = Math.round((wireChecks.filter(Boolean).length / wireChecks.length) * 100);
  const filterWiredForCandidateProfile = profileUsesStageSafeFilter("CANDIDATE");

  const overallPct = Math.min(
    100,
    Math.round((trapScore + sosScore + surfaceScore + wireScore) / 4),
  );

  return {
    trapLaneTotal: getAllTrapLaneIds().length,
    trapLanesGated: trapLanesGated,
    sosQuestionTotal: getAllSosDebateQuestionIds().length,
    sosQuestionsGated: sosQuestionsGated,
    coachingScriptTotal: PHASE15_P3_COACHING_SCRIPT_TOTAL,
    surfacesAtBar: bar.atBar,
    surfaceTotal: bar.total,
    candidateBlockedCount: bar.candidateBlocked,
    hubInCandidateNav,
    fieldBookReady,
    canonReady,
    migrationRouteBound,
    filterWiredForCandidateProfile,
    overallPct,
  };
}

export type Phase15P3UpgradePassReport = {
  passId: "phase-15-p3-stage-safe-filter";
  title: "Step 15 P3 — Stage-safe filter";
  summary: string;
  completionPct: number;
  hubHref: string;
  progress: Phase15P3Progress;
};

export function computePhase15P3UpgradePass(): Phase15P3UpgradePassReport {
  const progress = computePhase15P3Progress();
  return {
    passId: "phase-15-p3-stage-safe-filter",
    title: "Step 15 P3 — Stage-safe filter",
    summary:
      "Candidate and clerk-week profiles redact NEEDS_REVIEW rehearse lines on trap lanes, SOS questions, and coaching scripts — staff-verify fallback with research-question framing.",
    completionPct: progress.overallPct,
    hubHref: PHASE15_P3_STAGE_SAFE_FILTER_HUB_HREF,
    progress,
  };
}

export function listStageSafeFilterSurfaces(): StageSafeSurfaceOverlay[] {
  return listStageSafeSurfaceOverlays();
}

export function assertPhase15P3Bar(): { ok: boolean; message: string } {
  const p = computePhase15P3Progress();
  const issues: string[] = [];
  if (p.trapLaneTotal < PHASE15_P3_TRAP_LANE_TOTAL) issues.push(`trap lanes ${p.trapLaneTotal}`);
  if (p.sosQuestionTotal < 24) issues.push(`sos ${p.sosQuestionTotal}`);
  if (p.surfacesAtBar < MIN_SURFACES_AT_BAR) issues.push(`surfaces ${p.surfacesAtBar}/${MIN_SURFACES_AT_BAR}`);
  if (!p.hubInCandidateNav) issues.push("hub not in candidate nav");
  if (!p.fieldBookReady) issues.push("field book");
  if (!p.canonReady) issues.push("canon");
  if (!p.migrationRouteBound) issues.push("migration");
  if (!p.filterWiredForCandidateProfile) issues.push("candidate filter profile");

  for (const laneId of getAllTrapLaneIds()) {
    const o = getTrapLaneStageSafeOverlay(laneId);
    if (!o || !stageSafeSurfaceMeetsPhase15P3Bar(o)) issues.push(`trap overlay ${laneId}`);
  }
  for (const qId of getAllSosDebateQuestionIds()) {
    const o = getSosQuestionStageSafeOverlay(qId);
    if (!o || !stageSafeSurfaceMeetsPhase15P3Bar(o)) issues.push(`sos overlay ${qId}`);
  }
  for (const scriptId of COACHING_SCRIPT_SURFACE_IDS) {
    const o = getCoachingScriptStageSafeOverlay(scriptId);
    if (!o || !stageSafeSurfaceMeetsPhase15P3Bar(o)) issues.push(`coaching overlay ${scriptId}`);
  }

  if (issues.length === 0) return { ok: true, message: "Phase 15 P3 bar met" };
  return { ok: false, message: issues.slice(0, 6).join("; ") };
}

export { PHASE15_P3_STAGE_SAFE_FILTER_HUB_HREF };
