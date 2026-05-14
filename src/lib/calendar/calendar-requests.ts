import "server-only";

import { cache } from "react";
import { prisma } from "@/lib/db";
import {
  EXCLUDED_WORKFLOW_INTAKE_SOURCES,
  getCalendarRequestKind,
  isCalendarLikeWorkflowIntake,
} from "@/lib/calendar/calendar-intake-taxonomy";

export const CALENDAR_INTAKE_METRICS_SCAN_CAP = 600;
const LIST_FETCH_CAP = 200;

export type CalendarRequestRow = {
  intakeId: string;
  status: string;
  title: string | null;
  source: string | null;
  kind: ReturnType<typeof getCalendarRequestKind>;
  createdAt: Date;
  updatedAt: Date;
  countyId: string | null;
  countyName: string | null;
  requesterName: string | null;
  requesterEmail: string | null;
  requesterPhone: string | null;
  submissionType: string | null;
  notesExcerpt: string | null;
  structuredSummary: {
    community?: string | null;
    gatheringType?: string | null;
    preferredTiming?: string | null;
    eventTitle?: string | null;
    preferredDate?: string | null;
  };
  linkedEventId: string | null;
  linkedEventTitle: string | null;
  linkedEventWorkflowState: string | null;
};

export type CalendarLikeIntakeMetricRow = {
  id: string;
  title: string | null;
  status: string;
  source: string | null;
  metadata: unknown;
  submission: { type: string | null; structuredData: unknown } | null;
};

function pickStructured(obj: Record<string, unknown>) {
  return {
    community: typeof obj.community === "string" ? obj.community : null,
    gatheringType: typeof obj.gatheringType === "string" ? obj.gatheringType : null,
    preferredTiming: typeof obj.preferredTiming === "string" ? obj.preferredTiming : null,
    eventTitle: typeof obj.eventTitle === "string" ? obj.eventTitle : null,
    preferredDate: typeof obj.preferredDate === "string" ? obj.preferredDate : null,
  };
}

async function loadCalendarLikeIntakesForMetricsUncached(): Promise<CalendarLikeIntakeMetricRow[]> {
  const candidates = await prisma.workflowIntake.findMany({
    where: {
      status: { notIn: ["ARCHIVED", "DECLINED"] },
      source: { notIn: [...EXCLUDED_WORKFLOW_INTAKE_SOURCES] },
    },
    orderBy: { createdAt: "desc" },
    take: CALENDAR_INTAKE_METRICS_SCAN_CAP,
    select: {
      id: true,
      title: true,
      status: true,
      source: true,
      metadata: true,
      submission: { select: { type: true, structuredData: true } },
    },
  });

  return candidates.filter((r) =>
    isCalendarLikeWorkflowIntake({
      source: r.source,
      metadata: r.metadata,
      submission: r.submission ?? undefined,
    }),
  );
}

/** Bounded calendar-like intakes for counts / readiness (deduped per request). */
export const getCalendarLikeIntakesForMetrics = cache(loadCalendarLikeIntakesForMetricsUncached);

export async function getCalendarRequestPipelineCounts(): Promise<{
  newCount: number;
  followUpCount: number;
  draftedCount: number;
  reviewedCount: number;
  allEventLikeCount: number;
}> {
  const rows = await getCalendarLikeIntakesForMetrics();
  let newCount = 0;
  let followUpCount = 0;
  let draftedCount = 0;
  let reviewedCount = 0;
  for (const r of rows) {
    if (r.status === "PENDING") newCount++;
    else if (r.status === "AWAITING_INFO") followUpCount++;
    else if (r.status === "CONVERTED") draftedCount++;
    else if (r.status === "IN_REVIEW" || r.status === "READY_FOR_CALENDAR") reviewedCount++;
  }
  return {
    newCount,
    followUpCount,
    draftedCount,
    reviewedCount,
    allEventLikeCount: rows.length,
  };
}

export async function listCalendarRequestRows(take = 80): Promise<CalendarRequestRow[]> {
  const rows = await prisma.workflowIntake.findMany({
    where: {
      status: { notIn: ["ARCHIVED", "DECLINED"] },
      source: { notIn: [...EXCLUDED_WORKFLOW_INTAKE_SOURCES] },
    },
    orderBy: { createdAt: "desc" },
    take: LIST_FETCH_CAP,
    include: {
      county: { select: { displayName: true } },
      submission: {
        select: {
          type: true,
          content: true,
          structuredData: true,
          user: { select: { name: true, email: true, phone: true, county: true } },
        },
      },
      eventRequest: {
        include: {
          campaignEvent: { select: { id: true, title: true, eventWorkflowState: true } },
        },
      },
    },
  });

  const filtered = rows.filter((r) =>
    isCalendarLikeWorkflowIntake({
      source: r.source,
      metadata: r.metadata,
      submission: r.submission ?? undefined,
    }),
  );

  return filtered.slice(0, take).map((r) => {
    const sd =
      r.submission?.structuredData && typeof r.submission.structuredData === "object" && !Array.isArray(r.submission.structuredData)
        ? (r.submission.structuredData as Record<string, unknown>)
        : {};
    const raw = r.submission?.content?.slice(0, 400) ?? null;
    const u = r.submission?.user;
    return {
      intakeId: r.id,
      status: r.status,
      title: r.title,
      source: r.source,
      kind: getCalendarRequestKind({
        source: r.source,
        metadata: r.metadata,
        submission: r.submission ?? undefined,
      }),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      countyId: r.countyId,
      countyName: r.county?.displayName ?? u?.county ?? null,
      requesterName: u?.name ?? null,
      requesterEmail: u?.email ?? null,
      requesterPhone: u?.phone ?? null,
      submissionType: r.submission?.type ?? null,
      notesExcerpt: raw,
      structuredSummary: pickStructured(sd),
      linkedEventId: r.eventRequest?.campaignEvent?.id ?? null,
      linkedEventTitle: r.eventRequest?.campaignEvent?.title ?? null,
      linkedEventWorkflowState: r.eventRequest?.campaignEvent?.eventWorkflowState ?? null,
    };
  });
}
