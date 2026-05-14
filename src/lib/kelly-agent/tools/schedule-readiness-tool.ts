import {
  buildDecisionTonightList,
  buildRecommendedWeekRouteSummary,
  buildSettlementApprovalQueue,
  filterItemsInChicagoWeek,
  filterItemsNextDays,
  opportunityFilterForSettlement,
} from "@/lib/calendar/schedule-settlement-compute";
import { getChicagoWeekRange } from "@/lib/calendar/week-view-range";
import { loadCountyPrioritySnapshot, loadTravelCalendarItems, travelCalendarDataPresent } from "@/lib/calendar/load-travel-calendar-data";
import {
  loadCommunityOpportunitiesNormalized,
  loadKellyWeekendRoutePreviews,
  loadWeekendRoutePlansFile,
} from "@/lib/opportunities/load-community-opportunities-data";
import type { CampaignCalendarItem } from "@/lib/calendar/campaign-calendar-item";
import type { EnrichedCalendarItem } from "@/lib/calendar/kelly-cockpit-types";

export type ScheduleReadinessReport = {
  weekStart: string;
  readyToSettle: boolean;
  missingCriticalData: string[];
  highRiskItems: string[];
  decisionsNeededTonight: string[];
  routeRisks: string[];
  staffCallsNeeded: string[];
  recommendedNextDecision: string;
};

function todayYmd(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit" });
}

function enrichForReadiness(item: CampaignCalendarItem): EnrichedCalendarItem {
  const badge: EnrichedCalendarItem["cardBadge"] =
    item.calendarStatus === "conflict"
      ? "conflict"
      : item.calendarStatus === "confirmed"
        ? "confirmed"
        : item.calendarStatus === "tentative" || item.calendarStatus === "needs_verification" || item.calendarStatus === "recommended"
          ? "tentative"
          : "needs_approval";
  return {
    ...item,
    kellyApprovalState: item.calendarStatus === "confirmed" ? "not_requested" : "needs_kelly_review",
    cardBadge: badge,
    sortKey: new Date(item.start).getTime(),
    latestDecision: null,
    hasOpenLocalCoverage: false,
  };
}

export async function buildScheduleReadinessReport(weekMondayYmd?: string): Promise<ScheduleReadinessReport> {
  const missingCriticalData: string[] = [];
  const highRiskItems: string[] = [];
  const routeRisks: string[] = [];
  const staffCallsNeeded: string[] = [];

  const hasTravelData = travelCalendarDataPresent();
  if (!hasTravelData) missingCriticalData.push("calendar-items.normalized.json");

  const today = todayYmd();
  const enriched = loadTravelCalendarItems().map(enrichForReadiness);
  const wr = getChicagoWeekRange(weekMondayYmd ?? today);
  const weekItems = filterItemsInChicagoWeek(enriched, wr.mondayYmd);
  const horizonItems = filterItemsNextDays(enriched, today, 14);
  const countyPriorities = loadCountyPrioritySnapshot();
  const weekendPlans = loadKellyWeekendRoutePreviews(today, 6);
  const plansFile = loadWeekendRoutePlansFile();
  const opportunities = loadCommunityOpportunitiesNormalized();
  const settlementOpps = opportunityFilterForSettlement(opportunities, today, 18);

  if (weekItems.length === 0) missingCriticalData.push("current-week calendar rows");
  if (!plansFile?.plans?.length) missingCriticalData.push("weekend-route-plans-2026.json");
  if (countyPriorities.length === 0) missingCriticalData.push("county-priority-snapshot.json");

  const approvalQueue = buildSettlementApprovalQueue(horizonItems, 14);
  const decisions = buildDecisionTonightList({
    enriched,
    weekendPlans,
    opportunities: settlementOpps,
    todayYmd: today,
  });
  const recommendedWeek = buildRecommendedWeekRouteSummary({ weekItems, priorities: countyPriorities });

  for (const item of weekItems) {
    if (item.calendarStatus === "conflict") highRiskItems.push(`Conflict: ${item.title}`);
    if (item.kellyGoogle?.syncReviewNeeded) highRiskItems.push(`Google review: ${item.title}`);
    if (item.cardBadge === "needs_staff_follow_up") staffCallsNeeded.push(`Staff follow-up: ${item.title}`);
    if (item.cardBadge === "send_local") staffCallsNeeded.push(`Local coverage decision: ${item.title}`);
  }

  for (const plan of weekendPlans) {
    if (plan.routeTightness !== "comfortable") {
      routeRisks.push(`${plan.title}: ${plan.routeTightness.replace(/_/g, " ")} (${plan.totalDriveMiles} mi)`);
    }
    for (const risk of plan.risks.slice(0, 3)) routeRisks.push(`${plan.title}: ${risk}`);
  }
  if (recommendedWeek.risk !== "low") routeRisks.push(`Recommended week route risk: ${recommendedWeek.risk.replace(/_/g, " ")}`);

  const decisionsNeededTonight = decisions.slice(0, 10).map((d) => d.hint ? `${d.label} — ${d.hint}` : d.label);
  const readyToSettle =
    missingCriticalData.length === 0 &&
    weekItems.length > 0 &&
    decisionsNeededTonight.length > 0 &&
    highRiskItems.filter((x) => x.startsWith("Conflict:")).length === 0;

  const recommendedNextDecision =
    highRiskItems.find((x) => x.startsWith("Conflict:")) ??
    decisionsNeededTonight[0] ??
    (approvalQueue[0] ? `Review approval queue item: ${approvalQueue[0].title}` : "No urgent schedule settlement decision found.");

  return {
    weekStart: wr.mondayYmd,
    readyToSettle,
    missingCriticalData,
    highRiskItems: highRiskItems.slice(0, 12),
    decisionsNeededTonight,
    routeRisks: [...new Set(routeRisks)].slice(0, 12),
    staffCallsNeeded: [...new Set(staffCallsNeeded)].slice(0, 12),
    recommendedNextDecision,
  };
}
