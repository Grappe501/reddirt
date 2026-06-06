/**
 * Phase 9 — Debate instruction operator runbook (dossier corpus → stage-ready drills).
 */

export type DebateCoachingRunbookStep = {
  order: number;
  phase: string;
  action: string;
  href?: string;
};

export const DEBATE_COACHING_RUNBOOK_STEPS: DebateCoachingRunbookStep[] = [
  {
    order: 1,
    phase: "T-14 days",
    action:
      "Audit all 28 prep sections for Phase 9 dossier cross-links — open phase-9-upgrade hub and confirm prep/trap/SOS bridge metrics at 100%.",
    href: "/admin/intelligence/phase-9-upgrade",
  },
  {
    order: 2,
    phase: "T-10 days",
    action:
      "Kelly reads bio narrative chapters + kelly-debate-credential-intro aloud; staff marks NEEDS_REVIEW rows in claims ledger.",
    href: "/admin/intelligence/candidate-dossiers",
  },
  {
    order: 3,
    phase: "T-7 days",
    action:
      "Rehearse six trap lanes with clerk-room scripts — max three traps in curious tone before ACCA panel.",
    href: "/admin/intelligence/trap-lanes",
  },
  {
    order: 4,
    phase: "T-5 days",
    action:
      "SOS question bank: top 10 HIGH probability questions with Phase 9 dossier hooks — 30s and 60s timed answers.",
    href: "/admin/intelligence/sos-debate-questions",
  },
  {
    order: 5,
    phase: "T-3 days",
    action:
      "Mock three-way panel geometry — Hammer tenure pivot, Pakko reform respect, Kelly administrator close under 12 seconds.",
    href: "/admin/intelligence/kelly-debate-coaching",
  },
  {
    order: 6,
    phase: "T-2 days",
    action:
      "County-deep + hammer-traps-clerk-room ACCA sections mandatory pre-read; pair with phase8AccaPanelOperatorRunbook.",
    href: "/admin/intelligence/county-clerk-week/acca-summer-conference",
  },
  {
    order: 7,
    phase: "T-1 day",
    action:
      "Closing-checklist prep section only — no new cramming. Verify claims gate on every number Kelly will cite on stage.",
    href: "/admin/intelligence/kim-hammer/debate-prep/closing-checklist",
  },
  {
    order: 8,
    phase: "T+24h",
    action:
      "Post-event debrief: capture verbatim moderator questions, promote verified lines to Field Book debate-instruction-bridge article.",
    href: "/admin/intelligence/field-book/debate-instruction-bridge",
  },
];

export function buildDebateCoachingOperatorSummary(): {
  steps: DebateCoachingRunbookStep[];
  stepCount: number;
} {
  return { steps: DEBATE_COACHING_RUNBOOK_STEPS, stepCount: DEBATE_COACHING_RUNBOOK_STEPS.length };
}
