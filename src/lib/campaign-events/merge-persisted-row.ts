import { formatInTimeZone } from "date-fns-tz";
import type { CampaignEventLedgerRecord } from "@prisma/client";
import type { CampaignCalendarItem } from "@/lib/calendar/campaign-calendar-item";
import { buildCampaignEventLedgerRow } from "./build-fact-card";
import { detectEventConflicts, type EventConflictBadge } from "./conflicts";
import { countEditableGaps } from "./fact-card-data";
import { parseFactCardEnvelope } from "./fact-card-envelope";
import type { ApprovalTimelineEntry } from "./approval-timeline";
import type { EventCommunicationEntry } from "./event-communication";
import { resolveCalendarLanes, type CalendarLaneResolution } from "./calendar-lane";
import { parseIntakeMetaFromFactCard } from "./intake/intake-meta";
import {
  buildCalendarSyncContext,
  lookupGoogleRecordForLedger,
  resolveLedgerCalendarSync,
  type CalendarSyncContext,
} from "./calendar-sync/resolve-ledger-calendar-sync";
import {
  TRUTH_STATUS_LABELS,
  TRUTH_STATUS_TONE,
  type LedgerCalendarTruthStatus,
} from "./calendar-sync/calendar-sync-truth-types";
import type { LedgerCalendarSyncMeta } from "./calendar-sync/calendar-sync-meta";
import { latestApprovalEmailLog, parseApprovalEmailLog } from "./approval-email/approval-email-log";
import { decisionLabel } from "./review-meta";
import { resolveDefaultTravelOrigin } from "./travel-origin";
import type { CampaignEventLedgerRow } from "./types";
import type { EditableFactSectionId } from "./constants";
import { buildEditableFactSection } from "./section-field-config";

export type PersistedMarchEventRow = CampaignEventLedgerRow & {
  recordId: string;
  factCard: import("./fact-card-data").CampaignEventFactCardData;
  eventStatus: string;
  calendarStatus: string;
  reviewStatus: string;
  conflicts: EventConflictBadge[];
  travelLine: string;
  reimbursementDisplay?: string;
  persistedMissingCount: number;
  decisionLabel: string | null;
  requestInfoStatus: string | null;
  approvalEmailLastLog: import("./approval-email/approval-email-log").ApprovalEmailLogEntry | null;
};

/** Workbench row — persisted ledger + filter/sort fields (any period). */
export type WorkbenchEventRow = PersistedMarchEventRow & {
  startAtMs: number;
  timeLabel: string;
  county?: string;
  rawEventStatus: string;
  rawReviewStatus: string;
  rawDecision: string | null;
  hasWorkHoursWarning: boolean;
  hasConflictWarning: boolean;
  roundTripMiles: number | null;
  reimbursementAmount: number | null;
  lastReviewedAt: string | null;
  lastRecalculatedAt: string | null;
  approvalTimeline: ApprovalTimelineEntry[];
  communicationThread: EventCommunicationEntry[];
  calendarLanes: CalendarLaneResolution;
  entrySource: string;
  isWebsiteIntake: boolean;
  intakeNeedsReview: boolean;
  duplicateRisk: boolean;
  intakeScheduleConflict: boolean;
  intakeSummary: string | null;
  intakeRecommendedAction: string | null;
  calendarTruthStatus: LedgerCalendarTruthStatus;
  calendarTruthLabel: string;
  calendarTruthTone: "neutral" | "amber" | "green" | "red" | "navy" | "slate";
  calendarSync: LedgerCalendarSyncMeta;
  calendarWriteDisabled: boolean;
};

export { buildCalendarSyncContext, type CalendarSyncContext };

const TZ = "America/Chicago";

const EDITABLE_SECTION_IDS: EditableFactSectionId[] = ["when", "where", "why", "who", "what", "travel"];

function formatCompactTime(iso: string, allDay: boolean): string {
  if (allDay) return "All day";
  return formatInTimeZone(new Date(iso), TZ, "h:mm a");
}

export function mergePersistedMarchRow(
  record: CampaignEventLedgerRecord,
  calendar: CampaignCalendarItem,
  allCalendar: CampaignCalendarItem[],
  syncCtx?: CalendarSyncContext,
): WorkbenchEventRow {
  const base = buildCampaignEventLedgerRow(calendar, allCalendar);
  const envelope = parseFactCardEnvelope(record.factCard);
  const factCard = envelope.data;
  const travelOrigin = resolveDefaultTravelOrigin(calendar);
  const originCity =
    factCard.travel.originOverrideCity?.trim() ||
    factCard.travel.assumedOriginCity?.trim() ||
    travelOrigin.originCity;
  const destCity =
    factCard.travel.destinationOverrideCity?.trim() ||
    factCard.travel.assumedDestinationCity?.trim() ||
    factCard.where.city?.trim() ||
    base.likelyCity;

  const travelLine = destCity ? `${originCity} → ${destCity}` : `${originCity} → (city TBD)`;
  const reimbursementDisplay =
    record.reimbursementAmount != null
      ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(record.reimbursementAmount))
      : undefined;

  const sections = base.sections.map((section) => {
    const editableId = section.id as EditableFactSectionId;
    if (!EDITABLE_SECTION_IDS.includes(editableId)) return section;
    return buildEditableFactSection(editableId, factCard, {
      title: section.title,
      helper: section.helper,
      defaultCollapsed: section.defaultCollapsed,
      emphasis: section.emphasis,
    });
  });

  const approvalEmailLastLog = latestApprovalEmailLog(parseApprovalEmailLog(record.factCard));
  const intakeMeta = parseIntakeMetaFromFactCard(record.factCard);
  const conflicts = detectEventConflicts(calendar, allCalendar, record.eventStatus);
  const workHours = base.workHours;
  const intakeConflict = intakeMeta?.scheduleConflict ?? false;
  const intakeDuplicate = intakeMeta?.duplicateRisk ?? false;

  const googleRecord = syncCtx ? lookupGoogleRecordForLedger(record, calendar, syncCtx) : null;
  const syncResolution = syncCtx
    ? resolveLedgerCalendarSync({
        record,
        calendar,
        googleRecord,
        jsonFreshness: syncCtx.jsonFreshness,
      })
    : {
        version: 1 as const,
        truthStatus: "NOT_LINKED" as LedgerCalendarTruthStatus,
        matchedBy: "none" as const,
        googleEventId: record.googleEventId,
        googleCalendarId: null,
        googleEventUrl: record.googleEventUrl,
        sourceCalendarName: record.sourceCalendarName,
        prismaGoogleSyncStatus: record.googleSyncStatus,
        lastGoogleSeenAt: null,
        lastLedgerUpdatedAt: record.updatedAt.toISOString(),
        normalizedJsonSourceAt: null,
        syncWarning: null,
        syncError: null,
        writeEnabled: false as const,
        computedAt: new Date().toISOString(),
        match: {
          matchedBy: "none" as const,
          googleEventId: record.googleEventId,
          googleCalendarId: null,
          googleEventUrl: record.googleEventUrl,
          lastGoogleSeenAt: null,
          syncWarning: null,
          syncError: null,
          titleMismatch: false,
          startMismatch: false,
        },
        badgeLabel: "not linked",
        showWriteDisabled: true,
      };

  return {
    ...base,
    recordId: record.id,
    factCard,
    eventStatus: record.eventStatus.replaceAll("_", " ").toLowerCase(),
    calendarStatus: record.calendarStatus.replaceAll("_", " ").toLowerCase(),
    reviewStatus: record.reviewStatus.replaceAll("_", " ").toLowerCase(),
    conflicts,
    travelLine,
    reimbursementDisplay,
    likelyCity: destCity ?? base.likelyCity,
    county: factCard.where.county?.trim() || calendar.county,
    missingInfoCount: countEditableGaps(factCard),
    persistedMissingCount: countEditableGaps(factCard),
    sections,
    sourceCalendarId: record.calendarSourceId,
    decisionLabel: decisionLabel(envelope.review.decision),
    requestInfoStatus: envelope.review.requestInfoStatus ?? null,
    approvalEmailLastLog,
    startAtMs: record.startAt.getTime(),
    timeLabel: formatCompactTime(calendar.start, calendar.allDay),
    rawEventStatus: record.eventStatus,
    rawReviewStatus: record.reviewStatus,
    rawDecision: envelope.review.decision ?? null,
    hasWorkHoursWarning: workHours.show,
    hasConflictWarning: conflicts.length > 0 || intakeConflict,
    roundTripMiles: record.roundTripMiles != null ? Number(record.roundTripMiles) : factCard.travel.roundTripMiles ?? null,
    reimbursementAmount:
      record.reimbursementAmount != null ? Number(record.reimbursementAmount) : factCard.travel.reimbursementAmount ?? null,
    lastReviewedAt: envelope.review.lastReviewedAt ?? null,
    lastRecalculatedAt: envelope.review.lastRecalculatedAt ?? null,
    approvalTimeline: envelope.approvalTimeline,
    communicationThread: envelope.communication,
    calendarLanes: resolveCalendarLanes(record),
    entrySource: record.entrySource,
    isWebsiteIntake: record.entrySource === "WEBSITE_ENTRY",
    intakeNeedsReview:
      record.entrySource === "WEBSITE_ENTRY" &&
      (envelope.review.intakeReviewStatus === "needs_review" || !envelope.review.decision),
    duplicateRisk: intakeDuplicate,
    intakeScheduleConflict: intakeConflict,
    intakeSummary: intakeMeta?.intakeSummary ?? null,
    intakeRecommendedAction: intakeMeta?.recommendedNextAction ?? null,
    calendarTruthStatus: syncResolution.truthStatus,
    calendarTruthLabel: TRUTH_STATUS_LABELS[syncResolution.truthStatus],
    calendarTruthTone: TRUTH_STATUS_TONE[syncResolution.truthStatus],
    calendarSync: syncResolution,
    calendarWriteDisabled: syncResolution.showWriteDisabled,
  };
}
