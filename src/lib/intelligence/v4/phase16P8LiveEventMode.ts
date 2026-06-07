/**
 * Phase 16 P8 — Live event mode (ACCA countdown + day-of safe run-of-show).
 */
import { isCountyClerkPrimaryAudience } from "@/lib/intelligence/v4/debateAudienceMode";
import {
  getDefaultRunOfShowSteps,
  type RehearsalRunOfShowStep,
} from "@/lib/intelligence/v4/phase16P0SessionLauncher";
import {
  getRunOfShowStepsForPreset,
  countPresetMinutes,
} from "@/lib/intelligence/v4/phase16P1RunOfShow";
import { ENCOUNTERS_HUB_HREF } from "@/lib/intelligence/v4/phase16P2EncounterScenarios";

export const LIVE_EVENT_HUB_HREF = "/admin/intelligence/live-event";

export const PHASE16_P8_LIVE_FIELD_TOTAL = 5;

export const ACCA_PANEL_EVENT_ID = "acca-panel-2026";

/** Thu Jun 11, 2026 · 1:00pm CT — ACCA SOS candidates panel */
export const ACCA_PANEL_EVENT_ISO = "2026-06-11T13:00:00-05:00";

export const ACCA_PANEL_EVENT_LABEL = "ACCA Mountain View panel · Jun 11 · 1–3pm";

export const SRE_LIVE_EVENT_ENV_KEY = "NEXT_PUBLIC_SRE_LIVE_EVENT";

export type LiveEventCountdown = {
  eventId: string;
  eventLabel: string;
  eventIso: string;
  daysRemaining: number;
  hoursRemaining: number;
  isDayOf: boolean;
  isPast: boolean;
  isActive: boolean;
};

export type LiveEventDayOfPlan = {
  planId: "day-of-safe";
  title: string;
  totalMinutes: number;
  stepCount: number;
  steps: RehearsalRunOfShowStep[];
  launchHref: string;
  stageSafeOnly: boolean;
};

export type LiveEventSummary = {
  hubHref: string;
  modeActive: boolean;
  countdown: LiveEventCountdown;
  dayOfPlan: LiveEventDayOfPlan;
  accaPrepHref: string;
  encounterHref: string;
  tonightReminder: string;
};

export function getSreLiveEventEnv(): string | null {
  const raw = process.env[SRE_LIVE_EVENT_ENV_KEY]?.trim();
  return raw || null;
}

export function isLiveEventModeActive(): boolean {
  const env = getSreLiveEventEnv();
  if (env === ACCA_PANEL_EVENT_ID || env === "acca" || env === "1") return true;
  return isCountyClerkPrimaryAudience();
}

export function computeAccaPanelCountdown(now = new Date()): LiveEventCountdown {
  const eventAt = new Date(ACCA_PANEL_EVENT_ISO);
  const ms = eventAt.getTime() - now.getTime();
  const isPast = ms < 0;
  const isDayOf =
    !isPast &&
    now.getFullYear() === eventAt.getFullYear() &&
    now.getMonth() === eventAt.getMonth() &&
    now.getDate() === eventAt.getDate();
  const hoursRemaining = isPast ? 0 : Math.max(0, Math.ceil(ms / (1000 * 60 * 60)));
  const daysRemaining = isPast ? 0 : Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));

  return {
    eventId: ACCA_PANEL_EVENT_ID,
    eventLabel: ACCA_PANEL_EVENT_LABEL,
    eventIso: ACCA_PANEL_EVENT_ISO,
    daysRemaining,
    hoursRemaining,
    isDayOf,
    isPast,
    isActive: isLiveEventModeActive(),
  };
}

export function filterStageSafeRunOfShowSteps(steps: RehearsalRunOfShowStep[]): RehearsalRunOfShowStep[] {
  return steps.filter((s) => s.stageSafeRequired);
}

export function selectShortestSafeRunOfShowSteps(
  candidates: RehearsalRunOfShowStep[][],
): RehearsalRunOfShowStep[] {
  const safePaths = candidates
    .map((steps) => filterStageSafeRunOfShowSteps(steps))
    .filter((steps) => steps.length > 0);
  if (!safePaths.length) return [];
  safePaths.sort((a, b) => countPresetMinutes(a) - countPresetMinutes(b));
  return safePaths[0]!;
}

/** Compressed ACCA day-of path — prep hub + claims gate only */
function buildAccaDayOfCompressedSteps(): RehearsalRunOfShowStep[] {
  const acca = getDefaultRunOfShowSteps("acca-panel");
  return acca.filter((s) => s.stepId === "acca-prep-hub" || s.stepId === "acca-claims");
}

export function buildLiveEventDayOfPlan(now = new Date()): LiveEventDayOfPlan {
  const accaFull = getDefaultRunOfShowSteps("acca-panel");
  const accaCompressed = buildAccaDayOfCompressedSteps();
  const quickSafe = selectShortestSafeRunOfShowSteps([
    accaCompressed,
    accaFull,
    getRunOfShowStepsForPreset("quick-15"),
  ]);

  const countdown = computeAccaPanelCountdown(now);
  const steps = countdown.isDayOf ? accaCompressed : quickSafe;
  const totalMinutes = countPresetMinutes(steps);

  return {
    planId: "day-of-safe",
    title: countdown.isDayOf ? "Day-of ACCA safe path" : "Shortest stage-safe rehearsal",
    totalMinutes,
    stepCount: steps.length,
    steps,
    launchHref: `${LIVE_EVENT_HUB_HREF}?plan=day-of-safe`,
    stageSafeOnly: steps.every((s) => s.stageSafeRequired),
  };
}

export function buildLiveEventSummary(): LiveEventSummary {
  const countdown = computeAccaPanelCountdown();
  const dayOfPlan = buildLiveEventDayOfPlan();
  const accaPrepHref = "/admin/intelligence/county-clerk-week/acca-summer-conference";
  const encounterHref = `${ENCOUNTERS_HUB_HREF}?scenario=acca-panel`;

  let tonightReminder =
    "Live event mode — ACCA Jun 11 panel countdown and shortest stage-safe day-of run when clerk week or SRE live env is active.";
  if (countdown.isActive) {
    if (countdown.isPast) {
      tonightReminder = "ACCA panel window passed — run session debrief capture and staff follow-ups.";
    } else if (countdown.isDayOf) {
      tonightReminder = `Day-of ACCA panel — ${dayOfPlan.totalMinutes}-minute safe path (${dayOfPlan.stepCount} steps). Gate every clerk-room line before 1pm.`;
    } else {
      tonightReminder = `${countdown.daysRemaining} day${countdown.daysRemaining === 1 ? "" : "s"} to ACCA panel — ${dayOfPlan.totalMinutes}-minute shortest safe rehearsal ready.`;
    }
  }

  return {
    hubHref: LIVE_EVENT_HUB_HREF,
    modeActive: countdown.isActive,
    countdown,
    dayOfPlan,
    accaPrepHref,
    encounterHref,
    tonightReminder,
  };
}

export function resolveLiveEventPlanId(raw: string | undefined): "day-of-safe" {
  return raw === "day-of-safe" ? "day-of-safe" : "day-of-safe";
}
