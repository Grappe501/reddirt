/**
 * Phase 16 P0 — Session launcher closure.
 */
import { buildCandidateCommandHomeFeed } from "@/lib/intelligence/v4/candidateCommandHome";
import { flattenCandidateCommandNavLinks, buildCandidateCommandNavSections } from "@/lib/intelligence/v4/candidateCommandNav";
import {
  buildRehearsalLauncherSummary,
  buildRehearsalSession,
  listRehearsalEncounterOptions,
  PHASE16_P0_DEFAULT_RUN_OF_SHOW_MINUTES,
  PHASE16_P0_DEFAULT_RUN_OF_SHOW_STEP_TOTAL,
  PHASE16_P0_ENCOUNTER_TOTAL,
  REHEARSAL_HUB_HREF,
} from "@/lib/intelligence/v4/phase16P0SessionLauncher";
import {
  countDefaultRunOfShowStepsAtBar,
  countRehearsalEncountersAtBar,
  getRehearsalEncounterOverlay,
  getRunOfShowStepOverlay,
  rehearsalEncounterMeetsPhase16P0Bar,
  runOfShowStepMeetsPhase16P0Bar,
} from "@/lib/intelligence/v4/phase16P0SessionLauncherDepth";
import { getFieldBookArticle } from "@/lib/intelligence/fieldBookRegistry";
import { resolveCanonBinding } from "@/lib/intelligence/fieldBookCanonRegistry";
import { listStrategyMigrationRoutes } from "@/lib/intelligence/v4/strategyMigrationBridge";

export type Phase16P0Progress = {
  encounterTotal: number;
  encountersAtBar: number;
  runOfShowStepTotal: number;
  runOfShowStepsAtBar: number;
  defaultSessionMinutes: number;
  hubInCandidateNav: boolean;
  commandHomeWired: boolean;
  fieldBookReady: boolean;
  canonReady: boolean;
  migrationRouteBound: boolean;
  overallPct: number;
};

export function computePhase16P0Progress(): Phase16P0Progress {
  const encounterBar = countRehearsalEncountersAtBar();
  const stepBar = countDefaultRunOfShowStepsAtBar();
  const feed = buildCandidateCommandHomeFeed();
  const defaultSession = buildRehearsalSession("debate-prep");

  const candidateHrefs = new Set(
    flattenCandidateCommandNavLinks(buildCandidateCommandNavSections("CANDIDATE")).map((l) => l.href),
  );

  const hubInCandidateNav = candidateHrefs.has(REHEARSAL_HUB_HREF);
  const commandHomeWired = Boolean(feed.rehearsalLauncher?.tonightReminder);
  const fieldBookReady = Boolean(getFieldBookArticle("session-launcher-command"));
  const canonReady = Boolean(resolveCanonBinding(REHEARSAL_HUB_HREF));
  const migrationRouteBound = listStrategyMigrationRoutes().some(
    (r) => r.intelligenceHref === REHEARSAL_HUB_HREF,
  );

  const encounterScore =
    encounterBar.atBar >= PHASE16_P0_ENCOUNTER_TOTAL ? 100 : Math.round((encounterBar.atBar / PHASE16_P0_ENCOUNTER_TOTAL) * 100);
  const stepScore =
    stepBar.atBar >= PHASE16_P0_DEFAULT_RUN_OF_SHOW_STEP_TOTAL
      ? 100
      : Math.round((stepBar.atBar / PHASE16_P0_DEFAULT_RUN_OF_SHOW_STEP_TOTAL) * 100);
  const minutesScore =
    defaultSession.durationMinutes >= PHASE16_P0_DEFAULT_RUN_OF_SHOW_MINUTES - 2 &&
    defaultSession.durationMinutes <= PHASE16_P0_DEFAULT_RUN_OF_SHOW_MINUTES + 2
      ? 100
      : 85;
  const wireChecks = [hubInCandidateNav, commandHomeWired, fieldBookReady, canonReady, migrationRouteBound];
  const wireScore = Math.round((wireChecks.filter(Boolean).length / wireChecks.length) * 100);

  const overallPct = Math.min(100, Math.round((encounterScore + stepScore + minutesScore + wireScore) / 4));

  return {
    encounterTotal: encounterBar.total,
    encountersAtBar: encounterBar.atBar,
    runOfShowStepTotal: stepBar.total,
    runOfShowStepsAtBar: stepBar.atBar,
    defaultSessionMinutes: defaultSession.durationMinutes,
    hubInCandidateNav,
    commandHomeWired,
    fieldBookReady,
    canonReady,
    migrationRouteBound,
    overallPct,
  };
}

export type Phase16P0UpgradePassReport = {
  passId: "phase-16-p0-session-launcher";
  title: "Step 16 P0 — Session launcher";
  summary: string;
  completionPct: number;
  hubHref: string;
  progress: Phase16P0Progress;
};

export function computePhase16P0UpgradePass(): Phase16P0UpgradePassReport {
  const progress = computePhase16P0Progress();
  return {
    passId: "phase-16-p0-session-launcher",
    title: "Step 16 P0 — Session launcher",
    summary:
      "Stage Rehearsal Engine entry — four encounter types, default 30-minute debate-prep run-of-show, and command home launcher strip deep-linking existing prep surfaces.",
    completionPct: progress.overallPct,
    hubHref: REHEARSAL_HUB_HREF,
    progress,
  };
}

export function assertPhase16P0Bar(): { ok: boolean; message: string } {
  const p = computePhase16P0Progress();
  const issues: string[] = [];
  if (p.encountersAtBar < PHASE16_P0_ENCOUNTER_TOTAL) {
    issues.push(`encounters ${p.encountersAtBar}/${PHASE16_P0_ENCOUNTER_TOTAL}`);
  }
  if (p.runOfShowStepsAtBar < PHASE16_P0_DEFAULT_RUN_OF_SHOW_STEP_TOTAL) {
    issues.push(`steps ${p.runOfShowStepsAtBar}/${PHASE16_P0_DEFAULT_RUN_OF_SHOW_STEP_TOTAL}`);
  }
  if (
    p.defaultSessionMinutes < PHASE16_P0_DEFAULT_RUN_OF_SHOW_MINUTES - 2 ||
    p.defaultSessionMinutes > PHASE16_P0_DEFAULT_RUN_OF_SHOW_MINUTES + 2
  ) {
    issues.push(`minutes ${p.defaultSessionMinutes}`);
  }
  if (!p.hubInCandidateNav) issues.push("candidate nav");
  if (!p.commandHomeWired) issues.push("command home");
  if (!p.fieldBookReady) issues.push("field book");
  if (!p.canonReady) issues.push("canon");
  if (!p.migrationRouteBound) issues.push("migration");

  for (const encounter of listRehearsalEncounterOptions()) {
    const o = getRehearsalEncounterOverlay(encounter.encounterId);
    if (!o || !rehearsalEncounterMeetsPhase16P0Bar(o)) issues.push(`overlay ${encounter.encounterId}`);
  }

  const defaultSession = buildRehearsalSession("debate-prep");
  for (const step of defaultSession.steps) {
    const o = getRunOfShowStepOverlay(step.stepId);
    if (!o || !runOfShowStepMeetsPhase16P0Bar(o)) issues.push(`step ${step.stepId}`);
  }

  if (issues.length === 0) return { ok: true, message: "Phase 16 P0 bar met" };
  return { ok: false, message: issues.slice(0, 6).join("; ") };
}

export { REHEARSAL_HUB_HREF };
