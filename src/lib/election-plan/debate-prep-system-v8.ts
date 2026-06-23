/**
 * Debate Prep System v8 — world-class readiness engine.
 * Layers unified operator package (v7) with 8-dimension radar, prep modes, simulations, and dress rehearsal.
 */
import "server-only";

import {
  buildDebatePrepTonightPackage,
  buildDebatePrepSystemV7Snapshot,
  type DebatePrepSystemV7Snapshot,
  type DebatePrepTonightPackage,
} from "@/lib/election-plan/debate-prep-system-v7";
import { buildDebatePrepPathwayTonightFocus } from "@/lib/election-plan/debate-prep-hub-tonight";
import {
  buildDebatePrepWorldClassEngine,
  pickSmartTrapLane,
  type DebatePrepWorldClassEngineSlice,
} from "@/lib/election-plan/debatePrepWorldClassEngine";
import { epTrapLaneHref } from "@/lib/election-plan/debate-prep-links";
import { DEBATE_PREP_PACKAGE_LABEL } from "@/lib/election-plan/debate-prep-links";
import { loadKellyDebatePackageProgress } from "@/lib/intelligence/v4/kellyDebatePackageProgress";
import { countWorldClassDressQueueCards } from "@/lib/intelligence/v4/debatePrepWorldClassDressCards";
import type {
  DebatePrepTonightPackageV8,
  DebatePrepTonightStepV8,
} from "@/lib/election-plan/debate-prep-system-v8-types";

export { DEBATE_PREP_PACKAGE_LABEL } from "@/lib/election-plan/debate-prep-links";
export type { DebatePrepTonightPackageV8, DebatePrepTonightStepV8 } from "@/lib/election-plan/debate-prep-system-v8-types";

export const DEBATE_PREP_SYSTEM_V8_VERSION = "debate-prep-system-v8.8-day8-command-course-v1.1.0";

export type DebatePrepSystemV8Snapshot = Omit<
  DebatePrepSystemV7Snapshot,
  "version" | "headline" | "intro" | "packageLabel" | "readinessPct" | "readinessLabel" | "todayFocus" | "tonightPackage" | "modules"
> & {
  version: typeof DEBATE_PREP_SYSTEM_V8_VERSION;
  headline: string;
  intro: string;
  packageLabel: typeof DEBATE_PREP_PACKAGE_LABEL;
  readinessPct: number;
  readinessLabel: string;
  todayFocus: string | null;
  tonightPackage: DebatePrepTonightPackageV8;
  modules: DebatePrepSystemV7Snapshot["modules"];
  worldClass: DebatePrepWorldClassEngineSlice;
};

function enrichTonightPackageWithSmartTrap(
  pkg: DebatePrepTonightPackage,
  smartTrapLaneId: string,
  completedStepIds: string[],
): DebatePrepTonightPackageV8 {
  const steps = pkg.steps.map((step) => {
    let href = step.href;
    if (step.stepId === "forum-trap" || step.stepId === "trap-lane") {
      href = epTrapLaneHref(smartTrapLaneId);
    }
    return {
      ...step,
      href,
      completed: completedStepIds.includes(step.stepId),
    } satisfies DebatePrepTonightStepV8;
  });
  return {
    ...pkg,
    steps,
    stepsCompleted: steps.filter((s) => s.completed).length,
  };
}

export function buildDebatePrepSystemV8Snapshot(referenceDate?: string): DebatePrepSystemV8Snapshot {
  const base = buildDebatePrepSystemV7Snapshot(referenceDate);
  const packageProgress = loadKellyDebatePackageProgress();
  const worldClass = buildDebatePrepWorldClassEngine(base.forumIntel, referenceDate);
  const tonightBase = buildDebatePrepTonightPackage(referenceDate);
  const tonightPackage = enrichTonightPackageWithSmartTrap(
    tonightBase,
    worldClass.smartTrapLaneId,
    packageProgress.completedStepIds,
  );

  worldClass.tonightStepsTotal = tonightPackage.steps.length;
  worldClass.tonightStepsCompleted = tonightPackage.stepsCompleted;
  worldClass.worldClassDressCardCount = countWorldClassDressQueueCards();

  const readinessPct = Math.min(
    100,
    Math.round(base.readinessPct * 0.4 + worldClass.compositeReadinessScore * 0.6),
  );

  const modules = base.modules.map((mod) => {
    if (mod.id === "rehearsal") {
      return {
        ...mod,
        status: worldClass.worldClassDressCardCount > 0 ? ("ready" as const) : mod.status,
        statusNote: `${mod.statusNote ?? ""} · world-class dress queue (${worldClass.worldClassDressCardCount} cards)`.trim(),
      };
    }
    if (mod.id === "ai-tutor") {
      return {
        ...mod,
        statusNote: `${mod.statusNote ?? ""} · 8 prep modes · pile-on sim`.trim(),
      };
    }
    if (mod.id === "trap-lanes") {
      return {
        ...mod,
        statusNote: `Smart pick tonight: ${worldClass.smartTrapLaneId.replace(/-/g, " ")}`,
      };
    }
    if (mod.id === "command-home") {
      return {
        ...mod,
        statusNote: `${worldClass.countdownLabel} · ${readinessPct}% composite · ${tonightPackage.stepsCompleted}/${tonightPackage.steps.length} tonight steps`,
      };
    }
    return mod;
  });

  const weakHigh = worldClass.weakSpots.filter((w) => w.severity === "high").length;

  const pathwayTonightFocus = buildDebatePrepPathwayTonightFocus(referenceDate);

  const packageTonightFocus =
    tonightPackage.stepsCompleted < tonightPackage.steps.length
      ? `Tonight package ${tonightPackage.stepsCompleted}/${tonightPackage.steps.length} — next: ${tonightPackage.steps.find((s) => !s.completed)?.label ?? "debrief"}`
      : `Tonight package complete — run world-class dress (${worldClass.worldClassDressCardCount} cards) or T-24h war room.`;

  return {
    ...base,
    version: DEBATE_PREP_SYSTEM_V8_VERSION,
    headline: "Debate Prep System v8 · world-class engine",
    intro:
      "Every path to stage-ready — 8-dimension readiness radar, prep modes from panic-5 to full dress, pile-on simulations, quotable bank, scenario traps, psychology stack, and tracked tonight package. Built for Kelly's APA statewide broadcast — clerks in the lines, the whole state in the room.",
    packageLabel: DEBATE_PREP_PACKAGE_LABEL,
    readinessPct,
    readinessLabel:
      worldClass.compositeReadinessScore >= 85
        ? `${worldClass.compositeReadinessLabel} · ${worldClass.countdownLabel}`
        : weakHigh > 0
          ? `${weakHigh} high-priority gap${weakHigh > 1 ? "s" : ""} · fix before stage`
          : worldClass.compositeReadinessLabel,
    todayFocus: `${pathwayTonightFocus} Staff package: ${packageTonightFocus}`,
    tonightPackage,
    packageCompletenessPct: Math.round(
      (base.packageCompletenessPct + worldClass.compositeReadinessScore) / 2,
    ),
    modules,
    worldClass,
  };
}

export { pickSmartTrapLane };
