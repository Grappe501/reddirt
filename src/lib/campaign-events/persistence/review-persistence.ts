import type {
  CampaignEventLedgerEventStatus,
  CampaignEventLedgerReviewStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { countEditableGaps } from "../fact-card-data";
import { parseFactCardEnvelope, serializeFactCardEnvelope, withPreservedFactCardExtensions } from "../fact-card-envelope";
import { reviewFormToFactCard, type EventReviewFormState } from "../review-form";
import type { CampaignEventDecision, CampaignEventEmailDraft, CampaignEventReviewMeta } from "../review-meta";
import { applyTravelMileageToFactCard } from "./travel-calc";

export async function persistReviewForm(
  recordId: string,
  form: EventReviewFormState,
  options: { recalculate: boolean; draft?: boolean; actor?: string },
) {
  const record = await prisma.campaignEventLedgerRecord.findUnique({ where: { id: recordId } });
  if (!record) throw new Error("Campaign event record not found.");

  const envelope = parseFactCardEnvelope(record.factCard);
  let data = reviewFormToFactCard(form);
  const dateYmd = record.startAt.toISOString().slice(0, 10);

  if (options.recalculate) {
    data = await applyTravelMileageToFactCard(recordId, dateYmd, data);
    envelope.review.lastRecalculatedAt = new Date().toISOString();
  }

  envelope.data = data;
  envelope.operatorNotes = form.operatorNotes?.trim() || undefined;
  envelope.review.lastReviewedAt = new Date().toISOString();

  const reviewStatus = mapReviewStatus(form.reviewStatus);
  const eventStatus = mapEventStatus(form.eventStatus);

  if (!options.draft) {
    envelope.review.requestInfoStatus = envelope.review.requestInfoStatus ?? "none";
  }

  return prisma.campaignEventLedgerRecord.update({
    where: { id: recordId },
    data: {
      factCard: withPreservedFactCardExtensions(serializeFactCardEnvelope(envelope), record.factCard) as object,
      displayCity: data.where.city?.trim() || record.displayCity,
      displayEventType: data.why.eventType?.trim() || record.displayEventType,
      roundTripMiles: data.travel.roundTripMiles ?? null,
      reimbursementAmount: data.travel.reimbursementAmount ?? null,
      reviewStatus,
      eventStatus,
    },
  });
}

export async function applyReviewDecision(
  recordId: string,
  decision: CampaignEventDecision,
  input: { note?: string; actor?: string },
) {
  const record = await prisma.campaignEventLedgerRecord.findUnique({ where: { id: recordId } });
  if (!record) throw new Error("Campaign event record not found.");

  const envelope = parseFactCardEnvelope(record.factCard);
  const now = new Date().toISOString();
  envelope.review.decision = decision;
  envelope.review.decisionNote = input.note?.trim();
  envelope.review.decisionMadeBy = input.actor?.trim() || "admin";
  envelope.review.decisionMadeAt = now;
  envelope.review.lastReviewedAt = now;

  const { eventStatus, reviewStatus, requestInfoStatus } = mapDecisionToStatuses(decision);
  envelope.review.requestInfoStatus = requestInfoStatus;

  return prisma.campaignEventLedgerRecord.update({
    where: { id: recordId },
    data: {
      factCard: withPreservedFactCardExtensions(serializeFactCardEnvelope(envelope), record.factCard) as object,
      eventStatus,
      reviewStatus,
    },
  });
}

export async function saveEmailDraftToRecord(recordId: string, draft: CampaignEventEmailDraft) {
  const record = await prisma.campaignEventLedgerRecord.findUnique({ where: { id: recordId } });
  if (!record) throw new Error("Campaign event record not found.");

  const envelope = parseFactCardEnvelope(record.factCard);
  envelope.review.lastEmailDraft = draft;
  envelope.review.requestInfoStatus = "draft_ready";

  return prisma.campaignEventLedgerRecord.update({
    where: { id: recordId },
    data: {
      factCard: withPreservedFactCardExtensions(serializeFactCardEnvelope(envelope), record.factCard) as object,
      reviewStatus: "NEEDS_INFO",
    },
  });
}

function mapDecisionToStatuses(decision: CampaignEventDecision): {
  eventStatus: CampaignEventLedgerEventStatus;
  reviewStatus: CampaignEventLedgerReviewStatus;
  requestInfoStatus: CampaignEventReviewMeta["requestInfoStatus"];
} {
  switch (decision) {
    case "approved":
      return { eventStatus: "CONFIRMED", reviewStatus: "READY", requestInfoStatus: "none" };
    case "denied":
      return { eventStatus: "CANCELLED", reviewStatus: "READY", requestInfoStatus: "none" };
    case "hold":
      return { eventStatus: "NEEDS_REVIEW", reviewStatus: "NEEDS_INFO", requestInfoStatus: "awaiting_send" };
    case "request_confirmation":
      return { eventStatus: "TENTATIVE", reviewStatus: "NEEDS_INFO", requestInfoStatus: "draft_ready" };
    case "personal":
      return { eventStatus: "CANCELLED", reviewStatus: "READY", requestInfoStatus: "none" };
    case "duplicate":
      return { eventStatus: "NEEDS_REVIEW", reviewStatus: "READY", requestInfoStatus: "none" };
  }
}

function mapReviewStatus(raw: string): CampaignEventLedgerReviewStatus {
  const u = raw.toUpperCase().replace(/\s+/g, "_");
  if (u === "READY") return "READY";
  if (u === "NEEDS_INFO") return "NEEDS_INFO";
  if (u === "NOT_STARTED") return "NOT_STARTED";
  return "IN_PROGRESS";
}

function mapEventStatus(raw: string): CampaignEventLedgerEventStatus {
  const u = raw.toUpperCase().replace(/\s+/g, "_");
  if (u === "CONFIRMED") return "CONFIRMED";
  if (u === "TENTATIVE") return "TENTATIVE";
  if (u === "CANCELLED") return "CANCELLED";
  if (u === "COMPLETED") return "COMPLETED";
  return "NEEDS_REVIEW";
}

export function countMissingFromForm(form: EventReviewFormState): number {
  return countEditableGaps(reviewFormToFactCard(form));
}
