/**
 * Phase 16 P1 — Timed run-of-show closure.
 */
import { buildCandidateCommandHomeFeed } from "@/lib/intelligence/v4/candidateCommandHome";
import { flattenCandidateCommandNavLinks, buildCandidateCommandNavSections } from "@/lib/intelligence/v4/candidateCommandNav";
import {
  buildRunOfShowSummary,
  getRunOfShowStepsForPreset,
  listRunOfShowPresets,
  PHASE16_P1_PRESET_TOTAL,
  presetMinutesMatchTarget,
  RUN_OF_SHOW_HUB_HREF,
  RUN_OF_SHOW_PRESET_IDS,
} from "@/lib/intelligence/v4/phase16P1RunOfShow";
import {
  countRunOfShowPresetsAtBar,
  countStandardPresetStepsAtBar,
  getRunOfShowPresetOverlay,
  getRunOfShowPresetStepOverlay,
  runOfShowPresetMeetsPhase16P1Bar,
  runOfShowPresetStepMeetsPhase16P1Bar,
} from "@/lib/intelligence/v4/phase16P1RunOfShowDepth";
import { getFieldBookArticle } from "@/lib/intelligence/fieldBookRegistry";
import { resolveCanonBinding } from "@/lib/intelligence/fieldBookCanonRegistry";
import { listStrategyMigrationRoutes } from "@/lib/intelligence/v4/strategyMigrationBridge";

export type Phase16P1Progress = {
  presetTotal: number;
  presetsAtBar: number;
  standardStepTotal: number;
  standardStepsAtBar: number;
  hubInCandidateNav: boolean;
  commandHomeWired: boolean;
  fieldBookReady: boolean;
  canonReady: boolean;
  migrationRouteBound: boolean;
  allPresetsMinutesAligned: boolean;
  overallPct: number;
};

export function computePhase16P1Progress(): Phase16P1Progress {
  const presetBar = countRunOfShowPresetsAtBar();
  const stepBar = countStandardPresetStepsAtBar();
  const feed = buildCandidateCommandHomeFeed();

  const candidateHrefs = new Set(
    flattenCandidateCommandNavLinks(buildCandidateCommandNavSections("CANDIDATE")).map((l) => l.href),
  );

  const hubInCandidateNav =
    candidateHrefs.has(RUN_OF_SHOW_HUB_HREF) || Boolean(feed.runOfShow?.tonightReminder);
  const commandHomeWired = Boolean(feed.runOfShow?.tonightReminder);
  const fieldBookReady = Boolean(getFieldBookArticle("run-of-show-command"));
  const canonReady = Boolean(resolveCanonBinding(RUN_OF_SHOW_HUB_HREF));
  const migrationRouteBound = listStrategyMigrationRoutes().some(
    (r) => r.intelligenceHref === RUN_OF_SHOW_HUB_HREF,
  );
  const allPresetsMinutesAligned = RUN_OF_SHOW_PRESET_IDS.every((id) => presetMinutesMatchTarget(id));

  const presetScore =
    presetBar.atBar >= PHASE16_P1_PRESET_TOTAL ? 100 : Math.round((presetBar.atBar / PHASE16_P1_PRESET_TOTAL) * 100);
  const stepScore =
    stepBar.atBar >= stepBar.total ? 100 : Math.round((stepBar.atBar / Math.max(1, stepBar.total)) * 100);
  const alignScore = allPresetsMinutesAligned ? 100 : 70;
  const wireChecks = [hubInCandidateNav, commandHomeWired, fieldBookReady, canonReady, migrationRouteBound];
  const wireScore = Math.round((wireChecks.filter(Boolean).length / wireChecks.length) * 100);

  const overallPct = Math.min(100, Math.round((presetScore + stepScore + alignScore + wireScore) / 4));

  return {
    presetTotal: presetBar.total,
    presetsAtBar: presetBar.atBar,
    standardStepTotal: stepBar.total,
    standardStepsAtBar: stepBar.atBar,
    hubInCandidateNav,
    commandHomeWired,
    fieldBookReady,
    canonReady,
    migrationRouteBound,
    allPresetsMinutesAligned,
    overallPct,
  };
}

export type Phase16P1UpgradePassReport = {
  passId: "phase-16-p1-run-of-show";
  title: "Step 16 P1 — Timed run-of-show";
  summary: string;
  completionPct: number;
  hubHref: string;
  progress: Phase16P1Progress;
};

export function computePhase16P1UpgradePass(): Phase16P1UpgradePassReport {
  const progress = computePhase16P1Progress();
  return {
    passId: "phase-16-p1-run-of-show",
    title: "Step 16 P1 — Timed run-of-show",
    summary:
      "Four timed presets — 15, 30, 45, and 60 minutes — with step lists deep-linking existing prep surfaces and stage-safe gates on drill steps.",
    completionPct: progress.overallPct,
    hubHref: RUN_OF_SHOW_HUB_HREF,
    progress,
  };
}

export function assertPhase16P1Bar(): { ok: boolean; message: string } {
  const p = computePhase16P1Progress();
  const issues: string[] = [];
  if (p.presetsAtBar < PHASE16_P1_PRESET_TOTAL) issues.push(`presets ${p.presetsAtBar}/${PHASE16_P1_PRESET_TOTAL}`);
  if (p.standardStepsAtBar < p.standardStepTotal) {
    issues.push(`standard steps ${p.standardStepsAtBar}/${p.standardStepTotal}`);
  }
  if (!p.allPresetsMinutesAligned) issues.push("minutes alignment");
  if (!p.hubInCandidateNav) issues.push("candidate nav");
  if (!p.commandHomeWired) issues.push("command home");
  if (!p.fieldBookReady) issues.push("field book");
  if (!p.canonReady) issues.push("canon");
  if (!p.migrationRouteBound) issues.push("migration");

  for (const presetId of RUN_OF_SHOW_PRESET_IDS) {
    const o = getRunOfShowPresetOverlay(presetId);
    if (!o || !runOfShowPresetMeetsPhase16P1Bar(o)) issues.push(`overlay ${presetId}`);
  }

  for (const step of getRunOfShowStepsForPreset("standard-30")) {
    const o = getRunOfShowPresetStepOverlay("standard-30", step.stepId);
    if (!o || !runOfShowPresetStepMeetsPhase16P1Bar(o)) issues.push(`step ${step.stepId}`);
  }

  if (issues.length === 0) return { ok: true, message: "Phase 16 P1 bar met" };
  return { ok: false, message: issues.slice(0, 6).join("; ") };
}

export { RUN_OF_SHOW_HUB_HREF };
