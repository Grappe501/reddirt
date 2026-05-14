import { KellyMobileCalendarCockpit } from "@/components/admin/kelly-calendar-cockpit/KellyMobileCalendarCockpit";
import { weekendRoutePlanStub } from "@/app/admin/calendar-command-center/weekend-route-plan-actions";
import { buildCountyBasicsStrip, type CountyBasicsStrip } from "@/lib/calendar/kelly-county-basics";
import { loadKellyItemStagedMap } from "@/lib/calendar/kelly-cockpit-staged-metadata";
import {
  loadCountyFactsByKey,
  loadCountyPrioritySnapshot,
  loadCountyTouchMap,
  travelCalendarDataPresent,
} from "@/lib/calendar/load-travel-calendar-data";
import { loadKellyCockpitBundle } from "@/lib/calendar/kelly-cockpit-data";
import { loadKellyWeekendRoutePreviews } from "@/lib/opportunities/load-community-opportunities-data";

export const dynamic = "force-dynamic";

export default async function KellyCalendarCockpitPage() {
  const countyPriorities = loadCountyPrioritySnapshot();
  const hasData = travelCalendarDataPresent();
  const bundle = await loadKellyCockpitBundle();

  if (!hasData) {
    return (
      <div className="rounded-lg border border-amber-500/40 bg-amber-950/40 px-4 py-4 font-body text-sm text-amber-50">
        Run the travel reconcile script to generate JSON, then reload.
      </div>
    );
  }

  const facts = loadCountyFactsByKey();
  const touchMap = loadCountyTouchMap();
  const stagedByItemId = loadKellyItemStagedMap();
  const weekendRoutePlansPreview = loadKellyWeekendRoutePreviews(bundle.todayYmd, 2);

  const countyBasicsByItemId: Record<string, CountyBasicsStrip> = {};
  for (const it of bundle.enriched) {
    countyBasicsByItemId[it.id] = buildCountyBasicsStrip(it, { facts, priorities: countyPriorities, touchMap });
  }

  return (
    <KellyMobileCalendarCockpit
      enriched={bundle.enriched}
      countyPriorities={countyPriorities}
      alerts={bundle.alerts}
      todayYmd={bundle.todayYmd}
      tomorrowYmd={bundle.tomorrowYmd}
      weekEndYmd={bundle.weekEndYmd}
      countyBasicsByItemId={countyBasicsByItemId}
      stagedByItemId={stagedByItemId}
      weekendRoutePlansPreview={weekendRoutePlansPreview}
      weekendRoutePlanStub={weekendRoutePlanStub}
    />
  );
}
