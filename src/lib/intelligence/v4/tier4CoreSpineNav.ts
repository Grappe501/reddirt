import {
  CANDIDATE_IPAD_PRIMARY_NAV,
  CANDIDATE_IPAD_MORE_LINKS,
} from "@/lib/intelligence/candidateIpadMode";

export type Tier4CoreSpineNavItem = {
  href: string;
  label: string;
  description: string;
};

export type Tier4CoreSpineNavGroup = {
  id: string;
  title: string;
  description: string;
  items: Tier4CoreSpineNavItem[];
};

/** Tier-4 Kelly / county-clerk primary debate-week spine (already in sidebar — formal catalog). */
export const TIER_4_CORE_PRIMARY_NAV_ITEMS: Tier4CoreSpineNavItem[] = [
  {
    href: "/admin/intelligence/supreme-workbench",
    label: "Supreme workbench",
    description: "Unified command surface — live readiness, debate-day sequences, trap lanes, build gaps.",
  },
  {
    href: "/admin/intelligence/opposition-strategy",
    label: "Opposition strategy",
    description: "2021 package continuity, CVSGF trap, six offensive moves — pair with election funding.",
  },
  {
    href: "/admin/intelligence/candidate-dossiers",
    label: "Candidate dossiers",
    description: "Kelly alignment profile plus Hammer & Pakko opponent dossiers.",
  },
  {
    href: "/admin/intelligence/county-clerk-week/acca-summer-conference",
    label: "ACCA Mountain View panel",
    description: "Jun 11 SOS candidates panel — 13 narrative prep sections.",
  },
  {
    href: "/admin/intelligence/county-clerk-week",
    label: "7-day clerk path",
    description: "Seven-day reading order with daily goals and live-event card.",
  },
  {
    href: "/admin/intelligence/election-funding",
    label: "Election funding",
    description: "CVSGF + HAVA statutory evidence, county budget breadcrumbs, debate traps.",
  },
  {
    href: "/admin/intelligence/election-equipment-vvsg",
    label: "VVSG 2.0",
    description: "Federal certification timelines, equipment lifecycle, Arkansas SOS procurement role.",
  },
  {
    href: "/admin/intelligence/kim-hammer/county-administration-burden",
    label: "County burden",
    description: "KH-0B — who pays, who implements, quorum court pressure.",
  },
  {
    href: "/admin/intelligence/kim-hammer/debate-prep",
    label: "Debate prep",
    description: "Bill playbooks, Kelly frame, operator guides — rehearse after daily path.",
  },
  {
    href: "/admin/intelligence/trap-lanes",
    label: "Trap lanes",
    description: "Six trap lanes with drill-down: set-ups, rebuttals, sample scripts.",
  },
  {
    href: "/admin/intelligence/film-room",
    label: "Film room",
    description: "Clips, transcripts, cross-exam bank — rehearse pivots before stage.",
  },
  {
    href: "/admin/intelligence/sos-debate-questions",
    label: "Expected questions",
    description: "SOS debate bank — speak order, agree-plus-fresh-add, opponent angles.",
  },
  {
    href: "/admin/intelligence/debate-command",
    label: "Debate command",
    description: "Readiness scores and trap warnings — validate prep before stage.",
  },
  {
    href: "/admin/intelligence/claims",
    label: "Verify claims",
    description: "Legal firewall — supported vs needs research before any public line.",
  },
  {
    href: "/admin/intelligence/diligence",
    label: "Diligence hub",
    description: "Phase A — five-search court/financial checklists for Kelly, Hammer, and Pakko.",
  },
  {
    href: "/admin/intelligence/field-book",
    label: "The Field Book",
    description: "Campaign encyclopedia — four upgrade phases, cross-linked articles, strategy canon.",
  },
  {
    href: "/admin/intelligence/opponents",
    label: "Opponents",
    description: "Opponent dossiers hub — Hammer production + Pakko partial verified.",
  },
  {
    href: "/admin/intelligence/kelly-debate-coaching",
    label: "Debate coaching",
    description: "Openings/closings, stage presence, three-way strategy.",
  },
];

/** Tier-4 staff extended spine — evidence, queues, video, scenarios. */
export const TIER_4_CORE_EXTENDED_NAV_ITEMS: Tier4CoreSpineNavItem[] = [
  {
    href: "/admin/intelligence/kim-hammer/evidence-command",
    label: "Evidence command",
    description: "Citation locker, export gate, retrieval tasks.",
  },
  {
    href: "/admin/intelligence/action-queue",
    label: "Action queue",
    description: "Staff assignment queue — citations, debate prep, retrieval.",
  },
  {
    href: "/admin/intelligence/llm-review-queue",
    label: "LLM review",
    description: "NON_PUBLISHABLE AI drafts — staff only.",
  },
  {
    href: "/admin/intelligence/video-archive-room",
    label: "Video archive room",
    description: "Focus bills with committee sponsor presentation links.",
  },
  {
    href: "/admin/intelligence/legislative-video",
    label: "Legislative video",
    description: "Clip candidates and transcript chunks.",
  },
  {
    href: "/admin/intelligence/scenario-simulation",
    label: "Scenario simulation",
    description: "Trap warnings and mock debate scenarios.",
  },
  {
    href: "/admin/intelligence/command-center",
    label: "Intel command center",
    description: "Cross-lane dashboard when snapshot loads.",
  },
  {
    href: "/admin/intelligence/agent-tooling",
    label: "Agent tooling",
    description: "Debate-week copilot hub and operator sequences.",
  },
  {
    href: "/admin/intelligence/kim-hammer/debate-ai-workbench",
    label: "Debate AI workbench",
    description: "Governed AI prep surface for staff drafting.",
  },
  {
    href: "/admin/intelligence/memory",
    label: "Memory ledger",
    description: "NSI decision memory for staff continuity.",
  },
];

export const TIER_4_IPAD_PRIMARY_NAV_ITEMS: Tier4CoreSpineNavItem[] = CANDIDATE_IPAD_PRIMARY_NAV.map(
  (item) => ({
    href: item.href,
    label: item.label,
    description: `iPad primary tab — ${item.shortLabel}.`,
  }),
);

export const TIER_4_IPAD_MORE_NAV_ITEMS: Tier4CoreSpineNavItem[] = CANDIDATE_IPAD_MORE_LINKS.map((item) => ({
  href: item.href,
  label: item.label,
  description: "iPad More sheet — staff and depth tools.",
}));

export function buildTier4CoreSpineNavGroups(): Tier4CoreSpineNavGroup[] {
  return [
    {
      id: "tier4-primary",
      title: "Kelly & county-clerk primary path",
      description: "Debate-week spine — open supreme workbench and 7-day path first.",
      items: TIER_4_CORE_PRIMARY_NAV_ITEMS,
    },
    {
      id: "tier4-extended",
      title: "Staff extended tools",
      description: "Evidence, queues, video, scenarios — headset staff; not Kelly on-stage screens.",
      items: TIER_4_CORE_EXTENDED_NAV_ITEMS,
    },
    {
      id: "tier4-ipad",
      title: "Candidate iPad",
      description: "Bottom nav + More sheet on Kelly device builds.",
      items: [...TIER_4_IPAD_PRIMARY_NAV_ITEMS, ...TIER_4_IPAD_MORE_NAV_ITEMS],
    },
  ];
}
