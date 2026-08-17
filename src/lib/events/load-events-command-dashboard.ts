import { formatInTimeZone } from "date-fns-tz";

import { isDatabaseConfigured } from "@/lib/env";
import { loadCampaignEventsDashboard } from "@/lib/campaign-events/load-campaign-events-dashboard";
import { loadCampaignEventsWorkbench } from "@/lib/campaign-events/load-workbench-events";
import { loadPromotionWorkbench, type PromotionWorkbenchRow } from "@/lib/campaign-events/calendar-promotion/load-promotion-workbench";
import { loadElectionPlanSnapshot } from "@/lib/election-plan/electionPlanSnapshot";
import { evaluateMobilizeRequired } from "@/lib/election-plan/mobilize-enforcement";
import { getVolunteerLeaderRoster } from "@/lib/volunteers/leader-roster";
import { leaderWorkbenchHref } from "@/lib/volunteers/build-leader-workbench-v2";
import type { VolunteerLeader } from "@/lib/volunteers/types";
import type { WorkbenchEventRow } from "@/lib/campaign-events/merge-persisted-row";
import { getDpaOfficerOrgsForLocation } from "@/lib/election-plan/load-dpa-county-officers";

const TZ = "America/Chicago";
const UPCOMING_HORIZON_DAYS = 14;

export type EventsPipelineStage = "upcoming" | "mobilize_gaps" | "promotion_queue" | "post_event";

export type EventsCommandQueueRow = {
  recordId: string;
  dateYmd: string;
  timeLabel: string;
  title: string;
  city: string;
  county: string;
  status: string;
  reviewStatus: string;
  decisionLabel: string | null;
  promotionStatus: string;
  daysUntil: number;
  missingInfo: boolean;
  duplicateRisk: boolean;
  partyChair: string | null;
  partyOfficersHref: string | null;
  detailHref: string;
  adminReviewHref: string;
  forwardMotionHref: string | null;
};

export type EventsMobilizeGapRow = {
  eventId: string;
  eventName: string;
  date: string;
  county: string;
  city: string;
  daysUntil: number;
  mobilizeStatus: string;
  warning: string;
  reasons: string[];
  forwardMotionHref: string;
};

export type EventsPromotionRow = {
  recordId: string;
  title: string;
  dateYmd: string;
  city: string;
  county: string;
  promotionStatus: string;
  readiness: string;
  blockers: string[];
  adminPromotionHref: string;
};

export type EventsHotWashRow = {
  recordId: string;
  title: string;
  dateYmd: string;
  city: string;
  county: string;
  adminReviewHref: string;
};

export type EventsLaneLeaderRow = {
  slug: string;
  displayName: string;
  initials: string;
  roleLabel: string;
  counties: string[];
  workbenchHref: string;
  laneDrillDownHref: string;
};

export type EventsCommandDashboardPayload = {
  dbAvailable: boolean;
  period: string;
  stats: {
    upcomingEvents: number;
    mobilizeGaps: number;
    promotionReady: number;
    promotionBlocked: number;
    hotWashPending: number;
    eventsLeaders: number;
  };
  pipeline: Array<{ stage: EventsPipelineStage; label: string; count: number; description: string }>;
  upcomingQueue: EventsCommandQueueRow[];
  mobilizeGaps: EventsMobilizeGapRow[];
  promotionQueue: EventsPromotionRow[];
  hotWashQueue: EventsHotWashRow[];
  eventsLeaders: EventsLaneLeaderRow[];
  weeklyRhythm: Array<{ id: string; label: string; description: string; href?: string }>;
  mobilizeIntegrationNote: string;
};

function ymdAddDays(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

function daysBetween(fromYmd: string, toYmd: string): number {
  const [fy, fm, fd] = fromYmd.split("-").map(Number);
  const [ty, tm, td] = toYmd.split("-").map(Number);
  const a = Date.UTC(fy, fm - 1, fd);
  const b = Date.UTC(ty, tm - 1, td);
  return Math.round((b - a) / 86_400_000);
}

function mapWorkbenchRow(
  row: WorkbenchEventRow,
  todayYmd: string,
  period: string,
  forwardMotionByName: Map<string, string>,
): EventsCommandQueueRow {
  const title = row.calendar.title;
  const fmId =
    forwardMotionByName.get(title.toLowerCase()) ??
    forwardMotionByName.get(`${title} ${row.county ?? ""}`.toLowerCase()) ??
    null;

  const officerOrgs = getDpaOfficerOrgsForLocation({
    countySlug: row.county,
    city: row.likelyCity,
    eventSlug: title,
  });
  const chair = officerOrgs[0]?.chair ?? null;

  return {
    recordId: row.recordId,
    dateYmd: row.dateYmd,
    timeLabel: row.timeLabel,
    title,
    city: row.likelyCity ?? "",
    county: row.county ?? "",
    status: row.eventStatus,
    reviewStatus: row.reviewStatus,
    decisionLabel: row.decisionLabel,
    promotionStatus: row.promotionStatus,
    daysUntil: daysBetween(todayYmd, row.dateYmd),
    missingInfo: row.persistedMissingCount > 0 || Boolean(row.requestInfoStatus),
    duplicateRisk: row.duplicateRisk,
    partyChair: chair?.displayName ? `${chair.office} ${chair.displayName}` : null,
    partyOfficersHref: officerOrgs[0]?.href ?? null,
    detailHref: `/election-plan/operators/events-command?event=${row.recordId}`,
    adminReviewHref: `/admin/campaign-events/review?month=${period}&mode=chronological`,
    forwardMotionHref: fmId ? `/election-plan/forward-motion/${fmId}` : null,
  };
}

function promotionRowFromWorkbench(entry: PromotionWorkbenchRow, period: string): EventsPromotionRow {
  const row = entry.row;
  return {
    recordId: row.recordId,
    title: row.calendar.title,
    dateYmd: row.dateYmd,
    city: row.likelyCity ?? "",
    county: row.county ?? "",
    promotionStatus: entry.promotionStatus,
    readiness: entry.readinessTentative,
    blockers: entry.blockers.slice(0, 4),
    adminPromotionHref: `/admin/campaign-events/calendar-promotion?month=${period}`,
  };
}

export function isEventsLaneLeader(leader: VolunteerLeader): boolean {
  return Boolean(
    leader.workbenchTemplates?.includes("events_lead") ||
      leader.workbenchTemplates?.includes("event_planner") ||
      (leader.teamLanes.includes("events") && !leader.commandAccess),
  );
}

function eventsRoleLabel(leader: VolunteerLeader): string {
  if (leader.workbenchTemplates?.includes("events_lead")) return "Events lead";
  if (leader.workbenchTemplates?.includes("event_planner")) return "Event planner";
  if (leader.teamLanes.includes("events")) return "Events lane";
  return "Events";
}

function buildEventsLeaderRows(): EventsLaneLeaderRow[] {
  return getVolunteerLeaderRoster()
    .filter(isEventsLaneLeader)
    .map((leader) => ({
      slug: leader.slug,
      displayName: leader.displayName,
      initials: leader.initials,
      roleLabel: eventsRoleLabel(leader),
      counties: leader.connections
        .filter((c): c is Extract<typeof c, { kind: "county" }> => c.kind === "county")
        .map((c) => c.county)
        .slice(0, 3),
      workbenchHref: leaderWorkbenchHref(leader.slug),
      laneDrillDownHref: `/election-plan/operators/leaders/${leader.slug}/lane/events`,
    }))
    .sort((a, b) => {
      if (a.roleLabel === "Events lead" && b.roleLabel !== "Events lead") return -1;
      if (a.roleLabel !== "Events lead" && b.roleLabel === "Events lead") return 1;
      return a.displayName.localeCompare(b.displayName);
    });
}

function buildMobilizeGaps(): EventsMobilizeGapRow[] {
  const snap = loadElectionPlanSnapshot();
  return snap.forwardMotion.stopsNext21Days
    .map((stop) => {
      const evaluation = evaluateMobilizeRequired(
        {
          eventName: stop.eventName,
          mobilizeStatus: stop.mobilizeStatus,
          primaryLane: stop.primaryLane,
          county: stop.county,
          city: stop.city,
        },
        {
          isCampusEvent: stop.primaryLane.toLowerCase().includes("campus"),
        },
      );
      if (!evaluation.required || !evaluation.warning) return null;
      return {
        eventId: stop.eventId,
        eventName: stop.eventName,
        date: stop.date,
        county: stop.county,
        city: stop.city,
        daysUntil: stop.daysUntil,
        mobilizeStatus: stop.mobilizeStatus,
        warning: evaluation.warning,
        reasons: evaluation.reasons,
        forwardMotionHref: `/election-plan/forward-motion/${stop.eventId}`,
      };
    })
    .filter((row): row is EventsMobilizeGapRow => row !== null)
    .sort((a, b) => a.daysUntil - b.daysUntil);
}

const WEEKLY_RHYTHM: EventsCommandDashboardPayload["weeklyRhythm"] = [
  {
    id: "next-event",
    label: "Confirm next event on calendar",
    description: "Planned or confirmed — roles assigned where possible.",
    href: "/election-plan?tab=fieldCalendar",
  },
  {
    id: "mobilize-shifts",
    label: "Mobilize & volunteer shifts",
    description: "Live Mobilize page 48 hours before public promotion on volunteer-heavy stops.",
    href: "/election-plan/movement-infrastructure/mobilize-rules",
  },
  {
    id: "run-of-show",
    label: "Run of show & role assignments",
    description: "Host, photography, fundraising liaison, follow-up captain on event workbench.",
  },
  {
    id: "post-event",
    label: "Post-event closeout (48h)",
    description: "Thank-yous, Po5 commitments, field log, and hot wash for past stops.",
  },
  {
    id: "comms-align",
    label: "Coordinate with comms lane",
    description: "Copy and photos ready 72 hours before each public stop.",
    href: "/election-plan/operators/comms-command",
  },
];

const EMPTY: EventsCommandDashboardPayload = {
  dbAvailable: false,
  period: formatInTimeZone(new Date(), TZ, "yyyy-MM"),
  stats: {
    upcomingEvents: 0,
    mobilizeGaps: 0,
    promotionReady: 0,
    promotionBlocked: 0,
    hotWashPending: 0,
    eventsLeaders: 0,
  },
  pipeline: [
    {
      stage: "upcoming",
      label: "Upcoming events (14d)",
      count: 0,
      description: "Field calendar stops in the next two weeks",
    },
    {
      stage: "mobilize_gaps",
      label: "Mobilize gaps",
      count: 0,
      description: "Volunteer-heavy stops missing Mobilize before promotion",
    },
    {
      stage: "promotion_queue",
      label: "Promotion ready",
      count: 0,
      description: "Events cleared for tentative or official calendar promotion",
    },
    {
      stage: "post_event",
      label: "Hot wash pending",
      count: 0,
      description: "Past approved stops awaiting post-event closeout",
    },
  ],
  upcomingQueue: [],
  mobilizeGaps: [],
  promotionQueue: [],
  hotWashQueue: [],
  eventsLeaders: buildEventsLeaderRows(),
  weeklyRhythm: WEEKLY_RHYTHM,
  mobilizeIntegrationNote: "Mobilize API sync is scaffolded — operators create Mobilize events manually until Script 5+ ships.",
};

export async function loadEventsCommandDashboard(): Promise<EventsCommandDashboardPayload> {
  const period = formatInTimeZone(new Date(), TZ, "yyyy-MM");
  const eventsLeaders = buildEventsLeaderRows();
  const mobilizeGaps = buildMobilizeGaps();

  let upcomingQueue: EventsCommandQueueRow[] = [];
  let hotWashQueue: EventsHotWashRow[] = [];
  let promotionQueue: EventsPromotionRow[] = [];
  let stats = {
    upcomingEvents: 0,
    mobilizeGaps: mobilizeGaps.length,
    promotionReady: 0,
    promotionBlocked: 0,
    hotWashPending: 0,
    eventsLeaders: eventsLeaders.length,
  };

  const snap = loadElectionPlanSnapshot();
  const forwardMotionByName = new Map<string, string>();
  for (const stop of snap.forwardMotion.stops) {
    forwardMotionByName.set(stop.eventName.toLowerCase(), stop.eventId);
    forwardMotionByName.set(`${stop.eventName} ${stop.county}`.toLowerCase(), stop.eventId);
  }

  try {
    const dashboard = await loadCampaignEventsDashboard(period);
    const { snapshot } = dashboard;
    const todayYmd = snapshot.todayYmd;
    const horizonYmd = ymdAddDays(todayYmd, UPCOMING_HORIZON_DAYS);

    const { rows } = await loadCampaignEventsWorkbench({ period });
    upcomingQueue = rows
      .filter((r) => r.rawEventStatus !== "CANCELLED" && r.dateYmd >= todayYmd && r.dateYmd <= horizonYmd)
      .sort((a, b) => a.startAtMs - b.startAtMs)
      .map((r) => mapWorkbenchRow(r, todayYmd, period, forwardMotionByName));

    hotWashQueue = rows
      .filter((r) => r.rawDecision === "approved" && r.dateYmd < todayYmd && r.rawEventStatus !== "CANCELLED")
      .sort((a, b) => b.dateYmd.localeCompare(a.dateYmd))
      .slice(0, 25)
      .map((r) => ({
        recordId: r.recordId,
        title: r.calendar.title,
        dateYmd: r.dateYmd,
        city: r.likelyCity ?? "",
        county: r.county ?? "",
        adminReviewHref: `/admin/campaign-events/review?month=${period}&mode=chronological`,
      }));

    stats = {
      upcomingEvents: upcomingQueue.length,
      mobilizeGaps: mobilizeGaps.length,
      promotionReady: snapshot.promotionReadyTentative + snapshot.promotionReadyOfficial,
      promotionBlocked: snapshot.promotionBlocked,
      hotWashPending: snapshot.actionItems.hotWashPending,
      eventsLeaders: eventsLeaders.length,
    };

    if (isDatabaseConfigured()) {
      try {
        const promotion = await loadPromotionWorkbench(period);
        promotionQueue = [
          ...promotion.readyTentative.slice(0, 15),
          ...promotion.readyOfficial.slice(0, 10),
          ...promotion.blocked.slice(0, 10),
        ].map((entry) => promotionRowFromWorkbench(entry, period));
      } catch (e) {
        console.error("[loadEventsCommandDashboard] promotion", e);
      }
    }
  } catch (e) {
    console.error("[loadEventsCommandDashboard]", e);
    return {
      ...EMPTY,
      period,
      mobilizeGaps,
      eventsLeaders,
      stats: { ...EMPTY.stats, mobilizeGaps: mobilizeGaps.length, eventsLeaders: eventsLeaders.length },
    };
  }

  const pipeline = [
    {
      stage: "upcoming" as const,
      label: "Upcoming events (14d)",
      count: stats.upcomingEvents,
      description: "Field calendar stops in the next two weeks",
    },
    {
      stage: "mobilize_gaps" as const,
      label: "Mobilize gaps",
      count: stats.mobilizeGaps,
      description: "Volunteer-heavy stops missing Mobilize before promotion",
    },
    {
      stage: "promotion_queue" as const,
      label: "Promotion ready",
      count: stats.promotionReady,
      description: "Events cleared for tentative or official calendar promotion",
    },
    {
      stage: "post_event" as const,
      label: "Hot wash pending",
      count: stats.hotWashPending,
      description: "Past approved stops awaiting post-event closeout",
    },
  ];

  return {
    dbAvailable: isDatabaseConfigured(),
    period,
    stats,
    pipeline,
    upcomingQueue,
    mobilizeGaps,
    promotionQueue,
    hotWashQueue,
    eventsLeaders,
    weeklyRhythm: WEEKLY_RHYTHM,
    mobilizeIntegrationNote: EMPTY.mobilizeIntegrationNote,
  };
}
