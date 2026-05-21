import type { CampaignEventLedgerRecord } from "@prisma/client";
import type { CampaignCalendarItem } from "@/lib/calendar/campaign-calendar-item";
import { parseIntakeMetaFromFactCard } from "./intake-meta";

/** Synthetic calendar item for website ledger rows not present in normalized JSON. */
export function buildWebsiteIntakeCalendarItem(record: CampaignEventLedgerRecord): CampaignCalendarItem {
  const meta = parseIntakeMetaFromFactCard(record.factCard);
  const fact = record.factCard && typeof record.factCard === "object" ? (record.factCard as Record<string, unknown>) : {};
  const county =
    (typeof fact.where === "object" && fact.where && "county" in fact.where
      ? String((fact.where as Record<string, unknown>).county ?? "")
      : "") ||
    meta?.inferred.county ||
    undefined;
  const city = record.displayCity?.trim() || meta?.inferred.city || undefined;

  return {
    id: record.calendarSourceId,
    source: "public_schedule_request",
    title: record.originalTitle,
    start: record.startAt.toISOString(),
    end: record.endAt?.toISOString(),
    allDay: record.allDay,
    county: county || undefined,
    city,
    location: record.originalLocation ?? undefined,
    eventType: "community_event",
    calendarStatus: "tentative",
    publishStatus: "private_admin_only",
    countyTouchCounts: false,
    verificationConfidence: 0.35,
    notes: record.originalNotes ?? undefined,
    drillDown: meta?.inferred.likelyHost
      ? { host: meta.inferred.likelyHost, anchorClassification: meta.inferred.eventCategory }
      : undefined,
  };
}
