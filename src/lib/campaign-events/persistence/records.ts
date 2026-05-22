import type { CampaignEventLedgerRecord } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { CampaignCalendarItem } from "@/lib/calendar/campaign-calendar-item";
import { MARCH_2026_LEDGER_PERIOD } from "../constants";
import type { CampaignEventFactCardData } from "../fact-card-data";
import { countEditableGaps } from "../fact-card-data";
import { parseFactCardEnvelope, serializeFactCardEnvelope, withPreservedFactCardExtensions } from "../fact-card-envelope";
import type { EditableFactSectionId } from "../constants";
import { applyTravelMileageToFactCard } from "./travel-calc";
import { seedMarchCampaignEventRecords } from "./seed-march";
import { countNormalizedItemsForPeriod, seedCampaignEventRecordsForPeriod } from "./seed-period";

export async function ensureMarchCampaignEventRecords() {
  return seedMarchCampaignEventRecords();
}

/** Idempotent upsert for any YYYY-MM present in normalized calendar JSON. */
export async function ensureCampaignEventRecordsForPeriod(period: string) {
  const available = await countNormalizedItemsForPeriod(period);
  if (available === 0) {
    return { period, scanned: 0, created: 0, updated: 0 };
  }
  return seedCampaignEventRecordsForPeriod(period);
}

export async function listMarchCampaignEventRecords(): Promise<CampaignEventLedgerRecord[]> {
  return listCampaignEventRecordsByPeriod(MARCH_2026_LEDGER_PERIOD);
}

export async function listCampaignEventRecordsByPeriod(period: string): Promise<CampaignEventLedgerRecord[]> {
  return prisma.campaignEventLedgerRecord.findMany({
    where: { period },
    orderBy: { startAt: "asc" },
  });
}

export function recordToCalendarItem(record: CampaignEventLedgerRecord): CampaignCalendarItem {
  return {
    id: record.calendarSourceId,
    source: mapPrismaEntryToCalendarSource(record.entrySource),
    sourceId: record.googleEventId ?? undefined,
    title: record.originalTitle,
    start: record.startAt.toISOString(),
    end: record.endAt?.toISOString(),
    allDay: record.allDay,
    county: undefined,
    city: record.displayCity ?? undefined,
    location: record.originalLocation ?? undefined,
    eventType: "campaign_event",
    calendarStatus: "confirmed",
    publishStatus: "private_admin_only",
    countyTouchCounts: false,
    verificationConfidence: 0.5,
    notes: record.originalNotes ?? undefined,
  };
}

function mapPrismaEntryToCalendarSource(
  entry: CampaignEventLedgerRecord["entrySource"],
): CampaignCalendarItem["source"] {
  switch (entry) {
    case "GOOGLE_CALENDAR":
      return "google_calendar";
    case "WEBSITE_ENTRY":
      return "public_schedule_request";
    case "MANUAL_ADMIN":
      return "manual";
    case "IMPORT":
      return "spreadsheet";
    default:
      return "google_calendar";
  }
}

export async function getRecordById(recordId: string) {
  return prisma.campaignEventLedgerRecord.findUnique({ where: { id: recordId } });
}

export async function saveFactCardSection(
  recordId: string,
  sectionId: EditableFactSectionId,
  patch: Record<string, string | undefined>,
): Promise<CampaignEventLedgerRecord> {
  const record = await prisma.campaignEventLedgerRecord.findUnique({ where: { id: recordId } });
  if (!record) throw new Error("Campaign event record not found.");

  const envelope = parseFactCardEnvelope(record.factCard);
  applySectionPatch(envelope.data, sectionId, patch);
  if (sectionId === "travel") {
    coerceTravelNumericFields(envelope.data.travel);
  }

  const dateYmd = record.startAt.toISOString().slice(0, 10);
  let nextCard = envelope.data;
  if (sectionId === "travel" || sectionId === "where") {
    nextCard = await applyTravelMileageToFactCard(recordId, dateYmd, envelope.data);
    envelope.review.lastRecalculatedAt = new Date().toISOString();
  }
  envelope.data = nextCard;

  return prisma.campaignEventLedgerRecord.update({
    where: { id: recordId },
    data: {
      factCard: withPreservedFactCardExtensions(serializeFactCardEnvelope(envelope), record.factCard) as object,
      displayCity: nextCard.where.city?.trim() || record.displayCity,
      displayEventType: nextCard.why.eventType?.trim() || record.displayEventType,
      roundTripMiles: nextCard.travel.roundTripMiles ?? null,
      reimbursementAmount: nextCard.travel.reimbursementAmount ?? null,
      reviewStatus: countEditableGaps(nextCard) === 0 ? "READY" : "IN_PROGRESS",
    },
  });
}

function applySectionPatch(
  data: CampaignEventFactCardData,
  sectionId: EditableFactSectionId,
  patch: Record<string, string | undefined>,
) {
  const target = data[sectionId] as Record<string, string | undefined>;
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue;
    const trimmed = value.trim();
    if (!trimmed) {
      delete target[key];
    } else {
      target[key] = trimmed;
    }
  }
}

function coerceTravelNumericFields(travel: CampaignEventFactCardData["travel"]) {
  if (travel.roundTripMiles != null) travel.roundTripMiles = Number(travel.roundTripMiles) || undefined;
  if (travel.travelTimeMinutes != null) travel.travelTimeMinutes = Number(travel.travelTimeMinutes) || undefined;
  if (travel.reimbursementAmount != null) travel.reimbursementAmount = Number(travel.reimbursementAmount) || undefined;
}
