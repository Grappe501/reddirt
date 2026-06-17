/** Executive Book 2.0 — Campaign Operating System manual · chapter registry. */

export type ExecutiveBookPartId =
  | "doctrine"
  | "part-i-victory-strategy"
  | "part-ii-field-operations"
  | "part-iii-communications"
  | "part-iv-fundraising"
  | "part-v-infrastructure"
  | "part-vi-execution"
  | "appendices";

export type ExecutiveBookPartDef = {
  id: ExecutiveBookPartId;
  label: string;
  shortLabel: string;
};

export const EXECUTIVE_BOOK_PARTS: ExecutiveBookPartDef[] = [
  { id: "doctrine", label: "Chapter 0 — Campaign Doctrine", shortLabel: "Doctrine" },
  { id: "part-i-victory-strategy", label: "Part I — Victory Strategy", shortLabel: "Victory Strategy" },
  { id: "part-ii-field-operations", label: "Part II — Field Operations", shortLabel: "Field Operations" },
  { id: "part-iii-communications", label: "Part III — Communications", shortLabel: "Communications" },
  { id: "part-iv-fundraising", label: "Part IV — Fundraising", shortLabel: "Fundraising" },
  { id: "part-v-infrastructure", label: "Part V — Organizational Infrastructure", shortLabel: "Infrastructure" },
  { id: "part-vi-execution", label: "Part VI — Execution", shortLabel: "Execution" },
  { id: "appendices", label: "Appendices", shortLabel: "Appendices" },
];

/** Canonical V2 chapter slugs (Ch. 0–24). */
export type ExecutiveBookChapterSlug =
  | "doctrine"
  | "path-to-victory"
  | "county-strategy"
  | "community-strategy"
  | "coalition-strategy"
  | "ppen"
  | "leadership-development"
  | "county-workbench-system"
  | "community-workbench-system"
  | "event-operations"
  | "voter-engagement"
  | "campaign-communications-hub"
  | "social-media-operating-system"
  | "media-storytelling"
  | "communications-calendar"
  | "fundraising-operating-system"
  | "fundraising-opportunities"
  | "fundraising-leadership"
  | "volunteer-onboarding"
  | "technology-data-systems"
  | "accountability-reporting"
  | "immersion-county-missions"
  | "campaign-calendar"
  | "labor-day-readiness"
  | "election-day-operations"
  | "appendix-workbench-architecture"
  /** V1 bookmark slugs — resolve to canonical chapters; kept routable for share links. */
  | "ownership"
  | "influence-map"
  | "labor-day"
  | "scorecard"
  | "message"
  | "county-victory-targets"
  | "budget"
  | "power-of-5"
  | "students-for-arkansas"
  | "gotv"
  | "audit";

export type ExecutiveBookChapterDef = {
  slug: ExecutiveBookChapterSlug;
  /** Display chapter number (0–24). Legacy aliases reuse canonical number. */
  number: number;
  title: string;
  subtitle: string;
  /** Path under executive-book-v2/ or ../executive-book-v1/ for migrated prose. */
  markdownFile: string;
  href: string;
  partId: ExecutiveBookPartId;
  /** When set, this slug is a legacy alias — canonical slug for navigation. */
  canonicalSlug?: ExecutiveBookChapterSlug;
  osRoute?: string;
};

const V2_DIR = "executive-book-v2";
const V1_DIR = "../executive-book-v1";

export const EXECUTIVE_BOOK_CHAPTERS: ExecutiveBookChapterDef[] = [
  {
    slug: "doctrine",
    number: 0,
    title: "Campaign Doctrine",
    subtitle: "The Arkansas Way to Win — movement, not campaign; philosophy before mechanics",
    markdownFile: `${V1_DIR}/00-CAMPAIGN-DOCTRINE-THE-ARKANSAS-WAY-TO-WIN.md`,
    href: "/election-plan/executive-book/doctrine",
    partId: "doctrine",
    osRoute: "/election-plan/executive-book/doctrine",
  },
  {
    slug: "path-to-victory",
    number: 1,
    title: "Path to Victory",
    subtitle: "Electoral math, vote targets, cushion strategy, Top 40 cities, clusters, 50%+1",
    markdownFile: `${V1_DIR}/06-COUNTY-VICTORY-TARGETS.md`,
    href: "/election-plan/executive-book/path-to-victory",
    partId: "part-i-victory-strategy",
    osRoute: "/election-plan/county-victory-targets",
  },
  {
    slug: "county-strategy",
    number: 2,
    title: "County Strategy",
    subtitle: "County classifications, workbench doctrine, battlefield vs growth vs maintenance counties",
    markdownFile: `${V2_DIR}/02-COUNTY-STRATEGY.md`,
    href: "/election-plan/executive-book/county-strategy",
    partId: "part-i-victory-strategy",
    osRoute: "/election-plan?tab=countyPlaybooks",
  },
  {
    slug: "community-strategy",
    number: 3,
    title: "Community Strategy",
    subtitle: "Community Workbench doctrine — city, campus, program, and event workbenches",
    markdownFile: `${V2_DIR}/03-COMMUNITY-STRATEGY.md`,
    href: "/election-plan/executive-book/community-strategy",
    partId: "part-i-victory-strategy",
    osRoute: "/election-plan/workbenches",
  },
  {
    slug: "coalition-strategy",
    number: 4,
    title: "Coalition Strategy",
    subtitle: "Coalition Command — outreach lanes, faith, labor, educators, youth, business",
    markdownFile: `${V2_DIR}/04-COALITION-STRATEGY.md`,
    href: "/election-plan/executive-book/coalition-strategy",
    partId: "part-i-victory-strategy",
    osRoute: "/election-plan?tab=coalitionCommand",
  },
  {
    slug: "ppen",
    number: 5,
    title: "People Power Execution Network (PPEN)",
    subtitle: "Person → participation → relationship → impact · My Five · Help 10 Participate",
    markdownFile: `${V2_DIR}/05-PPEN.md`,
    href: "/election-plan/executive-book/ppen",
    partId: "part-i-victory-strategy",
    osRoute: "/election-plan?tab=peoplePower",
  },
  {
    slug: "leadership-development",
    number: 6,
    title: "Leadership Development System",
    subtitle: "Leadership Workbench doctrine — county, community, coalition, event, and succession",
    markdownFile: `${V2_DIR}/06-LEADERSHIP-DEVELOPMENT.md`,
    href: "/election-plan/executive-book/leadership-development",
    partId: "part-i-victory-strategy",
    osRoute: "/election-plan/leadership",
  },
  {
    slug: "county-workbench-system",
    number: 7,
    title: "County Workbench System",
    subtitle: "County intelligence operating center — leadership, field, fundraising, demographics",
    markdownFile: `${V2_DIR}/07-COUNTY-WORKBENCH-SYSTEM.md`,
    href: "/election-plan/executive-book/county-workbench-system",
    partId: "part-ii-field-operations",
    osRoute: "/election-plan/counties/faulkner",
  },
  {
    slug: "community-workbench-system",
    number: 8,
    title: "Community Workbench System",
    subtitle: "City execution model, readiness, committees, relationships, special KPI projects",
    markdownFile: `${V2_DIR}/08-COMMUNITY-WORKBENCH-SYSTEM.md`,
    href: "/election-plan/executive-book/community-workbench-system",
    partId: "part-ii-field-operations",
    osRoute: "/election-plan/workbenches/jacksonville",
  },
  {
    slug: "event-operations",
    number: 9,
    title: "Event Operations",
    subtitle: "Grassroots & Guitar Strings, house parties, fairs, forums, run of show, AAR",
    markdownFile: `${V2_DIR}/09-EVENT-OPERATIONS.md`,
    href: "/election-plan/executive-book/event-operations",
    partId: "part-ii-field-operations",
    osRoute: "/election-plan/workbenches/sherwood/events/grassroots-and-guitar-strings",
  },
  {
    slug: "voter-engagement",
    number: 10,
    title: "Voter Engagement",
    subtitle: "Help 10 Participate, registration verification, vote plans, election reminders",
    markdownFile: `${V2_DIR}/10-VOTER-ENGAGEMENT.md`,
    href: "/election-plan/executive-book/voter-engagement",
    partId: "part-ii-field-operations",
    osRoute: "/election-plan?tab=peoplePower",
  },
  {
    slug: "campaign-communications-hub",
    number: 11,
    title: "Campaign Communications Hub (CCH)",
    subtitle: "Substack architecture, public/insider feeds, contact acquisition, segmentation",
    markdownFile: `${V2_DIR}/11-CAMPAIGN-COMMUNICATIONS-HUB.md`,
    href: "/election-plan/executive-book/campaign-communications-hub",
    partId: "part-iii-communications",
    osRoute: "/election-plan/workbenches?kind=communications",
  },
  {
    slug: "social-media-operating-system",
    number: 12,
    title: "Social Media Operating System",
    subtitle: "Content Studio, platform workbenches, creator network, rapid response workflow",
    markdownFile: `${V2_DIR}/12-SOCIAL-MEDIA-OPERATING-SYSTEM.md`,
    href: "/election-plan/executive-book/social-media-operating-system",
    partId: "part-iii-communications",
    osRoute: "/election-plan/workbenches?kind=social",
  },
  {
    slug: "media-storytelling",
    number: 13,
    title: "Media & Storytelling",
    subtitle: "Story Corps, photography, video, testimonials, LTE, candidate narrative",
    markdownFile: `${V1_DIR}/05-THE-KELLY-GRAPPE-MESSAGE.md`,
    href: "/election-plan/executive-book/media-storytelling",
    partId: "part-iii-communications",
    osRoute: "/election-plan/executive-book/message",
  },
  {
    slug: "communications-calendar",
    number: 14,
    title: "Communications Calendar",
    subtitle: "Daily/weekly rhythm, county, coalition, and event communications cadence",
    markdownFile: `${V2_DIR}/14-COMMUNICATIONS-CALENDAR.md`,
    href: "/election-plan/executive-book/communications-calendar",
    partId: "part-iii-communications",
    osRoute: "/election-plan?tab=fieldCalendar",
  },
  {
    slug: "fundraising-operating-system",
    number: 15,
    title: "Fundraising Operating System (FOS)",
    subtitle: "Vote-target allocation, community goals, county/cluster/statewide rollups",
    markdownFile: `${V1_DIR}/06-CAMPAIGN-BUDGET-AND-FUNDRAISING-TARGETS.md`,
    href: "/election-plan/executive-book/fundraising-operating-system",
    partId: "part-iv-fundraising",
    osRoute: "/election-plan/executive-book/budget",
  },
  {
    slug: "fundraising-opportunities",
    number: 16,
    title: "Fundraising Opportunities",
    subtitle: "House parties, sponsors, grassroots events, campus and coalition fundraising",
    markdownFile: `${V2_DIR}/16-FUNDRAISING-OPPORTUNITIES.md`,
    href: "/election-plan/executive-book/fundraising-opportunities",
    partId: "part-iv-fundraising",
    osRoute: "/election-plan/workbenches/sherwood#fundraising",
  },
  {
    slug: "fundraising-leadership",
    number: 17,
    title: "Fundraising Leadership",
    subtitle: "County, community, and event fundraising leads — opportunity ownership",
    markdownFile: `${V2_DIR}/17-FUNDRAISING-LEADERSHIP.md`,
    href: "/election-plan/executive-book/fundraising-leadership",
    partId: "part-iv-fundraising",
    osRoute: "/election-plan/leadership",
  },
  {
    slug: "volunteer-onboarding",
    number: 18,
    title: "Volunteer Onboarding & Activation",
    subtitle: "Recruitment funnel, access levels, training, certifications, placement",
    markdownFile: `${V2_DIR}/18-VOLUNTEER-ONBOARDING.md`,
    href: "/election-plan/executive-book/volunteer-onboarding",
    partId: "part-v-infrastructure",
    osRoute: "/election-plan/operators",
  },
  {
    slug: "technology-data-systems",
    number: 19,
    title: "Technology & Data Systems",
    subtitle: "Election Plan OS, workbenches, PPEN, CCH, FOS, CRM, Discord roadmap",
    markdownFile: `${V2_DIR}/19-TECHNOLOGY-DATA-SYSTEMS.md`,
    href: "/election-plan/executive-book/technology-data-systems",
    partId: "part-v-infrastructure",
    osRoute: "/admin/election-plan",
  },
  {
    slug: "accountability-reporting",
    number: 20,
    title: "Accountability & Reporting",
    subtitle: "Weekly reporting, county/coalition reviews, KPI standards, data integrity",
    markdownFile: `${V1_DIR}/04-WEEKLY-SUCCESS-SCORECARD.md`,
    href: "/election-plan/executive-book/accountability-reporting",
    partId: "part-v-infrastructure",
    osRoute: "/election-plan/executive-book/scorecard",
  },
  {
    slug: "immersion-county-missions",
    number: 21,
    title: "Immersion County Missions",
    subtitle: "Quitman, Jacksonville, Sherwood, Mt. Ida, Jonesboro, Benton — one mission each",
    markdownFile: `${V2_DIR}/21-IMMERSION-COUNTY-MISSIONS.md`,
    href: "/election-plan/executive-book/immersion-county-missions",
    partId: "part-vi-execution",
    osRoute: "/election-plan/immersion-missions",
  },
  {
    slug: "campaign-calendar",
    number: 22,
    title: "Campaign Calendar",
    subtitle: "County sequence, leadership, hiring, fundraising, and event deadlines",
    markdownFile: `${V2_DIR}/22-CAMPAIGN-CALENDAR.md`,
    href: "/election-plan/executive-book/campaign-calendar",
    partId: "part-vi-execution",
    osRoute: "/election-plan?tab=fieldCalendar",
  },
  {
    slug: "labor-day-readiness",
    number: 23,
    title: "Labor Day Readiness Gate",
    subtitle: "September readiness — county, leadership, fundraising, communications criteria",
    markdownFile: `${V1_DIR}/03-SEPTEMBER-READINESS-LABOR-DAY.md`,
    href: "/election-plan/executive-book/labor-day-readiness",
    partId: "part-vi-execution",
    osRoute: "/election-plan/executive-book/labor-day",
  },
  {
    slug: "election-day-operations",
    number: 24,
    title: "Election Day Operations",
    subtitle: "GOTV, poll watching, voter assistance, war room, reporting",
    markdownFile: `${V1_DIR}/09-ARKANSAS-GOTV-OPERATIONS-PLAN.md`,
    href: "/election-plan/executive-book/election-day-operations",
    partId: "part-vi-execution",
    osRoute: "/election-plan/executive-book/gotv",
  },
  {
    slug: "appendix-workbench-architecture",
    number: 25,
    title: "Appendix H — Workbench Architecture",
    subtitle: "Campaign OS map — how Election Plan, workbenches, PPEN, FOS, and CCH connect",
    markdownFile: `${V2_DIR}/APPENDIX-H-WORKBENCH-ARCHITECTURE.md`,
    href: "/election-plan/executive-book/appendix-workbench-architecture",
    partId: "appendices",
    osRoute: "/election-plan",
  },
];

/** V1 share URLs → canonical V2 chapter (redirect in route handler). */
export const EXECUTIVE_BOOK_LEGACY_SLUG_ALIASES: Partial<Record<ExecutiveBookChapterSlug, ExecutiveBookChapterSlug>> = {
  ownership: "leadership-development",
  "influence-map": "coalition-strategy",
  "labor-day": "labor-day-readiness",
  scorecard: "accountability-reporting",
  message: "media-storytelling",
  "county-victory-targets": "path-to-victory",
  budget: "fundraising-operating-system",
  "power-of-5": "ppen",
  "students-for-arkansas": "community-strategy",
  gotv: "election-day-operations",
  audit: "accountability-reporting",
};

const LEGACY_ALIAS_ENTRIES: ExecutiveBookChapterDef[] = Object.entries(EXECUTIVE_BOOK_LEGACY_SLUG_ALIASES).flatMap(
  ([alias, canonical]) => {
    const target = EXECUTIVE_BOOK_CHAPTERS.find((c) => c.slug === canonical);
    if (!target) return [];
    return [
      {
        ...target,
        slug: alias as ExecutiveBookChapterSlug,
        href: `/election-plan/executive-book/${alias}`,
        canonicalSlug: canonical,
      },
    ];
  },
);

const ALL_CHAPTERS: ExecutiveBookChapterDef[] = [...EXECUTIVE_BOOK_CHAPTERS, ...LEGACY_ALIAS_ENTRIES];

export function resolveExecutiveBookChapterSlug(slug: string): ExecutiveBookChapterSlug | null {
  if (ALL_CHAPTERS.some((c) => c.slug === slug)) return slug as ExecutiveBookChapterSlug;
  return null;
}

export function getCanonicalExecutiveBookChapter(slug: ExecutiveBookChapterSlug): ExecutiveBookChapterDef {
  const chapter = ALL_CHAPTERS.find((c) => c.slug === slug);
  if (!chapter) throw new Error(`Unknown executive book slug: ${slug}`);
  if (chapter.canonicalSlug) {
    const canonical = EXECUTIVE_BOOK_CHAPTERS.find((c) => c.slug === chapter.canonicalSlug);
    if (canonical) return canonical;
  }
  return chapter;
}

export function getExecutiveBookChapter(slug: string): ExecutiveBookChapterDef | undefined {
  const resolved = resolveExecutiveBookChapterSlug(slug);
  if (!resolved) return undefined;
  return ALL_CHAPTERS.find((c) => c.slug === resolved);
}

export function isExecutiveBookChapterSlug(slug: string): slug is ExecutiveBookChapterSlug {
  return resolveExecutiveBookChapterSlug(slug) !== null;
}

export function listCanonicalExecutiveBookChapterSlugs(): ExecutiveBookChapterSlug[] {
  return EXECUTIVE_BOOK_CHAPTERS.map((c) => c.slug);
}

export function listExecutiveBookChapterSlugs(): ExecutiveBookChapterSlug[] {
  return ALL_CHAPTERS.map((c) => c.slug);
}

export function getExecutiveBookPart(partId: ExecutiveBookPartId): ExecutiveBookPartDef | undefined {
  return EXECUTIVE_BOOK_PARTS.find((p) => p.id === partId);
}

export function groupChaptersByPart(
  chapters: ExecutiveBookChapterDef[],
): Array<{ part: ExecutiveBookPartDef; chapters: ExecutiveBookChapterDef[] }> {
  return EXECUTIVE_BOOK_PARTS.map((part) => ({
    part,
    chapters: chapters.filter((c) => c.partId === part.id && !c.canonicalSlug),
  })).filter((g) => g.chapters.length > 0);
}
