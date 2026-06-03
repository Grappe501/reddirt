import type { CampaignOsNavGroup, CampaignOsNavLink } from "@/lib/dashboard-orchestration/campaign-os-nav-config";

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

/** Ordered for debate prep — hub first, then command surfaces, then review queues. */
export const DEBATE_WEEK_NAV_ITEMS: DebateWeekNavItem[] = [
  { href: "/admin/intelligence", label: "Opposition hub", badgeKey: "opposition", description: "Candidate command view + daily packet" },
  { href: "/admin/intelligence/debate-command", label: "Debate command", description: "War room readiness + brief pack scores" },
  { href: "/admin/intelligence/kim-hammer/debate-prep", label: "Debate prep", description: "14-section briefing + drill queue" },
  { href: "/admin/intelligence/kim-hammer", label: "Kim Hammer hub", description: "Module command center + bill drill-down" },
  { href: "/admin/intelligence/kim-hammer/evidence-command", label: "Evidence command", description: "Citation locker + export control" },
  { href: "/admin/intelligence/claims", label: "Claims ledger", description: "Supported / partial / needs research" },
  { href: "/admin/intelligence/action-queue", label: "Action queue", description: "Human retrieval assignments" },
  { href: "/admin/intelligence/llm-review-queue", label: "LLM review", description: "NON_PUBLISHABLE drafts" },
  { href: "/admin/intelligence/legislative-video", label: "Legislative video", description: "Clip candidates + chunks" },
  { href: "/admin/intelligence/scenario-simulation", label: "Scenario simulation", description: "Debate scenario prep" },
  { href: "/admin/intelligence/command-center", label: "Intel command center", description: "Cross-lane intelligence dashboard" },
  { href: "/admin/intelligence/kim-hammer/debate-ai-workbench", label: "Debate AI workbench", description: "Governed AI prep surface" },
  { href: "/admin/intelligence/memory", label: "Memory ledger", description: "NSI decision memory" },
];

export function isDebateWeekRoute(pathname: string): boolean {
  const path = pathname.split("?")[0]?.replace(/\/$/, "") || "/admin/intelligence";
  if (path === "/admin/login" || path.startsWith("/admin/login/")) return true;
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
