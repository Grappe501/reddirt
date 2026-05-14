import { formatInTimeZone } from "date-fns-tz";

import type { CountyPrioritySnapshotRow } from "@/lib/calendar/campaign-calendar-item";
import type {
  DecisionTonightItem,
  DaySegmentPreview,
  RouteComparisonOption,
  RouteComparisonThree,
  SettlementSnapshot,
} from "@/lib/calendar/schedule-settlement-types";
import type { EnrichedCalendarItem } from "@/lib/calendar/kelly-cockpit-types";
import { getChicagoWeekRange } from "@/lib/calendar/week-view-range";
import type { CommunityOpportunity, WeekendRoutePlan } from "@/lib/opportunities/community-opportunity-types";

const TZ = "America/Chicago";

function ymd(iso: string): string {
  return formatInTimeZone(new Date(iso), TZ, "yyyy-MM-dd");
}

function itemMs(iso: string): number {
  return new Date(iso).getTime();
}

export function filterItemsInChicagoWeek(items: EnrichedCalendarItem[], anchorYmd?: string): EnrichedCalendarItem[] {
  const wr = getChicagoWeekRange(anchorYmd);
  const a = new Date(wr.startIso).getTime();
  const b = new Date(wr.endExclusiveIso).getTime();
  return items.filter((it) => {
    const t = itemMs(it.start);
    return t >= a && t < b;
  });
}

export function filterItemsNextDays(items: EnrichedCalendarItem[], todayYmd: string, days: number): EnrichedCalendarItem[] {
  const start = new Date(`${todayYmd}T00:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + days);
  const endMs = end.getTime();
  return items.filter((it) => {
    const t = itemMs(it.start);
    return t >= start.getTime() && t < endMs;
  });
}

export function buildSettlementSnapshot(
  itemsThisWeek: EnrichedCalendarItem[],
  horizonItems: EnrichedCalendarItem[],
): SettlementSnapshot {
  const confirmedThisWeek = itemsThisWeek.filter((i) => i.calendarStatus === "confirmed").length;
  const tentativeThisWeek = itemsThisWeek.filter((i) =>
    ["tentative", "needs_verification", "recommended"].includes(i.calendarStatus),
  ).length;
  const travelBlocksThisWeek = itemsThisWeek.filter((i) => i.eventType === "travel").length;
  const overnightsThisWeek = itemsThisWeek.filter((i) => i.eventType === "overnight" || i.overnightRequired).length;
  const conflictsThisWeek = itemsThisWeek.filter((i) => i.calendarStatus === "conflict").length;
  const workExceptionsThisWeek = itemsThisWeek.filter((i) => Boolean(i.drillDown?.plannedTuesdayWorkException)).length;

  let googleSyncedApprox = 0;
  let googleNeedsAttentionApprox = 0;
  for (const it of horizonItems) {
    const g = it.kellyGoogle;
    if (!g?.googleEventId) continue;
    if (g.googleSyncState === "SYNCED") googleSyncedApprox++;
    else if (g.syncReviewNeeded || g.googleSyncState === "CONFLICT" || g.googleSyncState === "ERROR") {
      googleNeedsAttentionApprox++;
    }
  }

  const pendingDecisionsApprox = buildSettlementApprovalQueue(horizonItems, 14).length;

  return {
    confirmedThisWeek,
    tentativeThisWeek,
    travelBlocksThisWeek,
    overnightsThisWeek,
    conflictsThisWeek,
    workExceptionsThisWeek,
    googleSyncedApprox,
    googleNeedsAttentionApprox,
    pendingDecisionsApprox,
  };
}

/** Prioritized queue: conflicts → next-14d → tentative/route-affecting → high county value — capped. */
export function buildSettlementApprovalQueue(items: EnrichedCalendarItem[], horizonDays: number): EnrichedCalendarItem[] {
  const now = Date.now();
  const horizonMs = horizonDays * 86400000;
  const pool = items.filter((it) => {
    const t = itemMs(it.start);
    if (t < now - 86400000) return false;
    if (t > now + horizonMs) return false;
    if (it.calendarStatus === "conflict") return true;
    if (it.kellyApprovalState === "needs_kelly_review") return true;
    if (it.cardBadge === "send_local") return true;
    if (it.calendarStatus === "confirmed" && (it.cardBadge === "needs_staff_follow_up" || it.kellyGoogle?.syncReviewNeeded)) {
      return true;
    }
    return false;
  });

  const score = (it: EnrichedCalendarItem) => {
    let s = 0;
    if (it.calendarStatus === "conflict") s += 5000;
    const hours = (itemMs(it.start) - now) / 3600000;
    if (hours >= 0 && hours <= 336) s += 500 - hours; // 14d
    if (it.kellyApprovalState === "needs_kelly_review") s += 200;
    if (it.eventType === "travel" || it.eventType === "overnight") s += 80;
    if (it.cardBadge === "send_local") s += 120;
    return s;
  };

  return [...pool].sort((a, b) => score(b) - score(a) || a.start.localeCompare(b.start)).slice(0, 25);
}

export function buildDecisionTonightList(args: {
  enriched: EnrichedCalendarItem[];
  weekendPlans: WeekendRoutePlan[];
  opportunities: CommunityOpportunity[];
  todayYmd: string;
}): DecisionTonightItem[] {
  const { enriched, weekendPlans, opportunities, todayYmd } = args;
  const items: DecisionTonightItem[] = [];

  items.push({ id: "dec-week-route", label: "Approve this week route (Mon–Sun)?", kind: "week" });
  items.push({ id: "dec-weekend-route", label: "Approve this weekend route cluster?", kind: "weekend" });
  items.push({ id: "dec-greene-jun8", label: "Confirm Greene June 8 plan?", kind: "county", targetId: "Greene" });
  items.push({ id: "dec-clark-ark-jun6", label: "Confirm Clark / Arkadelphia June 6–7 plan?", kind: "county", targetId: "Clark" });
  items.push({ id: "dec-prescott-may18", label: "Confirm Prescott May 18–19 arc?", kind: "county", targetId: "Nevada" });

  const fairCalls = opportunities
    .filter((o) => o.type === "county_fair" || o.type === "festival")
    .filter((o) => o.verificationStatus === "needs_confirmation" || o.verificationStatus === "date_not_posted")
    .slice(0, 4);
  for (const o of fairCalls) {
    items.push({
      id: `dec-fair-${o.id}`,
      label: `Staff call: ${o.county} — ${o.title}`,
      hint: o.verificationStatus,
      kind: "fair",
      targetId: o.id,
    });
  }

  const sendLocal = enriched.filter((i) => i.cardBadge === "send_local").slice(0, 4);
  for (const it of sendLocal) {
    items.push({
      id: `dec-sl-${it.id}`,
      label: `Send local for “${it.title.slice(0, 48)}${it.title.length > 48 ? "…" : ""}”?`,
      kind: "event",
      targetId: it.id,
    });
  }

  const conflicts = enriched.filter((i) => i.calendarStatus === "conflict" && ymd(i.start) >= todayYmd).slice(0, 3);
  for (const it of conflicts) {
    items.push({
      id: `dec-conf-${it.id}`,
      label: `Resolve calendar conflict: ${it.title.slice(0, 40)}`,
      hint: ymd(it.start),
      kind: "event",
      targetId: it.id,
    });
  }

  if (weekendPlans[0]) {
    items.unshift({
      id: `dec-plan-${weekendPlans[0].id}`,
      label: `Primary weekend plan: ${weekendPlans[0].title}`,
      hint: `${weekendPlans[0].countiesTouched} counties · ${weekendPlans[0].routeTightness.replace(/_/g, " ")}`,
      kind: "route",
      targetId: weekendPlans[0].id,
    });
  }

  return items.slice(0, 22);
}

function oppTitle(id: string, opps: Map<string, CommunityOpportunity>): string {
  return opps.get(id)?.title ?? id;
}

function planToOption(
  plan: WeekendRoutePlan,
  label: string,
  opps: Map<string, CommunityOpportunity>,
  weekConflictCount: number,
  aiLine: string,
): RouteComparisonOption {
  const titles = plan.opportunities.slice(0, 6).map((s) => oppTitle(s.opportunityId, opps));
  return {
    id: plan.id,
    label,
    counties: plan.countiesCovered.slice(0, 14),
    eventTitles: titles.length ? titles : [plan.title],
    driveMinutes: plan.totalDriveMinutes,
    driveMiles: plan.totalDriveMiles,
    overnights: plan.overnightStops.map((o) => `${o.city} (${o.night})`),
    conflicts: weekConflictCount,
    riskLabel: plan.routeTightness.replace(/_/g, " "),
    aiRecommendation: plan.aiSummary?.slice(0, 160) ?? aiLine,
  };
}

export function buildRouteComparisonThree(args: {
  plans: WeekendRoutePlan[];
  opportunities: CommunityOpportunity[];
  weekConflictCount: number;
}): RouteComparisonThree {
  const { plans, opportunities, weekConflictCount } = args;
  const opps = new Map(opportunities.map((o) => [o.id, o]));

  if (plans.length === 0) {
    const empty: RouteComparisonOption = {
      id: "none",
      label: "No weekend route file rows",
      counties: [],
      eventTitles: [],
      driveMinutes: null,
      driveMiles: null,
      overnights: [],
      conflicts: weekConflictCount,
      riskLabel: "unknown",
      aiRecommendation: "Load weekend-route-plans JSON or run the weekend cluster script.",
    };
    return { optionA: empty, optionB: { ...empty, id: "none-b", label: "Option B (placeholder)" }, optionC: { ...empty, id: "none-c", label: "Option C (placeholder)" } };
  }

  const byCounties = [...plans].sort((a, b) => b.countiesTouched - a.countiesTouched);
  const byMiles = [...plans].sort((a, b) => a.totalDriveMiles - b.totalDriveMiles);
  const byMust = [...plans].sort((a, b) => b.mustAttendCount - a.mustAttendCount);

  const a = byCounties[0]!;
  const b = byMiles[0]!;
  const c = byMust.find((p) => p.id !== a.id && p.id !== b.id) ?? byMust[0]!;

  return {
    optionA: planToOption(a, "Option A — most counties", opps, weekConflictCount, "Heavier county coverage — watch drive tightness."),
    optionB: planToOption(b, "Option B — lowest drive load", opps, weekConflictCount, "Minimizes windshield time if the week is already dense."),
    optionC: planToOption(c, "Option C — must-attend / strategic", opps, weekConflictCount, "Prioritizes locked-in events and persuasion venues."),
  };
}

export function buildDaySegmentPreviews(): DaySegmentPreview[] {
  return [
    { segment: "morning", bufferMinutes: 25, notes: "Gas / restroom + parking scout" },
    { segment: "lunch", bufferMinutes: 35, notes: "Meal + handshakes / photos buffer" },
    { segment: "afternoon", bufferMinutes: 20, notes: "Rural / late-start buffer" },
    { segment: "evening", bufferMinutes: 25, notes: "Venue close-out + travel to hotel" },
    { segment: "travel", bufferMinutes: 30, notes: "Inter-county legs — add getting-lost buffer in rural counties" },
    { segment: "overnight", bufferMinutes: 45, notes: "Check-in, bags, next-day prep" },
  ];
}

export function buildRecommendedWeekRouteSummary(args: {
  weekItems: EnrichedCalendarItem[];
  priorities: CountyPrioritySnapshotRow[];
}): {
  title: string;
  counties: string[];
  eventCount: number;
  estDriveMinutes: number;
  estDriveMiles: number;
  overnightCities: string[];
  workExceptions: number;
  risk: string;
  staffLine: string;
} {
  const { weekItems, priorities } = args;
  const counties = [...new Set(weekItems.map((i) => i.county).filter(Boolean))] as string[];
  const priMap = new Map(priorities.map((p) => [p.county, p.priorityScore ?? 0]));
  const score = counties.reduce((acc, c) => acc + (priMap.get(c) ?? 0), 0);
  const overnightCities = [...new Set(weekItems.filter((i) => i.overnightCity).map((i) => i.overnightCity!))];
  const workExceptions = weekItems.filter((i) => i.drillDown?.plannedTuesdayWorkException).length;
  const conflicts = weekItems.filter((i) => i.calendarStatus === "conflict").length;
  const estMiles = Math.min(1200, Math.round(counties.length * 72 + weekItems.length * 12));
  const estMin = Math.round(estMiles * 1.15);
  let risk = "comfortable";
  if (weekItems.length > 22 || conflicts > 0) risk = "busy_but_safe";
  if (weekItems.length > 34 || conflicts > 1) risk = "too_tight";

  return {
    title: "Recommended week envelope (workbook + cockpit merge)",
    counties: counties.slice(0, 18),
    eventCount: weekItems.length,
    estDriveMinutes: estMin,
    estDriveMiles: estMiles,
    overnightCities,
    workExceptions,
    risk,
    staffLine:
      conflicts > 0
        ? "Resolve conflicts before locking the week."
        : score > 40
          ? "High county-value week — protect overnight buffers."
          : "Route looks workable — confirm weekend cluster alignment.",
  };
}

export function opportunityFilterForSettlement(opportunities: CommunityOpportunity[], todayYmd: string, max = 15): CommunityOpportunity[] {
  const t0 = new Date(`${todayYmd}T00:00:00`).getTime();
  const t1 = t0 + 30 * 86400000;
  const rank = (o: CommunityOpportunity) => {
    let s = o.score?.total ?? 0;
    if (o.campaignValue === "must_attend") s += 80;
    if (o.campaignValue === "high_value") s += 40;
    if (o.campaignValue === "send_local") s += 25;
    if (o.verificationStatus === "needs_confirmation") s += 15;
    return s;
  };

  return opportunities
    .filter((o) => {
      if (!o.startAt) return false;
      const t = new Date(o.startAt).getTime();
      if (t < t0 || t > t1) return false;
      if (o.verificationStatus === "duplicate" || o.verificationStatus === "not_relevant") return false;
      return ["must_attend", "high_value", "good_add_on", "send_local"].includes(o.campaignValue);
    })
    .sort((a, b) => rank(b) - rank(a))
    .slice(0, max);
}
