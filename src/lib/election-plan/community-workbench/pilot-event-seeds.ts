/** Pilot event workbench definitions — event leadership ≠ city leadership. */

export const GRASSROOTS_GUITAR_STRINGS_EVENT_SLUG = "grassroots-and-guitar-strings";

export type PilotEventSeed = {
  workbenchSlug: string;
  eventSlug: string;
  title: string;
  eventDateIso: string;
  location: string;
  expectedAttendance: number | null;
  status: "planned" | "confirmed" | "idea";
  profitGoal: number;
  committeeName: string;
  committeeGoals: string;
  /** Framework slots — assignee OPEN until participant records exist */
  committeeMemberSlots: string[];
  leadName: string | null;
  runOfShow: Array<{ time: string; label: string; owner?: string }>;
  assignments: Array<{ role: string; assignee: string; notes?: string }>;
};

export const GRASSROOTS_GUITAR_STRINGS_EVENT: PilotEventSeed = {
  workbenchSlug: "sherwood",
  eventSlug: GRASSROOTS_GUITAR_STRINGS_EVENT_SLUG,
  title: "Grassroots & Guitar Strings",
  eventDateIso: "2026-09-17T18:00:00.000Z",
  location: "Sherwood · venue TBD",
  expectedAttendance: null,
  status: "planned",
  profitGoal: 20_000,
  committeeName: "Grassroots & Guitar Strings Working Committee",
  committeeGoals:
    "Sept 17 special KPI event — profit goal $20,000 net. Event chair, hosts, and committee members live here — not Sherwood city leadership.",
  committeeMemberSlots: [
    "Event Chair — OPEN",
    "Fundraising Chair — OPEN",
    "Sponsor Chair — OPEN",
    "Ticket Sales Lead — OPEN",
    "Volunteer Coordinator — OPEN",
    "Marketing Lead — OPEN",
  ],
  leadName: null,
  runOfShow: [
    { time: "16:00", label: "Venue load-in · volunteer check-in", owner: "OPEN" },
    { time: "17:00", label: "Sound check · sponsor recognition prep", owner: "OPEN" },
    { time: "18:00", label: "Doors · grassroots program", owner: "OPEN" },
    { time: "19:30", label: "Kelly remarks · guitar strings segment", owner: "OPEN" },
    { time: "21:00", label: "Close · donation capture · teardown", owner: "OPEN" },
  ],
  assignments: [
    { role: "Event Chair", assignee: "OPEN", notes: "Event leadership — not community_lead" },
    { role: "Fundraising Chair", assignee: "OPEN" },
    { role: "Sponsor Chair", assignee: "OPEN" },
    { role: "Ticket Sales Lead", assignee: "OPEN" },
    { role: "Volunteer Coordinator", assignee: "OPEN" },
    { role: "Marketing Lead", assignee: "OPEN" },
    { role: "Run-of-show lead", assignee: "OPEN" },
    { role: "AAR author", assignee: "OPEN" },
  ],
};

export const PILOT_EVENT_SEEDS: PilotEventSeed[] = [GRASSROOTS_GUITAR_STRINGS_EVENT];

export function eventSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getPilotEventSeed(eventSlug: string): PilotEventSeed | undefined {
  return PILOT_EVENT_SEEDS.find((e) => e.eventSlug === eventSlug);
}

export function matchEventSlug(title: string): string {
  return eventSlugFromTitle(title);
}
