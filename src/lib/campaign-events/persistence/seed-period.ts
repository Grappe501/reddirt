import type { CampaignCalendarItem } from "@/lib/calendar/campaign-calendar-item";
import { prisma } from "@/lib/db";
import { classifyCampaignEvent } from "../classify-event";
import { loadNormalizedCalendarItems } from "../load-march-events";
import {
  buildInitialFactCard,
  buildSourceKey,
  mapCalendarStatus,
  mapEntrySource,
  mapEventStatus,
  resolveGoogleEventId,
  sourceCalendarDisplayName,
} from "./map-calendar-to-record";

export type PeriodSeedReport = {
  period: string;
  scanned: number;
  created: number;
  updated: number;
};

export type PeriodSeedVerification = {
  period: string;
  ledgerRowCount: number;
  eventTypeBreakdown: Record<string, number>;
  missingCity: number;
  missingCounty: number;
  withTravelData: number;
  needsMileageReview: number;
  workHoursWarnings: number;
  conflictWarnings: number;
};

const PERIOD_RE = /^\d{4}-\d{2}$/;

export function isValidLedgerPeriod(period: string): boolean {
  return PERIOD_RE.test(period);
}

export async function countNormalizedItemsForPeriod(period: string): Promise<number> {
  if (!isValidLedgerPeriod(period)) return 0;
  const all = await loadNormalizedCalendarItems();
  return all.filter((item) => String(item.start).slice(0, 7) === period).length;
}

export async function seedCampaignEventRecordsForPeriod(period: string): Promise<PeriodSeedReport> {
  if (!isValidLedgerPeriod(period)) {
    throw new Error(`Invalid ledger period "${period}" — expected YYYY-MM`);
  }

  const all = await loadNormalizedCalendarItems();
  const inPeriod = all.filter((item) => String(item.start).slice(0, 7) === period);
  let created = 0;
  let updated = 0;

  for (const item of inPeriod) {
    const sourceKey = buildSourceKey(item.id);
    const existing = await prisma.campaignEventLedgerRecord.findUnique({ where: { sourceKey } });
    const googleEventId = resolveGoogleEventId(item);
    const payload = buildUpsertPayload(item, period);

    if (existing) {
      await prisma.campaignEventLedgerRecord.update({
        where: { id: existing.id },
        data: {
          googleEventId: googleEventId ?? existing.googleEventId,
          originalTitle: item.title,
          originalNotes: item.notes ?? null,
          originalLocation: item.location ?? null,
          startAt: new Date(item.start),
          endAt: item.end ? new Date(item.end) : null,
          allDay: item.allDay,
          eventStatus: mapEventStatus(item),
          entrySource: mapEntrySource(item),
          sourceCalendarName: sourceCalendarDisplayName(item) ?? null,
          displayCity: existing.displayCity ?? payload.displayCity,
          displayEventType: existing.displayEventType ?? payload.displayEventType,
          period: existing.period === period ? existing.period : period,
        },
      });
      updated += 1;
    } else {
      await prisma.campaignEventLedgerRecord.create({ data: payload });
      created += 1;
    }
  }

  return { period, scanned: inPeriod.length, created, updated };
}

function buildUpsertPayload(item: CampaignCalendarItem, period: string) {
  const factCard = buildInitialFactCard(item);
  const classified = classifyCampaignEvent(item);

  return {
    period,
    sourceKey: buildSourceKey(item.id),
    calendarSourceId: item.id,
    googleEventId: resolveGoogleEventId(item),
    sourceCalendarName: sourceCalendarDisplayName(item) ?? null,
    createdFromSource: "NORMALIZED_CALENDAR" as const,
    entrySource: mapEntrySource(item),
    originalTitle: item.title,
    originalNotes: item.notes ?? null,
    originalLocation: item.location ?? null,
    startAt: new Date(item.start),
    endAt: item.end ? new Date(item.end) : null,
    allDay: item.allDay,
    eventStatus: mapEventStatus(item),
    calendarStatus: mapCalendarStatus(),
    reviewStatus: "NOT_STARTED" as const,
    googleSyncStatus: "NOT_LINKED" as const,
    displayCity: factCard.where.city ?? item.city ?? null,
    displayEventType: classified.label,
    factCard: factCard as object,
  };
}

/** Post-seed stats from normalized JSON + DB row counts (no full workbench merge). */
export async function verifySeededPeriod(period: string): Promise<PeriodSeedVerification> {
  const all = await loadNormalizedCalendarItems();
  const inPeriod = all.filter((item) => String(item.start).slice(0, 7) === period);
  const ledgerRowCount = await prisma.campaignEventLedgerRecord.count({ where: { period } });

  const eventTypeBreakdown: Record<string, number> = {};

  for (const item of inPeriod) {
    const t = item.eventType ?? "unknown";
    eventTypeBreakdown[t] = (eventTypeBreakdown[t] ?? 0) + 1;
  }

  const { loadCampaignEventsWorkbench } = await import("../load-workbench-events");
  const { rows } = await loadCampaignEventsWorkbench({ period, skipAutoSeed: true });

  let workHoursWarnings = 0;
  let conflictWarnings = 0;
  for (const row of rows) {
    if (row.hasWorkHoursWarning) workHoursWarnings++;
    if (row.hasConflictWarning) conflictWarnings++;
  }

  const active = rows.filter((r) => r.rawEventStatus !== "CANCELLED");
  const mergedMissingCity = active.filter((r) => !r.likelyCity?.trim()).length;
  const mergedMissingCounty = active.filter((r) => !r.county?.trim()).length;
  const travelCandidates = active.filter(
    (r) =>
      r.roundTripMiles != null ||
      r.reimbursementAmount != null ||
      (r.travelLine && r.travelLine.includes("→") && !r.travelLine.includes("(city TBD)")),
  ).length;
  const needsMileage = active.filter((r) => r.roundTripMiles == null).length;

  return {
    period,
    ledgerRowCount,
    eventTypeBreakdown,
    missingCity: mergedMissingCity,
    missingCounty: mergedMissingCounty,
    withTravelData: travelCandidates,
    needsMileageReview: needsMileage,
    workHoursWarnings,
    conflictWarnings,
  };
}
