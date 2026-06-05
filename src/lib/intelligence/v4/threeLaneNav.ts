import type { CampaignOsNavGroup, CampaignOsNavLink } from "@/lib/dashboard-orchestration/campaign-os-nav-config";
import {
  DEBATE_WEEK_EXTENDED_NAV_ITEMS,
  getDebateWeekPrimaryNavItems,
  PHASE_A_COMMAND_NAV_ITEMS,
  type DebateWeekNavItem,
} from "@/lib/intelligence/debate-week-nav";
import { isCountyClerkPrimaryAudience } from "@/lib/intelligence/v4/debateAudienceMode";
import { resolveIntelligenceNavProfileClient } from "@/lib/intelligence/v4/roleBasedNavProfile";

export type ThreeLaneId = "phase_a" | "kelly" | "clerks" | "staff";

export type ThreeLaneNavMeta = {
  id: ThreeLaneId;
  label: string;
  shortLabel: string;
  description: string;
  headerClass: string;
  chipClass: string;
  sidebarLabelClass: string;
};

export const THREE_LANE_NAV: Record<ThreeLaneId, ThreeLaneNavMeta> = {
  phase_a: {
    id: "phase_a",
    label: "Phase A · command & dossiers",
    shortLabel: "Phase A",
    description: "Diligence, Field Book, dossiers, build progress — safety before narrative.",
    headerClass: "text-rose-200",
    chipClass: "border-rose-300 bg-rose-50 text-rose-950",
    sidebarLabelClass: "text-rose-200",
  },
  kelly: {
    id: "kelly",
    label: "Kelly · candidate lane",
    shortLabel: "Kelly",
    description: "Debate prep, trap lanes, coaching, claims gate — safe on stage.",
    headerClass: "text-emerald-200",
    chipClass: "border-emerald-300 bg-emerald-50 text-emerald-950",
    sidebarLabelClass: "text-emerald-200",
  },
  clerks: {
    id: "clerks",
    label: "Clerks · county lane",
    shortLabel: "Clerks",
    description: "Seven-day path, ACCA panel, funding, VVSG — clerk-room vocabulary.",
    headerClass: "text-sky-200",
    chipClass: "border-sky-300 bg-sky-50 text-sky-950",
    sidebarLabelClass: "text-sky-200",
  },
  staff: {
    id: "staff",
    label: "Staff · research lane",
    shortLabel: "Staff",
    description: "Hammer modules, queues, evidence, NSI research — not for stage without review.",
    headerClass: "text-violet-200",
    chipClass: "border-violet-300 bg-violet-50 text-violet-950",
    sidebarLabelClass: "text-violet-200",
  },
};

const CLERKS_HREF_PREFIXES = [
  "/admin/intelligence/county-clerk-week",
  "/admin/intelligence/election-funding",
  "/admin/intelligence/election-equipment-vvsg",
  "/admin/intelligence/kim-hammer/county-administration-burden",
];

const STAFF_HREF_PREFIXES = [
  "/admin/intelligence/diligence",
  "/admin/intelligence/build-progress",
  "/admin/intelligence/kim-hammer/evidence-command",
  "/admin/intelligence/action-queue",
  "/admin/intelligence/llm-review-queue",
  "/admin/intelligence/video-archive-room",
  "/admin/intelligence/legislative-video",
  "/admin/intelligence/scenario-simulation",
  "/admin/intelligence/command-center",
  "/admin/intelligence/agent-tooling",
  "/admin/intelligence/kim-hammer/debate-ai-workbench",
  "/admin/intelligence/memory",
  "/admin/intelligence/morning-brief",
  "/admin/intelligence/strategy-alignment",
  "/admin/intelligence/briefing-papers",
  "/admin/intelligence/writing-toolbox",
  "/admin/intelligence/media-intake",
  "/admin/intelligence/campaign-intelligence-graph",
  "/admin/intelligence/intelligence-memory",
  "/admin/intelligence/ai-tools",
  "/admin/intelligence/strategic-target-pathway",
  "/admin/intelligence/field-book/canon",
];

const PHASE_A_HREFS = new Set(PHASE_A_COMMAND_NAV_ITEMS.map((i) => i.href));

function assignLane(href: string): ThreeLaneId {
  if (PHASE_A_HREFS.has(href)) return "phase_a";
  if (CLERKS_HREF_PREFIXES.some((p) => href === p || href.startsWith(`${p}/`))) return "clerks";
  if (STAFF_HREF_PREFIXES.some((p) => href === p || href.startsWith(`${p}/`))) return "staff";
  if (href.startsWith("/admin/intelligence/kim-hammer") && !href.includes("debate-prep")) return "staff";
  return "kelly";
}

function toLinks(items: DebateWeekNavItem[]): CampaignOsNavLink[] {
  return items.map((item) => ({
    href: item.href,
    label: item.label,
    badgeKey: item.badgeKey,
  }));
}

function dedupeItems(items: DebateWeekNavItem[]): DebateWeekNavItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.href)) return false;
    seen.add(item.href);
    return true;
  });
}

export function buildThreeLaneNavGroups(profileOverride?: "CANDIDATE" | "STAFF" | "CLERK_WEEK"): CampaignOsNavGroup[] {
  const profile = profileOverride ?? resolveIntelligenceNavProfileClient(isCountyClerkPrimaryAudience());
  const allItems = dedupeItems([
    ...PHASE_A_COMMAND_NAV_ITEMS,
    ...getDebateWeekPrimaryNavItems().filter((i) => !PHASE_A_HREFS.has(i.href)),
    ...DEBATE_WEEK_EXTENDED_NAV_ITEMS.filter((i) => !PHASE_A_HREFS.has(i.href)),
  ]);

  const buckets: Record<ThreeLaneId, DebateWeekNavItem[]> = {
    phase_a: [],
    kelly: [],
    clerks: [],
    staff: [],
  };

  for (const item of allItems) {
    buckets[assignLane(item.href)].push(item);
  }

  const laneOrder: ThreeLaneId[] =
    profile === "CLERK_WEEK"
      ? ["phase_a", "clerks", "kelly", "staff"]
      : profile === "STAFF"
        ? ["phase_a", "kelly", "clerks", "staff"]
        : ["phase_a", "kelly", "clerks", "staff"];

  const hideStaff = profile === "CANDIDATE";

  return laneOrder
    .filter((lane) => !(hideStaff && lane === "staff"))
    .map((lane) => {
      const meta = THREE_LANE_NAV[lane];
      return {
        id: meta.id,
        label: meta.label,
        links: toLinks(buckets[lane]),
      };
    })
    .filter((group) => group.links.length > 0);
}

/** @deprecated Use buildThreeLaneNavGroups */
export function buildLaunchSidebarNavGroups(): CampaignOsNavGroup[] {
  return buildThreeLaneNavGroups();
}

export function getThreeLaneNavLinkAuditRoutes(): string[] {
  return buildThreeLaneNavGroups("STAFF").flatMap((g) => g.links.map((l) => l.href));
}

export function getThreeLaneForHref(href: string): ThreeLaneNavMeta | undefined {
  const lane = assignLane(href.split("?")[0]?.replace(/\/$/, "") ?? href);
  return THREE_LANE_NAV[lane];
}
