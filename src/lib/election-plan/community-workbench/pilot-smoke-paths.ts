import type { CommunityPilotSlug } from "./pilot";

export type PilotSmokePathStep = {
  order: number;
  title: string;
  action: string;
  passCriteria: string;
  anchor?: string;
};

export type PilotSmokePath = {
  slug: CommunityPilotSlug;
  name: string;
  intro: string;
  steps: PilotSmokePathStep[];
};

export const SHERWOOD_PILOT_SMOKE_PATH: PilotSmokePath = {
  slug: "sherwood",
  name: "Sherwood",
  intro:
    "Sherwood is the first live pilot city. Complete these steps in production with fake training data only — no real voter PII.",
  steps: [
    {
      order: 1,
      title: "Sign in and set operator initials",
      action: "Open Election Plan → enter password → set initials (KGR, SGR, or ERN from seed).",
      passCriteria: "Operator bar shows your initials; edits are not blocked.",
    },
    {
      order: 2,
      title: "Assign first Community Lead",
      action: "Open Sherwood workbench → Leadership → Community Lead → save a lead name.",
      passCriteria: "Community Lead row persists after page refresh.",
      anchor: "leadership",
    },
    {
      order: 3,
      title: "Create first live event",
      action: "Events → New event → title, date, location, event lead → add 3 run-of-show rows → assign 2 volunteer roles.",
      passCriteria: "Event appears in list; Events readiness dimension increases.",
      anchor: "events",
    },
    {
      order: 4,
      title: "Confirm Sherwood KPIs respond",
      action: "Check KPI dashboard — events held metric should reflect active events.",
      passCriteria: "KPI card shows current count (Sherwood template).",
      anchor: "kpis",
    },
    {
      order: 5,
      title: "Complete first After Action Report",
      action: "Set event Executed → actual attendance → write AAR → status After-action complete.",
      passCriteria: "Event status is aar_complete; AAR body saved; readiness updated.",
      anchor: "events",
    },
    {
      order: 6,
      title: "Log a defect if anything failed",
      action: "Hub → Pilot validation → Defect log, or workbench pilot panel.",
      passCriteria: "Defect saved with severity; visible on hub defect list.",
      anchor: "pilot-smoke",
    },
  ],
};

export const JACKSONVILLE_PILOT_SMOKE_PATH: PilotSmokePath = {
  slug: "jacksonville",
  name: "Jacksonville",
  intro:
    "Jacksonville is the second live pilot — municipal / petition-leader focus. Use training labels on test events (e.g. PILOT — ward meeting).",
  steps: [
    {
      order: 1,
      title: "Sign in and set operator initials",
      action: "Open Election Plan → enter password → set initials.",
      passCriteria: "Operator bar shows your initials.",
    },
    {
      order: 2,
      title: "Assign first Community Lead",
      action: "Jacksonville workbench → Leadership → Community Lead.",
      passCriteria: "Lead persists after refresh.",
      anchor: "leadership",
    },
    {
      order: 3,
      title: "Create first live event",
      action: "Events → New event (e.g. PILOT — Ward 3 meeting) → run-of-show + volunteer assignments.",
      passCriteria: "Event saved; petition-leader / ward meeting KPI template visible.",
      anchor: "events",
    },
    {
      order: 4,
      title: "Link committee (optional Jacksonville path)",
      action: "Create or select a committee → link to event if applicable.",
      passCriteria: "Event shows linked committee name.",
      anchor: "committees",
    },
    {
      order: 5,
      title: "Complete first After Action Report",
      action: "Execute event → attendance → AAR → After-action complete.",
      passCriteria: "aar_complete status with body text.",
      anchor: "events",
    },
    {
      order: 6,
      title: "Log a defect if anything failed",
      action: "Record blocker/high defects for anything that blocked the smoke path.",
      passCriteria: "Defect appears on hub with Jacksonville slug.",
      anchor: "pilot-smoke",
    },
  ],
};

export const PILOT_SMOKE_PATHS: Record<CommunityPilotSlug, PilotSmokePath> = {
  sherwood: SHERWOOD_PILOT_SMOKE_PATH,
  jacksonville: JACKSONVILLE_PILOT_SMOKE_PATH,
};

export function getPilotSmokePath(slug: string): PilotSmokePath | null {
  if (slug === "sherwood") return SHERWOOD_PILOT_SMOKE_PATH;
  if (slug === "jacksonville") return JACKSONVILLE_PILOT_SMOKE_PATH;
  return null;
}
