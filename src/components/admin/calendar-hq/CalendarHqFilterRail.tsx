import Link from "next/link";
import { CampaignEventType, EventWorkflowState, type CalendarSourceType } from "@prisma/client";
import { calendarFiltersToSearchParams, type CalendarHqFilters } from "@/lib/calendar/hq-filters";

const h = "text-[7px] font-bold uppercase text-kelly-text/45";
const linkBase = "block rounded border border-kelly-text/10 bg-white px-1.5 py-0.5 text-[9px] text-kelly-text hover:border-kelly-navy/25";
const active = "border-kelly-navy/40 bg-amber-50/50 font-bold";

export function CalendarHqFilterRail({
  filters,
  weekKey,
  view,
  eventId,
  matrixQ,
  counties,
  sources,
  owners,
  monthYm,
}: {
  filters: CalendarHqFilters;
  weekKey: string;
  view: string;
  eventId: string | null;
  matrixQ: string | undefined;
  monthYm: string;
  counties: { id: string; displayName: string }[];
  sources: {
    id: string;
    label: string;
    displayName: string | null;
    isActive: boolean;
    color: string | null;
    sourceType: CalendarSourceType;
    isPublicFacing: boolean;
  }[];
  owners: { id: string; name: string | null; email: string }[];
}) {
  const qo = (f: CalendarHqFilters) =>
    calendarFiltersToSearchParams(f, { week: weekKey, view, event: eventId, q: matrixQ, month: view === "month" ? monthYm : undefined });

  const toggleSource = (id: string) => {
    const cur = filters.sourceIds ?? [];
    const has = cur.includes(id);
    const next = has ? cur.filter((x) => x !== id) : [...cur, id];
    return { ...filters, sourceIds: next.length ? next : null };
  };

  const clear: CalendarHqFilters = {
    sourceIds: null,
    countyId: null,
    eventType: null,
    eventWorkflowState: null,
    ownerUserId: null,
  };

  return (
    <div className="flex max-h-[min(78vh,920px)] flex-col gap-2 overflow-y-auto border-b border-kelly-text/10 bg-kelly-wash/30 p-2 text-[10px] xl:border-b-0 xl:border-r">
      <p className="font-heading text-[9px] font-bold uppercase tracking-wide text-kelly-text/60">Filters</p>
      <Link href={`/admin/workbench/calendar?${qo(clear)}`} className={`${linkBase} text-center`}>
        Clear all
      </Link>
      <p className={h}>Saved (v1)</p>
      <p className="text-[8px] text-kelly-text/40">Presets ship in Slice 9.</p>

      <p className={h}>Sources</p>
      <div className="flex flex-col gap-0.5">
        {sources.map((s) => {
          const activeSrc = filters.sourceIds?.includes(s.id);
          return (
            <Link
              key={s.id}
              href={`/admin/workbench/calendar?${qo(toggleSource(s.id))}`}
              className={`${linkBase} ${activeSrc ? active : ""} flex items-center gap-1`}
            >
              {s.color ? (
                <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: s.color }} title={s.sourceType} />
              ) : null}
              <span className="truncate">{s.displayName || s.label}</span>
              {s.isPublicFacing ? <span className="text-[6px] text-kelly-slate">PUB</span> : null}
            </Link>
          );
        })}
        {sources.length === 0 ? <span className="text-[8px] text-kelly-text/40">No CalendarSource rows</span> : null}
      </div>

      <p className={h}>County</p>
      <div className="flex max-h-28 flex-col gap-0.5 overflow-y-auto">
        <Link href={`/admin/workbench/calendar?${qo({ ...filters, countyId: null })}`} className={`${linkBase} ${!filters.countyId ? active : ""}`}>
          All counties
        </Link>
        {counties.map((c) => (
          <Link
            key={c.id}
            href={`/admin/workbench/calendar?${qo({ ...filters, countyId: c.id })}`}
            className={`${linkBase} ${filters.countyId === c.id ? active : ""}`}
          >
            {c.displayName}
          </Link>
        ))}
      </div>

      <p className={h}>Event type</p>
      <div className="flex max-h-32 flex-col gap-0.5 overflow-y-auto">
        <Link href={`/admin/workbench/calendar?${qo({ ...filters, eventType: null })}`} className={`${linkBase} ${!filters.eventType ? active : ""}`}>
          All types
        </Link>
        {Object.values(CampaignEventType).map((t) => (
          <Link key={t} href={`/admin/workbench/calendar?${qo({ ...filters, eventType: t })}`} className={`${linkBase} ${filters.eventType === t ? active : ""}`}>
            {t}
          </Link>
        ))}
      </div>

      <p className={h}>Stage</p>
      <div className="flex max-h-36 flex-col gap-0.5 overflow-y-auto">
        <Link href={`/admin/workbench/calendar?${qo({ ...filters, eventWorkflowState: null })}`} className={`${linkBase} ${!filters.eventWorkflowState ? active : ""}`}>
          All stages
        </Link>
        {Object.values(EventWorkflowState).map((s) => (
          <Link key={s} href={`/admin/workbench/calendar?${qo({ ...filters, eventWorkflowState: s })}`} className={`${linkBase} ${filters.eventWorkflowState === s ? active : ""}`}>
            {s}
          </Link>
        ))}
      </div>

      <p className={h}>Owner</p>
      <div className="flex max-h-32 flex-col gap-0.5 overflow-y-auto">
        <Link href={`/admin/workbench/calendar?${qo({ ...filters, ownerUserId: null })}`} className={`${linkBase} ${!filters.ownerUserId ? active : ""}`}>
          Anyone
        </Link>
        {owners.map((u) => (
          <Link
            key={u.id}
            href={`/admin/workbench/calendar?${qo({ ...filters, ownerUserId: u.id })}`}
            className={`${linkBase} ${filters.ownerUserId === u.id ? active : ""}`}
          >
            {u.name || u.email}
          </Link>
        ))}
      </div>
    </div>
  );
}

