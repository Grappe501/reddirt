import { formatInTimeZone } from "date-fns-tz";
import type { CampaignEventLedgerRecord } from "@prisma/client";
import type { calendar_v3 } from "@googleapis/calendar";
import {
  findKellyConfirmedCalendarSource,
  findKellyTentativeCalendarSource,
} from "@/lib/calendar/kelly-google-calendar-policy";
import type { WorkbenchEventRow } from "../merge-persisted-row";
import { buildApprovalEmailAssist } from "../approval-email/approval-email-assist";
import { assessPromotionReadiness } from "./promotion-readiness";
import type { GooglePayloadPreview, PromotionTargetLane } from "./promotion-types";

const TZ = "America/Chicago";

export async function buildGooglePayloadPreview(
  record: CampaignEventLedgerRecord,
  row: WorkbenchEventRow,
  targetLane: PromotionTargetLane,
): Promise<GooglePayloadPreview> {
  const source =
    targetLane === "official" ? await findKellyConfirmedCalendarSource() : await findKellyTentativeCalendarSource();
  const readiness = await assessPromotionReadiness(record, row, targetLane);
  const assist = buildApprovalEmailAssist(row);

  const city = row.likelyCity ?? record.displayCity ?? row.factCard.where.city ?? "";
  const county = row.county ?? row.factCard.where.county ?? "";
  const venue = row.factCard.where.venueName?.trim() || record.originalLocation?.trim() || "";
  const location = [venue, city, county].filter(Boolean).join(", ");

  const startIso = record.startAt.toISOString();
  const endIso = (record.endAt ?? new Date(record.startAt.getTime() + 3600000)).toISOString();
  const whenLabel = record.allDay
    ? formatInTimeZone(record.startAt, TZ, "yyyy-MM-dd (all day)")
    : `${formatInTimeZone(record.startAt, TZ, "h:mm a")} – ${formatInTimeZone(record.endAt ?? record.startAt, TZ, "h:mm a")} ${TZ}`;

  const travelNotes = row.travelLine ? `Travel: ${row.travelLine}` : null;
  const descriptionLines = [
    record.originalTitle,
    "",
    `When: ${whenLabel}`,
    location ? `Where: ${location}` : null,
    county ? `County: ${county}` : null,
    row.factCard.why.campaignPurpose ? `Purpose: ${row.factCard.why.campaignPurpose}` : null,
    travelNotes,
    "",
    assist.shortSummary,
    readiness.warnings.length ? `Warnings: ${readiness.warnings.join("; ")}` : null,
    "",
    `— Kelly Grappe for SOS · Event OS ledger ${record.id}`,
    "Promotion via human-controlled Sprint 5 workflow.",
  ].filter(Boolean) as string[];

  const aiSummary =
    targetLane === "tentative"
      ? readiness.level === "READY"
        ? "This event appears ready for the tentative Google calendar."
        : readiness.level === "WARNING"
          ? "This event may promote to tentative with operator acknowledgment of warnings."
          : "This event is blocked from tentative promotion."
      : readiness.level === "READY"
        ? "This event appears ready for the official campaign Google calendar."
        : readiness.level === "WARNING"
          ? "Review warnings before official promotion."
          : "This event is blocked from official promotion.";

  return {
    calendarTarget: source?.externalCalendarId ?? "(calendar source not configured)",
    calendarSourceLabel: source?.label ?? "Missing source",
    lane: targetLane,
    title: record.originalTitle,
    description: descriptionLines.join("\n"),
    location,
    startIso,
    endIso,
    allDay: record.allDay,
    timezone: TZ,
    visibility: targetLane === "official" ? "default (official lane)" : "default (tentative lane)",
    reminders: "Google calendar default reminders",
    attendees: "None (ledger promotion v1)",
    travelNotes,
    extendedProperties: {
      reddirtLedgerRecordId: record.id,
      calendarLane: targetLane,
      sourceSystem: "reddirt-event-os",
      syncVersion: "sprint5-v1",
    },
    aiSummary,
    warnings: readiness.warnings,
    missingFields: readiness.missingItems,
    conflictNotes: row.conflicts.map((c) => c.label),
  };
}

export function previewToGoogleEventBody(
  record: CampaignEventLedgerRecord,
  preview: GooglePayloadPreview,
  existingGoogleEventId?: string | null,
): calendar_v3.Schema$Event {
  const start = preview.allDay
    ? { date: preview.startIso.slice(0, 10) }
    : { dateTime: preview.startIso, timeZone: preview.timezone };
  const end = preview.allDay
    ? { date: preview.endIso.slice(0, 10) }
    : { dateTime: preview.endIso, timeZone: preview.timezone };
  return {
    id: existingGoogleEventId ?? undefined,
    summary: preview.title,
    description: preview.description,
    location: preview.location || undefined,
    start,
    end,
    status: record.eventStatus === "CANCELLED" ? "cancelled" : "confirmed",
    extendedProperties: {
      private: preview.extendedProperties,
    },
  };
}
