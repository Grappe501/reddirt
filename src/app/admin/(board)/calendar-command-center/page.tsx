import Link from "next/link";
import { DesktopCalendarCommandCenterShell } from "@/components/admin/kelly-calendar-cockpit/DesktopCalendarCommandCenterShell";
import {
  loadCountyPrioritySnapshot,
  loadTravelCalendarItems,
  travelCalendarDataPresent,
} from "@/lib/calendar/load-travel-calendar-data";
import { loadPublicScheduleShadowCalendarItems } from "@/lib/calendar/public-schedule-shadow-items";
import { loadKellyCockpitBundle } from "@/lib/calendar/kelly-cockpit-data";
import { loadKellyWinTargetScenarioFile } from "@/lib/election-targets/load-win-target-scenario";
import { loadVolunteerCapacityModelFile } from "@/lib/field-ops/load-volunteer-capacity-model";

export const dynamic = "force-dynamic";

export default async function CalendarCommandCenterPage() {
  const items = loadTravelCalendarItems();
  const shadowItems = await loadPublicScheduleShadowCalendarItems();
  const boardItems = [...items, ...shadowItems];
  const countyPriorities = loadCountyPrioritySnapshot();
  const hasData = travelCalendarDataPresent();
  const bundle = await loadKellyCockpitBundle();
  const winTargetScenario = loadKellyWinTargetScenarioFile();
  const volunteerCapacityModel = loadVolunteerCapacityModelFile();

  return (
    <div className="space-y-4">
      {!hasData ? (
        <div className="rounded-lg border border-amber-600/40 bg-amber-50 px-4 py-3 font-body text-sm text-amber-950">
          <p className="font-semibold">No normalized calendar file yet.</p>
          <p className="mt-1 text-amber-900/90">
            Run{" "}
            <code className="rounded bg-amber-100/80 px-1 py-0.5 text-xs">
              npm run calendar:travel:reconcile -- &quot;path/to/Kelly_Grappe_Travel_Calendar_to_July_4_2026.xlsx&quot;
            </code>{" "}
            from the RedDirt folder to generate{" "}
            <code className="rounded bg-amber-100/80 px-1 py-0.5 text-xs">data/calendar-command-center/*.json</code>.
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2 font-body text-xs text-kelly-text/70">
        <p>
          <span className="font-semibold text-kelly-text">Kelly Calendar Cockpit</span> — desktop board + approval
          queue. Phone view:{" "}
          <Link className="font-semibold text-kelly-text underline-offset-2 hover:underline" href="/admin/calendar-command-center/kelly">
            /kelly
          </Link>{" "}
          ·{" "}
          <Link className="font-semibold text-kelly-text underline-offset-2 hover:underline" href="/admin/calendar-command-center/fairs">
            County fairs
          </Link>{" "}
          ·{" "}
          <Link className="font-semibold text-kelly-text underline-offset-2 hover:underline" href="/admin/calendar-command-center/opportunities">
            Opportunities
          </Link>{" "}
          ·{" "}
          <Link className="font-semibold text-kelly-text underline-offset-2 hover:underline" href="/admin/calendar-command-center/week">
            Week view
          </Link>{" "}
          ·{" "}
          <Link className="font-semibold text-kelly-text underline-offset-2 hover:underline" href="/admin/calendar-command-center/field-ops">
            Field ops
          </Link>{" "}
          ·{" "}
          <Link className="font-semibold text-kelly-text underline-offset-2 hover:underline" href="/admin/calendar-command-center/build-status">
            Build status
          </Link>{" "}
          · Install shell:{" "}
          <Link className="font-semibold text-kelly-text underline-offset-2 hover:underline" href="/kelly/calendar">
            /kelly/calendar
          </Link>
        </p>
      </div>

      {hasData ? (
        <DesktopCalendarCommandCenterShell
          boardItems={boardItems}
          countyPriorities={countyPriorities}
          enriched={bundle.enriched}
          alerts={bundle.alerts}
          hasDb={bundle.hasDb}
          dbError={bundle.dbError}
          winTargetScenario={winTargetScenario}
          volunteerCapacityModel={volunteerCapacityModel}
        >
          <div className="rounded-lg border border-kelly-text/10 bg-kelly-wash/60 px-4 py-3 font-body text-xs text-kelly-text/75">
            <p>
              <span className="font-semibold text-kelly-text">Conflicts:</span> overlapping timed blocks stay flagged
              until staff resolves. Tuesday Little Rock work blocks: watch for travel outside Pulaski on Tuesdays.
            </p>
            <p className="mt-2">
              Calendar HQ:{" "}
              <Link href="/admin/workbench/calendar" className="font-semibold text-kelly-text underline-offset-2 hover:underline">
                workbench calendar
              </Link>
              .
            </p>
          </div>
        </DesktopCalendarCommandCenterShell>
      ) : null}
    </div>
  );
}
