import Link from "next/link";
import { calendarFiltersToSearchParams, type CalendarHqFilters } from "@/lib/calendar/hq-filters";
import { addWeeks, DEFAULT_CAMPAIGN_TZ } from "@/lib/calendar/weekly-time";

const tabCls = (on: boolean) =>
  `rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${on ? "bg-kelly-text text-kelly-page" : "bg-white text-kelly-text/70"}`;

export function CalendarHqMainTabs({
  filters,
  weekKey,
  view,
  eventId,
  matrixQ,
  monthYm,
}: {
  filters: CalendarHqFilters;
  weekKey: string;
  view: string;
  eventId: string | null;
  matrixQ: string | undefined;
  monthYm: string;
}) {
  const qs = (v: string) =>
    calendarFiltersToSearchParams(filters, {
      week: weekKey,
      view: v,
      event: eventId,
      q: matrixQ,
      month: v === "month" ? monthYm : undefined,
    });

  const tabs: [string, string][] = [
    ["week", "Week"],
    ["agenda", "Agenda"],
    ["month", "Month"],
    ["ribbon", "Approvals"],
    ["conflicts", "Conflicts"],
    ["analytics", "Analytics"],
    ["queue", "Cal comms"],
  ];

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-kelly-text/10 bg-kelly-text/[0.04] px-1 py-1">
      {tabs.map(([v, label]) => (
        <Link key={v} href={`/admin/workbench/calendar?${qs(v)}`} className={tabCls(view === v)}>
          {label}
        </Link>
      ))}
    </div>
  );
}

export function CalendarHqMonthNav({
  weekKey,
  monthYm,
  filters,
  view,
  eventId,
  matrixQ,
}: {
  weekKey: string;
  monthYm: string;
  filters: CalendarHqFilters;
  view: string;
  eventId: string | null;
  matrixQ: string | undefined;
}) {
  const weekHref = (wk: string) =>
    calendarFiltersToSearchParams(filters, {
      week: wk,
      view,
      event: eventId,
      q: matrixQ,
      month: view === "month" ? monthYm : undefined,
    });
  const base = (v: string) =>
    calendarFiltersToSearchParams(filters, {
      week: weekKey,
      view: v,
      event: eventId,
      q: matrixQ,
      month: v === "month" ? monthYm : undefined,
    });
  const label = (() => {
    const d = new Date(weekKey + "T12:00:00.000Z");
    return d.toLocaleDateString("en-US", { timeZone: DEFAULT_CAMPAIGN_TZ, month: "long", year: "numeric" });
  })();
  const [y, m] = monthYm.split("-").map(Number);
  const prevM = m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, "0")}`;
  const nextM = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;

  const monthHref = (ym: string) => {
    const p = new URLSearchParams(base("month"));
    p.set("month", ym);
    return `/admin/workbench/calendar?${p.toString()}`;
  };

  return (
    <div className="space-y-1 border-b border-kelly-text/10 py-1.5">
      <p className="text-[7px] font-bold uppercase text-kelly-text/45">Navigator</p>
      <p className="text-[9px] font-bold text-kelly-text/80">{label}</p>
      <div className="flex flex-wrap gap-0.5 text-[8px]">
        <Link className="rounded border border-kelly-text/15 bg-white px-1 py-0.5" href={`/admin/workbench/calendar?${weekHref(addWeeks(weekKey, -1))}`}>
          −Week
        </Link>
        <Link className="rounded border border-kelly-text/15 bg-white px-1 py-0.5" href={`/admin/workbench/calendar?${weekHref(addWeeks(weekKey, 1))}`}>
          +Week
        </Link>
        <Link className="rounded border border-kelly-text/15 bg-white px-1 py-0.5" href={monthHref(prevM)}>
          « {prevM}
        </Link>
        <Link className="rounded border border-kelly-text/15 bg-white px-1 py-0.5" href={monthHref(nextM)}>
          {nextM} »
        </Link>
      </div>
    </div>
  );
}
