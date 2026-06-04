import type { CampaignOsNavGroup, CampaignOsNavLink } from "@/lib/dashboard-orchestration/campaign-os-nav-config";
import { isCountyClerkPrimaryAudience } from "@/lib/intelligence/v4/debateAudienceMode";
import { DEBATE_WORKFLOW_STEPS } from "@/lib/intelligence/v4/debateOperatorNarratives";

/** Canonical debate-week operator paths (opposition + debate prep + review queues). */
export const DEBATE_WEEK_ROUTES = [
  "/admin/intelligence",
  "/admin/intelligence/command-center",
  "/admin/intelligence/debate-command",
  "/admin/intelligence/kim-hammer",
  "/admin/intelligence/kim-hammer/debate-prep",
  "/admin/intelligence/kim-hammer/debate-ai-workbench",
  "/admin/intelligence/kim-hammer/evidence-command",
  "/admin/intelligence/claims",
  "/admin/intelligence/llm-review-queue",
  "/admin/intelligence/action-queue",
  "/admin/intelligence/memory",
  "/admin/intelligence/scenario-simulation",
  "/admin/intelligence/legislative-video",
  "/admin/intelligence/video-archive-room",
  "/admin/intelligence/trap-lanes",
  "/admin/intelligence/film-room",
  "/admin/intelligence/sos-debate-questions",
  "/admin/intelligence/agent-tooling",
  "/admin/intelligence/debate-depth",
] as const;

export type DebateWeekRoute = (typeof DEBATE_WEEK_ROUTES)[number];

export type DebateWeekNavItem = {
  href: string;
  label: string;
  badgeKey?: CampaignOsNavLink["badgeKey"];
  description?: string;
};

function stepDesc(href: string, fallback: string): string {
  const step = DEBATE_WORKFLOW_STEPS.find((s) => s.href === href);
  if (!step) return fallback;
  return `${step.guide.whyItMatters} When: ${step.guide.whenToUse}`;
}

/** County clerks week — Kelly reads this path daily (see countyClerkSevenDayPrepPath). */
export const COUNTY_CLERK_WEEK_PRIMARY_NAV_ITEMS: DebateWeekNavItem[] = [
  {
    href: "/admin/intelligence/county-clerk-week",
    label: "7-day clerk path",
    badgeKey: "opposition",
    description:
      "Primary audience: county clerks. Seven-day reading order with daily goals, trap setup, and live-event card — Kelly's home screen this week.",
  },
  {
    href: "/admin/intelligence/kim-hammer/county-administration-burden",
    label: "County burden",
    description:
      "KH-0B layer: who pays, who implements, quorum court pressure — anchor vocabulary for clerk rooms.",
  },
  {
    href: "/admin/intelligence/kim-hammer/debate-prep",
    label: "Debate prep",
    description: stepDesc(
      "/admin/intelligence/kim-hammer/debate-prep",
      "Bill playbooks, Kelly frame, operator guides — rehearse after daily path readings.",
    ),
  },
  {
    href: "/admin/intelligence/trap-lanes",
    label: "Trap lanes",
    description:
      "Six trap lanes with full drill-down: what Hammer will say, set-ups, rebuttals, sample scripts — tap from hub summary cards.",
  },
  {
    href: "/admin/intelligence/film-room",
    label: "Film room",
    description:
      "Clips, KATV/THV11 transcripts, cross-exam bank, and argument library — rehearse pivots before stage. Staff only for live clip use.",
  },
  {
    href: "/admin/intelligence/sos-debate-questions",
    label: "Expected questions",
    description:
      "Research-backed SOS debate bank: speak order 1·2·3, agree-plus-fresh-add, Hammer/Packo angles — open drill-down per topic.",
  },
  {
    href: "/admin/intelligence/debate-command",
    label: "Trap questions",
    description: stepDesc(
      "/admin/intelligence/debate-command",
      "Readiness scores and trap warnings — validate prep before stage.",
    ),
  },
  {
    href: "/admin/intelligence/claims",
    label: "Verify claims",
    description: stepDesc(
      "/admin/intelligence/claims",
      "Legal firewall before any clerk-room line or social post.",
    ),
  },
  {
    href: "/admin/intelligence/opponents",
    label: "Opponents",
    description: "Hammer (live) + Michael Packo scaffold — third-candidate research queue.",
  },
  {
    href: "/admin/intelligence/kelly-debate-coaching",
    label: "Debate coaching",
    description: "Openings/closings, stage presence, three-way strategy, Kelly suggestions.",
  },
];

/** Kelly-first path — three steps plus two reference surfaces. */
export const DEBATE_WEEK_PRIMARY_NAV_ITEMS: DebateWeekNavItem[] = [
  {
    href: "/admin/intelligence",
    label: "Start here",
    badgeKey: "opposition",
    description: stepDesc(
      "/admin/intelligence",
      "Command overview: executive brief, theme matrix, rehearsal deck, argument map, do-not-say list. Open first every prep day.",
    ),
  },
  {
    href: "/admin/intelligence/kim-hammer/debate-prep",
    label: "Debate prep",
    description: stepDesc(
      "/admin/intelligence/kim-hammer/debate-prep",
      "28-section rehearsal packet with per-section operator guides, drill deck, and rebuttal bridges.",
    ),
  },
  {
    href: "/admin/intelligence/film-room",
    label: "Film room",
    description:
      "Opponent clips, transcript drills (KATV/THV11/TBP), cross-exam bank, argument library — rehearse before stage.",
  },
  {
    href: "/admin/intelligence/sos-debate-questions",
    label: "Expected questions",
    description:
      "23 moderator-style SOS questions with 1st/2nd/3rd speak-order drills, rebuttals, and claims gates — never end on 'I agree' alone.",
  },
  {
    href: "/admin/intelligence/debate-depth",
    label: "Plain-language depth",
    description:
      "What to expect, handle Hammer's attacks, adversity, getting stuck, and culture-war bait — plus auto depth on every drill-down.",
  },
  {
    href: "/admin/intelligence/debate-command",
    label: "Debate command",
    description: stepDesc(
      "/admin/intelligence/debate-command",
      "Readiness scores and message lanes — validate what prep assumes before stage. Avoid BLOCKED lanes on TV.",
    ),
  },
  {
    href: "/admin/intelligence/kim-hammer",
    label: "Opponent record",
    description: stepDesc(
      "/admin/intelligence/kim-hammer",
      "Module map for staff deep dives; Kelly stays on hub/prep/bills on debate day.",
    ),
  },
  {
    href: "/admin/intelligence/claims",
    label: "Verify claims",
    description: stepDesc(
      "/admin/intelligence/claims",
      "Legal firewall: supported vs needs research. Gate every line before debate, ads, and social.",
    ),
  },
];

/** Staff / deep tools — still in full tab bar below primary row. */
export const DEBATE_WEEK_EXTENDED_NAV_ITEMS: DebateWeekNavItem[] = [
  {
    href: "/admin/intelligence/kim-hammer/evidence-command",
    label: "Evidence command",
    description:
      "Staff citation locker: export-ready claims, review workflow, retrieval tasks. Confirms act numbers before stage — Kelly uses Claims; headset staff use this.",
  },
  {
    href: "/admin/intelligence/action-queue",
    label: "Action queue",
    description:
      "Staff assignment queue (citations, debate prep, retrieval) — persisted fast load on Netlify. Prioritize URGENT/HIGH before stage; Kelly uses Claims, not this live.",
  },
  {
    href: "/admin/intelligence/llm-review-queue",
    label: "LLM review",
    description:
      "NON_PUBLISHABLE AI drafts. Never read aloud in debate; staff only. Pair with claims before any adaptation goes public.",
  },
  {
    href: "/admin/intelligence/film-room",
    label: "Film room",
    description:
      "Opponent media drills, transcript excerpts, cross-exam bank, argument library — pair with video archive for cuts.",
  },
  {
    href: "/admin/intelligence/video-archive-room",
    label: "Video archive room",
    description:
      "Focus bills with committee sponsor presentation links — watch, download source, register cut-and-ready clips for the film team.",
  },
  {
    href: "/admin/intelligence/legislative-video",
    label: "Legislative video",
    description:
      "Clip candidates and transcript chunks. Use with film room — do not imply video proof without a clip ID and claims gate.",
  },
  {
    href: "/admin/intelligence/scenario-simulation",
    label: "Scenario simulation",
    description:
      "Trap warnings and mock debate scenarios. Run after debate prep skim; debrief with debate command scores.",
  },
  {
    href: "/admin/intelligence/command-center",
    label: "Intel command center",
    description:
      "Cross-lane dashboard when snapshot loads; v4 executive fallback when not. Staff orientation — Kelly uses hub instead on debate day.",
  },
  {
    href: "/admin/intelligence/agent-tooling",
    label: "Agent tooling package",
    description:
      "Debate-week copilot hub: readiness signals, operator sequences (T-24h, pre-stage, spin room), one-click tool runs — INTERNAL_DRAFT only.",
  },
  {
    href: "/admin/intelligence/kim-hammer/debate-ai-workbench",
    label: "Debate AI workbench",
    description:
      "Governed AI prep surface for staff drafting. Outputs require human review and claims gate before any public use.",
  },
  {
    href: "/admin/intelligence/memory",
    label: "Memory ledger",
    description:
      "NSI decision memory for staff continuity. Documents why claims were held or released — not a debate-night screen for Kelly.",
  },
];

export function getDebateWeekPrimaryNavItems(): DebateWeekNavItem[] {
  return isCountyClerkPrimaryAudience() ? COUNTY_CLERK_WEEK_PRIMARY_NAV_ITEMS : DEBATE_WEEK_PRIMARY_NAV_ITEMS;
}

/** Full ordered list (sidebar + route allowlist). */
export const DEBATE_WEEK_NAV_ITEMS: DebateWeekNavItem[] = [
  ...DEBATE_WEEK_PRIMARY_NAV_ITEMS,
  ...DEBATE_WEEK_EXTENDED_NAV_ITEMS,
];

export function getDebateWeekNavItems(): DebateWeekNavItem[] {
  if (!isCountyClerkPrimaryAudience()) return DEBATE_WEEK_NAV_ITEMS;
  const primaryHrefs = new Set(COUNTY_CLERK_WEEK_PRIMARY_NAV_ITEMS.map((i) => i.href));
  const extended = DEBATE_WEEK_EXTENDED_NAV_ITEMS.filter((i) => !primaryHrefs.has(i.href));
  return [...COUNTY_CLERK_WEEK_PRIMARY_NAV_ITEMS, ...extended];
}

export function isDebateWeekRoute(pathname: string): boolean {
  const path = pathname.split("?")[0]?.replace(/\/$/, "") || "/admin/intelligence";
  if (path === "/admin" || path === "/admin/login" || path.startsWith("/admin/login/")) return true;
  if (path.startsWith("/admin/intelligence") || path.startsWith("/admin/opposition")) return true;
  return DEBATE_WEEK_ROUTES.some((route) => path === route || path.startsWith(`${route}/`));
}

export function buildDebateWeekNavGroups(): CampaignOsNavGroup[] {
  const items = getDebateWeekNavItems();
  return [
    {
      id: "debate_week",
      label: isCountyClerkPrimaryAudience() ? "County clerks week" : "Debate week",
      links: items.map((item) => ({
        href: item.href,
        label: item.label,
        badgeKey: item.badgeKey,
      })),
    },
  ];
}

/** Intelligence section inside full Campaign OS sidebar during debate prep. */
export function buildDebateWeekIntelligenceSectionLinks(): CampaignOsNavLink[] {
  return getDebateWeekNavItems().map((item) => ({
    href: item.href,
    label: item.label,
    badgeKey: item.badgeKey,
  }));
}

/** Active-route narrative blurb for subnav helper text. */
export function describeDebateWeekRoute(pathname: string): string | undefined {
  const path = pathname.split("?")[0]?.replace(/\/$/, "") || "";
  const item = getDebateWeekNavItems().find((i) => path === i.href || path.startsWith(`${i.href}/`));
  return item?.description;
}
