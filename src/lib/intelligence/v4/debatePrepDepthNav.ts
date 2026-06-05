import { DEBATE_DEPTH_TOPICS } from "@/lib/intelligence/v4/debateDepthTopics";
import { listDebatePhilosophyBriefings } from "@/lib/intelligence/v4/debatePhilosophyBriefings";

/** Tier-2 debate prep surfaces — built but previously only reachable via in-page hops. */
export type DebatePrepDepthNavItem = {
  href: string;
  label: string;
  description: string;
};

export const TIER_2_COMMAND_HUB_NAV: DebatePrepDepthNavItem = {
  href: "/admin/intelligence",
  label: "Command hub",
  description:
    "Executive brief, theme matrix, rehearsal deck, argument map, do-not-say list, opponent module preview — Kelly's orientation screen.",
};

export const TIER_2_DEBATE_PREP_NAV_ITEMS: DebatePrepDepthNavItem[] = [
  TIER_2_COMMAND_HUB_NAV,
  {
    href: "/admin/intelligence/debate-briefings",
    label: "Philosophy briefings",
    description:
      "Eight handling/philosophy pages — agree-but-never-only-agree, author vs administrator, pile-on, rebuttal architecture — plus prep finder.",
  },
  {
    href: "/admin/intelligence/debate-depth",
    label: "Plain-language depth",
    description:
      "Five topic guides: adversity, culture war, if stuck, Hammer attack patterns, three-way geometry — pair with trap lanes and SOS questions.",
  },
  {
    href: "/admin/intelligence/build-progress",
    label: "Build progress",
    description:
      "Master completion chart: drill-down depth, act-proof coverage, flagged gaps, psychology manual, NSI staff suite, phased upgrade plan.",
  },
];

export function getAllDebateDepthTopicHrefs(): string[] {
  return DEBATE_DEPTH_TOPICS.map((t) => t.href);
}

export function getAllDebatePhilosophyBriefingHrefs(): string[] {
  return listDebatePhilosophyBriefings().map((b) => `/admin/intelligence/debate-briefings/${b.briefingId}`);
}

export function getTier2DebatePrepLinkAuditRoutes(): string[] {
  return [
    ...TIER_2_DEBATE_PREP_NAV_ITEMS.map((i) => i.href),
    ...getAllDebateDepthTopicHrefs(),
    ...getAllDebatePhilosophyBriefingHrefs(),
  ];
}
