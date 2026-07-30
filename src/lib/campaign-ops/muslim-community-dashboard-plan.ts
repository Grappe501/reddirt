/**
 * Muslim Community Civic Organizing Dashboard — plan constants.
 * Used by `/volunteer/resources/muslim-community` and campaign-ops docs.
 */

export const MUSLIM_DASHBOARD_DRAFT_NOTICE =
  "This hub is still growing with community partners. Materials and labels will expand as they are ready to share.";

/** Authenticated-style dashboard shell (partner-facing). Resource hub remains the long-form draft. */
export const MUSLIM_COMMUNITY_DASHBOARD_BASE = "/dashboard/community/muslim";

export const MUSLIM_LIVE_DASHBOARD_NAV = [
  { segment: "", label: "Overview" },
  { segment: "p5-vr", label: "P5 / Voter Registration" },
  { segment: "events", label: "Events" },
  { segment: "social", label: "Social / Communications" },
  { segment: "youth-outreach", label: "Youth Outreach" },
  { segment: "womens-outreach", label: "Women's Outreach" },
  { segment: "mosque-polling", label: "Mosque polling readiness" },
  { segment: "resources", label: "Resources" },
  { segment: "messages", label: "Messages" },
  { segment: "rollup", label: "Rollup" },
] as const;

export function muslimDashboardHref(segment: (typeof MUSLIM_LIVE_DASHBOARD_NAV)[number]["segment"]): string {
  return segment ? `${MUSLIM_COMMUNITY_DASHBOARD_BASE}/${segment}` : MUSLIM_COMMUNITY_DASHBOARD_BASE;
}

export function resolveMuslimDashboardLabel(pathname: string): string {
  const base = MUSLIM_COMMUNITY_DASHBOARD_BASE;
  if (pathname === base || pathname === `${base}/`) return "Overview";
  for (const t of MUSLIM_LIVE_DASHBOARD_NAV) {
    if (t.segment && (pathname === `${base}/${t.segment}` || pathname.startsWith(`${base}/${t.segment}/`))) {
      return t.label;
    }
  }
  return "Overview";
}

/** Demo rollup lane momentum (20-square); replace with live aggregates when region metrics land in DB. */
export const MUSLIM_ROLLUP_TWENTY_SQUARE_SEED: { id: string; label: string; percent: number }[] = [
  { id: "m-r-social", label: "Social / Communications", percent: 54 },
  { id: "m-r-events", label: "Events", percent: 48 },
  { id: "m-r-p5", label: "P5 / Voter registration", percent: 61 },
  { id: "m-r-youth", label: "Youth Outreach", percent: 42 },
  { id: "m-r-womens", label: "Women's Outreach", percent: 51 },
  { id: "m-r-mosque", label: "Mosque polling readiness", percent: 36 },
  { id: "m-r-cross", label: "Cross-lane coordination", percent: 58 },
];

export const MUSLIM_COMMUNITY_DASHBOARD_TABS = [
  { id: "overview", label: "Overview" },
  { id: "p5-vr", label: "P5 / Voter Registration" },
  { id: "events", label: "Events" },
  { id: "social", label: "Social / Communications" },
  { id: "youth-outreach", label: "Youth Outreach" },
  { id: "womens-outreach", label: "Women’s Outreach" },
  { id: "cross-lane", label: "Cross-Lane coordination" },
  { id: "mosque-polling", label: "Mosque Polling Location Readiness" },
  { id: "resources", label: "Resources" },
  { id: "messages", label: "Messages" },
  { id: "rollup", label: "Rollup" },
] as const;

/** Text hierarchy for docs and dashboard Overview tab. */
export const MUSLIM_REGION_LEADERSHIP_MODEL = {
  title: "Muslim Community Region — leadership model",
  lines: [
    "Muslim Community Overall Lead",
    "  ├─ P5 / Voter Registration Lead",
    "  ├─ Events Lead",
    "  ├─ Social / Communications Lead",
    "  ├─ Youth Outreach Lead",
    "  └─ Women’s Outreach Lead",
  ],
  reporting: [
    "P5 / VR Lead → Campaign P5 / VR Lead",
    "Events Lead → Campaign Events Lead",
    "Social Lead → Campaign Social Media Lead",
    "Youth Outreach Lead → Muslim Community Overall Lead + Field Director support",
    "Women’s Outreach Lead → Muslim Community Overall Lead + Field Director support",
    "Muslim Community Overall Lead → Field Director / campaign team lead structure",
  ],
} as const;

export const MUSLIM_YOUTH_OUTREACH_LANE = {
  purpose:
    "Engage young people through trusted community spaces, family networks, student groups, service opportunities, and civic education.",
  responsibilities: [
    "Identify youth and young adult networks.",
    "Coordinate with parents, families, and community elders where appropriate.",
    "Connect with student groups and young professionals.",
    "Help young voters register and understand voting.",
    "Recruit youth volunteers into appropriate roles.",
    "Encourage youth participation in community outreach events.",
    "Surface youth-specific questions to campaign leads.",
    "Support young people who want to help with social media, events, or voter registration.",
  ],
  kpis: [
    "Youth contacts identified",
    "Youth voter registrations",
    "Youth volunteers referred to /volunteer",
    "Youth participants at community events",
    "Student/community groups engaged",
    "Youth-led outreach actions completed",
  ],
} as const;

export const MUSLIM_WOMENS_OUTREACH_LANE = {
  purpose:
    "Support outreach through trusted women’s networks, family relationships, community gatherings, service circles, and women-led civic conversations.",
  responsibilities: [
    "Identify women’s community networks.",
    "Support women-led voter registration and civic conversations.",
    "Coordinate family-friendly outreach opportunities.",
    "Help organize women’s listening sessions or small gatherings.",
    "Connect women volunteers into Events, Social, P5/VR, or downstream teams.",
    "Surface questions and concerns to campaign leads.",
    "Ensure outreach is respectful of modesty, family structure, and community norms.",
    "Help plan events at times and places that work for women and families.",
  ],
  kpis: [
    "Women’s network contacts identified",
    "Women voter registrations",
    "Women volunteers referred to /volunteer",
    "Women-led gatherings planned",
    "Family-friendly events supported",
    "Questions/issues elevated to campaign",
  ],
} as const;

export const MUSLIM_CROSS_LANE_COORDINATION = {
  intro:
    "Youth and Women’s Outreach are first-class lanes — not side programs. They stay connected to the rest of the Muslim Community dashboard:",
  rows: [
    { from: "Youth Outreach", to: "P5 / VR", note: "Registration, turnout education, trusted follow-up." },
    { from: "Women’s Outreach", to: "Events", note: "Gatherings, drives, family-friendly calendar." },
    { from: "Social / Communications", to: "Youth / Women’s messaging", note: "Community-approved messaging and assets." },
    { from: "Events", to: "Family / community calendar", note: "One coherent schedule; no duplicate competing asks." },
    { from: "P5 / VR", to: "Registration goals", note: "Shared targets; lanes report into rollup." },
  ],
} as const;

/** Resource stubs linked from volunteer library (anchors on hub page). */
export const MUSLIM_COMMUNITY_RESOURCE_STUBS = [
  {
    anchor: "resource-youth-civic",
    lane: "youth" as const,
    title: "Youth Civic Participation Guide",
    blurb: "Framework for age-appropriate civic education and volunteer on-ramps — outline for community review.",
  },
  {
    anchor: "resource-youth-student-vr",
    lane: "youth" as const,
    title: "Student Voter Registration Checklist",
    blurb: "Campus and student-group aligned steps — outline for community review.",
  },
  {
    anchor: "resource-youth-volunteer-invite",
    lane: "youth" as const,
    title: "Youth Volunteer Invitation Template",
    blurb: "Low-pressure invite language — outline for community review.",
  },
  {
    anchor: "resource-youth-social",
    lane: "youth" as const,
    title: "Youth Social Media Guidelines",
    blurb: "Safety, guardian context, and community norms — outline for community review.",
  },
  {
    anchor: "resource-youth-service-civic",
    lane: "youth" as const,
    title: "Community Service-to-Civic Action Guide",
    blurb: "Bridge service projects to registration and turnout — outline for community review.",
  },
  {
    anchor: "resource-women-civic",
    lane: "womens" as const,
    title: "Women’s Civic Conversation Guide",
    blurb: "Listening-first prompts and boundaries — outline for community review.",
  },
  {
    anchor: "resource-women-family-events",
    lane: "womens" as const,
    title: "Family-Friendly Event Checklist",
    blurb: "Timing, childcare considerations, accessibility — outline for community review.",
  },
  {
    anchor: "resource-women-listening",
    lane: "womens" as const,
    title: "Women’s Listening Session Guide",
    blurb: "Small gathering format and escalation — outline for community review.",
  },
  {
    anchor: "resource-women-volunteer-invite",
    lane: "womens" as const,
    title: "Women Volunteer Invitation Template",
    blurb: "Respectful invite language — outline for community review.",
  },
  {
    anchor: "resource-women-respectful-outreach",
    lane: "womens" as const,
    title: "Respectful Outreach Guidance",
    blurb: "Modesty, family structure, and community norms — outline for community review.",
  },
] as const;
