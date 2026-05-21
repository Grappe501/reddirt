import { parse } from "date-fns";
import { fromZonedTime } from "date-fns-tz";

import type { CampaignEventLedgerRecord } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { PublicSchedulingAssistantResult } from "@/lib/kelly-agent/public-scheduling-agent";
import type { ScheduleCampaignEventBody } from "@/lib/forms/public-schedule-schema";
import { sanitizePlainText } from "@/lib/security/sanitize";
import { emptyFactCardData } from "../fact-card-data";
import { serializeFactCardEnvelope } from "../fact-card-envelope";
import { emptyReviewMeta } from "../review-meta";
import { loadNormalizedCalendarItems } from "../load-march-events";
import { listCampaignEventRecordsByPeriod } from "../persistence/records";
import { classifyCampaignEvent } from "../classify-event";
import {
  assessIntakeDuplicateAndConflict,
  ledgerRowsToCalendarPeers,
} from "./intake-duplicate-conflict";
import {
  buildIntakeSummary,
  recommendIntakeNextAction,
  runIntakeInference,
} from "./intake-inference";
import {
  attachIntakeMetaToFactCard,
  buildWebsiteEntrySourceKey,
  buildWebsiteIntakeCalendarSourceId,
  parseIntakeMetaFromFactCard,
  publicFormSnapshot,
  type WebsiteIntakeBridgeMeta,
} from "./intake-meta";
import { buildWebsiteIntakeCalendarItem } from "./website-intake-calendar";

const TZ = "America/Chicago";

export type BridgeWebsiteIntakeInput = {
  body: ScheduleCampaignEventBody;
  assistant: PublicSchedulingAssistantResult;
  routeImpactMilesEstimate: number | null;
  workflowIntakeId: string;
  eventRequestId: string;
  submissionId: string;
};

export type BridgeWebsiteIntakeResult = {
  recordId: string;
  created: boolean;
  sourceKey: string;
  period: string;
  duplicateRisk: boolean;
  scheduleConflict: boolean;
};

function ledgerPeriodFromDate(d: Date): string {
  return d.toISOString().slice(0, 7);
}

function parsePreferredStart(body: ScheduleCampaignEventBody, assistant: PublicSchedulingAssistantResult): {
  startAt: Date;
  endAt: Date | null;
  allDay: boolean;
} {
  const rec = assistant.recommendedTentativeEvent;
  if (rec.startAt) {
    const startAt = new Date(rec.startAt);
    const endAt = rec.endAt ? new Date(rec.endAt) : null;
    return { startAt, endAt, allDay: false };
  }

  const dateStr = body.preferredDate?.trim();
  if (dateStr) {
    const time = body.preferredStartTime?.trim() || "12:00";
    const parsed = parse(`${dateStr} ${time}`, "yyyy-MM-dd HH:mm", new Date());
    const startAt = fromZonedTime(parsed, TZ);
    let endAt: Date | null = null;
    if (body.preferredEndTime?.trim()) {
      const endParsed = parse(`${dateStr} ${body.preferredEndTime.trim()}`, "yyyy-MM-dd HH:mm", new Date());
      endAt = fromZonedTime(endParsed, TZ);
    }
    return { startAt, endAt, allDay: !body.preferredStartTime?.trim() };
  }

  const placeholder = fromZonedTime(parse("2099-01-15 12:00", "yyyy-MM-dd HH:mm", new Date()), TZ);
  return { startAt: placeholder, endAt: null, allDay: true };
}

function buildSyntheticCalendarForInference(
  body: ScheduleCampaignEventBody,
  assistant: PublicSchedulingAssistantResult,
  calendarSourceId: string,
  startAt: Date,
  endAt: Date | null,
  allDay: boolean,
) {
  const city = body.city?.trim() || assistant.recommendedTentativeEvent.city?.trim();
  return {
    id: calendarSourceId,
    source: "public_schedule_request" as const,
    title: sanitizePlainText(body.eventTitle, 200),
    start: startAt.toISOString(),
    end: endAt?.toISOString(),
    allDay,
    county: sanitizePlainText(body.county, 100),
    city: city || undefined,
    location: body.address ? sanitizePlainText(body.address, 500) : undefined,
    eventType: "community_event" as const,
    calendarStatus: "tentative" as const,
    publishStatus: "private_admin_only" as const,
    countyTouchCounts: false,
    verificationConfidence: 0.35,
    notes: [body.eventPurpose, body.notes].filter(Boolean).join("\n\n") || undefined,
    drillDown: {
      host: body.organization?.trim() || body.requesterName.trim(),
    },
  };
}

function buildFactCardFromIntake(
  body: ScheduleCampaignEventBody,
  assistant: PublicSchedulingAssistantResult,
  inferred: ReturnType<typeof runIntakeInference>,
  meta: WebsiteIntakeBridgeMeta,
) {
  const data = emptyFactCardData();
  const { label } = classifyCampaignEvent(
    buildSyntheticCalendarForInference(
      body,
      assistant,
      "infer",
      new Date(),
      null,
      false,
    ),
  );
  data.why.eventType = inferred.eventTypeLabel || label;
  data.why.campaignPurpose = body.eventPurpose?.trim() || undefined;
  data.where.city = inferred.city ?? undefined;
  data.where.county = inferred.county ?? undefined;
  data.where.zipCode = inferred.zipCode ?? undefined;
  data.where.venueName = body.address?.split(",")[0]?.trim();
  data.who.hostName = inferred.likelyHost ?? body.requesterName.trim();
  data.who.hostOrganization = body.organization?.trim() || undefined;
  data.who.hostEmail = body.email;
  data.who.hostPhone = body.phone;
  data.what.candidateRole = inferred.candidateSpeakingSlot ? "Speaking / headliner" : undefined;
  data.what.speakingSlot = inferred.candidateSpeakingSlot ? "Requested on public form" : undefined;
  data.travel.assumedDestinationCity = inferred.city ?? undefined;
  if (inferred.likelyTravel) {
    data.travel.mileageSource = inferred.travelReason ?? "Website intake — travel likely";
  }

  const envelope = {
    data,
    review: {
      ...emptyReviewMeta(),
      intakeReviewStatus: "needs_review" as const,
      websiteIntake: true,
    },
    approvalTimeline: [],
    communication: [],
  };

  return attachIntakeMetaToFactCard(serializeFactCardEnvelope(envelope), meta);
}

/**
 * Idempotent bridge: one ledger row per WorkflowIntake (`website_entry:{id}`).
 */
export async function bridgeWebsiteIntakeToLedger(
  input: BridgeWebsiteIntakeInput,
): Promise<BridgeWebsiteIntakeResult> {
  const sourceKey = buildWebsiteEntrySourceKey(input.workflowIntakeId);
  const calendarSourceId = buildWebsiteIntakeCalendarSourceId(input.workflowIntakeId);

  const existing = await prisma.campaignEventLedgerRecord.findUnique({ where: { sourceKey } });
  if (existing) {
    const meta = parseIntakeMetaFromFactCard(existing.factCard);
    return {
      recordId: existing.id,
      created: false,
      sourceKey,
      period: existing.period,
      duplicateRisk: meta?.duplicateRisk ?? false,
      scheduleConflict: meta?.scheduleConflict ?? false,
    };
  }

  const { startAt, endAt, allDay } = parsePreferredStart(input.body, input.assistant);
  const period = ledgerPeriodFromDate(startAt);
  const synthetic = buildSyntheticCalendarForInference(
    input.body,
    input.assistant,
    calendarSourceId,
    startAt,
    endAt,
    allDay,
  );

  const inferred = runIntakeInference({
    body: input.body,
    assistant: input.assistant,
    routeImpactMilesEstimate: input.routeImpactMilesEstimate,
    syntheticCalendar: synthetic,
  });

  const normalized = await loadNormalizedCalendarItems();
  const ledgerPeers = await listCampaignEventRecordsByPeriod(period);
  const peerItems = [...normalized, ...ledgerRowsToCalendarPeers(ledgerPeers, calendarSourceId)];

  const hostLabel = inferred.likelyHost;
  const notesHaystack = [input.body.eventPurpose, input.body.notes].filter(Boolean).join(" ");
  const risks = assessIntakeDuplicateAndConflict({
    candidate: synthetic,
    peerCalendarItems: peerItems,
    existingLedger: ledgerPeers,
    hostLabel,
    notesHaystack,
  });

  const intakeSummary = buildIntakeSummary(inferred, input.body);
  const recommendedNextAction = recommendIntakeNextAction({
    inferred,
    duplicateRisk: risks.duplicateRisk,
    scheduleConflict: risks.scheduleConflict,
    assistant: input.assistant,
  });

  const meta: WebsiteIntakeBridgeMeta = {
    version: 1,
    workflowIntakeId: input.workflowIntakeId,
    eventRequestId: input.eventRequestId,
    submissionId: input.submissionId,
    duplicateRisk: risks.duplicateRisk,
    scheduleConflict: risks.scheduleConflict,
    duplicateReasons: risks.duplicateReasons,
    conflictReasons: risks.conflictReasons,
    inferred,
    intakeSummary,
    recommendedNextAction,
    submittedAt: new Date().toISOString(),
    publicForm: publicFormSnapshot(input.body),
  };

  const factCard = buildFactCardFromIntake(input.body, input.assistant, inferred, meta);
  const title = sanitizePlainText(input.body.eventTitle, 200);
  const locationParts = [input.body.address, input.body.city, input.body.county].filter(Boolean);
  const originalLocation = locationParts.length ? sanitizePlainText(locationParts.join(", "), 500) : null;
  const originalNotes = sanitizePlainText(
    [
      `Website intake via ${input.body.requesterName}`,
      input.body.organization ? `Org: ${input.body.organization}` : "",
      input.body.notes ?? "",
      intakeSummary,
    ]
      .filter(Boolean)
      .join("\n"),
    8000,
  );

  const created = await prisma.campaignEventLedgerRecord.create({
    data: {
      period,
      sourceKey,
      calendarSourceId,
      entrySource: "WEBSITE_ENTRY",
      createdFromSource: "WEBSITE_ENTRY",
      sourceCalendarName: "Website intake (tentative)",
      originalTitle: title,
      originalNotes,
      originalLocation,
      startAt,
      endAt,
      allDay,
      eventStatus: "TENTATIVE",
      calendarStatus: "TENTATIVE_CALENDAR",
      reviewStatus: "NOT_STARTED",
      googleSyncStatus: "NOT_LINKED",
      displayCity: inferred.city,
      displayEventType: inferred.eventTypeLabel,
      factCard: factCard as object,
    },
  });

  await linkEventRequestToLedger(input.eventRequestId, created.id);

  return {
    recordId: created.id,
    created: true,
    sourceKey,
    period,
    duplicateRisk: risks.duplicateRisk,
    scheduleConflict: risks.scheduleConflict,
  };
}

async function linkEventRequestToLedger(eventRequestId: string, ledgerRecordId: string) {
  const er = await prisma.eventRequest.findUnique({ where: { id: eventRequestId } });
  if (!er) return;
  const meta =
    er.metadata && typeof er.metadata === "object" ? ({ ...(er.metadata as Record<string, unknown>) } as Record<string, unknown>) : {};
  meta.campaignEventLedgerRecordId = ledgerRecordId;
  await prisma.eventRequest.update({
    where: { id: eventRequestId },
    data: { metadata: meta as object },
  });
}

export { buildWebsiteIntakeCalendarItem } from "./website-intake-calendar";
