"use client";

import Link from "next/link";

import type { CampaignCalendarItem } from "@/lib/calendar/campaign-calendar-item";
import type { WeekBoardDay, WeekMapMarker } from "@/lib/calendar/build-week-board-model";
import { weekPlanStub } from "@/app/admin/calendar-command-center/week-actions";
import { WeekViewMap } from "@/components/admin/calendar-command-center/WeekViewMap";

export function WeekViewBoard(props: {
  mondayYmd: string;
  prevMondayYmd: string;
  nextMondayYmd: string;
  days: WeekBoardDay[];
  markers: WeekMapMarker[];
  polyline: [number, number][];
  routeTightness: "comfortable" | "busy_but_safe" | "too_tight";
  overnightCities: string[];
  itemCount: number;
  workWindowWarnings: number;
}) {
  const {
    mondayYmd,
    prevMondayYmd,
    nextMondayYmd,
    days,
    markers,
    polyline,
    routeTightness,
    overnightCities,
    itemCount,
    workWindowWarnings,
  } = props;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-kelly-text/12 bg-[#f7f2e8] px-4 py-3 font-body text-xs text-kelly-text">
        <div>
          <p className="font-heading text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-text/45">Week of</p>
          <p className="text-sm font-bold text-kelly-text">{mondayYmd} (Mon–Sun, America/Chicago)</p>
          <p className="mt-1 text-kelly-text/70">
            {itemCount} items · tightness: <span className="font-semibold">{routeTightness.replace(/_/g, " ")}</span>
            {overnightCities.length ? (
              <>
                {" "}
                · overnight: {overnightCities.join(", ")}
              </>
            ) : null}
            {workWindowWarnings ? (
              <span className="text-amber-800"> · {workWindowWarnings} cockpit alerts tied to this week</span>
            ) : null}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            className="rounded-lg border border-kelly-text/20 bg-white px-3 py-1.5 text-[10px] font-bold uppercase text-kelly-text hover:bg-kelly-wash"
            href={`/admin/calendar-command-center/week?week=${encodeURIComponent(prevMondayYmd)}`}
          >
            ← Prev
          </Link>
          <Link
            className="rounded-lg border border-kelly-text/20 bg-white px-3 py-1.5 text-[10px] font-bold uppercase text-kelly-text hover:bg-kelly-wash"
            href={`/admin/calendar-command-center/week?week=${encodeURIComponent(nextMondayYmd)}`}
          >
            Next →
          </Link>
        </div>
      </div>

      <WeekViewMap markers={markers} polyline={polyline} />

      <div className="grid gap-4 lg:grid-cols-7">
        {days.map((d) => (
          <div key={d.ymd} className="flex min-h-[220px] flex-col rounded-lg border border-kelly-text/12 bg-white p-2 shadow-sm">
            <p className="border-b border-kelly-text/10 pb-1 font-heading text-[11px] font-bold uppercase text-kelly-text/55">
              {d.weekday.slice(0, 3)} · {d.ymd.slice(5)}
            </p>
            <div className="mt-2 flex-1 space-y-2 overflow-y-auto">
              {d.items.length === 0 ? (
                <p className="font-body text-[10px] text-kelly-text/45">—</p>
              ) : (
                d.items.map((it: CampaignCalendarItem) => {
                  const isPublic = it.source === "public_schedule_request";
                  return (
                  <Link
                    key={it.id}
                    href={`/admin/calendar-command-center/event/${encodeURIComponent(it.id)}`}
                    className={`block rounded-md px-2 py-1.5 font-body text-[10px] leading-snug text-kelly-text hover:bg-kelly-wash ${
                      isPublic
                        ? "border border-dashed border-amber-800/55 bg-amber-50/70"
                        : "rounded-md border border-kelly-text/10 bg-kelly-wash/40"
                    }`}
                  >
                    <span className="font-bold">{new Date(it.start).toLocaleTimeString("en-US", { timeZone: "America/Chicago", hour: "numeric", minute: "2-digit" })}</span>
                    {isPublic ? (
                      <span className="mt-0.5 block text-[9px] font-bold uppercase tracking-wide text-amber-950/80">
                        Public request · not confirmed
                      </span>
                    ) : null}
                    <span className="mt-0.5 block text-kelly-text/85">{it.title}</span>
                    <span className="mt-0.5 block text-[9px] uppercase text-kelly-text/50">{it.calendarStatus}</span>
                    {isPublic && it.notes ? (
                      <span className="mt-0.5 block text-[9px] text-kelly-text/60">{it.notes}</span>
                    ) : null}
                  </Link>
                  );
                })
              )}
            </div>
            <div className="mt-2 space-y-1 border-t border-dashed border-kelly-text/15 pt-2 font-body text-[9px] text-kelly-text/50">
              <p>Meal / gas buffers: staff blocks (Hour View next)</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 rounded-lg border border-kelly-text/12 bg-white px-4 py-3">
        <form action={weekPlanStub}>
          <input type="hidden" name="weekMondayYmd" value={mondayYmd} />
          <input type="hidden" name="weekIntent" value="approve_week" />
          <button type="submit" className="rounded-lg bg-emerald-800 px-3 py-2 font-body text-[10px] font-bold uppercase text-white">
            Approve whole week
          </button>
        </form>
        <form action={weekPlanStub}>
          <input type="hidden" name="weekMondayYmd" value={mondayYmd} />
          <input type="hidden" name="weekIntent" value="modify_week" />
          <button type="submit" className="rounded-lg border border-kelly-text/25 px-3 py-2 font-body text-[10px] font-bold uppercase text-kelly-text">
            Modify week
          </button>
        </form>
        <form action={weekPlanStub}>
          <input type="hidden" name="weekMondayYmd" value={mondayYmd} />
          <input type="hidden" name="weekIntent" value="send_local_pieces" />
          <button type="submit" className="rounded-lg border border-violet-300 bg-violet-50 px-3 py-2 font-body text-[10px] font-bold uppercase text-violet-950">
            Send pieces local
          </button>
        </form>
        <p className="w-full font-body text-[10px] text-kelly-text/55">
          Tentative / Confirmed Google pushes stay behind existing HQ flows — these buttons revalidate only until wired.
        </p>
      </div>
    </div>
  );
}
