import type { Prisma } from "@prisma/client";
import type {
  CommunicationRecipientEventType,
  CommunicationRecipientStatus,
  CommsDeliveryHealthStatus,
} from "@prisma/client";
import { mapCommunicationUserSummary } from "../comms-workbench/mappers";
import type {
  CommsPlanAudienceSegmentRuleView,
  CommsPlanAudienceSegmentMemberListItem,
  CommsPlanAudienceSegmentListItem,
  CommunicationPlanDeliveryHealthProblems,
  CommunicationPlanEngagementSummary,
  CommunicationRecipientDetail,
  CommunicationRecipientEventListItem,
  CommunicationRecipientEventTypeCounts,
  CommunicationRecipientIdentitySummary,
  CommunicationRecipientListItem,
  CommunicationSendEngagementSummary,
  ContactEngagementSummary,
} from "./dto";
import { formatRecipientEventSummaryLine } from "./display";

const EVENT_FAILURE_TYPES: CommunicationRecipientEventType[] = [
  "FAILED",
  "BOUNCED",
  "UNSUBSCRIBED",
  "OPTED_OUT_SMS",
];

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function mapCommunicationRecipientIdentitySummary(
  input: {
    addressUsed: string;
    userId: string | null;
    user: { id: string; name: string | null; email: string; phone: string | null } | null;
    volunteerProfileId: string | null;
    volunteerProfile: {
      id: string;
      user: { id: string; name: string | null; email: string; phone: string | null };
    } | null;
    communicationThreadId: string | null;
    thread: { id: string; primaryEmail: string | null; primaryPhone: string | null } | null;
    crmContactKey: string | null;
  }
): CommunicationRecipientIdentitySummary {
  if (input.user) {
    const u = input.user;
    const display = [u.name?.trim() || null, u.email].filter(Boolean).join(" · ");
    return {
      identityType: "USER",
      identityId: u.id,
      nameLabel: u.name?.trim() || null,
      emailLabel: u.email,
      phoneLabel: u.phone?.trim() || null,
      subtitle: "User account",
      displayLabel: display || u.id,
    };
  }
  if (input.volunteerProfile) {
    const u = input.volunteerProfile.user;
    const display = [u.name?.trim() || null, u.email].filter(Boolean).join(" · ");
    return {
      identityType: "VOLUNTEER_PROFILE",
      identityId: input.volunteerProfile.id,
      nameLabel: u.name?.trim() || null,
      emailLabel: u.email,
      phoneLabel: u.phone?.trim() || null,
      subtitle: "Volunteer profile",
      displayLabel: display || `Volunteer ${input.volunteerProfile.id.slice(0, 8)}…`,
    };
  }
  if (input.thread) {
    const t = input.thread;
    const display =
      t.primaryEmail?.trim() || t.primaryPhone?.trim() || `Thread ${t.id.slice(0, 8)}…`;
    return {
      identityType: "THREAD",
      identityId: t.id,
      nameLabel: null,
      emailLabel: t.primaryEmail?.trim() || null,
      phoneLabel: t.primaryPhone?.trim() || null,
      subtitle: "Conversation thread",
      displayLabel: display,
    };
  }
  const key = input.crmContactKey?.trim();
  if (key) {
    return {
      identityType: "CRM_KEY",
      identityId: null,
      nameLabel: null,
      emailLabel: null,
      phoneLabel: null,
      subtitle: "External / CRM key",
      displayLabel: `Key: ${key}`,
    };
  }
  return {
    identityType: "UNRESOLVED",
    identityId: null,
    nameLabel: null,
    emailLabel: null,
    phoneLabel: null,
    subtitle: "Address only",
    displayLabel: input.addressUsed || "Unknown recipient",
  };
}

function sumPartial<K extends string>(keys: K[], m: Partial<Record<K, number>>): number {
  let t = 0;
  for (const k of keys) {
    t += m[k] ?? 0;
  }
  return t;
}

const SENT_LIKE: CommunicationRecipientStatus[] = [
  "SENT",
  "DELIVERED",
  "OPENED",
  "CLICKED",
  "REPLIED",
];

const FAILED_RECIPIENT: CommunicationRecipientStatus[] = ["FAILED", "BOUNCED", "UNSUBSCRIBED", "CANCELED"];

/**
 * In-memory event counts and latest/failure from event rows.
 */
export function buildCommunicationRecipientEventRollup(
  events: { eventType: CommunicationRecipientEventType; occurredAt: Date }[]
): {
  eventTypeCounts: CommunicationRecipientEventTypeCounts;
  latest: { at: string; type: CommunicationRecipientEventType } | null;
  lastFailureAt: string | null;
} {
  const eventTypeCounts: CommunicationRecipientEventTypeCounts = {};
  let latest: { at: string; type: CommunicationRecipientEventType } | null = null;
  let lastFailureAt: string | null = null;

  for (const e of events) {
    const t = e.eventType;
    eventTypeCounts[t] = (eventTypeCounts[t] ?? 0) + 1;
    const at = e.occurredAt.getTime();
    if (!latest || at > new Date(latest.at).getTime()) {
      latest = { at: e.occurredAt.toISOString(), type: t };
    }
    if (EVENT_FAILURE_TYPES.includes(t) && (lastFailureAt == null || e.occurredAt.toISOString() > lastFailureAt)) {
      lastFailureAt = e.occurredAt.toISOString();
    }
  }

  return { eventTypeCounts, latest, lastFailureAt };
}

export function buildCommunicationSendEngagementSummary(input: {
  communicationSendId: string;
  totalRecipients: number;
  countByStatus: Partial<Record<CommunicationRecipientStatus, number>>;
  countByDeliveryHealth: Partial<Record<CommsDeliveryHealthStatus, number>>;
  eventTypeCounts: CommunicationRecipientEventTypeCounts;
  lastEventAt: string | null;
  latestFailureSummary: string | null;
  linkClickEventCount: number;
}): CommunicationSendEngagementSummary {
  const sentLikeRecipientCount = sumPartial(SENT_LIKE, input.countByStatus);
  const failedRecipientCount = sumPartial(FAILED_RECIPIENT, input.countByStatus);
  return {
    communicationSendId: input.communicationSendId,
    totalRecipients: input.totalRecipients,
    countByStatus: input.countByStatus,
    countByDeliveryHealth: input.countByDeliveryHealth,
    eventTypeCounts: input.eventTypeCounts,
    sentLikeRecipientCount,
    failedRecipientCount,
    lastEventAt: input.lastEventAt,
    latestFailureSummary: input.latestFailureSummary,
    linkClickEventCount: input.linkClickEventCount,
  };
}

function buildDeliveryHealthProblems(
  c: Partial<Record<CommsDeliveryHealthStatus, number>>
): CommunicationPlanDeliveryHealthProblems {
  return {
    suppressed: c.SUPPRESSED ?? 0,
    unsubscribed: c.UNSUBSCRIBED ?? 0,
    invalidEmail: c.INVALID_EMAIL ?? 0,
    invalidPhone: c.INVALID_PHONE ?? 0,
    hardBounced: c.HARD_BOUNCED ?? 0,
    smsOptOut: c.SMS_OPT_OUT ?? 0,
    unknown: c.UNKNOWN ?? 0,
  };
}

export function buildCommunicationPlanEngagementSummary(input: {
  communicationPlanId: string;
  totalRecipientRows: number;
  totalSendsWithRecipients: number;
  countByStatus: Partial<Record<CommunicationRecipientStatus, number>>;
  countByDeliveryHealth: Partial<Record<CommsDeliveryHealthStatus, number>>;
  eventTypeCounts: CommunicationRecipientEventTypeCounts;
  lastEventAt: string | null;
  lastFailureEventAt: string | null;
  recipientRowsByChannel: Partial<Record<import("@prisma/client").CommsWorkbenchChannel, number>>;
}): CommunicationPlanEngagementSummary {
  const sentLikeRecipientCount = sumPartial(SENT_LIKE, input.countByStatus);
  const failedRecipientCount = sumPartial(FAILED_RECIPIENT, input.countByStatus);
  return {
    communicationPlanId: input.communicationPlanId,
    totalRecipientRows: input.totalRecipientRows,
    totalSendsWithRecipients: input.totalSendsWithRecipients,
    countByStatus: input.countByStatus,
    countByDeliveryHealth: input.countByDeliveryHealth,
    eventTypeCounts: input.eventTypeCounts,
    sentLikeRecipientCount,
    failedRecipientCount,
    latestRecipientActivityAt: input.lastEventAt,
    latestRecipientFailureAt: input.lastFailureEventAt,
    recipientRowsByChannel: input.recipientRowsByChannel,
    deliveryHealthProblems: buildDeliveryHealthProblems(input.countByDeliveryHealth),
  };
}

export function mapRuleDefinitionToView(ruleDefinitionJson: Prisma.JsonValue): CommsPlanAudienceSegmentRuleView {
  if (!isRecord(ruleDefinitionJson)) {
    return { keys: [], previewJson: null };
  }
  const o = ruleDefinitionJson as Record<string, unknown>;
  return {
    version: typeof o.version === "string" ? o.version : undefined,
    keys: Object.keys(o),
    previewJson: o,
  };
}

export function mapCommunicationRecipientListItem(
  r: {
    id: string;
    communicationSendId: string;
    channel: import("@prisma/client").CommsWorkbenchChannel;
    addressUsed: string;
    status: import("@prisma/client").CommunicationRecipientStatus;
    deliveryHealthStatus: CommsDeliveryHealthStatus;
    targetSegmentId: string | null;
    targetSegmentLabel: string | null;
    userId: string | null;
    user: { id: string; name: string | null; email: string; phone: string | null } | null;
    volunteerProfileId: string | null;
    volunteerProfile: {
      id: string;
      user: { id: string; name: string | null; email: string; phone: string | null };
    } | null;
    communicationThreadId: string | null;
    thread: { id: string; primaryEmail: string | null; primaryPhone: string | null } | null;
    crmContactKey: string | null;
    createdAt: Date;
    updatedAt: Date;
  },
  eventRollup: {
    eventTypeCounts: CommunicationRecipientEventTypeCounts;
    latest: { at: string; type: CommunicationRecipientEventType } | null;
  }
): CommunicationRecipientListItem {
  const identity = mapCommunicationRecipientIdentitySummary(r);
  return {
    id: r.id,
    communicationSendId: r.communicationSendId,
    channel: r.channel,
    addressUsed: r.addressUsed,
    status: r.status,
    deliveryHealthStatus: r.deliveryHealthStatus,
    targetSegmentId: r.targetSegmentId,
    targetSegmentLabel: r.targetSegmentLabel,
    identity,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    latestEventType: eventRollup.latest?.type ?? null,
    latestEventAt: eventRollup.latest?.at ?? null,
    latestEventSummary: null,
    eventTypeCounts: eventRollup.eventTypeCounts,
  };
}

/**
 * Fills `latestEventSummary` when latest event is known (caller fetches one event for label).
 */
export function attachLatestEventSummary(
  item: CommunicationRecipientListItem,
  ev: { eventType: CommunicationRecipientEventType; providerName: string | null; linkLabel: string | null; linkUrl: string | null } | null
): CommunicationRecipientListItem {
  if (!ev) return item;
  return {
    ...item,
    latestEventSummary: formatRecipientEventSummaryLine({
      eventType: ev.eventType,
      providerName: ev.providerName,
      linkLabel: ev.linkLabel,
      linkUrl: ev.linkUrl,
    }),
  };
}

export function mapCommunicationRecipientEventListItem(
  e: {
    id: string;
    communicationRecipientId: string;
    eventType: CommunicationRecipientEventType;
    occurredAt: Date;
    providerName: string | null;
    providerEventId: string | null;
    linkUrl: string | null;
    linkLabel: string | null;
    metadataJson: Prisma.JsonValue;
  }
): CommunicationRecipientEventListItem {
  const hasStructuredMetadata =
    isRecord(e.metadataJson) && Object.keys(e.metadataJson as object).length > 0;
  return {
    id: e.id,
    communicationRecipientId: e.communicationRecipientId,
    eventType: e.eventType,
    occurredAt: e.occurredAt.toISOString(),
    providerName: e.providerName,
    providerEventId: e.providerEventId,
    linkUrl: e.linkUrl,
    linkLabel: e.linkLabel,
    summaryLine: formatRecipientEventSummaryLine({
      eventType: e.eventType,
      providerName: e.providerName,
      linkLabel: e.linkLabel,
      linkUrl: e.linkUrl,
    }),
    hasStructuredMetadata,
  };
}

function memberIdentityFromMemberRow(m: {
  userId: string | null;
  user: { id: string; name: string | null; email: string; phone: string | null } | null;
  volunteerProfileId: string | null;
  segmentVolunteerProfile: { id: string; user: { id: string; name: string | null; email: string; phone: string | null } } | null;
  crmContactKey: string | null;
}): CommunicationRecipientIdentitySummary {
  if (m.user) {
    return mapCommunicationRecipientIdentitySummary({
      addressUsed: "",
      userId: m.userId,
      user: m.user,
      volunteerProfileId: null,
      volunteerProfile: null,
      communicationThreadId: null,
      thread: null,
      crmContactKey: null,
    });
  }
  if (m.segmentVolunteerProfile) {
    return mapCommunicationRecipientIdentitySummary({
      addressUsed: "",
      userId: null,
      user: null,
      volunteerProfileId: m.volunteerProfileId,
      volunteerProfile: m.segmentVolunteerProfile,
      communicationThreadId: null,
      thread: null,
      crmContactKey: null,
    });
  }
  if (m.crmContactKey?.trim()) {
    return mapCommunicationRecipientIdentitySummary({
      addressUsed: "",
      userId: null,
      user: null,
      volunteerProfileId: null,
      volunteerProfile: null,
      communicationThreadId: null,
      thread: null,
      crmContactKey: m.crmContactKey,
    });
  }
  return {
    identityType: "UNRESOLVED",
    identityId: null,
    nameLabel: null,
    emailLabel: null,
    phoneLabel: null,
    subtitle: "Segment member",
    displayLabel: "Unspecified member",
  };
}

export function mapCommsPlanAudienceSegmentListItem(
  s: {
    id: string;
    communicationPlanId: string;
    name: string;
    description: string | null;
    segmentType: import("@prisma/client").CommsPlanAudienceSegmentType;
    status: import("@prisma/client").CommsPlanAudienceSegmentStatus;
    isDynamic: boolean;
    _count: { members: number };
    createdBy: Parameters<typeof mapCommunicationUserSummary>[0];
    updatedBy: Parameters<typeof mapCommunicationUserSummary>[0];
    createdAt: Date;
    updatedAt: Date;
  }
): CommsPlanAudienceSegmentListItem {
  const isDynamic = s.isDynamic;
  const staticCount = s._count.members;
  return {
    id: s.id,
    communicationPlanId: s.communicationPlanId,
    name: s.name,
    description: s.description,
    segmentType: s.segmentType,
    status: s.status,
    isDynamic,
    memberCount: isDynamic ? null : staticCount,
    memberCountNote: isDynamic ? "DYNAMIC_UNEVALUATED" : "STORED",
    isManualMembershipAllowed:
      s.status === "ACTIVE" && !isDynamic && s.segmentType === "STATIC",
    createdBy: mapCommunicationUserSummary(s.createdBy),
    updatedBy: mapCommunicationUserSummary(s.updatedBy),
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

export function mapCommsPlanAudienceSegmentMemberListItem(
  m: {
    id: string;
    comsPlanAudienceSegmentId: string;
    sourceType: import("@prisma/client").CommsPlanAudienceSegmentMemberSource;
    addedByUser: Parameters<typeof mapCommunicationUserSummary>[0];
    createdAt: Date;
    userId: string | null;
    user: { id: string; name: string | null; email: string; phone: string | null } | null;
    volunteerProfileId: string | null;
    segmentVolunteerProfile: { id: string; user: { id: string; name: string | null; email: string; phone: string | null } } | null;
    crmContactKey: string | null;
  }
): CommsPlanAudienceSegmentMemberListItem {
  return {
    id: m.id,
    comsPlanAudienceSegmentId: m.comsPlanAudienceSegmentId,
    sourceType: m.sourceType,
    addedBy: mapCommunicationUserSummary(m.addedByUser),
    createdAt: m.createdAt.toISOString(),
    identity: memberIdentityFromMemberRow(m),
  };
}

/**
 * Picks a dominant delivery health for contact summary (worst first heuristic).
 */
export function pickDeliveryHealthSnapshot(
  healths: CommsDeliveryHealthStatus[]
): CommsDeliveryHealthStatus | "MIXED" | "UNKNOWN" {
  if (healths.length === 0) return "UNKNOWN";
  const u = new Set(healths);
  if (u.size === 1) return healths[0]!;
  if ([...u].some((h) => h === "HARD_BOUNCED" || h === "INVALID_EMAIL" || h === "UNSUBSCRIBED")) {
    return "MIXED";
  }
  return "MIXED";
}

function mergeCounts<K extends string>(a: Partial<Record<K, number>>, b: Partial<Record<K, number>>): Partial<Record<K, number>> {
  const o = { ...a };
  for (const k of Object.keys(b) as K[]) {
    o[k] = (o[k] ?? 0) + (b[k] ?? 0);
  }
  return o;
}

export function buildContactEngagementSummary(input: {
  query: {
    userId: string | null;
    volunteerProfileId: string | null;
    communicationThreadId: string | null;
    crmContactKey: string | null;
  };
  primaryIdentity: CommunicationRecipientIdentitySummary;
  totalRecipientRows: number;
  countByStatus: Partial<Record<CommunicationRecipientStatus, number>>;
  countByDeliveryHealth: Partial<Record<CommsDeliveryHealthStatus, number>>;
  eventTypeCounts: CommunicationRecipientEventTypeCounts;
  latestRecipientActivityAt: string | null;
  lastFailureSummary: string | null;
  recentSends: import("./dto").ContactEngagementRecentSend[];
  segmentMemberships: { segmentId: string; segmentName: string; planId: string; planTitle: string }[];
  allHealth: CommsDeliveryHealthStatus[];
}): ContactEngagementSummary {
  return {
    query: input.query,
    identity: input.primaryIdentity,
    totalRecipientRows: input.totalRecipientRows,
    countByStatus: input.countByStatus,
    countByDeliveryHealth: input.countByDeliveryHealth,
    eventTypeCounts: input.eventTypeCounts,
    latestRecipientActivityAt: input.latestRecipientActivityAt,
    lastFailureSummary: input.lastFailureSummary,
    recentSends: input.recentSends,
    segmentMemberships: input.segmentMemberships,
    deliveryHealthSnapshot: pickDeliveryHealthSnapshot(input.allHealth),
  };
}

export function mapCommunicationRecipientDetail(
  r: {
    id: string;
    communicationSendId: string;
    channel: import("@prisma/client").CommsWorkbenchChannel;
    addressUsed: string;
    status: import("@prisma/client").CommunicationRecipientStatus;
    deliveryHealthStatus: CommsDeliveryHealthStatus;
    targetSegmentId: string | null;
    targetSegmentLabel: string | null;
    crmContactKey: string | null;
    providerRecipientId: string | null;
    comsPlanAudienceSegmentId: string | null;
    comsPlanAudienceSegment: { name: string } | null;
    userId: string | null;
    user: { id: string; name: string | null; email: string; phone: string | null } | null;
    volunteerProfileId: string | null;
    volunteerProfile: {
      id: string;
      user: { id: string; name: string | null; email: string; phone: string | null };
    } | null;
    communicationThreadId: string | null;
    thread: { id: string; primaryEmail: string | null; primaryPhone: string | null } | null;
    createdAt: Date;
    updatedAt: Date;
    send: { status: import("@prisma/client").CommunicationSendStatus; plan: { id: string; title: string } };
    events: {
      id: string;
      communicationRecipientId: string;
      eventType: CommunicationRecipientEventType;
      occurredAt: Date;
      providerName: string | null;
      providerEventId: string | null;
      linkUrl: string | null;
      linkLabel: string | null;
      metadataJson: Prisma.JsonValue;
    }[];
  }
): CommunicationRecipientDetail {
  const identity = mapCommunicationRecipientIdentitySummary(r);
  const mappedEvents = r.events.map(mapCommunicationRecipientEventListItem);
  const lastEv = r.events.length
    ? r.events.reduce((a, b) => (a.occurredAt >= b.occurredAt ? a : b))
    : null;
  const linkClickCount = r.events.filter((e) => e.eventType === "CLICKED" && (e.linkUrl || e.linkLabel)).length;
  const failEv = r.events
    .filter((e) => EVENT_FAILURE_TYPES.includes(e.eventType))
    .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())[0];
  return {
    id: r.id,
    communicationSendId: r.communicationSendId,
    communicationPlanId: r.send.plan.id,
    planTitle: r.send.plan.title,
    sendStatus: r.send.status,
    channel: r.channel,
    addressUsed: r.addressUsed,
    status: r.status,
    deliveryHealthStatus: r.deliveryHealthStatus,
    targetSegmentId: r.targetSegmentId,
    targetSegmentLabel: r.targetSegmentLabel,
    crmContactKey: r.crmContactKey,
    providerRecipientId: r.providerRecipientId,
    comsPlanAudienceSegmentId: r.comsPlanAudienceSegmentId,
    segmentName: r.comsPlanAudienceSegment?.name ?? null,
    identity,
    events: mappedEvents,
    eventsLastAt: lastEv ? lastEv.occurredAt.toISOString() : null,
    linkClickCount,
    lastFailureEventSummary: failEv
      ? formatRecipientEventSummaryLine({
          eventType: failEv.eventType,
          providerName: failEv.providerName,
          linkLabel: failEv.linkLabel,
          linkUrl: failEv.linkUrl,
        })
      : null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export { mergeCounts, sumPartial, SENT_LIKE, FAILED_RECIPIENT, EVENT_FAILURE_TYPES };
