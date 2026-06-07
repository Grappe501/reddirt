/**
 * Phase 16 P1 — Run-of-show preset depth overlays.
 */
import {
  getRunOfShowPreset,
  getRunOfShowStepsForPreset,
  listRunOfShowPresets,
  RUN_OF_SHOW_HUB_HREF,
  RUN_OF_SHOW_PRESET_IDS,
  type RunOfShowPresetId,
} from "@/lib/intelligence/v4/phase16P1RunOfShow";

export { RUN_OF_SHOW_HUB_HREF };

export type RunOfShowPresetOverlay = {
  presetId: RunOfShowPresetId;
  operatorSteps: string[];
  minutesAligned: boolean;
  wiredOnRoute: boolean;
};

export type RunOfShowPresetStepOverlay = {
  stepId: string;
  operatorSteps: string[];
  stageSafeRequired: boolean;
  wiredOnRoute: boolean;
};

export function getRunOfShowPresetOverlay(presetId: RunOfShowPresetId): RunOfShowPresetOverlay | undefined {
  const preset = getRunOfShowPreset(presetId);
  if (!preset) return undefined;
  const steps = getRunOfShowStepsForPreset(presetId);
  const actualMinutes = steps.reduce((s, st) => s + st.durationMinutes, 0);
  return {
    presetId,
    operatorSteps: [preset.description, preset.kellyRule, `${steps.length} steps · ${actualMinutes} min total`],
    minutesAligned: Math.abs(actualMinutes - preset.durationMinutes) <= 2,
    wiredOnRoute: preset.launchHref.startsWith("/admin/intelligence"),
  };
}

export function runOfShowPresetMeetsPhase16P1Bar(overlay: RunOfShowPresetOverlay): boolean {
  return overlay.operatorSteps.length >= 3 && overlay.minutesAligned && overlay.wiredOnRoute;
}

export function countRunOfShowPresetsAtBar(): { atBar: number; total: number } {
  const atBar = RUN_OF_SHOW_PRESET_IDS.filter((id) => {
    const o = getRunOfShowPresetOverlay(id);
    return o && runOfShowPresetMeetsPhase16P1Bar(o);
  }).length;
  return { atBar, total: RUN_OF_SHOW_PRESET_IDS.length };
}

export function getRunOfShowPresetStepOverlay(
  presetId: RunOfShowPresetId,
  stepId: string,
): RunOfShowPresetStepOverlay | undefined {
  const step = getRunOfShowStepsForPreset(presetId).find((s) => s.stepId === stepId);
  if (!step) return undefined;
  return {
    stepId,
    operatorSteps: [step.kellyBeat, `Duration: ${step.durationLabel}`, `Route: ${step.href}`],
    stageSafeRequired: step.stageSafeRequired,
    wiredOnRoute: step.href.startsWith("/admin/intelligence"),
  };
}

export function runOfShowPresetStepMeetsPhase16P1Bar(overlay: RunOfShowPresetStepOverlay): boolean {
  return overlay.operatorSteps.length >= 3 && overlay.wiredOnRoute;
}

export function countStandardPresetStepsAtBar(): { atBar: number; total: number } {
  const steps = getRunOfShowStepsForPreset("standard-30");
  const atBar = steps.filter((s) => {
    const o = getRunOfShowPresetStepOverlay("standard-30", s.stepId);
    return o && runOfShowPresetStepMeetsPhase16P1Bar(o);
  }).length;
  return { atBar, total: steps.length };
}

export function listRunOfShowPresetRows() {
  return listRunOfShowPresets();
}
