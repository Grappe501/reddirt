import { formatInTimeZone } from "date-fns-tz";
import type { MessageStudioDraftStatus } from "@prisma/client";

import { prisma } from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/env";
import { loadCommunicationsBundle } from "@/lib/campaign-events/communications/load-communications-bundle";
import { loadCampaignEventsDashboard } from "@/lib/campaign-events/load-campaign-events-dashboard";
import { messageStudioSharedDraftSnapshotCounts } from "@/lib/email-command-center/message-studio-drafts";
import { getEmailWorkflowQueueSummary, listEmailWorkflowItems } from "@/lib/email-workflow/queries";
import { EMAIL_WORKFLOW_NEEDS_ATTENTION_STATUSES } from "@/lib/email-workflow/governance";
import { getVolunteerLeaderRoster } from "@/lib/volunteers/leader-roster";
import { leaderWorkbenchHref } from "@/lib/volunteers/build-leader-workbench-v2";
import type { VolunteerLeader } from "@/lib/volunteers/types";

const TZ = "America/Chicago";
const COMMS_EVENT_HORIZON_DAYS = 3;

export type CommsPipelineStage = "editorial" | "email_queue" | "event_alignment" | "county_comms";

export type CommsEditorialQueueRow = {
  id: string;
  title: string;
  status: MessageStudioDraftStatus;
  draftType: string;
  subject: string;
  updatedAt: string;
  editorialReviewOwner: string | null;
  detailHref: string;
  adminStudioHref: string;
};

export type CommsEmailQueueRow = {
  id: string;
  status: string;
  priority: string;
  title: string | null;
  whoSummary: string | null;
  whatSummary: string | null;
  assignedTo: string | null;
  createdAt: string;
  adminHref: string;
};

export type CommsEventAlignmentRow = {
  recordId: string;
  dateYmd: string;
  timeLabel: string;
  title: string;
  city: string;
  county: string;
  status: string;
  daysUntil: number;
  calendarHref: string;
};

export type CommsLeaderCoverageRow = {
  slug: string;
  displayName: string;
  initials: string;
  roleLabel: string;
  counties: string[];
  workbenchHref: string;
  laneDrillDownHref: string;
};

export type StatewideCommsDashboardPayload = {
  dbAvailable: boolean;
  period: string;
  stats: {
    draftsNeedingReview: number;
    draftsInReview: number;
    emailNeedsAttention: number;
    eventsCommsDue: number;
    commsLeaders: number;
    massEmailStatus: "blocked" | "gated";
  };
  pipeline: Array<{ stage: CommsPipelineStage; label: string; count: number; description: string }>;
  editorialQueue: CommsEditorialQueueRow[];
  emailQueue: CommsEmailQueueRow[];
  eventAlignment: CommsEventAlignmentRow[];
  commsLeaders: CommsLeaderCoverageRow[];
  readinessRisks: string[];
  weeklyRhythm: Array<{ id: string; label: string; description: string; href?: string }>;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

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

export function isCommsLaneLeader(leader: VolunteerLeader): boolean {
  return Boolean(
    leader.workbenchTemplates?.includes("comms_lead") ||
      leader.interfaithCommsLiaison ||
      (leader.teamLanes.includes("comms") && !leader.commandAccess),
  );
}

function commsRoleLabel(leader: VolunteerLeader): string {
  if (leader.workbenchTemplates?.includes("comms_lead")) return "Statewide / county comms lead";
  if (leader.interfaithCommsLiaison) return "Interfaith comms liaison";
  if (leader.teamLanes.includes("comms")) return "Comms lane";
  return "Comms";
}

function buildCommsLeaderRows(): CommsLeaderCoverageRow[] {
  return getVolunteerLeaderRoster()
    .filter(isCommsLaneLeader)
    .map((leader) => ({
      slug: leader.slug,
      displayName: leader.displayName,
      initials: leader.initials,
      roleLabel: commsRoleLabel(leader),
      counties: leader.connections
        .filter((c): c is Extract<typeof c, { kind: "county" }> => c.kind === "county")
        .map((c) => c.county)
        .slice(0, 3),
      workbenchHref: leaderWorkbenchHref(leader.slug),
      laneDrillDownHref: `/election-plan/operators/leaders/${leader.slug}/lane/comms`,
    }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
}

const WEEKLY_RHYTHM: StatewideCommsDashboardPayload["weeklyRhythm"] = [
  {
    id: "message-packet",
    label: "Pull county message packet",
    description: "Core line + shareable prompts from Conversations & Stories — align every post.",
    href: "/messages",
  },
  {
    id: "validator-story",
    label: "One local validator story",
    description: "Neighbor, faith leader, or business — sourced only, no unsourced claims.",
  },
  {
    id: "event-comms",
    label: "Event comms 72h ahead",
    description: "Copy and photos aligned with events lane before each stop.",
  },
  {
    id: "editorial-queue",
    label: "Clear editorial review queue",
    description: "Message Studio drafts waiting on comms lead signoff.",
  },
  {
    id: "conversation-reach",
    label: "Log offline conversation reach",
    description: "Field log category for posts that sparked real conversations.",
  },
];

const EMPTY: StatewideCommsDashboardPayload = {
  dbAvailable: false,
  period: formatInTimeZone(new Date(), TZ, "yyyy-MM"),
  stats: {
    draftsNeedingReview: 0,
    draftsInReview: 0,
    emailNeedsAttention: 0,
    eventsCommsDue: 0,
    commsLeaders: 0,
    massEmailStatus: "blocked",
  },
  pipeline: [
    {
      stage: "editorial",
      label: "Editorial review",
      count: 0,
      description: "Message Studio drafts awaiting comms lead review",
    },
    {
      stage: "email_queue",
      label: "Email workflow",
      count: 0,
      description: "Inbound / triage items needing operator attention",
    },
    {
      stage: "event_alignment",
      label: "Event comms (72h)",
      count: 0,
      description: "Stops needing copy and photo alignment soon",
    },
    {
      stage: "county_comms",
      label: "County comms leads",
      count: 0,
      description: "Leaders with comms lane on their workbench",
    },
  ],
  editorialQueue: [],
  emailQueue: [],
  eventAlignment: [],
  commsLeaders: buildCommsLeaderRows(),
  readinessRisks: [],
  weeklyRhythm: WEEKLY_RHYTHM,
};

export async function loadStatewideCommsDashboard(): Promise<StatewideCommsDashboardPayload> {
  const period = formatInTimeZone(new Date(), TZ, "yyyy-MM");
  const commsLeaders = buildCommsLeaderRows();
  const bundle = loadCommunicationsBundle();

  let eventsCommsDue = 0;
  let eventAlignment: CommsEventAlignmentRow[] = [];
  try {
    const events = await loadCampaignEventsDashboard(period);
    const { snapshot } = events;
    const horizonYmd = ymdAddDays(snapshot.todayYmd, COMMS_EVENT_HORIZON_DAYS);
    eventAlignment = snapshot.upcoming
      .filter((e) => e.dateYmd <= horizonYmd)
      .map((e) => ({
        recordId: e.recordId,
        dateYmd: e.dateYmd,
        timeLabel: e.timeLabel,
        title: e.title,
        city: e.city,
        county: e.county,
        status: e.status,
        daysUntil: daysBetween(snapshot.todayYmd, e.dateYmd),
        calendarHref: `/admin/campaign-events/review?month=${period}&mode=chronological`,
      }));
    eventsCommsDue = eventAlignment.length;
  } catch (e) {
    console.error("[loadStatewideCommsDashboard] events", e);
  }

  if (!isDatabaseConfigured()) {
    return {
      ...EMPTY,
      period,
      commsLeaders,
      stats: {
        ...EMPTY.stats,
        eventsCommsDue,
        commsLeaders: commsLeaders.length,
        massEmailStatus: bundle.massEmailStatus,
      },
      pipeline: EMPTY.pipeline.map((p) =>
        p.stage === "event_alignment"
          ? { ...p, count: eventsCommsDue }
          : p.stage === "county_comms"
            ? { ...p, count: commsLeaders.length }
            : p,
      ),
      eventAlignment,
      readinessRisks: bundle.risks.slice(0, 4),
    };
  }

  try {
    const [draftCounts, draftRows, emailSummary, emailRows] = await Promise.all([
      messageStudioSharedDraftSnapshotCounts(),
      prisma.messageStudioDraft.findMany({
        where: { status: { in: ["NEEDS_REVIEW", "IN_REVIEW"] } },
        orderBy: { updatedAt: "desc" },
        take: 40,
        select: {
          id: true,
          title: true,
          status: true,
          draftType: true,
          subject: true,
          updatedAt: true,
          editorialReviewJson: true,
        },
      }),
      getEmailWorkflowQueueSummary(),
      listEmailWorkflowItems({
        take: 30,
        filters: { status: EMAIL_WORKFLOW_NEEDS_ATTENTION_STATUSES },
      }),
    ]);

    const editorialQueue: CommsEditorialQueueRow[] = draftRows.map((row) => {
      const ed = isRecord(row.editorialReviewJson) ? row.editorialReviewJson : {};
      const owner = typeof ed.editorialReviewOwner === "string" ? ed.editorialReviewOwner : null;
      return {
        id: row.id,
        title: row.title,
        status: row.status,
        draftType: row.draftType,
        subject: row.subject,
        updatedAt: row.updatedAt.toISOString(),
        editorialReviewOwner: owner,
        detailHref: `/election-plan/operators/comms-command?draft=${row.id}`,
        adminStudioHref: `/admin/workbench/email-command-center/message-studio?draft=${row.id}`,
      };
    });

    const emailQueue: CommsEmailQueueRow[] = emailRows.map((row) => ({
      id: row.id,
      status: row.status,
      priority: row.priority,
      title: row.title,
      whoSummary: row.whoSummary,
      whatSummary: row.whatSummary,
      assignedTo: row.assignedTo?.nameLabel ?? row.assignedTo?.email ?? null,
      createdAt: row.createdAt,
      adminHref: `/admin/workbench/email-queue/${row.id}`,
    }));

    const editorialCount = draftCounts.needsReview + draftCounts.inReview;

    const stats = {
      draftsNeedingReview: draftCounts.needsReview,
      draftsInReview: draftCounts.inReview,
      emailNeedsAttention: emailSummary.needsAttentionCount,
      eventsCommsDue,
      commsLeaders: commsLeaders.length,
      massEmailStatus: bundle.massEmailStatus,
    };

    const pipeline = [
      {
        stage: "editorial" as const,
        label: "Editorial review",
        count: editorialCount,
        description: "Message Studio drafts awaiting comms lead review or signoff",
      },
      {
        stage: "email_queue" as const,
        label: "Email workflow",
        count: emailSummary.needsAttentionCount,
        description: "Inbound and triage items needing operator attention",
      },
      {
        stage: "event_alignment" as const,
        label: "Event comms (72h)",
        count: eventsCommsDue,
        description: "Stops needing copy and photo alignment within three days",
      },
      {
        stage: "county_comms" as const,
        label: "County comms leads",
        count: commsLeaders.length,
        description: "Leaders with comms lane tools on their workbench",
      },
    ];

    return {
      dbAvailable: draftCounts.dbReachable,
      period,
      stats,
      pipeline,
      editorialQueue,
      emailQueue,
      eventAlignment,
      commsLeaders,
      readinessRisks: bundle.risks.slice(0, 4),
      weeklyRhythm: WEEKLY_RHYTHM,
    };
  } catch (e) {
    console.error("[loadStatewideCommsDashboard]", e);
    return {
      ...EMPTY,
      period,
      commsLeaders,
      stats: {
        ...EMPTY.stats,
        eventsCommsDue,
        commsLeaders: commsLeaders.length,
        massEmailStatus: bundle.massEmailStatus,
      },
      pipeline: EMPTY.pipeline.map((p) =>
        p.stage === "event_alignment"
          ? { ...p, count: eventsCommsDue }
          : p.stage === "county_comms"
            ? { ...p, count: commsLeaders.length }
            : p,
      ),
      eventAlignment,
      readinessRisks: bundle.risks.slice(0, 4),
    };
  }
}
