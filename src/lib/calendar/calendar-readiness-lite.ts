import "server-only";

import { CampaignEventVisibility, EventWorkflowState } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  isGoogleCalendarAutoPublishPublicFacingIngestEnabled,
  isGoogleCalendarConfigured,
} from "@/lib/calendar/env";
import {
  CALENDAR_INTAKE_METRICS_SCAN_CAP,
  getCalendarLikeIntakesForMetrics,
  type CalendarLikeIntakeMetricRow,
} from "@/lib/calendar/calendar-requests";
import { getCalendarRequestKind } from "@/lib/calendar/calendar-intake-taxonomy";

export type GoogleWritePolicyStatus = "disabled" | "enabledButRequiresApproval" | "unavailable";

export type CalendarReadinessLite = {
  campaignEventTotal: number;
  upcomingInternalEvents: number;
  newRequestCount: number;
  needsFollowUpCount: number;
  /** @deprecated prefer intakeInReviewCount + intakeReadyForCalendarCount */
  reviewedCount: number;
  intakeInReviewCount: number;
  intakeReadyForCalendarCount: number;
  convertedCount: number;
  draftEventCount: number;
  upcomingEventCount: number;
  publicReadyEventCount: number;
  googleCalendarReadiness: boolean;
  googleAutoPublishPublicFacingEnabled: boolean;
  googleWritePolicy: GoogleWritePolicyStatus;
  recentRequests: Array<{ id: string; title: string | null; status: string; source: string | null; kind: string }>;
  upcomingEvents: Array<{ id: string; title: string; startAt: Date; eventWorkflowState: string }>;
  intakeCountNote: string | null;
};

function summarizeIntakes(calendarIntakes: CalendarLikeIntakeMetricRow[]) {
  let newRequestCount = 0;
  let needsFollowUpCount = 0;
  let intakeInReviewCount = 0;
  let intakeReadyForCalendarCount = 0;
  let convertedCount = 0;
  for (const r of calendarIntakes) {
    if (r.status === "PENDING") newRequestCount++;
    else if (r.status === "AWAITING_INFO") needsFollowUpCount++;
    else if (r.status === "IN_REVIEW") intakeInReviewCount++;
    else if (r.status === "READY_FOR_CALENDAR") intakeReadyForCalendarCount++;
    else if (r.status === "CONVERTED") convertedCount++;
  }
  const reviewedCount = intakeInReviewCount + intakeReadyForCalendarCount;
  return {
    newRequestCount,
    needsFollowUpCount,
    intakeInReviewCount,
    intakeReadyForCalendarCount,
    reviewedCount,
    convertedCount,
  };
}

export async function getCalendarReadinessLite(): Promise<CalendarReadinessLite> {
  const now = new Date();
  const horizon21 = new Date(now.getTime() + 21 * 86400000);
  const horizon14 = new Date(now.getTime() + 14 * 86400000);

  const [calendarIntakes, campaignEventTotal, upcomingInternalEvents, draftEventCount, upcomingEventCount, publicReadyEventCount, upcomingEvents] =
    await Promise.all([
      getCalendarLikeIntakesForMetrics().catch(() => [] as CalendarLikeIntakeMetricRow[]),
      prisma.campaignEvent.count().catch(() => 0),
      prisma.campaignEvent
        .count({
          where: {
            startAt: { gte: now, lte: horizon14 },
            visibility: { in: [CampaignEventVisibility.INTERNAL, CampaignEventVisibility.STAFF] },
          },
        })
        .catch(() => 0),
      prisma.campaignEvent
        .count({ where: { eventWorkflowState: { in: [EventWorkflowState.DRAFT, EventWorkflowState.PENDING_APPROVAL] } } })
        .catch(() => 0),
      prisma.campaignEvent.count({ where: { startAt: { gte: now, lte: horizon21 } } }).catch(() => 0),
      prisma.campaignEvent
        .count({
          where: {
            eventWorkflowState: EventWorkflowState.APPROVED,
            isPublicOnWebsite: false,
          },
        })
        .catch(() => 0),
      prisma.campaignEvent
        .findMany({
          where: { startAt: { gte: now, lte: horizon21 } },
          orderBy: { startAt: "asc" },
          take: 5,
          select: { id: true, title: true, startAt: true, eventWorkflowState: true },
        })
        .catch(() => []),
    ]);

  const rawScanSize = calendarIntakes.length;
  const intakeCountNote =
    rawScanSize >= CALENDAR_INTAKE_METRICS_SCAN_CAP
      ? `Request counts are from the bounded scan (up to ${CALENDAR_INTAKE_METRICS_SCAN_CAP} most recent non-excluded intakes).`
      : null;

  const {
    newRequestCount,
    needsFollowUpCount,
    intakeInReviewCount,
    intakeReadyForCalendarCount,
    reviewedCount,
    convertedCount,
  } = summarizeIntakes(calendarIntakes);

  const recentRequests = calendarIntakes.slice(0, 5).map((r) => ({
    id: r.id,
    title: r.title,
    status: r.status,
    source: r.source,
    kind: getCalendarRequestKind({ source: r.source, metadata: r.metadata, submission: r.submission ?? undefined }),
  }));

  const googleCalendarReadiness = isGoogleCalendarConfigured();
  const googleAutoPublishPublicFacingEnabled = isGoogleCalendarAutoPublishPublicFacingIngestEnabled();
  const googleWritePolicy: GoogleWritePolicyStatus = !googleCalendarReadiness
    ? "unavailable"
    : googleAutoPublishPublicFacingEnabled
      ? "enabledButRequiresApproval"
      : "disabled";

  return {
    campaignEventTotal,
    upcomingInternalEvents,
    newRequestCount,
    needsFollowUpCount,
    reviewedCount,
    intakeInReviewCount,
    intakeReadyForCalendarCount,
    convertedCount,
    draftEventCount,
    upcomingEventCount,
    publicReadyEventCount,
    googleCalendarReadiness,
    googleAutoPublishPublicFacingEnabled,
    googleWritePolicy,
    recentRequests,
    upcomingEvents: upcomingEvents.map((e) => ({
      id: e.id,
      title: e.title,
      startAt: e.startAt,
      eventWorkflowState: e.eventWorkflowState,
    })),
    intakeCountNote,
  };
}
