/**
 * Phase 16 P2 — Encounter scenarios closure.
 */
import { buildCandidateCommandHomeFeed } from "@/lib/intelligence/v4/candidateCommandHome";
import { flattenCandidateCommandNavLinks, buildCandidateCommandNavSections } from "@/lib/intelligence/v4/candidateCommandNav";
import {
  buildEncounterScenariosSummary,
  ENCOUNTER_SCENARIO_IDS,
  ENCOUNTERS_HUB_HREF,
  getEncounterScenario,
  getEncounterScenarioSteps,
  PHASE16_P2_SCENARIO_TOTAL,
  scenarioPrimaryBindMatches,
} from "@/lib/intelligence/v4/phase16P2EncounterScenarios";
import {
  countAccaScenarioStepsAtBar,
  countEncounterScenariosAtBar,
  encounterScenarioMeetsPhase16P2Bar,
  encounterScenarioStepMeetsPhase16P2Bar,
  getEncounterScenarioOverlay,
  getEncounterScenarioStepOverlay,
} from "@/lib/intelligence/v4/phase16P2EncounterScenariosDepth";
import { getFieldBookArticle } from "@/lib/intelligence/fieldBookRegistry";
import { resolveCanonBinding } from "@/lib/intelligence/fieldBookCanonRegistry";
import { listStrategyMigrationRoutes } from "@/lib/intelligence/v4/strategyMigrationBridge";

export type Phase16P2Progress = {
  scenarioTotal: number;
  scenariosAtBar: number;
  accaStepTotal: number;
  accaStepsAtBar: number;
  accaPrimaryBindWired: boolean;
  hubInCandidateNav: boolean;
  commandHomeWired: boolean;
  fieldBookReady: boolean;
  canonReady: boolean;
  migrationRouteBound: boolean;
  overallPct: number;
};

export function computePhase16P2Progress(): Phase16P2Progress {
  const scenarioBar = countEncounterScenariosAtBar();
  const accaStepBar = countAccaScenarioStepsAtBar();
  const feed = buildCandidateCommandHomeFeed();
  const acca = getEncounterScenario("acca-panel");

  const candidateHrefs = new Set(
    flattenCandidateCommandNavLinks(buildCandidateCommandNavSections("CANDIDATE")).map((l) => l.href),
  );

  const hubInCandidateNav = candidateHrefs.has(ENCOUNTERS_HUB_HREF);
  const commandHomeWired = Boolean(feed.encounterScenarios?.tonightReminder);
  const fieldBookReady = Boolean(getFieldBookArticle("encounter-scenarios-command"));
  const canonReady = Boolean(resolveCanonBinding(ENCOUNTERS_HUB_HREF));
  const migrationRouteBound = listStrategyMigrationRoutes().some(
    (r) => r.intelligenceHref === ENCOUNTERS_HUB_HREF,
  );
  const accaPrimaryBindWired = acca
    ? acca.primaryBindHref.includes("acca-summer-conference") && scenarioPrimaryBindMatches("acca-panel")
    : false;

  const scenarioScore =
    scenarioBar.atBar >= PHASE16_P2_SCENARIO_TOTAL
      ? 100
      : Math.round((scenarioBar.atBar / PHASE16_P2_SCENARIO_TOTAL) * 100);
  const stepScore =
    accaStepBar.atBar >= accaStepBar.total ? 100 : Math.round((accaStepBar.atBar / Math.max(1, accaStepBar.total)) * 100);
  const bindScore = accaPrimaryBindWired ? 100 : 70;
  const wireChecks = [hubInCandidateNav, commandHomeWired, fieldBookReady, canonReady, migrationRouteBound];
  const wireScore = Math.round((wireChecks.filter(Boolean).length / wireChecks.length) * 100);

  const overallPct = Math.min(100, Math.round((scenarioScore + stepScore + bindScore + wireScore) / 4));

  return {
    scenarioTotal: scenarioBar.total,
    scenariosAtBar: scenarioBar.atBar,
    accaStepTotal: accaStepBar.total,
    accaStepsAtBar: accaStepBar.atBar,
    accaPrimaryBindWired,
    hubInCandidateNav,
    commandHomeWired,
    fieldBookReady,
    canonReady,
    migrationRouteBound,
    overallPct,
  };
}

export type Phase16P2UpgradePassReport = {
  passId: "phase-16-p2-encounter-scenarios";
  title: "Step 16 P2 — Encounter scenarios";
  summary: string;
  completionPct: number;
  hubHref: string;
  progress: Phase16P2Progress;
};

export function computePhase16P2UpgradePass(): Phase16P2UpgradePassReport {
  const progress = computePhase16P2Progress();
  return {
    passId: "phase-16-p2-encounter-scenarios",
    title: "Step 16 P2 — Encounter scenarios",
    summary:
      "Four encounter scenarios — three-way debate, ACCA panel, clerk 1:1, purchase walkthrough — each binds existing prep depth with evidence honesty gates and primary route anchors.",
    completionPct: progress.overallPct,
    hubHref: ENCOUNTERS_HUB_HREF,
    progress,
  };
}

export function assertPhase16P2Bar(): { ok: boolean; message: string } {
  const p = computePhase16P2Progress();
  const issues: string[] = [];
  if (p.scenariosAtBar < PHASE16_P2_SCENARIO_TOTAL) {
    issues.push(`scenarios ${p.scenariosAtBar}/${PHASE16_P2_SCENARIO_TOTAL}`);
  }
  if (p.accaStepsAtBar < p.accaStepTotal) {
    issues.push(`acca steps ${p.accaStepsAtBar}/${p.accaStepTotal}`);
  }
  if (!p.accaPrimaryBindWired) issues.push("acca bind");
  if (!p.hubInCandidateNav) issues.push("candidate nav");
  if (!p.commandHomeWired) issues.push("command home");
  if (!p.fieldBookReady) issues.push("field book");
  if (!p.canonReady) issues.push("canon");
  if (!p.migrationRouteBound) issues.push("migration");

  for (const scenarioId of ENCOUNTER_SCENARIO_IDS) {
    const o = getEncounterScenarioOverlay(scenarioId);
    if (!o || !encounterScenarioMeetsPhase16P2Bar(o)) issues.push(`overlay ${scenarioId}`);
  }

  for (const step of getEncounterScenarioSteps("acca-panel")) {
    const o = getEncounterScenarioStepOverlay("acca-panel", step.stepId);
    if (!o || !encounterScenarioStepMeetsPhase16P2Bar(o)) issues.push(`step ${step.stepId}`);
  }

  if (issues.length === 0) return { ok: true, message: "Phase 16 P2 bar met" };
  return { ok: false, message: issues.slice(0, 6).join("; ") };
}

export { ENCOUNTERS_HUB_HREF };
