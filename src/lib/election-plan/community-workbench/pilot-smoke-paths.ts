import type { CommunityPilotSlug } from "./pilot";
import { grassrootsGuitarStringsEventHref } from "./event-links";
import { GRASSROOTS_GUITAR_STRINGS_EVENT_SLUG } from "./pilot-event-seeds";

export type PilotSmokePathStep = {
  order: number;
  title: string;
  action: string;
  passCriteria: string;
  anchor?: string;
  href?: string;
};

export type PilotSmokePath = {
  slug: string;
  name: string;
  intro: string;
  kind: "city" | "event" | "optional_city";
  workbenchSlug?: string;
  eventSlug?: string;
  steps: PilotSmokePathStep[];
};

export const JACKSONVILLE_PILOT_SMOKE_PATH: PilotSmokePath = {
  slug: "jacksonville",
  name: "Jacksonville",
  kind: "city",
  workbenchSlug: "jacksonville",
  intro:
    "Primary city pilot — municipal / petition-leader focus. Start here: /election-plan/workbenches/jacksonville. Use PILOT-labeled test events only.",
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
      passCriteria: "Event saved; petition-leader KPI template visible.",
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
      action: "Hub → Pilot validation → Defect log.",
      passCriteria: "Defect appears on hub with Jacksonville slug.",
      anchor: "pilot-smoke",
    },
  ],
};

export const GRASSROOTS_GUITAR_STRINGS_PILOT_SMOKE_PATH: PilotSmokePath = {
  slug: GRASSROOTS_GUITAR_STRINGS_EVENT_SLUG,
  name: "Grassroots & Guitar Strings",
  kind: "event",
  workbenchSlug: "sherwood",
  eventSlug: GRASSROOTS_GUITAR_STRINGS_EVENT_SLUG,
  intro:
    "Primary event pilot — Sept 17 special KPI / $20,000 profit opportunity. Event leadership ≠ Sherwood city leadership. Event hosts ≠ house-party hosts.",
  steps: [
    {
      order: 1,
      title: "Open event workbench (not city leadership board)",
      action: `Navigate to ${grassrootsGuitarStringsEventHref()} — confirm working committee, run-of-show, and assignments load.`,
      passCriteria: "Event ops panel shows Sept 17 date, committee link, and OPEN role slots.",
      href: grassrootsGuitarStringsEventHref(),
      anchor: "event-ops",
    },
    {
      order: 2,
      title: "Confirm city vs event separation",
      action: "Sherwood city workbench → Leadership should remain OPEN unless a city lead is explicitly placed. G&G chairs live on the event only.",
      passCriteria: "No G&G committee members appear as Sherwood community_lead rows.",
      href: "/election-plan/workbenches/sherwood#leadership",
    },
    {
      order: 3,
      title: "Assign Event Chair on event workbench",
      action: "Event workbench → Event Chair assignment → save name (PILOT prefix OK).",
      passCriteria: "Event Chair assignee persists — not copied to city leadership.",
      href: grassrootsGuitarStringsEventHref(),
      anchor: "event-ops",
    },
    {
      order: 4,
      title: "Committee slots remain OPEN until PPEN A.0b",
      action:
        "Document committee member slots as OPEN on the event workbench. Do not build enrollment UI or duplicate leaders — PPEN A.0b (Person + Participation) unlocks participant records.",
      passCriteria: "Slots visible as OPEN; no fake people or enrollment before PpenPerson exists.",
      anchor: "committee",
    },
    {
      order: 5,
      title: "Run-of-show and volunteer assignments",
      action: "Add or confirm 3+ run-of-show rows and 2+ volunteer role assignments on the event.",
      passCriteria: "Run-of-show and assignments save with operator initials.",
      anchor: "event-ops",
    },
    {
      order: 6,
      title: "Fundraising opportunity card",
      action: "Review $20,000 profit goal on event fundraising panel — sponsors/tickets/donations at zero until records exist.",
      passCriteria: "Profit goal shown separately from Sherwood city base/stretch FOS goals.",
      anchor: "fundraising",
    },
    {
      order: 7,
      title: "Complete pilot AAR on event",
      action: "Set event Executed → attendance → write AAR → After-action complete.",
      passCriteria: "Event status aar_complete with body saved.",
      anchor: "event-ops",
    },
    {
      order: 8,
      title: "Log a defect if anything failed",
      action: "Defect log with workbench slug sherwood and note G&G event path.",
      passCriteria: "Defect saved and visible on hub.",
      anchor: "pilot-smoke",
    },
  ],
};

/** Optional — Sherwood city campaign plan only; not gated on G&G event pilot. */
export const SHERWOOD_CITY_OPTIONAL_SMOKE_PATH: PilotSmokePath = {
  slug: "sherwood",
  name: "Sherwood (city — optional)",
  kind: "optional_city",
  workbenchSlug: "sherwood",
  intro:
    "Optional city workbench smoke — 60% vote-share stretch goal and OPEN city leadership. Do not conflate with Grassroots & Guitar Strings event ops.",
  steps: [
    {
      order: 1,
      title: "Review vote cushion / 60% stretch",
      action: "Sherwood workbench → Vote cushion section — confirm planning targets only.",
      passCriteria: "Stretch goal visible; not mixed with G&G profit KPI.",
      anchor: "vote-cushion",
    },
    {
      order: 2,
      title: "City leadership remains OPEN until accepted",
      action: "Leadership board — Community Lead and city roles stay OPEN unless explicitly filled.",
      passCriteria: "No auto-populated G&G event leaders on city board.",
      anchor: "leadership",
    },
    {
      order: 3,
      title: "Link to community events",
      action: "Overview → Community Events → open Grassroots & Guitar Strings event workbench.",
      passCriteria: "Deep link to event workbench works.",
      href: grassrootsGuitarStringsEventHref(),
    },
    {
      order: 4,
      title: "FOS city goals vs opportunities",
      action: "Fundraising section — base $9,390 / stretch $16,433 separate from G&G $20,000 opportunity.",
      passCriteria: "Opportunity rollup shows potential total, not replacement of base goal.",
      anchor: "fundraising",
    },
  ],
};

export const PRIMARY_PILOT_SMOKE_PATHS: PilotSmokePath[] = [
  JACKSONVILLE_PILOT_SMOKE_PATH,
  GRASSROOTS_GUITAR_STRINGS_PILOT_SMOKE_PATH,
];

export const PILOT_SMOKE_PATHS: Record<CommunityPilotSlug, PilotSmokePath> = {
  jacksonville: JACKSONVILLE_PILOT_SMOKE_PATH,
  sherwood: SHERWOOD_CITY_OPTIONAL_SMOKE_PATH,
};

export function getPilotSmokePath(slug: string): PilotSmokePath | null {
  if (slug === "jacksonville") return JACKSONVILLE_PILOT_SMOKE_PATH;
  if (slug === "sherwood") return SHERWOOD_CITY_OPTIONAL_SMOKE_PATH;
  return null;
}

export function getEventPilotSmokePath(eventSlug: string): PilotSmokePath | null {
  if (eventSlug === GRASSROOTS_GUITAR_STRINGS_EVENT_SLUG) return GRASSROOTS_GUITAR_STRINGS_PILOT_SMOKE_PATH;
  return null;
}

export function getPrimaryPilotSmokePath(slug: string): PilotSmokePath | null {
  return PRIMARY_PILOT_SMOKE_PATHS.find((p) => p.slug === slug) ?? null;
}
