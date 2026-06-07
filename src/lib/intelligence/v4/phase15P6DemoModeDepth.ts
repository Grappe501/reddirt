/**
 * Phase 15 P6 — Demo mode depth overlays.
 */
import {
  DEMO_MODE_HUB_HREF,
  getDemoScriptStep,
  listDemoScriptSteps,
  type DemoScriptStep,
} from "@/lib/intelligence/v4/phase15P6DemoMode";

export { DEMO_MODE_HUB_HREF };

export type DemoScriptStepOverlay = {
  stepId: string;
  operatorSteps: string[];
  wiredOnRoute: boolean;
};

export function getDemoScriptStepOverlay(stepId: string): DemoScriptStepOverlay | undefined {
  const step = getDemoScriptStep(stepId);
  if (!step) return undefined;
  return {
    stepId,
    operatorSteps: [
      step.demoBeat,
      `Buyer line: ${step.buyerLine}`,
      step.staffNote,
    ],
    wiredOnRoute: step.href.startsWith("/admin/intelligence"),
  };
}

export function demoScriptStepMeetsPhase15P6Bar(overlay: DemoScriptStepOverlay): boolean {
  return overlay.operatorSteps.length >= 3 && overlay.wiredOnRoute;
}

export function countDemoScriptStepsAtBar(): { atBar: number; total: number } {
  const steps = listDemoScriptSteps();
  const atBar = steps.filter((s) => {
    const o = getDemoScriptStepOverlay(s.stepId);
    return o && demoScriptStepMeetsPhase15P6Bar(o);
  }).length;
  return { atBar, total: steps.length };
}

export function listDemoScriptStepRows(): DemoScriptStep[] {
  return listDemoScriptSteps();
}
