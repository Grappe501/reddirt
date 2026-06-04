import type { CampaignOsNavGroup, CampaignOsNavLink } from "@/lib/dashboard-orchestration/campaign-os-nav-config";
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
      "Staff citation locker and export control. Use after claims review to pull export-ready anchors for rapid response — not for Kelly on stage.",
  },
  {
    href: "/admin/intelligence/action-queue",
    label: "Action queue",
    description:
      "Human retrieval assignments from intelligence gaps. Prioritize HIGH items before debate; Kelly should not cite OPEN gap topics publicly.",
  },
  {
    href: "/admin/intelligence/llm-review-queue",
    label: "LLM review",
    description:
      "NON_PUBLISHABLE AI drafts. Never read aloud in debate; staff only. Pair with claims before any adaptation goes public.",
  },
  {
    href: "/admin/intelligence/legislative-video",
    label: "Legislative video",
    description:
      "Clip candidates and transcript chunks. Use only when debate-command film room lane is READY — do not imply video proof without a clip ID.",
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

/** Full ordered list (sidebar + route allowlist). */
export const DEBATE_WEEK_NAV_ITEMS: DebateWeekNavItem[] = [
  ...DEBATE_WEEK_PRIMARY_NAV_ITEMS,
  ...DEBATE_WEEK_EXTENDED_NAV_ITEMS,
];

export function isDebateWeekRoute(pathname: string): boolean {
  const path = pathname.split("?")[0]?.replace(/\/$/, "") || "/admin/intelligence";
  if (path === "/admin" || path === "/admin/login" || path.startsWith("/admin/login/")) return true;
  if (path.startsWith("/admin/intelligence") || path.startsWith("/admin/opposition")) return true;
  return DEBATE_WEEK_ROUTES.some((route) => path === route || path.startsWith(`${route}/`));
}

export function buildDebateWeekNavGroups(): CampaignOsNavGroup[] {
  return [
    {
      id: "debate_week",
      label: "Debate week",
      links: DEBATE_WEEK_NAV_ITEMS.map((item) => ({
        href: item.href,
        label: item.label,
        badgeKey: item.badgeKey,
      })),
    },
  ];
}

/** Intelligence section inside full Campaign OS sidebar during debate prep. */
export function buildDebateWeekIntelligenceSectionLinks(): CampaignOsNavLink[] {
  return DEBATE_WEEK_NAV_ITEMS.map((item) => ({
    href: item.href,
    label: item.label,
    badgeKey: item.badgeKey,
  }));
}

/** Active-route narrative blurb for subnav helper text. */
export function describeDebateWeekRoute(pathname: string): string | undefined {
  const path = pathname.split("?")[0]?.replace(/\/$/, "") || "";
  const item = DEBATE_WEEK_NAV_ITEMS.find((i) => path === i.href || path.startsWith(`${i.href}/`));
  return item?.description;
}
