import type { CampaignEventFactCardData } from "./fact-card-data";
import { emptyFactCardData, parseFactCardData } from "./fact-card-data";
import type { CampaignEventReviewMeta } from "./review-meta";
import { emptyReviewMeta } from "./review-meta";
import { parseApprovalTimeline, type ApprovalTimelineEntry } from "./approval-timeline";
import { parseCommunicationThread, type EventCommunicationEntry } from "./event-communication";

export type CampaignEventFactCardEnvelope = {
  data: CampaignEventFactCardData;
  review: CampaignEventReviewMeta;
  operatorNotes?: string;
  approvalTimeline: ApprovalTimelineEntry[];
  communication: EventCommunicationEntry[];
};

export function parseFactCardEnvelope(raw: unknown): CampaignEventFactCardEnvelope {
  if (!raw || typeof raw !== "object") {
    return {
      data: emptyFactCardData(),
      review: emptyReviewMeta(),
      approvalTimeline: parseApprovalTimeline(undefined),
      communication: [],
    };
  }
  const o = raw as Record<string, unknown>;
  const reviewRaw = o._review ?? o.review;
  const review =
    reviewRaw && typeof reviewRaw === "object" ? ({ ...emptyReviewMeta(), ...(reviewRaw as CampaignEventReviewMeta) }) : emptyReviewMeta();
  const operatorNotes = typeof o.operatorNotes === "string" ? o.operatorNotes : undefined;
  const data = parseFactCardData(raw);
  return {
    data,
    review,
    operatorNotes,
    approvalTimeline: parseApprovalTimeline(o._approvalTimeline),
    communication: parseCommunicationThread(o._communication),
  };
}

export function serializeFactCardEnvelope(envelope: CampaignEventFactCardEnvelope): object {
  return {
    ...envelope.data,
    _review: envelope.review,
    operatorNotes: envelope.operatorNotes,
    _approvalTimeline: envelope.approvalTimeline,
    _communication: envelope.communication,
  };
}

/** Keys on factCard JSON that are not part of the core envelope spread (preserve on ledger updates). */
const PRESERVED_FACT_CARD_KEYS = ["_hotWash", "_intake", "_calendarSync", "_approvalEmailLog", "_aiObservations"] as const;

export function withPreservedFactCardExtensions(next: object, previousRaw: unknown): object {
  const n = { ...(next as Record<string, unknown>) };
  if (!previousRaw || typeof previousRaw !== "object") return n;
  const p = previousRaw as Record<string, unknown>;
  for (const key of PRESERVED_FACT_CARD_KEYS) {
    if (p[key] !== undefined) n[key] = p[key];
  }
  return n;
}
