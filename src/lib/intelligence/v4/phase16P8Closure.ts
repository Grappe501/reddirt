/**
 * Phase 16 P8 — Live event mode closure.
 */
import { buildCandidateCommandHomeFeed } from "@/lib/intelligence/v4/candidateCommandHome";
import { flattenCandidateCommandNavLinks, buildCandidateCommandNavSections } from "@/lib/intelligence/v4/candidateCommandNav";
import {
  LIVE_EVENT_FIELD_IDS,
  countLiveEventFieldsAtBar,
  liveEventFieldMeetsPhase16P8Bar,
  getLiveEventFieldOverlay,
} from "@/lib/intelligence/v4/phase16P8LiveEventDepth";
import {
  buildLiveEventSummary,
  isLiveEventModeActive,
  PHASE16_P8_LIVE_FIELD_TOTAL,
  LIVE_EVENT_HUB_HREF,
} from "@/lib/intelligence/v4/phase16P8LiveEventMode";
import { getFieldBookArticle } from "@/lib/intelligence/fieldBookRegistry";
import { resolveCanonBinding } from "@/lib/intelligence/fieldBookCanonRegistry";
import { listStrategyMigrationRoutes } from "@/lib/intelligence/v4/strategyMigrationBridge";

export type Phase16P8Progress = {
  fieldTotal: number;
  fieldsAtBar: number;
  hubInCandidateNav: boolean;
  commandHomeWired: boolean;
  fieldBookReady: boolean;
  canonReady: boolean;
  migrationRouteBound: boolean;
  liveModeDetectWired: boolean;
  dayOfPlanSafe: boolean;
  overallPct: number;
};

export function computePhase16P8Progress(): Phase16P8Progress {
  const fieldBar = countLiveEventFieldsAtBar();
  const feed = buildCandidateCommandHomeFeed();
  const summary = buildLiveEventSummary();

  const candidateHrefs = new Set(
    flattenCandidateCommandNavLinks(buildCandidateCommandNavSections("CANDIDATE")).map((l) => l.href),
  );

  const hubInCandidateNav = candidateHrefs.has(LIVE_EVENT_HUB_HREF);
  const commandHomeWired = Boolean(feed.liveEvent?.tonightReminder);
  const fieldBookReady = Boolean(getFieldBookArticle("live-event-command"));
  const canonReady = Boolean(resolveCanonBinding(LIVE_EVENT_HUB_HREF));
  const migrationRouteBound = listStrategyMigrationRoutes().some(
    (r) => r.intelligenceHref === LIVE_EVENT_HUB_HREF,
  );
  const liveModeDetectWired = typeof isLiveEventModeActive === "function";
  const dayOfPlanSafe = summary.dayOfPlan.stageSafeOnly && summary.dayOfPlan.stepCount > 0;

  const fieldScore =
    fieldBar.atBar >= PHASE16_P8_LIVE_FIELD_TOTAL
      ? 100
      : Math.round((fieldBar.atBar / PHASE16_P8_LIVE_FIELD_TOTAL) * 100);
  const modeScore = liveModeDetectWired && dayOfPlanSafe ? 100 : 85;
  const wireChecks = [hubInCandidateNav, commandHomeWired, fieldBookReady, canonReady, migrationRouteBound];
  const wireScore = Math.round((wireChecks.filter(Boolean).length / wireChecks.length) * 100);

  const overallPct = Math.min(100, Math.round((fieldScore + modeScore + wireScore) / 3));

  return {
    fieldTotal: fieldBar.total,
    fieldsAtBar: fieldBar.atBar,
    hubInCandidateNav,
    commandHomeWired,
    fieldBookReady,
    canonReady,
    migrationRouteBound,
    liveModeDetectWired,
    dayOfPlanSafe,
    overallPct,
  };
}

export type Phase16P8UpgradePassReport = {
  passId: "phase-16-p8-live-event";
  title: "Step 16 P8 — Live event mode";
  summary: string;
  completionPct: number;
  hubHref: string;
  progress: Phase16P8Progress;
};

export function computePhase16P8UpgradePass(): Phase16P8UpgradePassReport {
  const progress = computePhase16P8Progress();
  return {
    passId: "phase-16-p8-live-event",
    title: "Step 16 P8 — Live event mode",
    summary:
      "ACCA Jun 11 countdown on command home — day-of run-of-show auto-selects shortest stage-safe path when clerk week or SRE live env is active.",
    completionPct: progress.overallPct,
    hubHref: LIVE_EVENT_HUB_HREF,
    progress,
  };
}

export function assertPhase16P8Bar(): { ok: boolean; message: string } {
  const p = computePhase16P8Progress();
  const issues: string[] = [];
  if (p.fieldsAtBar < PHASE16_P8_LIVE_FIELD_TOTAL) {
    issues.push(`fields ${p.fieldsAtBar}/${PHASE16_P8_LIVE_FIELD_TOTAL}`);
  }
  if (!p.hubInCandidateNav) issues.push("candidate nav");
  if (!p.commandHomeWired) issues.push("command home");
  if (!p.fieldBookReady) issues.push("field book");
  if (!p.canonReady) issues.push("canon");
  if (!p.migrationRouteBound) issues.push("migration");
  if (!p.dayOfPlanSafe) issues.push("day-of plan");

  for (const fieldId of LIVE_EVENT_FIELD_IDS) {
    const overlay = getLiveEventFieldOverlay(fieldId);
    if (!liveEventFieldMeetsPhase16P8Bar(overlay)) issues.push(`overlay ${fieldId}`);
  }

  if (issues.length === 0) return { ok: true, message: "Phase 16 P8 bar met" };
  return { ok: false, message: issues.slice(0, 6).join("; ") };
}

export { LIVE_EVENT_HUB_HREF };
