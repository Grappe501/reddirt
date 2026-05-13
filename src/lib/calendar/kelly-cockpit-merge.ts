import type { KellyCalendarDecision, LocalCoverageRequest, KellyCockpitDecisionKind } from "@prisma/client";
import { approvalPriorityScore, buildApprovalContext } from "./build-approval-context";
import type { CampaignCalendarItem, CountyPrioritySnapshotRow } from "./campaign-calendar-item";
import { resolveApprovalContextHints } from "./kelly-approval-hints";
import { loadCountyPrioritySnapshot, loadCountyTouchMap } from "./load-travel-calendar-data";
import type {
  CalendarAlertDto,
  EnrichedCalendarItem,
  KellyApprovalState,
  KellyCalendarDecisionDto,
  KellyEventCardBadge,
} from "./kelly-cockpit-types";

const TZ = "America/Chicago";

function toIso(d: Date): string {
  return d.toISOString();
}

function mapDecisionToState(d: KellyCockpitDecisionKind): KellyApprovalState {
  switch (d) {
    case "APPROVE":
      return "kelly_approved";
    case "MODIFY":
      return "kelly_requested_changes";
    case "SEND_LOCAL":
      return "kelly_requested_local";
    case "HOLD":
      return "kelly_hold";
    case "REJECT":
      return "kelly_declined";
    case "ASK_STAFF":
      return "staff_follow_up";
    default:
      return "not_requested";
  }
}

function decisionDto(row: KellyCalendarDecision): KellyCalendarDecisionDto {
  return {
    id: row.id,
    calendarItemId: row.calendarItemId,
    campaignEventId: row.campaignEventId,
    decision: row.decision as KellyCalendarDecisionDto["decision"],
    decidedByUserId: row.decidedByUserId,
    decidedAt: toIso(row.createdAt),
    notes: row.notes,
    requestedDateChange: row.requestedDateChange ? toIso(row.requestedDateChange) : null,
    requestedTimeChange: row.requestedTimeChange,
    requestedLocationChange: row.requestedLocationChange,
    requestedSurrogateType: row.requestedSurrogateType,
    requestedSurrogateId: row.requestedSurrogateId,
    staffFollowUpRequired: row.staffFollowUpRequired,
  };
}

export function deriveKellyApprovalState(
  item: CampaignCalendarItem,
  latest: KellyCalendarDecision | null,
  promoted: boolean,
  openLocal: boolean,
): KellyApprovalState {
  if (promoted) return "promoted_to_campaign_event";
  if (!latest) {
    if (item.calendarStatus === "declined") return "kelly_declined";
    if (
      item.calendarStatus === "tentative" ||
      item.calendarStatus === "recommended" ||
      item.calendarStatus === "needs_verification" ||
      item.calendarStatus === "conflict"
    ) {
      return "needs_kelly_review";
    }
    if (item.calendarStatus === "confirmed") return "not_requested";
    return "not_requested";
  }
  if (latest.decision === "APPROVE") return "kelly_approved";
  if (latest.decision === "SEND_LOCAL" || openLocal) return "kelly_requested_local";
  if (latest.staffFollowUpRequired || latest.decision === "ASK_STAFF") return "staff_follow_up";
  return mapDecisionToState(latest.decision);
}

export function deriveCardBadge(
  item: CampaignCalendarItem,
  state: KellyApprovalState,
  openLocal: boolean,
): KellyEventCardBadge {
  if (state === "promoted_to_campaign_event") return "approved";
  if (item.calendarStatus === "conflict") return "conflict";
  if (openLocal || state === "kelly_requested_local") return "send_local";
  if (state === "staff_follow_up") return "staff_follow_up";
  if (state === "needs_kelly_review") {
    if (item.calendarStatus === "needs_verification") return "needs_staff_follow_up";
    return "needs_approval";
  }
  if (state === "kelly_approved" || state === "ready_for_calendar_hq") return "approved";
  if (state === "kelly_hold") return "tentative";
  if (state === "kelly_declined") return "tentative";
  if (item.calendarStatus === "confirmed") return "confirmed";
  if (item.calendarStatus === "tentative" || item.calendarStatus === "recommended") return "tentative";
  return "needs_approval";
}

/** Lower = higher priority in approval queue (uses deterministic travel/work/conflict context). */
export function approvalQueueSortKey(
  item: EnrichedCalendarItem,
  allItems: CampaignCalendarItem[],
  priorities: CountyPrioritySnapshotRow[],
  touchMap: Map<string, { touches: number; lastYmd: string }>,
): number {
  return approvalPriorityScore(
    item,
    buildApprovalContext(item, allItems, resolveApprovalContextHints(item, priorities, touchMap)),
  );
}

export function mergeKellyCockpitData(
  items: CampaignCalendarItem[],
  decisions: KellyCalendarDecision[],
  localByItem: Map<string, LocalCoverageRequest[]>,
  promotedIds: Set<string>,
): EnrichedCalendarItem[] {
  const priorities = loadCountyPrioritySnapshot();
  const touchMap = loadCountyTouchMap();
  const byItem = new Map<string, KellyCalendarDecision[]>();
  for (const d of decisions) {
    const arr = byItem.get(d.calendarItemId) ?? [];
    arr.push(d);
    byItem.set(d.calendarItemId, arr);
  }
  for (const arr of byItem.values()) {
    arr.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  return items.map((item) => {
    const chain = byItem.get(item.id) ?? [];
    const latest = chain[0] ?? null;
    const openLocal = (localByItem.get(item.id) ?? []).some((r) => r.status === "NEEDS_STAFF_FOLLOW_UP");
    const promoted = promotedIds.has(item.id);
    const kellyApprovalState = deriveKellyApprovalState(item, latest, promoted, openLocal);
    const cardBadge = deriveCardBadge(item, kellyApprovalState, openLocal);
    const enriched: EnrichedCalendarItem = {
      ...item,
      kellyApprovalState,
      cardBadge,
      sortKey: 0,
      latestDecision: latest ? decisionDto(latest) : null,
      hasOpenLocalCoverage: openLocal,
    };
    enriched.sortKey = approvalQueueSortKey(enriched, items, priorities, touchMap);
    return enriched;
  });
}

export function sortApprovalQueue(items: EnrichedCalendarItem[]): EnrichedCalendarItem[] {
  return [...items].sort((a, b) => a.sortKey - b.sortKey || a.start.localeCompare(b.start));
}

export function alertsToDto(rows: { id: string; calendarItemId: string; severity: string; title: string; body: string; status: string; dueAt: Date | null; channel: string }[]): CalendarAlertDto[] {
  return rows.map((r) => ({
    id: r.id,
    calendarItemId: r.calendarItemId,
    severity: r.severity,
    title: r.title,
    body: r.body,
    status: r.status,
    dueAt: r.dueAt ? toIso(r.dueAt) : null,
    channel: r.channel,
  }));
}

export function todayTomorrowWeekKeys(): { todayYmd: string; tomorrowYmd: string; weekEndYmd: string } {
  const now = new Date();
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
  const todayYmd = fmt(now);
  const t2 = new Date(now.getTime() + 86400000);
  const tomorrowYmd = fmt(t2);
  const w7 = new Date(now.getTime() + 7 * 86400000);
  return { todayYmd, tomorrowYmd, weekEndYmd: fmt(w7) };
}
