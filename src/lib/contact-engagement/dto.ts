import type {
  CommsDeliveryHealthStatus,
  CommsPlanAudienceSegmentMemberSource,
  CommsPlanAudienceSegmentStatus,
  CommsPlanAudienceSegmentType,
  CommsWorkbenchChannel,
  CommunicationRecipientEventType,
  CommunicationRecipientStatus,
  CommunicationSendStatus,
} from "@prisma/client";
import type { CommunicationUserSummary } from "../comms-workbench/dto";

/** How this recipient row is linked to a person / address (CE-1 multi-linkage). */
export type CommunicationRecipientIdentityType =
  | "USER"
  | "VOLUNTEER_PROFILE"
  | "THREAD"
  | "CRM_KEY"
  | "UNRESOLVED";

/**
 * Centralized, UI-ready identity display — do not re-derive in future packets.
 * `displayLabel` is always non-empty for list rows.
 */
export type CommunicationRecipientIdentitySummary = {
  identityType: CommunicationRecipientIdentityType;
  identityId: string | null;
  nameLabel: string | null;
  emailLabel: string | null;
  phoneLabel: string | null;
  /** Extra context, e.g. "Thread" or "Volunteer profile". */
  subtitle: string | null;
  displayLabel: string;
};

export type CommunicationRecipientEventTypeCounts = Partial<Record<CommunicationRecipientEventType, number>>;

export type CommunicationRecipientListItem = {
  id: string;
  communicationSendId: string;
  channel: CommsWorkbenchChannel;
  addressUsed: string;
  status: CommunicationRecipientStatus;
  deliveryHealthStatus: CommsDeliveryHealthStatus;
  targetSegmentId: string | null;
  targetSegmentLabel: string | null;
  identity: CommunicationRecipientIdentitySummary;
  createdAt: string;
  updatedAt: string;
  latestEventType: CommunicationRecipientEventType | null;
  latestEventAt: string | null;
  latestEventSummary: string | null;
  eventTypeCounts: CommunicationRecipientEventTypeCounts;
};

export type CommunicationRecipientEventListItem = {
  id: string;
  communicationRecipientId: string;
  eventType: CommunicationRecipientEventType;
  occurredAt: string;
  providerName: string | null;
  providerEventId: string | null;
  linkUrl: string | null;
  linkLabel: string | null;
  /** One-line, operator-safe; not raw provider blob. */
  summaryLine: string;
  hasStructuredMetadata: boolean;
};

export type CommunicationRecipientDetail = {
  id: string;
  communicationSendId: string;
  communicationPlanId: string;
  planTitle: string;
  sendStatus: CommunicationSendStatus;
  channel: CommsWorkbenchChannel;
  addressUsed: string;
  status: CommunicationRecipientStatus;
  deliveryHealthStatus: CommsDeliveryHealthStatus;
  targetSegmentId: string | null;
  targetSegmentLabel: string | null;
  crmContactKey: string | null;
  providerRecipientId: string | null;
  comsPlanAudienceSegmentId: string | null;
  segmentName: string | null;
  identity: CommunicationRecipientIdentitySummary;
  events: CommunicationRecipientEventListItem[];
  eventsLastAt: string | null;
  linkClickCount: number;
  lastFailureEventSummary: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CommunicationRecipientStatusCounts = Partial<Record<CommunicationRecipientStatus, number>>;

export type CommsDeliveryHealthStatusCounts = Partial<Record<CommsDeliveryHealthStatus, number>>;

/**
 * Per-send rollups. Status/health counts are from `CommunicationRecipient` rows;
 * `eventTypeCounts` and `perEventRollup` are from `CommunicationRecipientEvent` (normalized history).
 */
export type CommunicationSendEngagementSummary = {
  communicationSendId: string;
  totalRecipients: number;
  countByStatus: CommunicationRecipientStatusCounts;
  countByDeliveryHealth: CommsDeliveryHealthStatusCounts;
  eventTypeCounts: CommunicationRecipientEventTypeCounts;
  /** Convenience: pipeline-ish counts; prefer `eventTypeCounts` when present. */
  sentLikeRecipientCount: number;
  failedRecipientCount: number;
  lastEventAt: string | null;
  latestFailureSummary: string | null;
  linkClickEventCount: number;
};

/**
 * Counts of recipients that look “unhealthy” for ops (subset of non-HEALTHY).
 */
export type CommunicationPlanDeliveryHealthProblems = {
  suppressed: number;
  unsubscribed: number;
  invalidEmail: number;
  invalidPhone: number;
  hardBounced: number;
  smsOptOut: number;
  unknown: number;
};

export type CommunicationPlanEngagementSummary = {
  communicationPlanId: string;
  totalRecipientRows: number;
  totalSendsWithRecipients: number;
  countByStatus: CommunicationRecipientStatusCounts;
  countByDeliveryHealth: CommsDeliveryHealthStatusCounts;
  eventTypeCounts: CommunicationRecipientEventTypeCounts;
  sentLikeRecipientCount: number;
  failedRecipientCount: number;
  latestRecipientActivityAt: string | null;
  latestRecipientFailureAt: string | null;
  /** Sum of `recipientRows` for channels (one row = one send attempt; same person on two channels = 2). */
  recipientRowsByChannel: Partial<Record<CommsWorkbenchChannel, number>>;
  deliveryHealthProblems: CommunicationPlanDeliveryHealthProblems;
};

export type CommsPlanAudienceSegmentListItem = {
  id: string;
  communicationPlanId: string;
  name: string;
  description: string | null;
  segmentType: CommsPlanAudienceSegmentType;
  status: CommsPlanAudienceSegmentStatus;
  isDynamic: boolean;
  /**
   * **STATIC**: count of `CommsPlanAudienceSegmentMember` rows.
   * **DYNAMIC** with no stored membership engine: `null` (not evaluated; do not fake precision).
   */
  memberCount: number | null;
  memberCountNote: "STORED" | "DYNAMIC_UNEVALUATED";
  createdBy: CommunicationUserSummary | null;
  updatedBy: CommunicationUserSummary | null;
  createdAt: string;
  updatedAt: string;
  /**
   * Manual add/remove is allowed for active **static, non-dynamic** segments only.
   * Dynamic segments use stored rules; membership is not hand-maintained in CE-4.
   */
  isManualMembershipAllowed: boolean;
};

export type CommsPlanAudienceSegmentRuleView = {
  version?: string;
  /** Opaque until CE-4; keys only for read surfaces — no rule execution. */
  keys: string[];
  /** Safe preview: first level of structure only. */
  previewJson: unknown;
};

export type CommsPlanAudienceSegmentMemberListItem = {
  id: string;
  comsPlanAudienceSegmentId: string;
  sourceType: CommsPlanAudienceSegmentMemberSource;
  addedBy: CommunicationUserSummary | null;
  createdAt: string;
  identity: CommunicationRecipientIdentitySummary;
};

export type CommsPlanAudienceSegmentDetail = CommsPlanAudienceSegmentListItem & {
  members: CommsPlanAudienceSegmentMemberListItem[];
  ruleView: CommsPlanAudienceSegmentRuleView;
  /** Raw stored JSON (for management forms; still validate on write). */
  ruleDefinitionJson: unknown;
};

export type ContactEngagementRecentSend = {
  communicationSendId: string;
  communicationPlanId: string;
  planTitle: string;
  channel: CommsWorkbenchChannel;
  sendStatus: CommunicationSendStatus;
  recipientId: string;
  recipientStatus: CommunicationRecipientStatus;
  lastActivityAt: string | null;
};

export type ContactEngagementSummary = {
  query: {
    userId: string | null;
    volunteerProfileId: string | null;
    communicationThreadId: string | null;
    crmContactKey: string | null;
  };
  identity: CommunicationRecipientIdentitySummary;
  totalRecipientRows: number;
  countByStatus: CommunicationRecipientStatusCounts;
  countByDeliveryHealth: CommsDeliveryHealthStatusCounts;
  eventTypeCounts: CommunicationRecipientEventTypeCounts;
  latestRecipientActivityAt: string | null;
  lastFailureSummary: string | null;
  recentSends: ContactEngagementRecentSend[];
  segmentMemberships: { segmentId: string; segmentName: string; planId: string; planTitle: string }[];
  /** Dominant / worst health seen across rows (ops snapshot). */
  deliveryHealthSnapshot: CommsDeliveryHealthStatus | "MIXED" | "UNKNOWN";
};
