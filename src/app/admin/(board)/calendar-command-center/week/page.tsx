import Link from "next/link";
import { addDays, parse } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

import { WeekViewBoard } from "@/components/admin/calendar-command-center/WeekViewBoard";
import {
  buildWeekBoardDays,
  buildWeekMapModel,
  stripCalendarItemForWeekClient,
  weekRouteTightness,
} from "@/lib/calendar/build-week-board-model";
import { filterCalendarItemsInWindow, loadTravelCalendarItems, travelCalendarDataPresent } from "@/lib/calendar/load-travel-calendar-data";
import { getChicagoWeekRange } from "@/lib/calendar/week-view-range";
import { loadKellyCockpitBundle } from "@/lib/calendar/kelly-cockpit-data";

const TZ = "America/Chicago";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ week?: string }> };

export default async function CalendarWeekViewPage({ searchParams }: Props) {
  const sp = await searchParams;
  const anchorYmd =
    sp.week && /^\d{4}-\d{2}-\d{2}$/.test(sp.week) ? sp.week : formatInTimeZone(new Date(), TZ, "yyyy-MM-dd");
  const wr = getChicagoWeekRange(anchorYmd);
  const mondayYmd = wr.mondayYmd;
  const prevMondayYmd = formatInTimeZone(addDays(parse(mondayYmd, "yyyy-MM-dd", new Date()), -7), TZ, "yyyy-MM-dd");
  const nextMondayYmd = formatInTimeZone(addDays(parse(mondayYmd, "yyyy-MM-dd", new Date()), 7), TZ, "yyyy-MM-dd");

  if (!travelCalendarDataPresent()) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 font-body text-sm text-amber-900">
        No travel calendar JSON yet. Run the travel reconcile script, then reload.
      </div>
    );
  }

  const items = loadTravelCalendarItems();
  const startMs = new Date(wr.startIso).getTime();
  const endMs = new Date(wr.endExclusiveIso).getTime();
  const windowItems = filterCalendarItemsInWindow(items, startMs, endMs);
  const bundle = await loadKellyCockpitBundle();
  const badgeById = Object.fromEntries(bundle.enriched.map((e) => [e.id, e.cardBadge]));
  const { markers, polyline } = buildWeekMapModel(windowItems, badgeById);
  const days = buildWeekBoardDays(
    mondayYmd,
    windowItems.map(stripCalendarItemForWeekClient),
  );
  const overnightCities = [
    ...new Set(windowItems.filter((i) => i.overnightRequired && i.overnightCity).map((i) => i.overnightCity!)),
  ];
  const windowIds = new Set(windowItems.map((i) => i.id));
  const workWindowWarnings = bundle.alerts.filter((a) => windowIds.has(a.calendarItemId)).length;

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-4 py-6">
      <div className="font-body text-xs text-kelly-text/60">
        <Link href="/admin/calendar-command-center" className="text-kelly-text underline-offset-2 hover:underline">
          ← Command center
        </Link>
        {" · "}
        <Link href="/admin/calendar-command-center/kelly" className="text-kelly-text underline-offset-2 hover:underline">
          Kelly cockpit
        </Link>
        {" · "}
        <span className="text-kelly-text/80">Week view (route planner)</span>
      </div>

      <header className="rounded-lg border border-kelly-text/15 bg-[#f7f2e8] px-5 py-5 shadow-sm">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-text/45">Monday–Sunday board</p>
        <h1 className="mt-2 font-heading text-2xl font-bold text-kelly-text">Week route planner</h1>
        <p className="mt-2 max-w-3xl font-body text-sm text-kelly-text/75">
          Map uses county-seat centroids when the workbook row has no coordinates. Kelly agent tools (calendar, route matrix,
          opportunities) power <code className="rounded bg-white/80 px-1">POST /api/admin/kelly-agent/recommend</code>.
        </p>
      </header>

      <WeekViewBoard
        mondayYmd={mondayYmd}
        prevMondayYmd={prevMondayYmd}
        nextMondayYmd={nextMondayYmd}
        days={days}
        markers={markers}
        polyline={polyline}
        routeTightness={weekRouteTightness(windowItems.length)}
        overnightCities={overnightCities}
        itemCount={windowItems.length}
        workWindowWarnings={workWindowWarnings}
      />
    </div>
  );
}
