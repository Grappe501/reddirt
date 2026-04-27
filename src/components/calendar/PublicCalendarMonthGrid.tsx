import Link from "next/link";
import type { PublicCampaignEvent } from "@/lib/calendar/public-event-types";
import {
  daysInGregorianMonth,
  weekday0SundayYmd,
  ymdInTimeZone,
} from "@/lib/calendar/public-event-format";
import { PUBLIC_CALENDAR_DEFAULT_TZ } from "@/lib/calendar/public-event-types";

const Z = PUBLIC_CALENDAR_DEFAULT_TZ;
const wk = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type Cell = { key: string; d: number | null; ymd: string | null; events: PublicCampaignEvent[] };

function buildMonthCells(
  year: number,
  month1: number,
  events: PublicCampaignEvent[]
): Cell[] {
  const dim = daysInGregorianMonth(year, month1);
  const firstYmd = `${year}-${String(month1).padStart(2, "0")}-01`;
  const firstDow = weekday0SundayYmd(firstYmd, Z);
  const byYmd = new Map<string, PublicCampaignEvent[]>();
  for (const e of events) {
    const ymd = ymdInTimeZone(e.startAt, Z);
    if (!ymd.startsWith(`${year}-${String(month1).padStart(2, "0")}`)) continue;
    const list = byYmd.get(ymd) ?? [];
    list.push(e);
    byYmd.set(ymd, list);
  }
  const cells: Cell[] = [];
  for (let i = 0; i < firstDow; i += 1) {
    cells.push({ key: `pad-${i}`, d: null, ymd: null, events: [] });
  }
  for (let d = 1; d <= dim; d += 1) {
    const ymd = `${year}-${String(month1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ key: ymd, d, ymd, events: byYmd.get(ymd) ?? [] });
  }
  return cells;
}

export function PublicCalendarMonthGrid({
  ymd,
  events,
  hrefForMonth,
}: {
  ymd: string;
  events: PublicCampaignEvent[];
  hrefForMonth: (nextYmd: string) => string;
}) {
  const [ys, ms] = ymd.split("-").map((p) => parseInt(p, 10));
  const year = ys!;
  const month1 = ms!;
  const monthLabel = new Date(Date.UTC(year, month1 - 1, 1)).toLocaleString("en-US", {
    timeZone: Z,
    month: "long",
    year: "numeric",
  });
  const cells = buildMonthCells(year, month1, events);
  const prev = month1 === 1 ? { y: year - 1, m: 12 } : { y: year, m: month1 - 1 };
  const next = month1 === 12 ? { y: year + 1, m: 1 } : { y: year, m: month1 + 1 };
  const prevYm = `${prev.y}-${String(prev.m).padStart(2, "0")}-01`;
  const nextYm = `${next.y}-${String(next.m).padStart(2, "0")}-01`;

  return (
    <div className="w-full min-w-0">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-heading text-lg font-bold text-kelly-text md:text-xl">{monthLabel}</h2>
        <div className="flex flex-wrap gap-1">
          <Link
            href={hrefForMonth(prevYm)}
            className="rounded-md border border-kelly-text/12 px-2 py-1 text-xs font-semibold text-kelly-text/80 hover:border-kelly-navy/30"
            prefetch={false}
          >
            ← Prev
          </Link>
          <Link
            href={hrefForMonth(nextYm)}
            className="rounded-md border border-kelly-text/12 px-2 py-1 text-xs font-semibold text-kelly-text/80 hover:border-kelly-navy/30"
            prefetch={false}
          >
            Next →
          </Link>
        </div>
      </div>
      <p className="mb-2 text-[10px] text-kelly-text/50">
        The grid is aligned to {Z.replace(/_/g, " ")}. Event cards use each event&rsquo;s own timezone.
      </p>
      <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-bold uppercase tracking-wider text-kelly-text/45">
        {wk.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((c) => (
          <div
            key={c.key}
            className={`min-h-[4.5rem] rounded border border-kelly-text/8 p-1 text-left ${
              c.d == null ? "bg-transparent" : "bg-kelly-page"
            }`}
          >
            {c.d != null && c.ymd ? (
              <>
                <span className="text-[11px] font-bold text-kelly-text/70">{c.d}</span>
                <ul className="mt-0.5 space-y-0.5">
                  {c.events.slice(0, 3).map((e) => (
                    <li key={e.id} className="leading-tight">
                      <Link
                        href={e.detailHref}
                        className="block text-[9px] font-semibold text-kelly-navy hover:underline"
                        title={e.title}
                      >
                        <span className="font-mono text-kelly-text/70">
                          {e.timezone
                            ? new Intl.DateTimeFormat("en-US", {
                                timeZone: e.timezone,
                                hour: "numeric",
                                minute: "2-digit",
                              }).format(e.startAt)
                            : new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(
                                e.startAt,
                              )}{" "}
                        </span>
                        <span className="line-clamp-2">{e.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                {c.events.length > 3 ? (
                  <p className="mt-0.5 text-[8px] text-kelly-text/45">+{c.events.length - 3} more</p>
                ) : null}
              </>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
