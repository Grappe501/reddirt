import { isDatabaseConfigured } from "@/lib/env";
import {
  loadCoalitionCommandHub,
  type CoalitionCommandWorkbenchCard,
} from "@/lib/election-plan/community-workbench/load-coalition-command-hub";
import { communityWorkbenchHref } from "@/lib/election-plan/community-workbench/links";
import { loadStatewideFieldEntryRollups } from "@/lib/election-plan/field-entry/load-field-entries";
import {
  loadVolunteerIntakeDashboard,
  type VolunteerIntakeQueueRow,
} from "@/lib/volunteers/load-volunteer-intake-dashboard";
import { getVolunteerLeaderRoster } from "@/lib/volunteers/leader-roster";
import { leaderWorkbenchHref } from "@/lib/volunteers/build-leader-workbench-v2";
import type { VolunteerLeader } from "@/lib/volunteers/types";

const TZ = "America/Chicago";

const COALITION_LEAD_TEMPLATES = [
  "progressives_liaison",
  "muslim_community_lead",
  "educators_coalition_lead",
  "union_liaison",
  "democratic_black_caucus_lead",
  "hispanic_outreach_lead",
  "special_outreach_lead",
] as const;

const COALITION_INTAKE_KEYWORDS = [
  "coalition",
  "faith",
  "labor",
  "union",
  "muslim",
  "progressive",
  "educator",
  "naacp",
  "community",
  "partner",
  "validator",
];

export type CoalitionPipelineStage = "missing_owners" | "low_readiness" | "partner_intake" | "lane_leaders";

export type CoalitionWorkbenchRow = {
  slug: string;
  name: string;
  tagline: string | null;
  locale: string;
  leadRole: string | null;
  communityLead: string | null;
  hasOwner: boolean;
  hasUpcomingEvent: boolean;
  readinessPct: number;
  readinessBand: "green" | "yellow" | "red";
  warningCount: number;
  intelPagesFilled: number;
  relationshipCount: number;
  frameworkSectionCount: number;
  workbenchHref: string;
};

export type CoalitionIntakeQueueRow = VolunteerIntakeQueueRow & {
  coalitionSignals: string[];
};

export type CoalitionLaneLeaderRow = {
  slug: string;
  displayName: string;
  initials: string;
  roleLabel: string;
  coalitionWorkbench: string | null;
  workbenchHref: string;
  laneDrillDownHref: string;
};

export type CoalitionLaneDashboardPayload = {
  dbAvailable: boolean;
  stats: {
    coalitionWorkbenches: number;
    missingOwners: number;
    lowReadiness: number;
    coalitionIntakePending: number;
    partnerRelationships: number;
    coalitionLeaders: number;
    avgReadinessPct: number;
  };
  pipeline: Array<{ stage: CoalitionPipelineStage; label: string; count: number; description: string }>;
  workbenches: CoalitionWorkbenchRow[];
  missingOwnerWorkbenches: CoalitionWorkbenchRow[];
  coalitionIntake: CoalitionIntakeQueueRow[];
  coalitionLeaders: CoalitionLaneLeaderRow[];
  weeklyRhythm: Array<{ id: string; label: string; description: string; href?: string }>;
};

function coalitionIntakeSignals(row: VolunteerIntakeQueueRow): string[] {
  const signals: string[] = [];
  if (row.leadershipInterest) signals.push("Leadership interest");
  if (row.fundraisingInterest) signals.push("Fundraising interest");
  if (row.hostingInterest) signals.push("Hosting interest");
  const role = row.preferredRole?.toLowerCase() ?? "";
  for (const kw of COALITION_INTAKE_KEYWORDS) {
    if (role.includes(kw)) signals.push(`Role: ${kw}`);
  }
  for (const interest of row.interests) {
    const lower = interest.toLowerCase();
    if (COALITION_INTAKE_KEYWORDS.some((kw) => lower.includes(kw))) signals.push(interest);
  }
  return [...new Set(signals)];
}

export function isCoalitionIntakeCandidate(row: VolunteerIntakeQueueRow): boolean {
  return coalitionIntakeSignals(row).length > 0;
}

export function hasCoalitionLeadTemplate(leader: VolunteerLeader): boolean {
  return COALITION_LEAD_TEMPLATES.some((id) => leader.workbenchTemplates?.includes(id));
}

export function isCoalitionLaneLeader(leader: VolunteerLeader): boolean {
  return Boolean(
    hasCoalitionLeadTemplate(leader) ||
      leader.interfaithCommsLiaison ||
      (leader.teamLanes.includes("coalition") && leader.teamLanes[0] === "coalition" && !leader.commandAccess),
  );
}

function coalitionRoleLabel(leader: VolunteerLeader): string {
  if (leader.workbenchTemplates?.includes("progressives_liaison")) return "Progressives liaison";
  if (leader.workbenchTemplates?.includes("muslim_community_lead")) return "Muslim community lead";
  if (leader.workbenchTemplates?.includes("educators_coalition_lead")) return "Educators coalition lead";
  if (leader.workbenchTemplates?.includes("union_liaison")) return "Union liaison";
  if (leader.workbenchTemplates?.includes("democratic_black_caucus_lead")) return "Democratic Black Caucus lead";
  if (leader.workbenchTemplates?.includes("hispanic_outreach_lead")) return "Hispanic outreach lead";
  if (leader.interfaithCommsLiaison) return "Interfaith comms liaison";
  if (leader.teamLanes.includes("coalition")) return "Coalition lane";
  return "Coalition";
}

function coalitionWorkbenchFromLeader(leader: VolunteerLeader): string | null {
  const program = leader.connections.find((c) => c.kind === "program");
  return program?.programSlug ?? null;
}

function buildCoalitionLeaderRows(): CoalitionLaneLeaderRow[] {
  return getVolunteerLeaderRoster()
    .filter(isCoalitionLaneLeader)
    .map((leader) => ({
      slug: leader.slug,
      displayName: leader.displayName,
      initials: leader.initials,
      roleLabel: coalitionRoleLabel(leader),
      coalitionWorkbench: coalitionWorkbenchFromLeader(leader),
      workbenchHref: leaderWorkbenchHref(leader.slug),
      laneDrillDownHref: `/election-plan/operators/leaders/${leader.slug}/lane/coalition`,
    }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
}

function mapWorkbenchCard(wb: CoalitionCommandWorkbenchCard): CoalitionWorkbenchRow {
  return {
    slug: wb.slug,
    name: wb.name,
    tagline: wb.tagline,
    locale: wb.locale,
    leadRole: wb.leadRole,
    communityLead: wb.communityLead,
    hasOwner: wb.hasOwner,
    hasUpcomingEvent: wb.hasUpcomingEvent,
    readinessPct: wb.readinessPct,
    readinessBand: wb.readinessBand,
    warningCount: wb.warningCount,
    intelPagesFilled: wb.intelPagesFilled,
    relationshipCount: wb.relationshipCount,
    frameworkSectionCount: wb.frameworkSectionCount,
    workbenchHref: communityWorkbenchHref(wb.slug),
  };
}

const WEEKLY_RHYTHM: CoalitionLaneDashboardPayload["weeklyRhythm"] = [
  {
    id: "validator-list",
    label: "Update validator / partner list",
    description: "Workbench relationships + field log — trust before asks.",
  },
  {
    id: "intro-chain",
    label: "One warm introduction this week",
    description: "Bridge partners who should know each other.",
  },
  {
    id: "partner-touch",
    label: "Log partner meetings",
    description: "Field log: leader and conversation categories.",
  },
  {
    id: "immersion",
    label: "Immersion missions",
    description: "Listening and relationship missions when assigned.",
    href: "/election-plan/immersion-missions",
  },
  {
    id: "escalation",
    label: "Escalate blocked asks",
    description: "When a partner needs Kelly or HQ — leader command.",
    href: "/election-plan/operators/leaders/command",
  },
];

const EMPTY: CoalitionLaneDashboardPayload = {
  dbAvailable: false,
  stats: {
    coalitionWorkbenches: 0,
    missingOwners: 0,
    lowReadiness: 0,
    coalitionIntakePending: 0,
    partnerRelationships: 0,
    coalitionLeaders: 0,
    avgReadinessPct: 0,
  },
  pipeline: [
    {
      stage: "missing_owners",
      label: "Missing owners",
      count: 0,
      description: "Coalition workbenches without a named community lead",
    },
    {
      stage: "low_readiness",
      label: "Low readiness",
      count: 0,
      description: "Workbenches below yellow readiness band",
    },
    {
      stage: "partner_intake",
      label: "Partner intake",
      count: 0,
      description: "Volunteer sign-ups with coalition or leadership signals",
    },
    {
      stage: "lane_leaders",
      label: "Coalition lane leaders",
      count: 0,
      description: "Liaisons and coalition template leads on the roster",
    },
  ],
  workbenches: [],
  missingOwnerWorkbenches: [],
  coalitionIntake: [],
  coalitionLeaders: buildCoalitionLeaderRows(),
  weeklyRhythm: WEEKLY_RHYTHM,
};

export async function loadCoalitionLaneDashboard(): Promise<CoalitionLaneDashboardPayload> {
  const coalitionLeaders = buildCoalitionLeaderRows();
  const fieldRollups = await loadStatewideFieldEntryRollups();
  const leaderFieldQty = fieldRollups.find((r) => r.category === "leader")?.totalQuantity ?? 0;
  const conversationQty = fieldRollups.find((r) => r.category === "conversation")?.totalQuantity ?? 0;
  const partnerRelationships = leaderFieldQty + conversationQty;

  let hub;
  try {
    hub = await loadCoalitionCommandHub();
  } catch (e) {
    console.error("[loadCoalitionLaneDashboard] hub", e);
    return {
      ...EMPTY,
      coalitionLeaders,
      stats: { ...EMPTY.stats, coalitionLeaders: coalitionLeaders.length, partnerRelationships },
    };
  }

  const workbenches = hub.workbenches.map(mapWorkbenchCard).sort((a, b) => {
    if (a.readinessBand !== b.readinessBand) {
      const order = { red: 0, yellow: 1, green: 2 };
      return order[a.readinessBand] - order[b.readinessBand];
    }
    return a.readinessPct - b.readinessPct;
  });

  const missingOwnerWorkbenches = workbenches.filter((w) => !w.hasOwner);
  const lowReadiness = workbenches.filter((w) => w.readinessBand === "red").length;

  let coalitionIntake: CoalitionIntakeQueueRow[] = [];
  let coalitionIntakePending = 0;

  try {
    const intake = await loadVolunteerIntakeDashboard();
    coalitionIntake = intake.queue
      .filter(isCoalitionIntakeCandidate)
      .map((row) => ({
        ...row,
        coalitionSignals: coalitionIntakeSignals(row),
        detailHref: `/election-plan/operators/coalition-command?intake=${row.id}`,
      }));
    coalitionIntakePending = coalitionIntake.filter(
      (r) => r.pipelineStage === "pending" || r.pipelineStage === "in_review",
    ).length;
  } catch (e) {
    console.error("[loadCoalitionLaneDashboard] intake", e);
  }

  const stats = {
    coalitionWorkbenches: hub.rollup.total,
    missingOwners: hub.rollup.total - hub.rollup.withOwner,
    lowReadiness,
    coalitionIntakePending,
    partnerRelationships,
    coalitionLeaders: coalitionLeaders.length,
    avgReadinessPct: hub.rollup.avgReadinessPct,
  };

  const pipeline = [
    {
      stage: "missing_owners" as const,
      label: "Missing owners",
      count: stats.missingOwners,
      description: "Coalition workbenches without a named community lead",
    },
    {
      stage: "low_readiness" as const,
      label: "Low readiness",
      count: stats.lowReadiness,
      description: "Workbenches in red readiness band — intel or ownership gaps",
    },
    {
      stage: "partner_intake" as const,
      label: "Partner intake",
      count: stats.coalitionIntakePending,
      description: "Volunteer sign-ups with coalition or leadership signals awaiting placement",
    },
    {
      stage: "lane_leaders" as const,
      label: "Coalition lane leaders",
      count: stats.coalitionLeaders,
      description: "Liaisons and coalition template leads on the roster",
    },
  ];

  return {
    dbAvailable: isDatabaseConfigured(),
    stats,
    pipeline,
    workbenches,
    missingOwnerWorkbenches,
    coalitionIntake,
    coalitionLeaders,
    weeklyRhythm: WEEKLY_RHYTHM,
  };
}
