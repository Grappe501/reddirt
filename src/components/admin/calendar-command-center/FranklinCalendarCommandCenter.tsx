"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import type {
  CampaignCalendarItem,
  CountyPrioritySnapshotRow,
} from "@/lib/calendar/campaign-calendar-item";

const TZ = "America/Chicago";

type View = "month" | "week" | "day" | "planner" | "counties";

function ymdChicago(d: Date): string {
  return d.toLocaleDateString("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
}

function parseItemDay(iso: string): string {
  return ymdChicago(new Date(iso));
}

function hourInChicago(iso: string): number {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", hour12: false }).formatToParts(d);
  const h = parts.find((p) => p.type === "hour")?.value;
  return Number(h);
}

function weekdayShort(d: Date): string {
  return d.toLocaleDateString("en-US", { timeZone: TZ, weekday: "short" });
}

function monthLabel(d: Date): string {
  return d.toLocaleDateString("en-US", { timeZone: TZ, month: "long", year: "numeric" });
}

function startOfMonthYmd(ym: string): string {
  return `${ym}-01`;
}

function addDaysYmd(ymd: string, n: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n, 12, 0, 0));
  return `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, "0")}-${String(t.getUTCDate()).padStart(2, "0")}`;
}

function mondayOfWeekContaining(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const w = new Date(Date.UTC(y, m - 1, d, 12, 0, 0)).getUTCDay();
  const mon0 = (w + 6) % 7;
  return addDaysYmd(ymd, -mon0);
}

const franklin = {
  binder: "bg-[#2a1d12] text-[#f5f0e6]",
  page: "bg-[#f7f2e8] text-[#2a1d12]",
  rule: "border-[#c9a227]/35",
  accent: "text-[#8b4513]",
  ring: "shadow-[inset_0_0_0_1px_rgba(201,162,39,0.25)]",
};

function statusChip(s: CampaignCalendarItem["calendarStatus"]) {
  const map: Record<string, string> = {
    confirmed: "bg-emerald-700/90 text-white",
    tentative: "bg-amber-600/90 text-white",
    recommended: "bg-sky-700/90 text-white",
    needs_verification: "bg-slate-500/90 text-white",
    conflict: "bg-rose-700/95 text-white",
    declined: "bg-zinc-500/80 text-white",
  };
  return map[s] ?? "bg-zinc-600 text-white";
}

type Props = {
  items: CampaignCalendarItem[];
  countyPriorities: CountyPrioritySnapshotRow[];
  /** `embedded` drops the outer binder chrome for desktop shell layout. */
  variant?: "standalone" | "embedded";
  /** Optional: narrow board to specific items (e.g. queue selection). */
  focusItemIds?: string[] | null;
};

export function FranklinCalendarCommandCenter({
  items,
  countyPriorities,
  variant = "standalone",
  focusItemIds,
}: Props) {
  const [view, setView] = useState<View>("month");
  const [anchorYmd, setAnchorYmd] = useState(() => ymdChicago(new Date()));
  const [filterTentative, setFilterTentative] = useState(true);
  const [filterConfirmed, setFilterConfirmed] = useState(true);
  const [filterConflicts, setFilterConflicts] = useState(false);
  const [filterFairs, setFilterFairs] = useState(false);
  const [filterMeetings, setFilterMeetings] = useState(false);
  const [filterTravel, setFilterTravel] = useState(false);
  const [filterUnderTouched, setFilterUnderTouched] = useState(false);

  const underNames = useMemo(() => {
    const s = new Set<string>();
    for (const c of countyPriorities) {
      if (!c.underTouched) continue;
      const raw = c.county.toLowerCase().trim();
      s.add(raw);
      s.add(raw.replace(/\s+county$/i, "").trim());
    }
    return s;
  }, [countyPriorities]);

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (focusItemIds?.length && !focusItemIds.includes(it.id)) return false;
      const st = it.calendarStatus;
      if (st === "declined") return false;
      if (filterConflicts && st !== "conflict") return false;
      if (!filterConflicts) {
        if (!filterTentative && (st === "tentative" || st === "recommended" || st === "needs_verification"))
          return false;
        if (!filterConfirmed && st === "confirmed") return false;
      }
      if (filterFairs && it.eventType !== "fair_festival") return false;
      if (filterMeetings && it.eventType !== "county_party_meeting") return false;
      if (filterTravel && it.eventType !== "travel" && it.eventType !== "overnight") return false;
      if (filterUnderTouched && it.county) {
        const ic = it.county.toLowerCase().trim();
        const icShort = ic.replace(/\s+county$/i, "").trim();
        const ok = [...underNames].some((u) => ic.includes(u) || u.includes(icShort));
        if (!ok) return false;
      }
      return true;
    });
  }, [
    items,
    filterTentative,
    filterConfirmed,
    filterConflicts,
    filterFairs,
    filterMeetings,
    filterTravel,
    filterUnderTouched,
    underNames,
    focusItemIds,
  ]);

  const itemsByDay = useMemo(() => {
    const m = new Map<string, CampaignCalendarItem[]>();
    for (const it of filtered) {
      const day = parseItemDay(it.start);
      const arr = m.get(day) ?? [];
      arr.push(it);
      m.set(day, arr);
    }
    for (const arr of m.values()) {
      arr.sort((a, b) => a.start.localeCompare(b.start));
    }
    return m;
  }, [filtered]);

  const ym = anchorYmd.slice(0, 7);
  const monthStart = startOfMonthYmd(ym);
  const [y0, m0] = ym.split("-").map(Number);
  const firstDow = new Date(Date.UTC(y0, m0 - 1, 1, 12, 0, 0)).getUTCDay();
  const pad = (firstDow + 6) % 7;
  const daysInMonth = new Date(Date.UTC(y0, m0, 0, 12, 0, 0)).getUTCDate();
  const monthCells: { ymd: string | null; inMonth: boolean }[] = [];
  for (let i = 0; i < pad; i++) monthCells.push({ ymd: null, inMonth: false });
  for (let d = 1; d <= daysInMonth; d++) {
    const ymd = `${ym}-${String(d).padStart(2, "0")}`;
    monthCells.push({ ymd, inMonth: true });
  }
  while (monthCells.length % 7 !== 0) {
    const last = monthCells[monthCells.length - 1]!;
    const next = last.ymd ? addDaysYmd(last.ymd, 1) : null;
    monthCells.push({ ymd: next, inMonth: false });
  }
  while (monthCells.length < 42) {
    const last = monthCells[monthCells.length - 1]!;
    const next = last.ymd ? addDaysYmd(last.ymd, 1) : null;
    monthCells.push({ ymd: next, inMonth: false });
  }

  const weekStart = mondayOfWeekContaining(anchorYmd);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDaysYmd(weekStart, i));

  const hourRows = useMemo(() => Array.from({ length: 17 }, (_, i) => i + 6), []);

  const eventsForPlannerDay = useMemo(() => {
    const list = itemsByDay.get(anchorYmd) ?? [];
    return list.filter((x) => !x.allDay);
  }, [itemsByDay, anchorYmd]);

  const navigateMonth = useCallback((delta: number) => {
    const [y, m] = ym.split("-").map(Number);
    const t = new Date(Date.UTC(y, m - 1 + delta, 15, 12, 0, 0));
    const ny = t.getUTCFullYear();
    const nm = t.getUTCMonth() + 1;
    setAnchorYmd(`${ny}-${String(nm).padStart(2, "0")}-01`);
  }, [ym]);

  const embedded = variant === "embedded";

  return (
    <div
      className={
        embedded
          ? `min-h-[60vh] rounded-lg border border-kelly-text/12 bg-[#f7f2e8] ${franklin.ring} overflow-hidden`
          : `min-h-[70vh] rounded-lg ${franklin.ring} ${franklin.binder} overflow-hidden`
      }
    >
      {!embedded ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f5f0e6]/15 px-5 py-4">
          <div>
            <p className="font-body text-[10px] font-bold uppercase tracking-[0.28em] text-[#f5f0e6]/55">
              Franklin-style travel board
            </p>
            <h1 className="font-heading text-xl font-bold tracking-tight">Campaign Calendar Command Center</h1>
            <p className="mt-1 max-w-2xl font-body text-xs text-[#f5f0e6]/75">
              Internal schedule from the travel workbook + calendar import. Tentative vs confirmed filters; conflicts
              highlighted. Promote to the official calendar only after Calendar HQ review.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/workbench/calendar"
              className="rounded border border-[#f5f0e6]/25 px-3 py-1.5 font-body text-xs font-semibold text-[#f5f0e6] hover:bg-[#f5f0e6]/10"
            >
              Calendar HQ ↗
            </Link>
            <Link
              href="/admin/calendar-command-center/kelly"
              className="rounded border border-[#f5f0e6]/25 px-3 py-1.5 font-body text-xs font-semibold text-[#f5f0e6] hover:bg-[#f5f0e6]/10"
            >
              Kelly phone cockpit ↗
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between border-b border-kelly-text/10 bg-[#f3ece0] px-3 py-2">
          <p className="font-heading text-xs font-bold text-kelly-text/80">Calendar board</p>
          <Link
            href="/admin/calendar-command-center/kelly"
            className="font-body text-[10px] font-semibold uppercase tracking-wide text-kelly-text underline-offset-2 hover:underline"
          >
            Kelly view
          </Link>
        </div>
      )}

      <div className={`grid gap-0 lg:grid-cols-[240px_1fr] ${embedded ? "bg-[#f7f2e8] text-kelly-text" : franklin.page}`}>
        <aside className={`border-r ${franklin.rule} space-y-4 p-4 font-body text-sm`}>
          <p className={`text-[10px] font-bold uppercase tracking-wider ${franklin.accent}`}>Views</p>
          <div className="flex flex-col gap-1">
              {(
              [
                ["month", "Monthly"],
                ["week", "Weekly"],
                ["day", "Daily"],
                ["planner", "Hourly day"],
                ["counties", "County priorities"],
              ] as const
            ).map(([k, lab]) => (
              <button
                key={k}
                type="button"
                onClick={() => setView(k)}
                className={`rounded px-3 py-2 text-left text-xs font-semibold ${
                  view === k ? "bg-[#2a1d12] text-[#f5f0e6]" : "bg-[#2a1d12]/8 hover:bg-[#2a1d12]/12"
                }`}
              >
                {lab}
              </button>
            ))}
          </div>

          <p className={`text-[10px] font-bold uppercase tracking-wider ${franklin.accent}`}>Filters</p>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={filterTentative} onChange={(e) => setFilterTentative(e.target.checked)} />
            Tentative / needs verification
          </label>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={filterConfirmed} onChange={(e) => setFilterConfirmed(e.target.checked)} />
            Confirmed
          </label>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={filterConflicts} onChange={(e) => setFilterConflicts(e.target.checked)} />
            Conflicts only
          </label>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={filterFairs} onChange={(e) => setFilterFairs(e.target.checked)} />
            Fairs / festivals
          </label>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={filterMeetings} onChange={(e) => setFilterMeetings(e.target.checked)} />
            County meetings
          </label>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={filterTravel} onChange={(e) => setFilterTravel(e.target.checked)} />
            Travel / overnight
          </label>
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={filterUnderTouched}
              onChange={(e) => setFilterUnderTouched(e.target.checked)}
            />
            Under-touched counties (from snapshot)
          </label>

          <p className={`text-[10px] font-bold uppercase tracking-wider ${franklin.accent}`}>Workflow (preview)</p>
          <p className="text-[11px] leading-relaxed text-kelly-muted">
            Approve / hold / reject will attach to `CampaignEvent` workflow in a follow-up slice. Use Calendar HQ for
            live workflow today.
          </p>
        </aside>

        <section className="min-h-[520px] p-4">
          {view === "month" && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <button
                  type="button"
                  className="rounded border border-kelly-text/20 px-2 py-1 text-xs font-semibold"
                  onClick={() => navigateMonth(-1)}
                >
                  ←
                </button>
                <p className="font-heading text-sm font-bold">{monthLabel(new Date(`${monthStart}T12:00:00Z`))}</p>
                <button
                  type="button"
                  className="rounded border border-kelly-text/20 px-2 py-1 text-xs font-semibold"
                  onClick={() => navigateMonth(1)}
                >
                  →
                </button>
              </div>
              <div className="grid grid-cols-7 gap-px bg-[#2a1d12]/15 font-body text-[10px] font-bold uppercase tracking-wide text-kelly-muted">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <div key={d} className="bg-[#f0e8dc] px-1 py-2 text-center">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-px bg-[#2a1d12]/20">
                {monthCells.map((cell, idx) => (
                  <div
                    key={idx}
                    className={`min-h-[72px] bg-[#f7f2e8] p-1 ${cell.inMonth ? "" : "opacity-40"}`}
                    onClick={() => cell.ymd && setAnchorYmd(cell.ymd)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && cell.ymd) setAnchorYmd(cell.ymd);
                    }}
                    role={cell.ymd ? "button" : undefined}
                    tabIndex={cell.ymd ? 0 : -1}
                  >
                    {cell.ymd ? (
                      <>
                        <p className="text-right font-body text-[11px] font-semibold text-kelly-text/80">
                          {Number(cell.ymd.slice(8))}
                        </p>
                        <div className="mt-1 space-y-0.5">
                          {(itemsByDay.get(cell.ymd) ?? []).slice(0, 3).map((it) => (
                            <Link
                              key={it.id}
                              href={`/admin/calendar-command-center/event/${encodeURIComponent(it.id)}`}
                              className={`block truncate rounded px-0.5 text-[9px] font-medium leading-tight text-white ${statusChip(it.calendarStatus)}`}
                              title={it.title}
                            >
                              {it.title}
                            </Link>
                          ))}
                          {(itemsByDay.get(cell.ymd) ?? []).length > 3 ? (
                            <p className="text-[9px] text-kelly-subtle">+{(itemsByDay.get(cell.ymd) ?? []).length - 3}</p>
                          ) : null}
                        </div>
                      </>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === "week" && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <button
                  type="button"
                  className="rounded border border-kelly-text/20 px-2 py-1 text-xs font-semibold"
                  onClick={() => setAnchorYmd(addDaysYmd(anchorYmd, -7))}
                >
                  ← Week
                </button>
                <p className="font-heading text-sm font-bold">
                  Week of {weekStart}{" "}
                  <span className="font-body text-xs font-normal text-kelly-muted">(Central)</span>
                </p>
                <button
                  type="button"
                  className="rounded border border-kelly-text/20 px-2 py-1 text-xs font-semibold"
                  onClick={() => setAnchorYmd(addDaysYmd(anchorYmd, 7))}
                >
                  Week →
                </button>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((d) => (
                  <div key={d} className={`rounded border ${franklin.rule} bg-[#faf6ef] p-2`}>
                    <p className="font-body text-[10px] font-bold uppercase text-kelly-subtle">
                      {weekdayShort(new Date(`${d}T12:00:00Z`))}
                    </p>
                    <p className="font-heading text-sm font-bold">{d.slice(5)}</p>
                    <div className="mt-2 space-y-1">
                      {(itemsByDay.get(d) ?? []).map((it) => (
                        <Link
                          key={it.id}
                          href={`/admin/calendar-command-center/event/${encodeURIComponent(it.id)}`}
                          className={`block rounded px-1 py-0.5 text-[10px] font-medium leading-snug text-white ${statusChip(it.calendarStatus)}`}
                        >
                          {it.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === "day" && (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <button
                  type="button"
                  className="rounded border border-kelly-text/20 px-2 py-1 text-xs font-semibold"
                  onClick={() => setAnchorYmd(addDaysYmd(anchorYmd, -1))}
                >
                  ←
                </button>
                <input
                  type="date"
                  value={anchorYmd}
                  onChange={(e) => setAnchorYmd(e.target.value)}
                  className="rounded border border-kelly-text/25 bg-white px-2 py-1 font-body text-sm"
                />
                <button
                  type="button"
                  className="rounded border border-kelly-text/20 px-2 py-1 text-xs font-semibold"
                  onClick={() => setAnchorYmd(addDaysYmd(anchorYmd, 1))}
                >
                  →
                </button>
              </div>
              <p className="mb-2 font-heading text-lg font-bold">
                {weekdayShort(new Date(`${anchorYmd}T12:00:00Z`))} · {anchorYmd}
              </p>
              <ul className="space-y-2">
                {(itemsByDay.get(anchorYmd) ?? []).map((it) => (
                  <li key={it.id} className={`rounded border ${franklin.rule} bg-white/80 p-3`}>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <Link
                          href={`/admin/calendar-command-center/event/${encodeURIComponent(it.id)}`}
                          className="font-heading text-base font-bold text-kelly-text underline-offset-2 hover:underline"
                        >
                          {it.title}
                        </Link>
                        <p className="mt-1 font-body text-xs text-kelly-muted">
                          {it.allDay ? "All day" : `${new Date(it.start).toLocaleTimeString("en-US", { timeZone: TZ })}`}
                          {it.county ? ` · ${it.county}` : ""}
                        </p>
                      </div>
                      <span className={`shrink-0 rounded px-2 py-0.5 font-body text-[10px] font-bold text-white ${statusChip(it.calendarStatus)}`}>
                        {it.calendarStatus}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {view === "planner" && (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <input
                  type="date"
                  value={anchorYmd}
                  onChange={(e) => setAnchorYmd(e.target.value)}
                  className="rounded border border-kelly-text/25 bg-white px-2 py-1 font-body text-sm"
                />
                <p className="font-body text-xs text-kelly-muted">Hourly grid (timed items only)</p>
              </div>
              <div className={`relative rounded border ${franklin.rule} bg-[#fffef9]`}>
                {hourRows.map((h) => (
                  <div key={h} className={`grid grid-cols-[56px_1fr] border-b ${franklin.rule} min-h-[40px]`}>
                    <div className="border-r border-[#c9a227]/25 bg-[#f3ece0] px-1 py-1 text-right font-body text-[10px] font-semibold text-kelly-muted">
                      {h > 12 ? h - 12 : h === 0 ? 12 : h}
                      {h >= 12 ? "p" : "a"}m
                    </div>
                    <div className="relative bg-[linear-gradient(to_bottom,transparent_39px,#c9a22722_40px)] bg-[length:100%_40px] px-1 py-0.5">
                      {eventsForPlannerDay
                        .filter((it) => hourInChicago(it.start) === h)
                        .map((it) => (
                          <Link
                            key={it.id}
                            href={`/admin/calendar-command-center/event/${encodeURIComponent(it.id)}`}
                            className={`mb-1 block rounded border border-kelly-text/10 px-2 py-1 text-xs font-medium text-white ${statusChip(it.calendarStatus)}`}
                          >
                            {it.title}
                          </Link>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === "counties" && (
            <div className="max-h-[560px] overflow-auto rounded border border-kelly-text/15 bg-white/90">
              <table className="w-full border-collapse font-body text-xs">
                <thead className="sticky top-0 bg-[#f3ece0]">
                  <tr className="text-left text-[10px] font-bold uppercase tracking-wide text-kelly-muted">
                    <th className="border-b border-kelly-text/10 px-2 py-2">County</th>
                    <th className="border-b border-kelly-text/10 px-2 py-2">Tier</th>
                    <th className="border-b border-kelly-text/10 px-2 py-2">Score</th>
                    <th className="border-b border-kelly-text/10 px-2 py-2">Touches</th>
                    <th className="border-b border-kelly-text/10 px-2 py-2">Under</th>
                    <th className="border-b border-kelly-text/10 px-2 py-2">Next anchor</th>
                  </tr>
                </thead>
                <tbody>
                  {[...countyPriorities]
                    .sort((a, b) => (b.priorityScore ?? 0) - (a.priorityScore ?? 0))
                    .map((r) => (
                      <tr key={r.county} className="odd:bg-white even:bg-kelly-wash/40">
                        <td className="border-b border-kelly-text/8 px-2 py-1.5 font-semibold">{r.county}</td>
                        <td className="border-b border-kelly-text/8 px-2 py-1.5">{r.tier ?? "—"}</td>
                        <td className="border-b border-kelly-text/8 px-2 py-1.5">{r.priorityScore ?? "—"}</td>
                        <td className="border-b border-kelly-text/8 px-2 py-1.5">{r.pastTouchesSinceNov1}</td>
                        <td className="border-b border-kelly-text/8 px-2 py-1.5">{r.underTouched ? "Yes" : ""}</td>
                        <td className="max-w-[220px] border-b border-kelly-text/8 px-2 py-1.5 text-kelly-text/80">
                          {r.nextScheduledAnchor ?? "—"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {!embedded ? (
        <div className={`border-t ${franklin.rule} px-5 py-3 font-body text-[11px] text-[#f5f0e6]/70`}>
          Showing {filtered.length} of {items.length} items · County priority rows: {countyPriorities.length}
        </div>
      ) : (
        <div className="border-t border-kelly-text/10 px-3 py-2 font-body text-[10px] text-kelly-muted">
          {filtered.length} of {items.length} shown
        </div>
      )}
    </div>
  );
}
