import type {
  CommsDeliveryHealthStatus,
  CommsPlanAudienceSegmentStatus,
  CommsPlanAudienceSegmentType,
  CommsWorkbenchChannel,
  CommunicationRecipientEventType,
  CommunicationRecipientStatus,
} from "@prisma/client";

/**
 * Optional filters for `listCommunicationRecipientsForSend`.
 * All conditions are AND-combined; omit or set undefined to ignore.
 */
export type CommunicationRecipientListFilters = {
  status?: CommunicationRecipientStatus;
  deliveryHealthStatus?: CommsDeliveryHealthStatus;
  channel?: CommsWorkbenchChannel;
  /** True = only rows with at least one event; false = only rows with no events. */
  hasEvents?: boolean;
  eventType?: CommunicationRecipientEventType;
  /** Trims; matches `addressUsed`, `crmContactKey`, linked user name/email, thread emails/phones (simple contains, case-insensitive). */
  searchText?: string;
};

export type CommsPlanAudienceSegmentListFilters = {
  status?: CommsPlanAudienceSegmentStatus;
  segmentType?: CommsPlanAudienceSegmentType;
  isDynamic?: boolean;
};

/** Identity selector for `getContactEngagementSummary` — exactly one field should be set. */
export type ContactEngagementSummaryQuery = {
  userId?: string;
  volunteerProfileId?: string;
  communicationThreadId?: string;
  crmContactKey?: string;
};
