import { formatInTimeZone } from "date-fns-tz";
import type { CampaignCalendarItem } from "@/lib/calendar/campaign-calendar-item";
import { loadNormalizedCalendarItems } from "../load-march-events";
import { inferEventAssumptions } from "../infer-event-assumptions";
import { parseFactCardEnvelope } from "../fact-card-envelope";
import { factCardToReviewForm, mergeFormWithAiPrefill } from "../review-form";
import { countMissingFromForm } from "./review-persistence";
import { getRecordById } from "./records";
import { buildWebsiteIntakeCalendarItem } from "../intake/website-intake-calendar";
import { parseIntakeMetaFromFactCard } from "../intake/intake-meta";
import type { WebsiteIntakeBridgeMeta } from "../intake/intake-meta";

const TZ = "America/Chicago";

export type EventReviewBundle = {
  recordId: string;
  snapshot: {
    originalTitle: string;
    originalNotes: string | null;
    originalLocation: string | null;
    startAt: string;
    endAt: string | null;
    allDay: boolean;
    calendarSourceId: string;
    googleEventId: string | null;
    sourceCalendarName: string | null;
    eventStatus: string;
    reviewStatus: string;
    calendarStatus: string;
    missingCount: number;
  };
  calendar: CampaignCalendarItem;
  inference: ReturnType<typeof inferEventAssumptions>;
  form: ReturnType<typeof factCardToReviewForm>;
  localContext: { city?: string; county?: string; hasContacts: false };
  /** True when operator already saved a value — assists must not silently overwrite. */
  humanLocks: { city: boolean; county: boolean; zipCode: boolean; roundTripMiles: boolean };
  websiteIntake: WebsiteIntakeBridgeMeta | null;
};

export async function loadEventReviewBundle(recordId: string): Promise<EventReviewBundle> {
  const record = await getRecordById(recordId);
  if (!record) throw new Error("Campaign event record not found.");

  const all = await loadNormalizedCalendarItems();
  let calendar = all.find((item) => item.id === record.calendarSourceId);
  if (!calendar && record.entrySource === "WEBSITE_ENTRY") {
    calendar = buildWebsiteIntakeCalendarItem(record);
  }
  if (!calendar) throw new Error("Calendar source row not found for this record.");
  const peerPool =
    record.entrySource === "WEBSITE_ENTRY"
      ? [...all, calendar]
      : all;

  const envelope = parseFactCardEnvelope(record.factCard);
  const inference = inferEventAssumptions(calendar, peerPool, record.eventStatus);
  const websiteIntake = parseIntakeMetaFromFactCard(record.factCard);
  const existingForm = factCardToReviewForm(
    envelope.data,
    envelope.operatorNotes,
    record.reviewStatus,
    record.eventStatus,
  );
  const form = mergeFormWithAiPrefill(existingForm, inference.prefill);

  return {
    recordId: record.id,
    snapshot: {
      originalTitle: record.originalTitle,
      originalNotes: record.originalNotes,
      originalLocation: record.originalLocation,
      startAt: formatInTimeZone(record.startAt, TZ, "yyyy-MM-dd HH:mm"),
      endAt: record.endAt ? formatInTimeZone(record.endAt, TZ, "yyyy-MM-dd HH:mm") : null,
      allDay: record.allDay,
      calendarSourceId: record.calendarSourceId,
      googleEventId: record.googleEventId,
      sourceCalendarName: record.sourceCalendarName,
      eventStatus: record.eventStatus,
      reviewStatus: record.reviewStatus,
      calendarStatus: record.calendarStatus,
      missingCount: countMissingFromForm(form),
    },
    calendar,
    inference,
    form,
    localContext: {
      city: form.city || inference.travelDestinationCity,
      county: form.county,
      hasContacts: false,
    },
    websiteIntake,
    humanLocks: {
      city: Boolean(envelope.data.where.city?.trim()),
      county: Boolean(envelope.data.where.county?.trim()),
      zipCode: Boolean(envelope.data.where.zipCode?.trim()),
      roundTripMiles: envelope.data.travel.roundTripMiles != null && envelope.data.travel.roundTripMiles > 0,
    },
  };
}
