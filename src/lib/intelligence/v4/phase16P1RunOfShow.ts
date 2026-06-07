/**
 * Phase 16 P1 — Timed run-of-show presets (15 / 30 / 45 / 60 min).
 */
import { CANDIDATE_COMMAND_HOME_HREF } from "@/lib/intelligence/v4/phase15CandidateCommandDepth";
import type { RehearsalRunOfShowStep } from "@/lib/intelligence/v4/phase16P0SessionLauncher";
import { getDefaultRunOfShowSteps } from "@/lib/intelligence/v4/phase16P0SessionLauncher";

export const RUN_OF_SHOW_HUB_HREF = "/admin/intelligence/run-of-show";

export const PHASE16_P1_PRESET_TOTAL = 4;
export const PHASE16_P1_PRESET_MINUTES = [15, 30, 45, 60] as const;

export type RunOfShowPresetId = "quick-15" | "standard-30" | "deep-45" | "full-60";

export type RunOfShowPreset = {
  presetId: RunOfShowPresetId;
  title: string;
  durationMinutes: number;
  durationLabel: string;
  description: string;
  kellyRule: string;
  launchHref: string;
  stepCount: number;
};

function step(
  stepId: string,
  order: number,
  title: string,
  durationMinutes: number,
  href: string,
  kellyBeat: string,
  stageSafeRequired: boolean,
): RehearsalRunOfShowStep {
  return {
    stepId,
    order,
    title,
    durationMinutes,
    durationLabel: `${durationMinutes} min`,
    href,
    kellyBeat,
    stageSafeRequired,
  };
}

const QUICK_15_STEPS: RehearsalRunOfShowStep[] = [
  step(
    "q15-home",
    1,
    "Command home — readiness scan",
    2,
    CANDIDATE_COMMAND_HOME_HREF,
    "Scan readiness % and safe/blocked lines — know staff-cleared lines before drills.",
    false,
  ),
  step(
    "q15-top-tier",
    2,
    "Top-tier prep — one promoted read",
    4,
    "/admin/intelligence/top-tier-prep",
    "Pick one briefing or depth guide — no library browsing.",
    false,
  ),
  step(
    "q15-trap",
    3,
    "Trap lane — one drill",
    6,
    "/admin/intelligence/trap-lanes/county-champion",
    "One lane, full speak-order — stage-safe script or staff-verify fallback.",
    true,
  ),
  step(
    "q15-claims",
    4,
    "Claims ledger — close",
    3,
    "/admin/intelligence/claims",
    "Gate any new line you tried — NEEDS_REVIEW stays research-question only.",
    true,
  ),
];

const DEEP_45_STEPS: RehearsalRunOfShowStep[] = [
  step(
    "d45-home",
    1,
    "Command home — readiness scan",
    3,
    CANDIDATE_COMMAND_HOME_HREF,
    "Readiness %, safe tonight, blocked tonight — staff-cleared lines only on stage.",
    false,
  ),
  step(
    "d45-top-tier",
    2,
    "Top-tier prep — pick tonight's read",
    5,
    "/admin/intelligence/top-tier-prep",
    "One promoted briefing or depth guide.",
    false,
  ),
  step(
    "d45-trap-county",
    3,
    "Trap lane — county champion",
    7,
    "/admin/intelligence/trap-lanes/county-champion",
    "Rehearse opponent signal and stage-safe rebuttal — never end on agree alone.",
    true,
  ),
  step(
    "d45-trap-funding",
    4,
    "Trap lane — election funding",
    8,
    "/admin/intelligence/trap-lanes/election-funding",
    "CVSGF + HAVA vocabulary — claims gate on dollar amounts.",
    true,
  ),
  step(
    "d45-sos",
    5,
    "SOS speak-order — one question",
    7,
    "/admin/intelligence/sos-debate-questions",
    "Moderator-style question with evidence honesty badge visible.",
    true,
  ),
  step(
    "d45-film",
    6,
    "Film room — one pivot",
    5,
    "/admin/intelligence/film-room",
    "Rehearse one pivot from clip or transcript.",
    true,
  ),
  step(
    "d45-philosophy",
    7,
    "Philosophy briefing — agree-but-contrast",
    5,
    "/admin/intelligence/debate-briefings/agree-but-never-only-agree",
    "Panel survival pivot — agree with concern, contrast on job-fit.",
    true,
  ),
  step(
    "d45-claims",
    8,
    "Claims ledger — close the loop",
    5,
    "/admin/intelligence/claims",
    "Verify every new adaptation before stage.",
    true,
  ),
];

const FULL_60_STEPS: RehearsalRunOfShowStep[] = [
  step(
    "f60-home",
    1,
    "Command home — readiness scan",
    3,
    CANDIDATE_COMMAND_HOME_HREF,
    "Readiness %, safe/blocked lines, today's focus.",
    false,
  ),
  step(
    "f60-prep-week",
    2,
    "Kelly prep week — tonight's day",
    5,
    "/admin/intelligence/kelly-prep-week",
    "Follow the orchestrated day path — do not skip ahead.",
    false,
  ),
  step(
    "f60-top-tier",
    3,
    "Top-tier prep — promoted read",
    7,
    "/admin/intelligence/top-tier-prep",
    "One philosophy briefing plus one depth guide if time allows.",
    false,
  ),
  step(
    "f60-trap-county",
    4,
    "Trap lane — county champion",
    8,
    "/admin/intelligence/trap-lanes/county-champion",
    "Full lane drill with speak-order.",
    true,
  ),
  step(
    "f60-trap-funding",
    5,
    "Trap lane — election funding",
    8,
    "/admin/intelligence/trap-lanes/election-funding",
    "Clerk-room funding vocabulary with claims gate.",
    true,
  ),
  step(
    "f60-sos",
    6,
    "SOS speak-order — two questions",
    8,
    "/admin/intelligence/sos-debate-questions",
    "Two moderator questions — speak-order drills back-to-back.",
    true,
  ),
  step(
    "f60-film",
    7,
    "Film room — pivot rehearsal",
    6,
    "/admin/intelligence/film-room",
    "Clip or transcript pivot with honesty label.",
    true,
  ),
  step(
    "f60-coaching",
    8,
    "Debate coaching — opening/closing",
    6,
    "/admin/intelligence/kelly-debate-coaching",
    "One opening and one closing beat — stage presence checklist.",
    true,
  ),
  step(
    "f60-philosophy",
    9,
    "Philosophy briefing — pile-on survival",
    5,
    "/admin/intelligence/debate-briefings/pile-on-survival",
    "When both opponents align — contrast without smear.",
    true,
  ),
  step(
    "f60-claims",
    10,
    "Claims ledger — final gate",
    4,
    "/admin/intelligence/claims",
    "Every line verified — no NEEDS_REVIEW on stage.",
    true,
  ),
];

const PRESET_REGISTRY: Record<RunOfShowPresetId, { preset: Omit<RunOfShowPreset, "stepCount">; steps: RehearsalRunOfShowStep[] }> = {
  "quick-15": {
    preset: {
      presetId: "quick-15",
      title: "Quick warm-up",
      durationMinutes: 15,
      durationLabel: "15 min",
      description: "Fast pre-stage scan — home, one read, one trap lane, claims close.",
      kellyRule: "Use when you have fifteen minutes before doors or a green room hit.",
      launchHref: `${RUN_OF_SHOW_HUB_HREF}?preset=quick-15`,
    },
    steps: QUICK_15_STEPS,
  },
  "standard-30": {
    preset: {
      presetId: "standard-30",
      title: "Standard rehearsal",
      durationMinutes: 30,
      durationLabel: "30 min",
      description: "Default debate-prep run — home, top-tier, trap, SOS, film room, claims.",
      kellyRule: "Default tonight run — matches Phase 16 P0 session launcher debate prep.",
      launchHref: `${RUN_OF_SHOW_HUB_HREF}?preset=standard-30`,
    },
    steps: getDefaultRunOfShowSteps("debate-prep"),
  },
  "deep-45": {
    preset: {
      presetId: "deep-45",
      title: "Deep rehearsal",
      durationMinutes: 45,
      durationLabel: "45 min",
      description: "Two trap lanes, SOS, film room, philosophy briefing, and claims close.",
      kellyRule: "Use the night before a major debate or long-form panel.",
      launchHref: `${RUN_OF_SHOW_HUB_HREF}?preset=deep-45`,
    },
    steps: DEEP_45_STEPS,
  },
  "full-60": {
    preset: {
      presetId: "full-60",
      title: "Full run",
      durationMinutes: 60,
      durationLabel: "60 min",
      description: "Complete stage rehearsal — prep week, dual traps, SOS, film, coaching, philosophy, claims.",
      kellyRule: "Block one hour — treat it like a dress rehearsal, not reference browsing.",
      launchHref: `${RUN_OF_SHOW_HUB_HREF}?preset=full-60`,
    },
    steps: FULL_60_STEPS,
  },
};

export const RUN_OF_SHOW_PRESET_IDS = Object.keys(PRESET_REGISTRY) as RunOfShowPresetId[];

export function listRunOfShowPresets(): RunOfShowPreset[] {
  return RUN_OF_SHOW_PRESET_IDS.map((id) => {
    const entry = PRESET_REGISTRY[id];
    return { ...entry.preset, stepCount: entry.steps.length };
  });
}

export function getRunOfShowPreset(presetId: RunOfShowPresetId): RunOfShowPreset | undefined {
  const entry = PRESET_REGISTRY[presetId];
  if (!entry) return undefined;
  return { ...entry.preset, stepCount: entry.steps.length };
}

export function getRunOfShowStepsForPreset(presetId: RunOfShowPresetId): RehearsalRunOfShowStep[] {
  return PRESET_REGISTRY[presetId]?.steps ?? getDefaultRunOfShowSteps("debate-prep");
}

export function countPresetMinutes(steps: RehearsalRunOfShowStep[]): number {
  return steps.reduce((s, step) => s + step.durationMinutes, 0);
}

export function resolveRunOfShowPresetId(raw: string | undefined): RunOfShowPresetId {
  if (raw && RUN_OF_SHOW_PRESET_IDS.includes(raw as RunOfShowPresetId)) {
    return raw as RunOfShowPresetId;
  }
  return "standard-30";
}

export function presetMinutesMatchTarget(presetId: RunOfShowPresetId): boolean {
  const preset = getRunOfShowPreset(presetId);
  if (!preset) return false;
  const actual = countPresetMinutes(getRunOfShowStepsForPreset(presetId));
  return Math.abs(actual - preset.durationMinutes) <= 2;
}

export type RunOfShowSummary = {
  hubHref: string;
  presetCount: number;
  defaultPresetId: RunOfShowPresetId;
  defaultMinutes: number;
  tonightReminder: string;
};

export function buildRunOfShowSummary(): RunOfShowSummary {
  const defaultPreset = getRunOfShowPreset("standard-30")!;
  return {
    hubHref: RUN_OF_SHOW_HUB_HREF,
    presetCount: PHASE16_P1_PRESET_TOTAL,
    defaultPresetId: "standard-30",
    defaultMinutes: defaultPreset.durationMinutes,
    tonightReminder:
      "Pick a timed run-of-show — 15, 30, 45, or 60 minutes — each step links into existing prep surfaces with stage-safe gates on drills.",
  };
}
