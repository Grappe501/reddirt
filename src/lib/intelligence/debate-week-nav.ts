import type { CampaignOsNavGroup, CampaignOsNavLink } from "@/lib/dashboard-orchestration/campaign-os-nav-config";
import { isCountyClerkPrimaryAudience } from "@/lib/intelligence/v4/debateAudienceMode";
import { TIER_2_DEBATE_PREP_NAV_ITEMS } from "@/lib/intelligence/v4/debatePrepDepthNav";
import { buildKimHammerTier3SidebarNavItems } from "@/lib/intelligence/v4/kimHammerOpponentModuleNav";
import { DEBATE_WORKFLOW_STEPS } from "@/lib/intelligence/v4/debateOperatorNarratives";
import { buildThreeLaneNavGroups } from "@/lib/intelligence/v4/threeLaneNav";

function dedupeNavItems(items: DebateWeekNavItem[]): DebateWeekNavItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.href)) return false;
    seen.add(item.href);
    return true;
  });
}

const KIM_HAMMER_TIER_3_NAV_ITEMS: DebateWeekNavItem[] = buildKimHammerTier3SidebarNavItems().map((item) => ({
  href: item.href,
  label: item.label,
  description: item.description,
}));

/** Canonical debate-week operator paths (opposition + debate prep + review queues). */
export const DEBATE_WEEK_ROUTES = [
  "/admin/intelligence",
  "/admin/intelligence/supreme-workbench",
  "/admin/intelligence/opposition-strategy",
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
  "/admin/intelligence/debate-briefings",
  "/admin/intelligence/debate-prep/psychology-manual",
  "/admin/intelligence/agent-tooling",
  "/admin/intelligence/debate-depth",
  "/admin/intelligence/election-funding",
  "/admin/intelligence/election-equipment-vvsg",
  "/admin/intelligence/build-progress",
  "/admin/intelligence/diligence",
  "/admin/intelligence/field-book",
  "/admin/intelligence/morning-brief",
  "/admin/intelligence/ai-tools",
  "/admin/intelligence/briefing-papers",
  "/admin/intelligence/writing-toolbox",
  "/admin/intelligence/strategy-alignment",
  "/admin/intelligence/strategic-target-pathway",
  "/admin/intelligence/campaign-intelligence-graph",
  "/admin/intelligence/media-intake",
  "/admin/intelligence/intelligence-memory",
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

/** Phase A + upgrade tracks — pinned to top of sidebar and horizontal subnav. */
export const PHASE_A_COMMAND_NAV_ITEMS: DebateWeekNavItem[] = [
  {
    href: "/admin/intelligence/supreme-workbench",
    label: "Supreme workbench",
    badgeKey: "opposition",
    description: "Unified command — readiness, trap lanes, Phase A upgrade pass, build gaps.",
  },
  {
    href: "/admin/intelligence/diligence",
    label: "Diligence hub",
    badgeKey: "opposition",
    description: "Phase A — five-search court/financial checklists for Kelly, Hammer, and Pakko.",
  },
  {
    href: "/admin/intelligence/field-book",
    label: "The Field Book",
    badgeKey: "opposition",
    description: "Campaign encyclopedia — four upgrade phases with cross-linked articles.",
  },
  {
    href: "/admin/intelligence/build-progress",
    label: "Build progress",
    description: "Master intelligence stack tracker — tiers, link audit, Phase A completion.",
  },
  {
    href: "/admin/intelligence/candidate-dossiers",
    label: "Candidate dossiers",
    badgeKey: "opposition",
    description:
      "Kelly alignment profile plus Hammer and Pakko opponent dossiers — claims, strengths, lead stories.",
  },
];

const PHASE_A_HREFS = new Set(PHASE_A_COMMAND_NAV_ITEMS.map((i) => i.href));

function withoutPhaseA(items: DebateWeekNavItem[]): DebateWeekNavItem[] {
  return items.filter((i) => !PHASE_A_HREFS.has(i.href));
}

/** County clerks week — Kelly reads this path daily (see countyClerkSevenDayPrepPath). */
export const COUNTY_CLERK_WEEK_PRIMARY_NAV_ITEMS: DebateWeekNavItem[] = [
  ...PHASE_A_COMMAND_NAV_ITEMS,
  {
    href: TIER_2_DEBATE_PREP_NAV_ITEMS[0].href,
    label: TIER_2_DEBATE_PREP_NAV_ITEMS[0].label,
    badgeKey: "opposition",
    description: TIER_2_DEBATE_PREP_NAV_ITEMS[0].description,
  },
  {
    href: "/admin/intelligence/opposition-strategy",
    label: "Opposition strategy",
    description:
      "v6.2 offense layer: 2021 package continuity, CVSGF trap, six offensive moves — pair with election funding day.",
  },
  {
    href: "/admin/intelligence/county-clerk-week/acca-summer-conference",
    label: "ACCA Mountain View panel",
    badgeKey: "opposition",
    description:
      "Thu Jun 11 1–3pm SOS candidates panel at Ozark Folk Center — two-hour moderated Q&A with Hammer & Pakko; 13 narrative prep sections.",
  },
  {
    href: "/admin/intelligence/county-clerk-week",
    label: "7-day clerk path",
    badgeKey: "opposition",
    description:
      "Primary audience: county clerks. Seven-day reading order with daily goals, trap setup, and live-event card — Kelly's home screen this week.",
  },
  {
    href: "/admin/intelligence/election-funding",
    label: "Election funding",
    description:
      "CVSGF + HAVA statutory evidence, appropriations table, county budget breadcrumbs, records request, SOS outreach script, debate traps.",
  },
  {
    href: "/admin/intelligence/election-equipment-vvsg",
    label: "VVSG 2.0",
    description:
      "EAC report: federal certification timelines, equipment lifecycle, modernization costs, Arkansas SOS procurement role, candidate debate lines.",
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
    href: "/admin/intelligence/debate-prep/psychology-manual",
    label: "Psychology manual",
    description:
      "22-section training manual: stage psychology, three-way dynamics, ACCA panel atmosphere, rehearsal scripts — pair with coaching and philosophy briefings.",
  },
  {
    href: TIER_2_DEBATE_PREP_NAV_ITEMS[1].href,
    label: TIER_2_DEBATE_PREP_NAV_ITEMS[1].label,
    description: TIER_2_DEBATE_PREP_NAV_ITEMS[1].description,
  },
  {
    href: TIER_2_DEBATE_PREP_NAV_ITEMS[2].href,
    label: TIER_2_DEBATE_PREP_NAV_ITEMS[2].label,
    description: TIER_2_DEBATE_PREP_NAV_ITEMS[2].description,
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
    description: "Opponent dossiers hub — Hammer production + Pakko partial verified; film room and command center links.",
  },
  {
    href: "/admin/intelligence/kelly-debate-coaching",
    label: "Debate coaching",
    description: "Openings/closings, stage presence, three-way strategy, Kelly suggestions.",
  },
  {
    href: TIER_2_DEBATE_PREP_NAV_ITEMS[3].href,
    label: TIER_2_DEBATE_PREP_NAV_ITEMS[3].label,
    description: TIER_2_DEBATE_PREP_NAV_ITEMS[3].description,
  },
  {
    href: "/admin/intelligence/kim-hammer",
    label: "Hammer record map",
    description:
      "Kim Hammer module index — debate profile, themes, timeline, gaps, dossier links. Staff deep dives; Kelly stays on debate prep on stage night.",
  },
];

/** Kelly-first path — supreme workbench + debate prep stack. */
export const DEBATE_WEEK_PRIMARY_NAV_ITEMS: DebateWeekNavItem[] = [
  ...PHASE_A_COMMAND_NAV_ITEMS,
  {
    href: "/admin/intelligence/opposition-strategy",
    label: "Opposition strategy",
    description:
      "v6.2 offense layer: 2021 integrity package, 2025 petition cluster, six trap lanes, six offensive moves, cross-exam starters, and debate-day offense sequence.",
  },
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
      "23 moderator-style SOS questions — each opens with full briefing (why, alternatives, Hammer hooks) plus speak-order drills and claims gates.",
  },
  {
    href: "/admin/intelligence/debate-briefings",
    label: "Philosophy briefings",
    description:
      "Eight handling/philosophy pages — agree-but-never-only-agree, author vs administrator, pile-on, rebuttal architecture — plus prep finder.",
  },
  {
    href: "/admin/intelligence/debate-prep/psychology-manual",
    label: "Psychology manual",
    description:
      "22-section advanced manual: debate atmosphere, body language, three-way geometry, ACCA panel psychology — read before stage.",
  },
  {
    href: "/admin/intelligence/debate-depth",
    label: "Plain-language depth",
    description:
      "What to expect, handle Hammer's attacks, adversity, getting stuck, and culture-war bait — plus auto depth on every drill-down.",
  },
  {
    href: "/admin/intelligence/election-funding",
    label: "Election funding",
    description:
      "County Voting System Grant Fund + HAVA: statutory authority, appropriations, county budget breadcrumbs, missing statewide ledger, records request, and debate traps.",
  },
  {
    href: "/admin/intelligence/election-equipment-vvsg",
    label: "VVSG 2.0 education",
    description:
      "EAC May 2026 report ingested: certification pipeline, aging equipment, national costs, Arkansas SOS role, debate lines — pair with election funding.",
  },
  {
    href: "/admin/intelligence/build-progress",
    label: "Build progress",
    description:
      "Master completion chart: drill-down depth, act-proof coverage, flagged gaps, and phased upgrade plan for next intelligence version.",
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

/** Tier-1 staff research surfaces (NSI suite) — wired in extended nav; not Kelly debate-night screens. */
export const NSI_STAFF_RESEARCH_NAV_ITEMS: DebateWeekNavItem[] = [
  {
    href: "/admin/intelligence/morning-brief",
    label: "Morning brief",
    description:
      "Daily staff digest: intelligence priorities, registration rollups, action queue sync, briefing paper index — staff start here on research days.",
  },
  {
    href: "/admin/intelligence/strategy-alignment",
    label: "Strategy alignment",
    description:
      "SDI-1 strategic doctrine alignment — Kelly SOS pillars vs opponent frames; pair with debate command and target pathway.",
  },
  {
    href: "/admin/intelligence/strategic-target-pathway",
    label: "Target pathway",
    description:
      "County and audience target pathways — where to invest field time and contrast messaging; links to county briefings.",
  },
  {
    href: "/admin/intelligence/briefing-papers",
    label: "Briefing papers",
    description:
      "Generated strategic briefing papers library — morning intel, doctrine, media monitoring; INTERNAL_DRAFT only.",
  },
  {
    href: "/admin/intelligence/writing-toolbox",
    label: "Writing toolbox",
    description:
      "Governed AI writing templates for op-eds, statements, and rapid response — all outputs to LLM review queue.",
  },
  {
    href: "/admin/intelligence/ai-tools",
    label: "AI tools registry",
    description:
      "Full NSI-11/12 copilot registry: opposition research, debate prep, briefing, and gathering tools — HUMAN_REVIEW_REQUIRED.",
  },
  {
    href: "/admin/intelligence/media-intake",
    label: "Media intake",
    description:
      "Public media monitoring queue — clip candidates, citation drafts, retrieval tasks from news and social sources.",
  },
  {
    href: "/admin/intelligence/campaign-intelligence-graph",
    label: "Intel graph",
    description:
      "NSI-4 unified campaign intelligence graph — bills, narratives, doctrines, counties, exports (read-only entity map).",
  },
  {
    href: "/admin/intelligence/intelligence-memory",
    label: "Intelligence memory",
    description:
      "NSI decision memory registry — why claims were held, released, or adapted; distinct from debate-week memory ledger.",
  },
];

/** Staff / deep tools — still in full tab bar below primary row. */
export const DEBATE_WEEK_EXTENDED_NAV_ITEMS: DebateWeekNavItem[] = dedupeNavItems([
  {
    href: "/admin/intelligence/kim-hammer/evidence-command",
    label: "Evidence command",
    description:
      "Staff citation locker: export-ready claims, review workflow, retrieval tasks. Confirms act numbers before stage — Kelly uses Claims; headset staff use this.",
  },
  {
    href: "/admin/intelligence/kim-hammer",
    label: "Hammer record map",
    description:
      "Kim Hammer module index — debate profile, themes, timeline, gaps, dossier links. Staff deep dives; Kelly stays on debate prep on stage night.",
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
  ...KIM_HAMMER_TIER_3_NAV_ITEMS,
  {
    href: "/admin/intelligence/memory",
    label: "Memory ledger",
    description:
      "NSI decision memory for staff continuity. Documents why claims were held or released — not a debate-night screen for Kelly.",
  },
  ...NSI_STAFF_RESEARCH_NAV_ITEMS,
]);

export function getDebateWeekPrimaryNavItems(): DebateWeekNavItem[] {
  return isCountyClerkPrimaryAudience() ? COUNTY_CLERK_WEEK_PRIMARY_NAV_ITEMS : DEBATE_WEEK_PRIMARY_NAV_ITEMS;
}

/** Flat list for route allowlists and legacy imports. */
export function getFlatDebateWeekNavItems(): DebateWeekNavItem[] {
  return dedupeNavItems([
    ...PHASE_A_COMMAND_NAV_ITEMS,
    ...withoutPhaseA(getDebateWeekPrimaryNavItems()),
    ...DEBATE_WEEK_EXTENDED_NAV_ITEMS,
  ]);
}

/** Full ordered list (sidebar + route allowlist). */
export const DEBATE_WEEK_NAV_ITEMS: DebateWeekNavItem[] = getFlatDebateWeekNavItems();

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
  return buildThreeLaneNavGroups();
}

/** Grouped sidebar — re-export from three-lane nav (Phase D). */
export { buildLaunchSidebarNavGroups, buildThreeLaneNavGroups } from "@/lib/intelligence/v4/threeLaneNav";

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
