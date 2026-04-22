import {
  CampaignEvent,
  CalendarSource,
  CalendarSourceType,
  CampaignEventStatus,
  EventWorkflowState,
} from "@prisma/client";

function hasRefreshToken(s: CalendarSource) {
  const o = (s.oauthJson ?? {}) as { refresh_token?: string };
  return Boolean(o.refresh_token);
}

const poolReady = (sources: CalendarSource[]) =>
  sources.filter((s) => s.isActive && s.syncEnabled && s.provider === "GOOGLE" && hasRefreshToken(s));

function pickPublicRail(pool: CalendarSource[]) {
  return (
    pool.find((s) => s.isPublicFacing && s.sourceType === CalendarSourceType.CANDIDATE_PUBLIC_APPEARANCES) ||
    pool.find((s) => s.isPublicFacing && s.sourceType === CalendarSourceType.CAMPAIGN_MASTER) ||
    pool.find((s) => s.isPublicFacing) ||
    null
  );
}

function pickInternalPlanning(pool: CalendarSource[]) {
  return (
    pool.find((s) => !s.isPublicFacing && s.sourceType === CalendarSourceType.INTERNAL_STAFF_PLANNING) ||
    pool.find((s) => !s.isPublicFacing && s.sourceType === CalendarSourceType.TRAVEL_LOGISTICS) ||
    pool.find((s) => !s.isPublicFacing) ||
    null
  );
}

function pickApprovedInternal(pool: CalendarSource[]) {
  return (
    pool.find((s) => !s.isPublicFacing && s.sourceType === CalendarSourceType.TRAVEL_LOGISTICS) ||
    pool.find((s) => !s.isPublicFacing && s.sourceType === CalendarSourceType.INTERNAL_STAFF_PLANNING) ||
    pool.find((s) => !s.isPublicFacing && s.sourceType === CalendarSourceType.CONTENT_MEDIA) ||
    pickInternalPlanning(pool)
  );
}

/**
 * Picks the Google `CalendarSource` for the next **outbound** write. CampaignOS governs; Google mirrors.
 */
export function selectOutboundCalendarSource(
  event: Pick<
    CampaignEvent,
    "eventWorkflowState" | "isPublicOnWebsite" | "status" | "calendarSourceId" | "ownerUserId"
  >,
  sources: CalendarSource[]
): CalendarSource | null {
  const pool = poolReady(sources);
  if (pool.length === 0) return null;

  if (event.status === CampaignEventStatus.CANCELLED || event.eventWorkflowState === EventWorkflowState.CANCELED) {
    return (event.calendarSourceId ? pool.find((s) => s.id === event.calendarSourceId) : null) ?? pool[0] ?? null;
  }

  if (event.eventWorkflowState === EventWorkflowState.PUBLISHED && event.isPublicOnWebsite) {
    return pickPublicRail(pool) ?? pickInternalPlanning(pool);
  }

  if (
    event.eventWorkflowState === EventWorkflowState.DRAFT ||
    event.eventWorkflowState === EventWorkflowState.PENDING_APPROVAL
  ) {
    return pickInternalPlanning(pool);
  }

  if (event.eventWorkflowState === EventWorkflowState.APPROVED) {
    return pickApprovedInternal(pool);
  }

  if (event.eventWorkflowState === EventWorkflowState.PUBLISHED) {
    return pickInternalPlanning(pool);
  }

  if (event.eventWorkflowState === EventWorkflowState.COMPLETED) {
    return (event.calendarSourceId ? pool.find((s) => s.id === event.calendarSourceId) : null) ?? pool[0] ?? null;
  }

  return pickInternalPlanning(pool);
}
