/**
 * Phase 16 P0 — Session launcher depth overlays.
 */
import {
  getRehearsalEncounterOption,
  listRehearsalEncounterOptions,
  getDefaultRunOfShowSteps,
  REHEARSAL_HUB_HREF,
  type RehearsalEncounterId,
  type RehearsalRunOfShowStep,
} from "@/lib/intelligence/v4/phase16P0SessionLauncher";

export { REHEARSAL_HUB_HREF };

export type RehearsalEncounterOverlay = {
  encounterId: RehearsalEncounterId;
  launcherSteps: string[];
  wiredOnRoute: boolean;
};

export type RehearsalRunOfShowStepOverlay = {
  stepId: string;
  operatorSteps: string[];
  stageSafeRequired: boolean;
  wiredOnRoute: boolean;
};

export function getRehearsalEncounterOverlay(
  encounterId: RehearsalEncounterId,
): RehearsalEncounterOverlay | undefined {
  const option = getRehearsalEncounterOption(encounterId);
  if (!option) return undefined;
  return {
    encounterId,
    launcherSteps: [option.description, option.kellyRule, `Launch: ${option.launchHref}`],
    wiredOnRoute: option.launchHref.startsWith("/admin/intelligence"),
  };
}

export function rehearsalEncounterMeetsPhase16P0Bar(overlay: RehearsalEncounterOverlay): boolean {
  return overlay.launcherSteps.length >= 3 && overlay.wiredOnRoute;
}

export function countRehearsalEncountersAtBar(): { atBar: number; total: number } {
  const options = listRehearsalEncounterOptions();
  const atBar = options.filter((o) => {
    const overlay = getRehearsalEncounterOverlay(o.encounterId);
    return overlay && rehearsalEncounterMeetsPhase16P0Bar(overlay);
  }).length;
  return { atBar, total: options.length };
}

export function getRunOfShowStepOverlay(stepId: string): RehearsalRunOfShowStepOverlay | undefined {
  const steps = getDefaultRunOfShowSteps("debate-prep");
  const step = steps.find((s) => s.stepId === stepId);
  if (!step) return undefined;
  return buildStepOverlay(step);
}

function buildStepOverlay(step: RehearsalRunOfShowStep): RehearsalRunOfShowStepOverlay {
  return {
    stepId: step.stepId,
    operatorSteps: [step.kellyBeat, `Duration: ${step.durationLabel}`, `Route: ${step.href}`],
    stageSafeRequired: step.stageSafeRequired,
    wiredOnRoute: step.href.startsWith("/admin/intelligence"),
  };
}

export function runOfShowStepMeetsPhase16P0Bar(overlay: RehearsalRunOfShowStepOverlay): boolean {
  return overlay.operatorSteps.length >= 3 && overlay.wiredOnRoute;
}

export function countDefaultRunOfShowStepsAtBar(): { atBar: number; total: number } {
  const steps = getDefaultRunOfShowSteps("debate-prep");
  const atBar = steps.filter((s) => {
    const o = getRunOfShowStepOverlay(s.stepId);
    return o && runOfShowStepMeetsPhase16P0Bar(o);
  }).length;
  return { atBar, total: steps.length };
}
