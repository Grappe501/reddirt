import { createHash, randomBytes } from "node:crypto";
import {
  CampaignEventStatus,
  CampaignEventType,
  CampaignEventVisibility,
  EventWorkflowState,
  Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import type { CampaignCalendarItem } from "@/lib/calendar/campaign-calendar-item";
import { loadTravelCalendarItems } from "@/lib/calendar/load-travel-calendar-data";
import { getKellyItemStaged } from "@/lib/calendar/kelly-cockpit-staged-metadata";

export function mapJsonEventType(et: CampaignCalendarItem["eventType"]): CampaignEventType {
  switch (et) {
    case "county_party_meeting":
      return CampaignEventType.MEETING;
    case "fundraiser":
      return CampaignEventType.FUNDRAISER;
    case "fair_festival":
      return CampaignEventType.FESTIVAL;
    case "media":
      return CampaignEventType.PRESS;
    case "travel":
      return CampaignEventType.OTHER;
    case "overnight":
      return CampaignEventType.OTHER;
    case "campaign_event":
      return CampaignEventType.APPEARANCE;
    case "community_event":
      return CampaignEventType.APPEARANCE;
    case "virtual_statewide":
      return CampaignEventType.MEETING;
    case "personal_admin":
      return CampaignEventType.OTHER;
    default:
      return CampaignEventType.OTHER;
  }
}

export function mapCalendarStatusToCampaignStatus(
  s: CampaignCalendarItem["calendarStatus"],
): CampaignEventStatus {
  switch (s) {
    case "declined":
      return CampaignEventStatus.CANCELLED;
    default:
      return CampaignEventStatus.SCHEDULED;
  }
}

export async function resolveCalendarCountyId(countyName?: string): Promise<string | null> {
  if (!countyName?.trim()) return null;
  const trimmed = countyName.trim();
  const direct = await prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT id::text AS id
    FROM public.counties
    WHERE lower(name) = lower(${trimmed})
       OR lower(name) = lower(${`${trimmed} County`})
       OR lower(regexp_replace(name, '\\s+County$', '', 'i')) = lower(${trimmed})
    LIMIT 1
  `);
  if (direct[0]?.id) return direct[0].id;
  const first = trimmed.split("/")[0]?.trim();
  if (first && first !== trimmed) return resolveCalendarCountyId(first);
  return null;
}

async function uniqueSlug(seed: string): Promise<string> {
  const base = `kelly-${createHash("sha256").update(seed).digest("hex").slice(0, 28)}`;
  let candidate = base;
  for (let i = 0; i < 8; i++) {
    const clash = await prisma.campaignEvent.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!clash) return candidate;
    candidate = `${base}-${randomBytes(2).toString("hex")}`;
  }
  return `${base}-${randomBytes(4).toString("hex")}`;
}

export function parseCalendarItemEnd(start: Date, item: CampaignCalendarItem): Date {
  if (item.end) return new Date(item.end);
  if (item.allDay) return new Date(start.getTime() + 86400000);
  return new Date(start.getTime() + 3600000);
}

/**
 * Promotes a Kelly workbook JSON item into a `CampaignEvent` + `KellyCalendarPromotion` (idempotent).
 * Does not push to Google — call `syncKellyCampaignEventToGoogle` after workflow transitions.
 */
export async function promoteKellyCalendarItemToCampaignEvent(
  calendarItemId: string,
  actorUserId: string,
): Promise<{ campaignEventId: string; created: boolean }> {
  const existingPromo = await prisma.kellyCalendarPromotion.findUnique({
    where: { calendarItemId },
    include: { campaignEvent: true },
  });
  if (existingPromo?.campaignEvent) {
    return { campaignEventId: existingPromo.campaignEvent.id, created: false };
  }

  const items = loadTravelCalendarItems();
  const item = items.find((i) => i.id === calendarItemId);
  if (!item) throw new Error(`Calendar item not found: ${calendarItemId}`);

  const staged = getKellyItemStaged(calendarItemId);
  const startAt = new Date(item.start);
  const endAt = parseCalendarItemEnd(startAt, item);
  const countyId = await resolveCalendarCountyId(item.county);
  const slug = await uniqueSlug(calendarItemId);

  const internalBits: string[] = [];
  if (item.drillDown?.host) internalBits.push(`Host (internal): ${item.drillDown.host}`);
  if (item.drillDown?.rowHint) internalBits.push(`Row hint: ${item.drillDown.rowHint}`);
  if (item.drillDown?.adminLocalGuide?.displayName) {
    internalBits.push(`Local guide: ${item.drillDown.adminLocalGuide.displayName} (phone withheld from Google description)`);
  }
  const internalSummary = internalBits.length ? internalBits.join("\n") : null;

  const commsState: Prisma.InputJsonValue = {
    kellyCockpit: {
      calendarItemId,
      pressRelease: staged.pressRelease ?? null,
      pressAngleNote: staged.pressAngleNote ?? null,
      googleSyncStatus: staged.googleSyncStatus ?? null,
      googleSyncTarget: staged.googleSyncTarget ?? null,
    },
  };

  const event = await prisma.campaignEvent.create({
    data: {
      slug,
      title: item.title.slice(0, 500),
      description: item.notes?.slice(0, 8000) ?? null,
      eventType: mapJsonEventType(item.eventType),
      status: mapCalendarStatusToCampaignStatus(item.calendarStatus),
      visibility: CampaignEventVisibility.INTERNAL,
      countyId: countyId ?? undefined,
      locationName: [item.city, item.location].filter(Boolean).join(" · ").slice(0, 500) || null,
      startAt,
      endAt,
      timezone: "America/Chicago",
      eventWorkflowState: EventWorkflowState.DRAFT,
      isPublicOnWebsite: false,
      internalSummary,
      commsStateJson: commsState,
    },
  });

  await prisma.eventStageChangeLog.create({
    data: {
      eventId: event.id,
      fromState: null,
      toState: EventWorkflowState.DRAFT,
      actorUserId: null,
      note: `Promoted from Kelly calendar JSON item ${calendarItemId} (actor: ${actorUserId})`,
    },
  });

  await prisma.kellyCalendarPromotion.create({
    data: {
      calendarItemId,
      campaignEventId: event.id,
      promotedByUserId: actorUserId,
    },
  });

  await prisma.kellyCalendarDecision.updateMany({
    where: { calendarItemId, campaignEventId: null },
    data: { campaignEventId: event.id },
  });

  return { campaignEventId: event.id, created: true };
}
