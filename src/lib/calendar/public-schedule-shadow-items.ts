import "server-only";

import { cache } from "react";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import type { CampaignCalendarEventType, CampaignCalendarItem } from "@/lib/calendar/campaign-calendar-item";
import { readStagedPublicScheduleRequests, type StagedPublicScheduleEntry } from "@/lib/forms/public-schedule-persist";

function asObj(v: unknown): Record<string, unknown> | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  return v as Record<string, unknown>;
}

function mapPublicEventTypeSlug(et: string | undefined): CampaignCalendarEventType {
  switch (et) {
    case "fair_festival":
      return "fair_festival";
    case "fundraiser":
      return "fundraiser";
    case "press_media":
      return "media";
    case "county_party_meeting":
      return "county_party_meeting";
    case "volunteer_event":
      return "campaign_event";
    default:
      return "community_event";
  }
}

type IntakeWithRelations = Prisma.WorkflowIntakeGetPayload<{
  include: { submission: true; eventRequest: true };
}>;

export function workflowIntakeToShadowCalendarItem(intake: IntakeWithRelations): CampaignCalendarItem {
  const sd = asObj(intake.submission?.structuredData);
  const er = intake.eventRequest;
  const erMeta = asObj(er?.metadata);
  const miles = typeof erMeta?.routeImpactMilesEstimate === "number" ? erMeta.routeImpactMilesEstimate : null;
  const eventTitle = typeof sd?.eventTitle === "string" ? sd.eventTitle : intake.title ?? "Public schedule request";
  const county = typeof sd?.county === "string" ? sd.county : undefined;
  const city = typeof sd?.city === "string" ? sd.city : undefined;
  const address = typeof sd?.address === "string" ? sd.address : er?.address ?? undefined;
  const startIso = er?.requestedStartAt?.toISOString() ?? intake.createdAt.toISOString();
  const endIso = er?.requestedEndAt?.toISOString() ?? undefined;
  const et = typeof sd?.eventType === "string" ? sd.eventType : undefined;

  let notes =
    "Public schedule request — not confirmed. Staff review required before any Google tentative sync.";
  if (miles != null) {
    notes += ` Route impact (rough hub-distance est.): ~${miles} mi.`;
  }

  return {
    id: `public-intake-${intake.id}`,
    source: "public_schedule_request",
    title: `Public request · ${eventTitle}`,
    start: startIso,
    end: endIso,
    allDay: false,
    county,
    city,
    location: address ?? er?.locationName ?? undefined,
    eventType: mapPublicEventTypeSlug(et),
    calendarStatus: "needs_verification",
    publishStatus: "private_admin_only",
    countyTouchCounts: false,
    verificationConfidence: 0.35,
    notes,
    drillDown: {
      spreadsheetTab: "Public schedule",
      matchedDb: { kind: "WorkflowIntake", id: intake.id, matchReason: "public_schedule_request" },
    },
  };
}

export function stagedEntryToShadowCalendarItem(entry: StagedPublicScheduleEntry): CampaignCalendarItem {
  const b = entry.payload;
  const startIso = entry.assistant.recommendedTentativeEvent.startAt ?? entry.createdAt;
  const endIso = entry.assistant.recommendedTentativeEvent.endAt;
  let notes = "File-staged public schedule (DB unavailable) — not confirmed.";
  if (entry.routeImpactMilesEstimate != null) {
    notes += ` Route impact (rough hub-distance est.): ~${entry.routeImpactMilesEstimate} mi.`;
  }
  return {
    id: `public-staged-${entry.id}`,
    source: "public_schedule_request",
    title: `Public request · ${b.eventTitle}`,
    start: startIso,
    end: endIso,
    allDay: false,
    county: b.county,
    city: b.city ?? undefined,
    location: b.address ?? undefined,
    eventType: mapPublicEventTypeSlug(b.eventType),
    calendarStatus: "needs_verification",
    publishStatus: "private_admin_only",
    countyTouchCounts: false,
    verificationConfidence: 0.25,
    notes,
    drillDown: {
      spreadsheetTab: "Public schedule (staged)",
      matchedDb: entry.workflowIntakeId
        ? { kind: "WorkflowIntake", id: entry.workflowIntakeId, matchReason: "staged_then_linked" }
        : undefined,
    },
  };
}

async function loadPublicScheduleShadowCalendarItemsUncached(): Promise<CampaignCalendarItem[]> {
  const out: CampaignCalendarItem[] = [];
  try {
    const intakes = await prisma.workflowIntake.findMany({
      where: {
        source: "public_schedule_request",
        status: { notIn: ["ARCHIVED", "DECLINED"] },
      },
      orderBy: { createdAt: "desc" },
      take: 80,
      include: { submission: true, eventRequest: true },
    });
    for (const row of intakes) {
      out.push(workflowIntakeToShadowCalendarItem(row));
    }
  } catch {
    /* database off or schema mismatch */
  }

  try {
    const staged = readStagedPublicScheduleRequests();
    for (const e of staged.entries.slice(0, 40)) {
      out.push(stagedEntryToShadowCalendarItem(e));
    }
  } catch {
    /* ignore */
  }

  return out;
}

export const loadPublicScheduleShadowCalendarItems = cache(loadPublicScheduleShadowCalendarItemsUncached);
