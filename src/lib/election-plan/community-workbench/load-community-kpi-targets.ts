import winSherwood from "../../../../data/campaign-brain/win-sherwood-operation.json";
import winQuitman from "../../../../data/campaign-brain/win-quitman-operation.json";

import { getCityNumericTargets } from "@/lib/election-plan/load-city-numeric-targets";
import { getSpecialKpiGoalForCity } from "@/lib/election-plan/load-special-kpi-goals";

import { countEventsByStatus } from "./event-readiness";
import type {
  CommunityWorkbenchEventRow,
  CommunityWorkbenchLeadershipRow,
  CommunityWorkbenchRelationshipRow,
  CommunityWorkbenchView,
} from "./types";

export type WorkbenchRecordCount = {
  key: string;
  label: string;
  count: number;
  /** In-page anchor for drill-down */
  drillAnchor: string;
  drillLabel: string;
};

export type WorkbenchPlanningGoal = {
  key: string;
  label: string;
  target: number;
  source: string;
  unit?: string;
};

type RecordCountInput = {
  leadership: CommunityWorkbenchLeadershipRow[];
  events: CommunityWorkbenchEventRow[];
  relationships: CommunityWorkbenchRelationshipRow[];
  fieldEntry: CommunityWorkbenchView["fieldEntry"];
};

function rollupQty(
  rollups: CommunityWorkbenchView["fieldEntry"]["rollups"],
  category: CommunityWorkbenchView["fieldEntry"]["rollups"][number]["category"],
): number {
  return rollups.find((r) => r.category === category)?.totalQuantity ?? 0;
}

function eventAssignmentCount(events: CommunityWorkbenchEventRow[]): number {
  return events.reduce(
    (sum, ev) => sum + ev.assignments.filter((a) => a.assignee?.trim()).length,
    0,
  );
}

/** Principle 1: counts come from records only — never from planning JSON. */
export function recordCountsForWorkbench(input: RecordCountInput): WorkbenchRecordCount[] {
  const eventCounts = countEventsByStatus(input.events);
  const executedEvents = eventCounts.executed + eventCounts.aar_complete;
  const leadershipFilled = input.leadership.filter((r) => r.personName?.trim()).length;

  return [
    {
      key: "volunteers",
      label: "Active volunteers",
      count: rollupQty(input.fieldEntry.rollups, "volunteer"),
      drillAnchor: "field-log",
      drillLabel: "View volunteer records",
    },
    {
      key: "conversations",
      label: "HCI conversations",
      count: rollupQty(input.fieldEntry.rollups, "conversation"),
      drillAnchor: "field-log",
      drillLabel: "View conversation records",
    },
    {
      key: "leaders",
      label: "Community leaders (field log)",
      count: rollupQty(input.fieldEntry.rollups, "leader"),
      drillAnchor: "field-log",
      drillLabel: "View leader records",
    },
    {
      key: "house_parties",
      label: "House party hosts",
      count: rollupQty(input.fieldEntry.rollups, "house_party"),
      drillAnchor: "field-log",
      drillLabel: "View house party records",
    },
    {
      key: "community_leadership",
      label: "Community leadership filled",
      count: leadershipFilled,
      drillAnchor: "leadership",
      drillLabel: "View community leadership",
    },
    {
      key: "relationships",
      label: "Relationship records",
      count: input.relationships.length,
      drillAnchor: "relationships",
      drillLabel: "View relationships",
    },
    {
      key: "events_executed",
      label: "Events executed",
      count: executedEvents,
      drillAnchor: "events",
      drillLabel: "View events",
    },
    {
      key: "event_volunteers",
      label: "Event volunteer assignments",
      count: eventAssignmentCount(input.events),
      drillAnchor: "events",
      drillLabel: "View event assignments",
    },
  ];
}

/** Planning goals — separate from live counts; sourced from campaign-brain / strategic plan. */
export function planningGoalsForSlug(slug: string): WorkbenchPlanningGoal[] {
  const citySlug = slug === "uca-campus" ? "conway" : slug;
  const numeric = getCityNumericTargets(citySlug);
  const goals: WorkbenchPlanningGoal[] = [];

  if (numeric) {
    goals.push(
      {
        key: "vote_target",
        label: "Vote target (chapter-05)",
        target: numeric.votes.target,
        source: numeric.source,
      },
      {
        key: "registration",
        label: "New registrations (plan)",
        target: numeric.registration.newRegistrations,
        source: "city-location-numeric-targets.source.json",
      },
      {
        key: "volunteers_plan",
        label: "Active volunteers (plan)",
        target: numeric.volunteers.activeVolunteers,
        source: "city-location-numeric-targets.source.json",
      },
      {
        key: "captains_plan",
        label: "Neighborhood captains (plan)",
        target: numeric.volunteers.captains,
        source: "city-location-numeric-targets.source.json",
      },
      {
        key: "hci_plan",
        label: "HCI conversations (plan)",
        target: numeric.houseParties.conversationsTarget,
        source: "city-location-numeric-targets.source.json",
      },
    );
  }

  if (slug === "sherwood") {
    goals.push(
      {
        key: "listed_hosts",
        label: "Listed hosts ($250)",
        target: winSherwood.hostTier.goal,
        source: "win-sherwood-operation.json",
      },
      {
        key: "vip_tables",
        label: "VIP tables (plan)",
        target: winSherwood.tracking.vipTablesGoal,
        source: "win-sherwood-operation.json",
      },
    );
  }

  if (slug === "quitman") {
    goals.push(
      {
        key: "fundraising",
        label: winQuitman.fundraising.label,
        target: winQuitman.fundraising.goal,
        source: "win-quitman-operation.json",
        unit: "$",
      },
      {
        key: "house_parties_plan",
        label: winQuitman.houseParties.label,
        target: winQuitman.houseParties.goal,
        source: "win-quitman-operation.json",
      },
      {
        key: "conversations_plan",
        label: winQuitman.conversations.label,
        target: winQuitman.conversations.goal,
        source: "win-quitman-operation.json",
      },
      {
        key: "vote_stretch",
        label: `${winQuitman.votePlan.stretchIncreasePct}% SOS stretch (bonus cushion)`,
        target: winQuitman.votePlan.stretchTargetSosVotes,
        source: winQuitman.votePlan.baselineSource,
      },
    );
  }

  const special = getSpecialKpiGoalForCity(citySlug);
  if (special?.targetSosVotes != null) {
    goals.push({
      key: "sos_lift",
      label: special.label,
      target: special.targetSosVotes,
      source: special.baselineSource,
    });
  } else if (numeric?.secondaryGoals?.[0]?.targetSosVotes != null) {
    const g = numeric.secondaryGoals[0];
    goals.push({
      key: "sos_lift",
      label: g.label,
      target: g.targetSosVotes,
      source: g.baselineSource,
    });
  }

  return goals;
}

/** @deprecated Use recordCountsForWorkbench — kept for search/readiness callers during migration. */
export function communityKpiMetricsForSlug(
  slug: string,
  _templateKey: string,
  fieldRollups: CommunityWorkbenchView["fieldEntry"]["rollups"],
  events: CommunityWorkbenchEventRow[] = [],
  leadership: CommunityWorkbenchLeadershipRow[] = [],
  relationships: CommunityWorkbenchRelationshipRow[] = [],
): CommunityWorkbenchView["kpiMetrics"] {
  return recordCountsForWorkbench({
    leadership,
    events,
    relationships,
    fieldEntry: { entries: [], rollups: fieldRollups, totalQuantity: 0 },
  }).map((r) => ({
    key: r.key,
    label: r.label,
    current: r.count,
  }));
}

export function communityReadinessTargetsForSlug(_slug: string): {
  volunteerTarget?: number;
  relationshipTarget?: number;
} {
  return {};
}
