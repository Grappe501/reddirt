import type { EnrichedCalendarItem } from "@/lib/calendar/kelly-cockpit-types";

export function TravelConflictBanner({ items }: { items: EnrichedCalendarItem[] }) {
  const conflicts = items.filter((i) => i.calendarStatus === "conflict");
  if (!conflicts.length) return null;
  return (
    <div className="mb-4 rounded-lg border border-rose-500/40 bg-rose-50 px-4 py-3 font-body text-sm text-rose-950">
      <p className="font-heading text-xs font-bold uppercase tracking-wide text-rose-800">Travel / schedule conflicts</p>
      <ul className="mt-2 list-inside list-disc space-y-1 text-xs">
        {conflicts.slice(0, 8).map((c) => (
          <li key={c.id}>
            <a className="font-semibold underline-offset-2 hover:underline" href={`/admin/calendar-command-center/event/${encodeURIComponent(c.id)}`}>
              {c.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
