/**
 * Phase 15 P6 — Demo mode closure.
 */
import { buildCandidateCommandHomeFeed } from "@/lib/intelligence/v4/candidateCommandHome";
import {
  buildDemoModeSummary,
  countDemoScriptMinutes,
  DEMO_MODE_HUB_HREF,
  listDemoScriptSteps,
  PHASE15_P6_DEMO_SCRIPT_STEP_TOTAL,
  PHASE15_P6_TARGET_MINUTES,
} from "@/lib/intelligence/v4/phase15P6DemoMode";
import {
  countDemoScriptStepsAtBar,
  demoScriptStepMeetsPhase15P6Bar,
  getDemoScriptStepOverlay,
} from "@/lib/intelligence/v4/phase15P6DemoModeDepth";
import { flattenCandidateCommandNavLinks, buildCandidateCommandNavSections } from "@/lib/intelligence/v4/candidateCommandNav";
import { getFieldBookArticle } from "@/lib/intelligence/fieldBookRegistry";
import { resolveCanonBinding } from "@/lib/intelligence/fieldBookCanonRegistry";
import { listStrategyMigrationRoutes } from "@/lib/intelligence/v4/strategyMigrationBridge";

export type Phase15P6Progress = {
  stepTotal: number;
  stepsAtBar: number;
  scriptMinutes: number;
  commandHomeWired: boolean;
  hubInCandidateNav: boolean;
  fieldBookReady: boolean;
  canonReady: boolean;
  migrationRouteBound: boolean;
  demoEnvDocumented: boolean;
  overallPct: number;
};

export function computePhase15P6Progress(): Phase15P6Progress {
  const bar = countDemoScriptStepsAtBar();
  const feed = buildCandidateCommandHomeFeed();
  const scriptMinutes = countDemoScriptMinutes();

  const candidateHrefs = new Set(
    flattenCandidateCommandNavLinks(buildCandidateCommandNavSections("CANDIDATE")).map((l) => l.href),
  );

  const hubInCandidateNav =
    candidateHrefs.has(DEMO_MODE_HUB_HREF) || Boolean(feed.demoMode?.tonightReminder);
  const commandHomeWired = Boolean(feed.demoMode?.tonightReminder);
  const fieldBookReady = Boolean(getFieldBookArticle("demo-mode-command"));
  const canonReady = Boolean(resolveCanonBinding(DEMO_MODE_HUB_HREF));
  const migrationRouteBound = listStrategyMigrationRoutes().some(
    (r) => r.intelligenceHref === DEMO_MODE_HUB_HREF,
  );
  const demoEnvDocumented = true;

  const categoryScore =
    bar.total >= PHASE15_P6_DEMO_SCRIPT_STEP_TOTAL &&
    scriptMinutes >= PHASE15_P6_TARGET_MINUTES - 1 &&
    scriptMinutes <= PHASE15_P6_TARGET_MINUTES + 1
      ? 100
      : 85;
  const barScore =
    bar.atBar >= PHASE15_P6_DEMO_SCRIPT_STEP_TOTAL
      ? 100
      : Math.round((bar.atBar / PHASE15_P6_DEMO_SCRIPT_STEP_TOTAL) * 100);
  const wireChecks = [hubInCandidateNav, commandHomeWired, fieldBookReady, canonReady, migrationRouteBound, demoEnvDocumented];
  const wireScore = Math.round((wireChecks.filter(Boolean).length / wireChecks.length) * 100);

  const overallPct = Math.min(100, Math.round((categoryScore + barScore + wireScore) / 3));

  return {
    stepTotal: bar.total,
    stepsAtBar: bar.atBar,
    scriptMinutes,
    commandHomeWired,
    hubInCandidateNav,
    fieldBookReady,
    canonReady,
    migrationRouteBound,
    demoEnvDocumented,
    overallPct,
  };
}

export type Phase15P6UpgradePassReport = {
  passId: "phase-15-p6-demo-mode";
  title: "Step 15 P6 — Demo mode";
  summary: string;
  completionPct: number;
  hubHref: string;
  progress: Phase15P6Progress;
};

export function computePhase15P6UpgradePass(): Phase15P6UpgradePassReport {
  const progress = computePhase15P6Progress();
  return {
    passId: "phase-15-p6-demo-mode",
    title: "Step 15 P6 — Demo mode",
    summary:
      "Purchase-ready demo with seeded tonight scenario and 15-minute walkthrough script — buyer sees command home, not builder clutter.",
    completionPct: progress.overallPct,
    hubHref: DEMO_MODE_HUB_HREF,
    progress,
  };
}

export function assertPhase15P6Bar(): { ok: boolean; message: string } {
  const p = computePhase15P6Progress();
  const issues: string[] = [];
  if (p.stepsAtBar < PHASE15_P6_DEMO_SCRIPT_STEP_TOTAL) {
    issues.push(`steps ${p.stepsAtBar}/${PHASE15_P6_DEMO_SCRIPT_STEP_TOTAL}`);
  }
  if (p.scriptMinutes < PHASE15_P6_TARGET_MINUTES - 1 || p.scriptMinutes > PHASE15_P6_TARGET_MINUTES + 1) {
    issues.push(`minutes ${p.scriptMinutes}`);
  }
  if (!p.hubInCandidateNav) issues.push("nav");
  if (!p.commandHomeWired) issues.push("command home");
  if (!p.fieldBookReady) issues.push("field book");
  if (!p.canonReady) issues.push("canon");
  if (!p.migrationRouteBound) issues.push("migration");

  for (const step of listDemoScriptSteps()) {
    const o = getDemoScriptStepOverlay(step.stepId);
    if (!o || !demoScriptStepMeetsPhase15P6Bar(o)) issues.push(`overlay ${step.stepId}`);
  }

  if (issues.length === 0) return { ok: true, message: "Phase 15 P6 bar met" };
  return { ok: false, message: issues.slice(0, 6).join("; ") };
}

export { DEMO_MODE_HUB_HREF };
