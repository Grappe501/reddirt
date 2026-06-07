/**
 * Phase 15 P6 — Purchase demo mode: seeded tonight scenario + 15-minute script.
 */
import { CANDIDATE_COMMAND_HOME_HREF } from "@/lib/intelligence/v4/phase15CandidateCommandDepth";

export const DEMO_MODE_HUB_HREF = "/admin/intelligence/demo-mode";

export const PHASE15_P6_DEMO_SCRIPT_STEP_TOTAL = 7;
export const PHASE15_P6_TARGET_MINUTES = 15;

export type DemoScriptStep = {
  stepId: string;
  order: number;
  title: string;
  durationMinutes: number;
  durationLabel: string;
  href: string;
  demoBeat: string;
  buyerLine: string;
  staffNote: string;
};

export type DemoTonightScenario = {
  scenarioId: string;
  title: string;
  eventLabel: string;
  eventDate: string;
  venue: string;
  audience: string;
  readinessTargetPct: number;
  prepMinutes: number;
  pitchLine: string;
  closeLine: string;
};

const TONIGHT_SCENARIO: DemoTonightScenario = {
  scenarioId: "acca-panel-tonight",
  title: "ACCA summer conference panel — tonight",
  eventLabel: "ACCA Summer Conference · moderated clerk panel",
  eventDate: "Jun 11 · Mountain View",
  venue: "Mountain View · ACCA summer conference",
  audience: "County clerks, election commissioners, quorum court funders",
  readinessTargetPct: 82,
  prepMinutes: 20,
  pitchLine:
    "Kelly opens one app — readiness score, tonight's 20-minute prep path, safe lines, and blocked lines with reasons. Staff verifies depth backstage.",
  closeLine:
    "Staff has fifty research modules backstage; Kelly never sees builder clutter — only stage-ready command surfaces.",
};

const DEMO_SCRIPT: DemoScriptStep[] = [
  {
    stepId: "home-orient",
    order: 1,
    title: "Command home — 60 seconds",
    durationMinutes: 1,
    durationLabel: "1 min",
    href: CANDIDATE_COMMAND_HOME_HREF,
    demoBeat: "Readiness %, top-tier prep strip, 3 safe lines, 3 blocked lines with reasons.",
    buyerLine: "Every morning Kelly sees what she can safely say — and what staff is still verifying.",
    staffNote: "Point at CandidateCommandHomePanel — not supreme workbench depth.",
  },
  {
    stepId: "trap-lane-rehearse",
    order: 2,
    title: "Trap lane rehearsal — 3 minutes",
    durationMinutes: 3,
    durationLabel: "3 min",
    href: "/admin/intelligence/trap-lanes/county-champion",
    demoBeat: "One lane drill-down — opponent signal, setup timing, stage-safe script or staff-verify fallback.",
    buyerLine: "Kelly rehearses what Hammer will try — with claims gate visible before any proof language.",
    staffNote: "Candidate profile shows StageSafeBlockedPanel when gated — honesty builds trust.",
  },
  {
    stepId: "philosophy-briefing",
    order: 3,
    title: "Philosophy briefing — 3 minutes",
    durationMinutes: 3,
    durationLabel: "3 min",
    href: "/admin/intelligence/debate-briefings/agree-but-never-only-agree",
    demoBeat: "One tier-A briefing card — when Hammer says X, Kelly says Y without ending on agree alone.",
    buyerLine: "Philosophy is coached — not a flat library of eighty links.",
    staffNote: "Cross-link to top-tier prep hub for full promoted inventory.",
  },
  {
    stepId: "opposition-contrast",
    order: 4,
    title: "Opposition contrast — 3 minutes",
    durationMinutes: 3,
    durationLabel: "3 min",
    href: "/admin/intelligence/opposition-strategy",
    demoBeat: "Offense readiness score, 2021 package frame, one offensive move — job-fit contrast not smear.",
    buyerLine: "Kelly knows Hammer's record without improvising attacks staff hasn't verified.",
    staffNote: "EvidenceHonestyBadge on governance label — internal draft, not broadcast proof.",
  },
  {
    stepId: "clerk-pocket-card",
    order: 5,
    title: "Clerk pocket card — 2 minutes",
    durationMinutes: 2,
    durationLabel: "2 min",
    href: "/admin/intelligence/county-clerk-week/acca-summer-conference",
    demoBeat: "ACCA panel prep — clerk-room vocabulary, pocket pledge, moderated Q&A beats.",
    buyerLine: "Same command center serves clerk rooms and debate stage — moment-based, not module-based.",
    staffNote: "Printable one-pager lives in ACCA depth — lamination is staff ops, not product UI.",
  },
  {
    stepId: "ipad-deploy",
    order: 6,
    title: "iPad stage-side — 2 minutes",
    durationMinutes: 2,
    durationLabel: "2 min",
    href: DEMO_MODE_HUB_HREF,
    demoBeat: "NEXT_PUBLIC_CANDIDATE_IPAD_MODE=true — bottom nav, touch targets, candidate profile only.",
    buyerLine: "Kelly rehearses on the same iPad she carries side-stage — no laptop clutter.",
    staffNote: "NEXT_PUBLIC_CANDIDATE_IPAD_MODE=true — five CCE bottom tabs with section sheets (Phase 15 P7).",
  },
  {
    stepId: "close-backstage",
    order: 7,
    title: "Close — staff backstage — 1 minute",
    durationMinutes: 1,
    durationLabel: "1 min",
    href: "/admin/intelligence/field-book/demo-mode-command",
    demoBeat: "Flip to STAFF profile only if buyer asks — builder pages stay URL-only, not in candidate nav.",
    buyerLine: "Research depth exists — Kelly just never wades through construction-site navigation.",
    staffNote: "Never open phase-*-upgrade pages in a purchase demo unless buyer is technical staff.",
  },
];

export function getDemoTonightScenario(): DemoTonightScenario {
  return TONIGHT_SCENARIO;
}

export function listDemoScriptSteps(): DemoScriptStep[] {
  return DEMO_SCRIPT;
}

export function getDemoScriptStep(stepId: string): DemoScriptStep | undefined {
  return DEMO_SCRIPT.find((s) => s.stepId === stepId);
}

export type DemoModeSummary = {
  hubHref: string;
  scenario: DemoTonightScenario;
  stepCount: number;
  totalMinutes: number;
  tonightReminder: string;
  demoEnvActive: boolean;
};

export function buildDemoModeSummary(demoEnvActive = false): DemoModeSummary {
  const steps = listDemoScriptSteps();
  const totalMinutes = steps.reduce((s, step) => s + step.durationMinutes, 0);
  const scenario = getDemoTonightScenario();

  return {
    hubHref: DEMO_MODE_HUB_HREF,
    scenario,
    stepCount: steps.length,
    totalMinutes,
    tonightReminder: demoEnvActive
      ? `Demo mode live — run the ${totalMinutes}-minute script for "${scenario.eventLabel}".`
      : `Purchase demo ready — ${totalMinutes}-minute script seeded for "${scenario.eventLabel}".`,
    demoEnvActive,
  };
}

export function countDemoScriptMinutes(steps: DemoScriptStep[] = listDemoScriptSteps()): number {
  return steps.reduce((s, step) => s + step.durationMinutes, 0);
}
