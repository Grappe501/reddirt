/**
 * Contact engagement + segmentation (Comms workbench, campaign-local).
 * CE-1: re-exports only — no ingestion or business rules. Prefer `@prisma/client` directly if you prefer.
 */

export {
  CommunicationRecipientEventType,
  CommunicationRecipientStatus,
  CommsDeliveryHealthStatus,
  CommsPlanAudienceSegmentMemberSource,
  CommsPlanAudienceSegmentStatus,
  CommsPlanAudienceSegmentType,
} from "@prisma/client";

export type {
  CommunicationLinkDefinition,
  CommunicationRecipient,
  CommunicationRecipientEvent,
  CommsPlanAudienceSegment,
  CommsPlanAudienceSegmentMember,
} from "@prisma/client";
