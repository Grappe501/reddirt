/**
 * Phase 8 — ACCA Mountain View panel operator runbook (Thu Jun 11, 1–3pm).
 */
import {
  loadAccaClerksConference2026,
  getAccaPanelCountdownDays,
} from "@/lib/intelligence/v4/accaClerksConference2026Depth";

export type AccaPanelRunbookStep = {
  order: number;
  phase: string;
  action: string;
  href?: string;
};

export const ACCA_PANEL_RUNBOOK_STEPS: AccaPanelRunbookStep[] = [
  {
    order: 1,
    phase: "T-7 days",
    action: "Re-read dossier research sections + hammer-traps-clerk-room + three-way-panel-geometry.",
    href: "/admin/intelligence/county-clerk-week/acca-summer-conference/hammer-traps-clerk-room",
  },
  {
    order: 2,
    phase: "T-3 days",
    action: "Claims gate all CVSGF numbers; rehearse max three trap questions in curious tone.",
    href: "/admin/intelligence/claims",
  },
  {
    order: 3,
    phase: "T-1 day",
    action: "30-second bio under 28s; pack green-room SOS function card + road story cards (approved only).",
    href: "/admin/intelligence/candidate-dossiers/kelly-grappe/kelly-30-second-bio",
  },
  {
    order: 4,
    phase: "Panel open",
    action: "Lead with clerk partnership — not opponent names. Fair acknowledge Hammer once if authorship raised.",
  },
  {
    order: 5,
    phase: "Mid-panel",
    action: "If Pakko agrees mandate burden: agree on clerk pain → add funded implementation + publish-the-ledger.",
    href: "/admin/intelligence/county-clerk-week/acca-summer-conference/three-way-panel-geometry",
  },
  {
    order: 6,
    phase: "Trap window",
    action: "Max three traps: CVSGF county ledger, 2021 training budget, Act 350 SOS staff ratio — then pass mic.",
    href: "/admin/intelligence/county-clerk-week/acca-summer-conference/cvsgf-for-clerks",
  },
  {
    order: 7,
    phase: "Close",
    action: "SOS as balls-and-strikes service office — hotline, training calendar, transparent rules for 75 counties.",
  },
  {
    order: 8,
    phase: "T+24h",
    action: "Post-panel debrief: quote ledger, claims gaps, schedule 3 county follow-ups, Benton Sep conference on calendar.",
    href: "/admin/intelligence/county-clerk-week/acca-summer-conference/after-panel-followup",
  },
];

export function buildAccaPanelOperatorSummary(): {
  eventTitle: string;
  panelDate: string;
  panelTime: string;
  countdownDays: number;
  candidates: string[];
  platinumSponsor: string;
  steps: AccaPanelRunbookStep[];
} {
  const file = loadAccaClerksConference2026();
  const panel = file.sosCandidatesPanel;
  return {
    eventTitle: file.title,
    panelDate: panel.date,
    panelTime: `${panel.startTime}–${panel.endTime}`,
    countdownDays: getAccaPanelCountdownDays(),
    candidates: panel.candidates.map((c) => `${c.name} (${c.party})`),
    platinumSponsor: file.sponsors.platinum[0] ?? "ES&S",
    steps: ACCA_PANEL_RUNBOOK_STEPS,
  };
}
