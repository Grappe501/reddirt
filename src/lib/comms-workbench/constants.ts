/**
 * Comms Workbench — shared labels and type aliases (Packet 1 / foundation).
 * Domain vocabulary “Communication channel” in docs maps to Prisma `CommsWorkbenchChannel`
 * because the legacy `CommunicationChannel` enum is reserved for SMS/EMAIL on `CommunicationMessage` rows.
 */
import type {
  CommunicationObjective,
  CommsWorkbenchChannel,
  CommunicationPlanStatus,
  CommunicationDraftStatus,
  CommunicationSendStatus,
  MediaOutreachStatus,
  CommunicationReviewDecision,
  CommunicationVariantStatus,
} from "@prisma/client";

/**
 * Outbound provider execution (Packet 10+). Other channels are planning / assets only until a delivery path exists.
 */
export const COMMUNICATION_SEND_EXECUTABLE_CHANNELS: readonly CommsWorkbenchChannel[] = ["EMAIL", "SMS"];

export function isExecutableCommsWorkbenchChannel(ch: CommsWorkbenchChannel): boolean {
  return (COMMUNICATION_SEND_EXECUTABLE_CHANNELS as readonly string[]).includes(ch);
}

export type { CommunicationObjective, CommsWorkbenchChannel, CommunicationPlanStatus };

/** Doc-facing alias; use `CommsWorkbenchChannel` in Prisma/API code. */
export type CommunicationChannelVocabulary = CommsWorkbenchChannel;

export const COMMUNICATION_OBJECTIVES: readonly CommunicationObjective[] = [
  "VOLUNTEER_RECRUITMENT",
  "VOLUNTEER_ACTIVATION",
  "EVENT_PROMOTION",
  "EVENT_REMINDER",
  "POST_EVENT_FOLLOWUP",
  "RAPID_RESPONSE",
  "CLARIFICATION",
  "SUPPORTER_MOBILIZATION",
  "DONOR_ENGAGEMENT",
  "INTERNAL_COORDINATION",
  "PRESS_OUTREACH",
  "MEDIA_RESPONSE",
  "GENERAL_UPDATE",
] as const;

export const COMMS_WORKBENCH_CHANNELS: readonly CommsWorkbenchChannel[] = [
  "EMAIL",
  "SMS",
  "INTERNAL_NOTICE",
  "PRESS_OUTREACH",
  "PHONE_SCRIPT",
  "TALKING_POINTS",
] as const;

export const COMMUNICATION_PLAN_STATUSES: readonly CommunicationPlanStatus[] = [
  "DRAFT",
  "PLANNING",
  "READY_FOR_REVIEW",
  "APPROVED",
  "SCHEDULED",
  "ACTIVE",
  "COMPLETED",
  "CANCELED",
  "ARCHIVED",
] as const;

export const COMMUNICATION_DRAFT_STATUSES: readonly CommunicationDraftStatus[] = [
  "DRAFT",
  "READY_FOR_REVIEW",
  "APPROVED",
  "REJECTED",
  "ARCHIVED",
] as const;

export const COMMUNICATION_SEND_STATUSES: readonly CommunicationSendStatus[] = [
  "DRAFT",
  "QUEUED",
  "SCHEDULED",
  "SENDING",
  "SENT",
  "PARTIALLY_SENT",
  "FAILED",
  "CANCELED",
] as const;

export const MEDIA_OUTREACH_STATUSES: readonly MediaOutreachStatus[] = [
  "NEW",
  "RESEARCHING",
  "READY",
  "CONTACTED",
  "FOLLOW_UP_DUE",
  "RESPONDED",
  "CLOSED",
  "ARCHIVED",
] as const;

export const COMMUNICATION_REVIEW_DECISIONS: readonly CommunicationReviewDecision[] = [
  "APPROVED",
  "REJECTED",
  "CHANGES_REQUESTED",
] as const;

export const COMMUNICATION_VARIANT_STATUSES: readonly CommunicationVariantStatus[] = [
  "DRAFT",
  "READY",
  "APPROVED",
  "ARCHIVED",
] as const;
