/**
 * Phase 16 P0 — Stage Rehearsal Engine session launcher.
 */
import { CANDIDATE_COMMAND_HOME_HREF } from "@/lib/intelligence/v4/phase15CandidateCommandDepth";
import { DEMO_MODE_HUB_HREF } from "@/lib/intelligence/v4/phase15P6DemoMode";
import { enrichRunOfShowWithForumIntel, forumRehearsalTonightReminder, countForumDrillQueueCards } from "@/lib/intelligence/v4/forumTranscriptRehearsalCards";

export const REHEARSAL_HUB_HREF = "/admin/intelligence/rehearsal";

export const PHASE16_P0_ENCOUNTER_TOTAL = 4;
export const PHASE16_P0_DEFAULT_RUN_OF_SHOW_MINUTES = 30;
export const PHASE16_P0_DEFAULT_RUN_OF_SHOW_STEP_TOTAL = 6;

export type RehearsalEncounterId =
  | "debate-prep"
  | "acca-panel"
  | "clerk-meeting"
  | "purchase-walkthrough";

export type RehearsalEncounterOption = {
  encounterId: RehearsalEncounterId;
  title: string;
  description: string;
  durationMinutes: number;
  durationLabel: string;
  kellyRule: string;
  launchHref: string;
};

export type RehearsalRunOfShowStep = {
  stepId: string;
  order: number;
  title: string;
  durationMinutes: number;
  durationLabel: string;
  href: string;
  kellyBeat: string;
  stageSafeRequired: boolean;
};

export type RehearsalSession = {
  sessionId: string;
  encounterId: RehearsalEncounterId;
  title: string;
  durationMinutes: number;
  steps: RehearsalRunOfShowStep[];
};

const ENCOUNTER_OPTIONS: RehearsalEncounterOption[] = [
  {
    encounterId: "debate-prep",
    title: "Three-way debate prep",
    description: "Trap lanes, SOS speak-order, and film-room pivots — default 30-minute run-of-show.",
    durationMinutes: 30,
    durationLabel: "30 min",
    kellyRule: "Start here when the stage is a moderated debate or three-way forum.",
    launchHref: `${REHEARSAL_HUB_HREF}?encounter=debate-prep`,
  },
  {
    encounterId: "acca-panel",
    title: "ACCA panel",
    description: "Clerk-room vocabulary, pocket pledge, and moderated Q&A beats for Mountain View.",
    durationMinutes: 30,
    durationLabel: "30 min",
    kellyRule: "Use before any county-clerk audience — claims gate on funding and equipment lines.",
    launchHref: `${REHEARSAL_HUB_HREF}?encounter=acca-panel`,
  },
  {
    encounterId: "clerk-meeting",
    title: "Clerk 1:1",
    description: "Short clerk-room rehearsal — funding evidence, VVSG vocabulary, one trap pivot.",
    durationMinutes: 20,
    durationLabel: "20 min",
    kellyRule: "One county clerk conversation — not a panel, not a debate.",
    launchHref: `${REHEARSAL_HUB_HREF}?encounter=clerk-meeting`,
  },
  {
    encounterId: "purchase-walkthrough",
    title: "Purchase walkthrough",
    description: "15-minute buyer demo script — command home, trap lane, philosophy, opposition, iPad deploy.",
    durationMinutes: 15,
    durationLabel: "15 min",
    kellyRule: "Staff-led buyer conversation — links to Phase 15 demo-mode script.",
    launchHref: DEMO_MODE_HUB_HREF,
  },
];

const DEBATE_PREP_RUN_OF_SHOW: RehearsalRunOfShowStep[] = [
  {
    stepId: "orient-home",
    order: 1,
    title: "Command home — readiness scan",
    durationMinutes: 3,
    durationLabel: "3 min",
    href: CANDIDATE_COMMAND_HOME_HREF,
    kellyBeat: "Readiness %, safe tonight lines, blocked lines — know what staff cleared before you speak.",
    stageSafeRequired: false,
  },
  {
    stepId: "top-tier-pick",
    order: 2,
    title: "Top-tier prep — pick tonight's read",
    durationMinutes: 5,
    durationLabel: "5 min",
    href: "/admin/intelligence/top-tier-prep",
    kellyBeat: "One promoted briefing or depth guide — do not browse the full library.",
    stageSafeRequired: false,
  },
  {
    stepId: "trap-lane-drill",
    order: 3,
    title: "Trap lane — county champion drill",
    durationMinutes: 7,
    durationLabel: "7 min",
    href: "/admin/intelligence/trap-lanes/county-champion",
    kellyBeat: "Rehearse opponent signal, setup timing, and stage-safe script — never end on agree alone.",
    stageSafeRequired: true,
  },
  {
    stepId: "sos-speak-order",
    order: 4,
    title: "SOS speak-order — one question",
    durationMinutes: 7,
    durationLabel: "7 min",
    href: "/admin/intelligence/sos-debate-questions",
    kellyBeat: "Pick one moderator-style question — speak-order drill with evidence honesty badge visible.",
    stageSafeRequired: true,
  },
  {
    stepId: "film-room-pivot",
    order: 5,
    title: "Film room — one pivot clip",
    durationMinutes: 5,
    durationLabel: "5 min",
    href: "/admin/intelligence/film-room",
    kellyBeat: "Rehearse one pivot from clip or transcript — honesty label before any proof language.",
    stageSafeRequired: true,
  },
  {
    stepId: "claims-close",
    order: 6,
    title: "Claims ledger — close the loop",
    durationMinutes: 3,
    durationLabel: "3 min",
    href: "/admin/intelligence/claims",
    kellyBeat: "Verify every new line you tried tonight — NEEDS_REVIEW stays research-question framing only.",
    stageSafeRequired: true,
  },
];

export function listRehearsalEncounterOptions(): RehearsalEncounterOption[] {
  return ENCOUNTER_OPTIONS;
}

export function getRehearsalEncounterOption(
  encounterId: RehearsalEncounterId,
): RehearsalEncounterOption | undefined {
  return ENCOUNTER_OPTIONS.find((e) => e.encounterId === encounterId);
}

export function buildTonightRehearsalOptions(): RehearsalEncounterOption[] {
  return listRehearsalEncounterOptions();
}

export function getDefaultRunOfShowSteps(
  encounterId: RehearsalEncounterId = "debate-prep",
): RehearsalRunOfShowStep[] {
  if (encounterId === "debate-prep") {
    return enrichRunOfShowWithForumIntel(DEBATE_PREP_RUN_OF_SHOW, "debate-prep");
  }
  if (encounterId === "acca-panel") {
    const base: RehearsalRunOfShowStep[] = [
      {
        stepId: "acca-prep-hub",
        order: 1,
        title: "ACCA panel prep hub",
        durationMinutes: 10,
        durationLabel: "10 min",
        href: "/admin/intelligence/county-clerk-week/acca-summer-conference",
        kellyBeat: "Clerk-room vocabulary, pocket pledge, moderated Q&A structure.",
        stageSafeRequired: true,
      },
      {
        stepId: "acca-trap",
        order: 2,
        title: "Trap lane — election funding",
        durationMinutes: 8,
        durationLabel: "8 min",
        href: "/admin/intelligence/trap-lanes/election-funding",
        kellyBeat: "Rehearse CVSGF + HAVA vocabulary — claims gate on dollar amounts.",
        stageSafeRequired: true,
      },
      {
        stepId: "acca-philosophy",
        order: 3,
        title: "Philosophy briefing — agree-but-contrast",
        durationMinutes: 7,
        durationLabel: "7 min",
        href: "/admin/intelligence/debate-briefings/agree-but-never-only-agree",
        kellyBeat: "Panel survival — agree with clerk concern, pivot to Kelly job-fit.",
        stageSafeRequired: true,
      },
      {
        stepId: "acca-claims",
        order: 4,
        title: "Claims check",
        durationMinutes: 5,
        durationLabel: "5 min",
        href: "/admin/intelligence/claims",
        kellyBeat: "Gate every clerk-room line before Jun 11 panel.",
        stageSafeRequired: true,
      },
    ];
    return enrichRunOfShowWithForumIntel(base, "acca-panel");
  }
  if (encounterId === "clerk-meeting") {
    return [
      {
        stepId: "clerk-funding",
        order: 1,
        title: "Election funding — clerk vocabulary",
        durationMinutes: 7,
        durationLabel: "7 min",
        href: "/admin/intelligence/election-funding",
        kellyBeat: "Statutory evidence for clerk-room funding questions — no unsourced awards.",
        stageSafeRequired: true,
      },
      {
        stepId: "clerk-vvsg",
        order: 2,
        title: "VVSG 2.0 pocket card",
        durationMinutes: 6,
        durationLabel: "6 min",
        href: "/admin/intelligence/election-equipment-vvsg",
        kellyBeat: "Equipment modernization vocabulary — internal draft until staff clears.",
        stageSafeRequired: true,
      },
      {
        stepId: "clerk-trap",
        order: 3,
        title: "One trap pivot",
        durationMinutes: 7,
        durationLabel: "7 min",
        href: "/admin/intelligence/trap-lanes",
        kellyBeat: "Pick the lane most likely in this county — full rebuttal script.",
        stageSafeRequired: true,
      },
    ];
  }
  return DEBATE_PREP_RUN_OF_SHOW;
}

export function buildRehearsalSession(encounterId: RehearsalEncounterId = "debate-prep"): RehearsalSession {
  const option = getRehearsalEncounterOption(encounterId)!;
  const steps = getDefaultRunOfShowSteps(encounterId);
  const durationMinutes = steps.reduce((s, step) => s + step.durationMinutes, 0);
  return {
    sessionId: `session-${encounterId}`,
    encounterId,
    title: option.title,
    durationMinutes,
    steps,
  };
}

export function countRunOfShowMinutes(steps: RehearsalRunOfShowStep[]): number {
  return steps.reduce((s, step) => s + step.durationMinutes, 0);
}

export type RehearsalLauncherSummary = {
  hubHref: string;
  encounterCount: number;
  defaultEncounterId: RehearsalEncounterId;
  defaultMinutes: number;
  defaultStepCount: number;
  tonightReminder: string;
  forumRunOfShowEnriched: boolean;
};

export function buildRehearsalLauncherSummary(): RehearsalLauncherSummary {
  const defaultSession = buildRehearsalSession("debate-prep");
  const forumReminder = forumRehearsalTonightReminder();
  return {
    hubHref: REHEARSAL_HUB_HREF,
    encounterCount: ENCOUNTER_OPTIONS.length,
    defaultEncounterId: countForumDrillQueueCards() > 0 ? "acca-panel" : "debate-prep",
    defaultMinutes: defaultSession.durationMinutes,
    defaultStepCount: defaultSession.steps.length,
    tonightReminder:
      forumReminder ??
      "Start tonight's rehearsal — pick an encounter, run the timed steps, deep-link into existing prep surfaces (no new content silos).",
    forumRunOfShowEnriched: countForumDrillQueueCards() > 0,
  };
}
