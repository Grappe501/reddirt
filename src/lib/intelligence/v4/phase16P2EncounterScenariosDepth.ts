/**
 * Phase 16 P2 — Encounter scenario depth overlays.
 */
import {
  ENCOUNTER_SCENARIO_IDS,
  ENCOUNTERS_HUB_HREF,
  getEncounterScenario,
  getEncounterScenarioSteps,
  scenarioPrimaryBindMatches,
  type EncounterScenarioId,
} from "@/lib/intelligence/v4/phase16P2EncounterScenarios";
import { rehearsalRouteWired } from "@/lib/intelligence/v4/rehearsalRouteWiring";

export { ENCOUNTERS_HUB_HREF };

export type EncounterScenarioOverlay = {
  scenarioId: EncounterScenarioId;
  operatorSteps: string[];
  primaryBindWired: boolean;
  honestyRulePresent: boolean;
  wiredOnRoute: boolean;
};

export type EncounterScenarioStepOverlay = {
  stepId: string;
  operatorSteps: string[];
  stageSafeRequired: boolean;
  wiredOnRoute: boolean;
};

export function getEncounterScenarioOverlay(
  scenarioId: EncounterScenarioId,
): EncounterScenarioOverlay | undefined {
  const scenario = getEncounterScenario(scenarioId);
  if (!scenario) return undefined;
  return {
    scenarioId,
    operatorSteps: [
      scenario.description,
      scenario.kellyRule,
      `${scenario.audienceLabel} · ${scenario.venueLabel}`,
      scenario.honestyRule,
      `Primary bind: ${scenario.primaryBindHref}`,
    ],
    primaryBindWired: scenarioPrimaryBindMatches(scenarioId),
    honestyRulePresent: scenario.honestyRule.length > 0,
    wiredOnRoute: scenario.launchHref.startsWith("/admin/intelligence"),
  };
}

export function encounterScenarioMeetsPhase16P2Bar(overlay: EncounterScenarioOverlay): boolean {
  return (
    overlay.operatorSteps.length >= 4 &&
    overlay.primaryBindWired &&
    overlay.honestyRulePresent &&
    overlay.wiredOnRoute
  );
}

export function countEncounterScenariosAtBar(): { atBar: number; total: number } {
  const atBar = ENCOUNTER_SCENARIO_IDS.filter((id) => {
    const o = getEncounterScenarioOverlay(id);
    return o && encounterScenarioMeetsPhase16P2Bar(o);
  }).length;
  return { atBar, total: ENCOUNTER_SCENARIO_IDS.length };
}

export function getEncounterScenarioStepOverlay(
  scenarioId: EncounterScenarioId,
  stepId: string,
): EncounterScenarioStepOverlay | undefined {
  const step = getEncounterScenarioSteps(scenarioId).find((s) => s.stepId === stepId);
  if (!step) return undefined;
  return {
    stepId,
    operatorSteps: [step.kellyBeat, `Duration: ${step.durationLabel}`, `Route: ${step.href}`],
    stageSafeRequired: step.stageSafeRequired,
    wiredOnRoute: rehearsalRouteWired(step.href),
  };
}

export function encounterScenarioStepMeetsPhase16P2Bar(overlay: EncounterScenarioStepOverlay): boolean {
  return overlay.operatorSteps.length >= 3 && overlay.wiredOnRoute;
}

export function countAccaScenarioStepsAtBar(): { atBar: number; total: number } {
  const steps = getEncounterScenarioSteps("acca-panel");
  const atBar = steps.filter((s) => {
    const o = getEncounterScenarioStepOverlay("acca-panel", s.stepId);
    return o && encounterScenarioStepMeetsPhase16P2Bar(o);
  }).length;
  return { atBar, total: steps.length };
}
