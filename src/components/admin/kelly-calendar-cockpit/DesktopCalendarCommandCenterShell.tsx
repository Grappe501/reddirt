import type { ReactNode } from "react";
import type { CountyPrioritySnapshotRow } from "@/lib/calendar/campaign-calendar-item";
import type { EnrichedCalendarItem } from "@/lib/calendar/kelly-cockpit-types";
import type { CalendarAlertDto } from "@/lib/calendar/kelly-cockpit-types";
import type { KellyWinTargetScenarioFile } from "@/lib/election-targets/win-target-types";
import type { VolunteerCapacityModelFile } from "@/lib/field-ops/volunteer-capacity-types";
import type { GotvCommitmentAllocationFile } from "@/lib/field-ops/gotv-commitment-types";
import { FranklinCalendarCommandCenter } from "@/components/admin/calendar-command-center/FranklinCalendarCommandCenter";
import { KellyApprovalQueue } from "@/components/admin/kelly-calendar-cockpit/KellyApprovalQueue";
import { CalendarAlertCenter } from "@/components/admin/kelly-calendar-cockpit/CalendarAlertCenter";
import { TravelConflictBanner } from "@/components/admin/kelly-calendar-cockpit/TravelConflictBanner";
import { GotvCommitmentStrip } from "@/components/admin/kelly-calendar-cockpit/GotvCommitmentStrip";
import { VolunteerCapacityStrip } from "@/components/admin/kelly-calendar-cockpit/VolunteerCapacityStrip";
import { WinTargetCountyCards, WinTargetHud } from "@/components/admin/kelly-calendar-cockpit/WinTargetHud";

const breakOut =
  "-mx-6 -mt-10 mb-0 w-[calc(100%+3rem)] max-w-[calc(100vw-280px-3rem)] min-w-0 px-0 pt-0 pb-2 lg:-mx-12 lg:mt-0 lg:w-[calc(100%+6rem)] lg:max-w-none";

type Props = {
  /** Raw JSON items for the Franklin board (filters / views). */
  boardItems: import("@/lib/calendar/campaign-calendar-item").CampaignCalendarItem[];
  countyPriorities: CountyPrioritySnapshotRow[];
  enriched: EnrichedCalendarItem[];
  alerts: CalendarAlertDto[];
  hasDb: boolean;
  dbError?: string;
  /** File-backed win-target scenario; null when JSON not generated yet. */
  winTargetScenario?: KellyWinTargetScenarioFile | null;
  /** File-backed volunteer capacity model; null when JSON not generated yet. */
  volunteerCapacityModel?: VolunteerCapacityModelFile | null;
  gotvAllocation?: GotvCommitmentAllocationFile | null;
  children?: ReactNode;
};

export function DesktopCalendarCommandCenterShell({
  boardItems,
  countyPriorities,
  enriched,
  alerts,
  hasDb,
  dbError,
  winTargetScenario = null,
  volunteerCapacityModel = null,
  gotvAllocation = null,
  children,
}: Props) {
  const travel = enriched.filter((i) => i.eventType === "travel" || i.eventType === "overnight" || i.overnightRequired);
  const topCounties = [...countyPriorities]
    .sort((a, b) => (b.priorityScore ?? 0) - (a.priorityScore ?? 0))
    .slice(0, 14);

  return (
    <div className={breakOut}>
      {children}
      {!hasDb && dbError ? (
        <div className="mb-3 rounded border border-amber-500/40 bg-amber-50 px-3 py-2 font-body text-xs text-amber-950">
          Kelly decisions / alerts need a migrated DB: {dbError}
        </div>
      ) : null}
      <div className="mb-4 space-y-3">
        <WinTargetHud scenario={winTargetScenario ?? null} />
        <WinTargetCountyCards
          scenario={winTargetScenario ?? null}
          priorities={countyPriorities}
          volunteerByCounty={
            volunteerCapacityModel ? Object.fromEntries(volunteerCapacityModel.counties.map((c) => [c.county, c])) : undefined
          }
        />
        <VolunteerCapacityStrip model={volunteerCapacityModel ?? null} />
        <GotvCommitmentStrip allocation={gotvAllocation ?? null} />
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-4">
          <TravelConflictBanner items={enriched} />
          <div className="rounded-lg border border-kelly-text/10 bg-kelly-wash/40 px-3 py-2">
            <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-kelly-text/45">
              County priority strip
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {topCounties.map((c) => (
                <span
                  key={c.county}
                  className="rounded-full border border-kelly-text/15 bg-white px-2 py-0.5 font-body text-[10px] font-medium text-kelly-text/80"
                >
                  {c.county} · {c.priorityScore ?? "—"}
                </span>
              ))}
            </div>
          </div>
          <FranklinCalendarCommandCenter
            variant="embedded"
            items={boardItems}
            countyPriorities={countyPriorities}
          />
          <div className="rounded-lg border border-kelly-text/10 bg-white/90 px-3 py-2">
            <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-kelly-text/45">
              Travel / overnight
            </p>
            <ul className="mt-1 max-h-40 list-inside list-disc overflow-auto font-body text-[11px] text-kelly-text/75">
              {travel.slice(0, 12).map((t) => (
                <li key={t.id}>
                  <a className="hover:underline" href={`/admin/calendar-command-center/event/${encodeURIComponent(t.id)}`}>
                    {t.title}
                  </a>
                </li>
              ))}
              {travel.length === 0 ? <li className="list-none text-kelly-text/50">No travel rows in current filters.</li> : null}
            </ul>
          </div>
        </div>
        <aside className="min-w-0 space-y-4 xl:sticky xl:top-4 xl:self-start">
          <KellyApprovalQueue items={enriched} />
          <CalendarAlertCenter alerts={alerts} />
        </aside>
      </div>
    </div>
  );
}
