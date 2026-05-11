/**
 * County Democratic Party organizing dashboard — content and navigation contract.
 * Integrates with geographic Volunteer OS lanes (same 3-person triad discipline).
 */

export const COUNTY_DEMOCRATS_DASHBOARD_ROUTE_PREFIX = "/dashboard/community/county-democrats";

export const COUNTY_DEMOCRATS_LIVE_NAV = [
  { segment: "", label: "Overview" },
  { segment: "monthly-meeting", label: "Monthly meeting" },
  { segment: "p5-vr", label: "P5 / Voter Registration" },
  { segment: "events", label: "Events" },
  { segment: "social", label: "Social / Communications" },
  { segment: "youth-outreach", label: "Youth Outreach" },
  { segment: "womens-outreach", label: "Women's Outreach" },
  { segment: "precinct-teams", label: "Precinct teams" },
  { segment: "resources", label: "Resources" },
  { segment: "messages", label: "Messages" },
  { segment: "rollup", label: "Rollup" },
] as const;

export function countyDemocratsHref(countySlug: string, segment: (typeof COUNTY_DEMOCRATS_LIVE_NAV)[number]["segment"]): string {
  const base = `${COUNTY_DEMOCRATS_DASHBOARD_ROUTE_PREFIX}/${countySlug}`;
  return segment ? `${base}/${segment}` : base;
}

export function resolveCountyDemocratsDashboardLabel(pathname: string, countySlug: string): string {
  const base = `${COUNTY_DEMOCRATS_DASHBOARD_ROUTE_PREFIX}/${countySlug}`;
  if (pathname === base || pathname === `${base}/`) return "Overview";
  for (const t of COUNTY_DEMOCRATS_LIVE_NAV) {
    if (
      t.segment &&
      (pathname === `${base}/${t.segment}` || pathname.startsWith(`${base}/${t.segment}/`))
    ) {
      return t.label;
    }
  }
  return "Overview";
}

export const COUNTY_PARTY_LEADERSHIP_MODEL = {
  title: "County party leadership model",
  lines: [
    "County Party Chair",
    "├─ Vice Chair / Organization Lead",
    "├─ P5 / Voter Registration Lead",
    "├─ Events Lead",
    "├─ Social / Communications Lead",
    "├─ Youth Outreach Lead",
    "├─ Women's Outreach Lead",
    "└─ Precinct Team Leads",
  ],
} as const;

/** KPI ids for rollup / future DB sync (mirror on team KPI patterns). */
export const COUNTY_PARTY_KPI_DEFINITIONS = [
  { id: "cd-k-meeting-attendance", label: "Monthly meeting attendance (avg)" },
  { id: "cd-k-new-attendees", label: "New attendees per meeting" },
  { id: "cd-k-p5-invites", label: "P5 invitations sent (meeting cycle)" },
  { id: "cd-k-volunteers", label: "Volunteers onboarded" },
  { id: "cd-k-regs", label: "Voter registrations assisted" },
  { id: "cd-k-precinct-teams", label: "Precinct triads launched" },
  { id: "cd-k-social", label: "Social engagement (lane score)" },
  { id: "cd-k-gotv", label: "GOTV readiness (composite)" },
] as const;

/** Illustrative rollup until county party metrics table exists. */
export const COUNTY_PARTY_ROLLUP_TWENTY_SQUARE_SEED: { id: string; label: string; percent: number }[] = [
  { id: "cd-r-meeting", label: "Monthly meeting rhythm", percent: 52 },
  { id: "cd-r-p5", label: "P5 / VR", percent: 58 },
  { id: "cd-r-events", label: "Events", percent: 45 },
  { id: "cd-r-social", label: "Social / Communications", percent: 49 },
  { id: "cd-r-youth", label: "Youth Outreach", percent: 38 },
  { id: "cd-r-womens", label: "Women's Outreach", percent: 44 },
  { id: "cd-r-precinct", label: "Precinct teams", percent: 41 },
  { id: "cd-r-gotv", label: "GOTV readiness", percent: 47 },
];
