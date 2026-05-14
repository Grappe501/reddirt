import {
  buildDaySegmentPreviews,
  buildDecisionTonightList,
  buildRecommendedWeekRouteSummary,
  buildRouteComparisonThree,
  buildSettlementApprovalQueue,
  buildSettlementSnapshot,
  filterItemsInChicagoWeek,
  filterItemsNextDays,
  opportunityFilterForSettlement,
} from "@/lib/calendar/schedule-settlement-compute";
import { getChicagoWeekRange } from "@/lib/calendar/week-view-range";
import { loadCountyPrioritySnapshot, travelCalendarDataPresent } from "@/lib/calendar/load-travel-calendar-data";
import { loadKellyCockpitBundle } from "@/lib/calendar/kelly-cockpit-data";
import {
  loadCommunityOpportunitiesNormalized,
  loadKellyWeekendRoutePreviews,
  loadWeekendRoutePlansFile,
} from "@/lib/opportunities/load-community-opportunities-data";
import { KellyScheduleSettlementDashboard } from "@/components/admin/kelly-calendar-cockpit/KellyScheduleSettlementDashboard";
import { loadKellyWinTargetScenarioFile } from "@/lib/election-targets/load-win-target-scenario";
import { loadVolunteerCapacityModelFile } from "@/lib/field-ops/load-volunteer-capacity-model";
import { runCandidateDashboardPreflight } from "@/lib/kelly-agent/tools/candidate-dashboard-preflight-tool";
import { loadEventCoveragePlans } from "@/lib/calendar/load-event-coverage-plans";

export const dynamic = "force-dynamic";

export default async function KellyCalendarCockpitPage() {
  const countyPriorities = loadCountyPrioritySnapshot();
  const hasData = travelCalendarDataPresent();
  const bundle = await loadKellyCockpitBundle();

  if (!hasData) {
    return (
      <div className="rounded-lg border border-amber-500/40 bg-amber-950/40 px-4 py-4 font-body text-sm text-amber-50">
        Run the travel reconcile script to generate JSON, then reload. Schedule settlement mode needs the normalized calendar file for map pins and week context.
      </div>
    );
  }

  const wr = getChicagoWeekRange(bundle.todayYmd);
  const weekItems = filterItemsInChicagoWeek(bundle.enriched, wr.mondayYmd);
  const horizonItems = filterItemsNextDays(bundle.enriched, bundle.todayYmd, 14);
  const snapshot = buildSettlementSnapshot(weekItems, horizonItems);

  const plansFile = loadWeekendRoutePlansFile();
  const pool = (plansFile?.plans?.length ? plansFile.plans : []).slice(0, 16);
  const weekendPlansForUi = loadKellyWeekendRoutePreviews(bundle.todayYmd, 6);
  const allOpps = loadCommunityOpportunitiesNormalized();
  const opps = opportunityFilterForSettlement(allOpps, bundle.todayYmd, 18);
  const weekConflictCount = weekItems.filter((i) => i.calendarStatus === "conflict").length;
  const comparison = buildRouteComparisonThree({
    plans: pool.length >= 3 ? pool : weekendPlansForUi.length ? weekendPlansForUi : pool,
    opportunities: allOpps,
    weekConflictCount,
  });

  const decisions = buildDecisionTonightList({
    enriched: bundle.enriched,
    weekendPlans: weekendPlansForUi,
    opportunities: opps,
    todayYmd: bundle.todayYmd,
  });

  const recommendedWeek = buildRecommendedWeekRouteSummary({
    weekItems,
    priorities: countyPriorities,
  });

  const approvalQueue = buildSettlementApprovalQueue(horizonItems, 14);
  const dayPreview = buildDaySegmentPreviews();
  const winScenario = loadKellyWinTargetScenarioFile();
  const volunteerCapacityModel = loadVolunteerCapacityModelFile();
  const preflight = await runCandidateDashboardPreflight({ weekMondayYmd: wr.mondayYmd });
  const coveragePlans = loadEventCoveragePlans();

  return (
    <KellyScheduleSettlementDashboard
      enriched={bundle.enriched}
      countyPriorities={countyPriorities}
      todayYmd={bundle.todayYmd}
      weekEndYmd={bundle.weekEndYmd}
      weekMondayYmd={wr.mondayYmd}
      weekendPlans={weekendPlansForUi}
      opportunities={opps}
      snapshot={snapshot}
      comparison={comparison}
      decisions={decisions}
      dayPreview={dayPreview}
      recommendedWeek={recommendedWeek}
      approvalQueue={approvalQueue}
      winScenario={winScenario}
      volunteerCapacityModel={volunteerCapacityModel}
      preflight={preflight}
      coveragePlans={coveragePlans}
      dataSourceMode={bundle.dataSourceMode}
      dataSourceNote={bundle.dataSourceNote}
    />
  );
}
