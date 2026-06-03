import type { CampaignOsNavGroup } from "@/lib/dashboard-orchestration/campaign-os-nav-config";

/** Emergency internal launch — opposition + debate prep workbench only. */
export const INTELLIGENCE_LAUNCH_MODE_ENV = "NEXT_PUBLIC_INTELLIGENCE_LAUNCH_MODE";
export const INTELLIGENCE_LAUNCH_MODE_OPPOSITION_DEBATE = "opposition_debate";

export const INTELLIGENCE_LAUNCH_ROUTES = [
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

export type IntelligenceLaunchRoute = (typeof INTELLIGENCE_LAUNCH_ROUTES)[number];

export function isIntelligenceOppositionDebateLaunchMode(): boolean {
  return process.env[INTELLIGENCE_LAUNCH_MODE_ENV] === INTELLIGENCE_LAUNCH_MODE_OPPOSITION_DEBATE;
}

export function isIntelligenceLaunchRoute(pathname: string): boolean {
  const path = pathname.split("?")[0]?.replace(/\/$/, "") || "/admin/intelligence";
  if (path === "/admin/login" || path.startsWith("/admin/login/")) return true;
  if (path.startsWith("/admin/intelligence") || path.startsWith("/admin/opposition")) return true;
  return INTELLIGENCE_LAUNCH_ROUTES.some((route) => path === route || path.startsWith(`${route}/`));
}

/** Campaign OS sidebar — opposition + debate prep only when launch mode is on. */
export function buildOppositionDebateLaunchNavGroups(): CampaignOsNavGroup[] {
  return [
    {
      id: "opposition_launch",
      label: "Debate launch",
      links: [
        { href: "/admin/intelligence", label: "Opposition research hub", badgeKey: "opposition" },
        { href: "/admin/intelligence/kim-hammer/debate-prep", label: "Debate prep briefing" },
        { href: "/admin/intelligence/debate-command", label: "Debate command center" },
        { href: "/admin/intelligence/kim-hammer", label: "Kim Hammer command hub" },
        { href: "/admin/intelligence/kim-hammer/evidence-command", label: "Evidence command" },
        { href: "/admin/intelligence/claims", label: "Claims ledger" },
        { href: "/admin/intelligence/action-queue", label: "Human action queue" },
        { href: "/admin/intelligence/llm-review-queue", label: "LLM review queue" },
        { href: "/admin/intelligence/scenario-simulation", label: "Scenario simulation" },
      ],
    },
  ];
}

export function shouldSkipCountyIntelligenceForLaunch(): boolean {
  return isIntelligenceOppositionDebateLaunchMode();
}

export const INTELLIGENCE_LAUNCH_BANNER =
  "Emergency Debate Launch Mode: Internal workbench only. Evidence confidence varies. Do not publish claims without review.";
