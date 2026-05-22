import type { CampaignCalendarItem } from "@/lib/calendar/campaign-calendar-item";
import type {
  CampaignEventLedgerCalendarStatus,
  CampaignEventLedgerCreatedFrom,
  CampaignEventLedgerEventStatus,
} from "@prisma/client";
import { classifyCampaignEvent } from "../classify-event";
import { emptyFactCardData, type CampaignEventFactCardData } from "../fact-card-data";
import { resolveDefaultTravelOrigin } from "../travel-origin";
import { extractTitleCity } from "@/lib/travel-ledger/ai/trip-resolution-autopilot/title-city-extractor";

export function buildSourceKey(calendarItemId: string): string {
  return `normalized_calendar:${calendarItemId}`;
}

export function resolveGoogleEventId(item: CampaignCalendarItem): string | null {
  if (item.sourceId?.trim()) return item.sourceId.trim();
  if (item.id.startsWith("gcal-")) return item.id.replace(/^gcal-/, "");
  if (item.id.includes("@")) return item.id;
  return null;
}

export function mapEntrySource(item: CampaignCalendarItem): CampaignEventLedgerCreatedFrom {
  switch (item.source) {
    case "google_calendar":
      return "GOOGLE_CALENDAR";
    case "manual":
      return "MANUAL_ADMIN";
    case "public_schedule_request":
      return "WEBSITE_ENTRY";
    case "spreadsheet":
      return "IMPORT";
    default:
      return "NORMALIZED_CALENDAR";
  }
}

export function mapEventStatus(item: CampaignCalendarItem): CampaignEventLedgerEventStatus {
  switch (item.calendarStatus) {
    case "confirmed":
      return "CONFIRMED";
    case "tentative":
    case "recommended":
      return "TENTATIVE";
    case "declined":
      return "CANCELLED";
    case "conflict":
    case "needs_verification":
    default:
      return "NEEDS_REVIEW";
  }
}

export function mapCalendarStatus(): CampaignEventLedgerCalendarStatus {
  return "IMPORTED_ONLY";
}

export function buildInitialFactCard(item: CampaignCalendarItem): CampaignEventFactCardData {
  const data = emptyFactCardData();
  const { label } = classifyCampaignEvent(item);
  const cityMatch = item.city?.trim() || extractTitleCity(item.title ?? "").city;
  const travelOrigin = resolveDefaultTravelOrigin(item);
  const destCity = cityMatch || undefined;

  data.why.eventType = label;
  data.why.campaignPurpose = item.notes?.trim() || item.drillDown?.anchorClassification;
  data.where.venueName = item.location?.split(";")[0]?.trim();
  data.where.city = destCity;
  data.where.county = item.county;
  data.who.hostName = item.drillDown?.host;
  data.who.hostPhone = item.drillDown?.contacts;
  data.who.campaignPointPerson = item.drillDown?.adminLocalGuide?.displayName;
  data.what.candidateRole = item.drillDown?.kellyRole;

  data.travel.assumedOriginCity = travelOrigin.originCity;
  data.travel.assumedDestinationCity = destCity;
  data.travel.travelStartPointLabel = travelOrigin.originLabel;
  data.travel.travelEndPointLabel = destCity ? `${destCity}, AR` : undefined;
  data.travel.originOverrideCity = undefined;
  data.travel.destinationOverrideCity = undefined;

  return data;
}

export function sourceCalendarDisplayName(item: CampaignCalendarItem): string | undefined {
  if (item.source === "google_calendar") return "Google Calendar (imported)";
  if (item.source === "spreadsheet") return item.drillDown?.spreadsheetTab ?? "Spreadsheet";
  return item.source.replaceAll("_", " ");
}
