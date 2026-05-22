const VIEWS = [
  { id: "full", label: "Full campaign", hint: "Now through Election Day" },
  { id: "month", label: "Month" },
  { id: "week", label: "Week" },
  { id: "day", label: "Day" },
  { id: "hour", label: "Hourly" },
] as const;

export function CalendarViewsRoadmap() {
  return (
    <section className="rounded-2xl border border-dashed border-kelly-text/15 bg-kelly-wash p-4">
      <p className="font-body text-xs font-bold uppercase tracking-wider text-kelly-slate">Calendar views coming next</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {VIEWS.map((v) => (
          <li
            key={v.id}
            className="rounded-full border border-kelly-text/10 bg-kelly-page px-3 py-1.5 font-body text-xs font-semibold text-kelly-muted"
            title={"hint" in v ? v.hint : undefined}
          >
            {v.label}
            {"hint" in v && v.hint ? <span className="ml-1 font-normal text-kelly-text/40">({v.hint})</span> : null}
          </li>
        ))}
      </ul>
      <p className="mt-3 font-body text-xs text-kelly-subtle">
        Each view will drill down to event fact cards, notes, travel, team communication, prep, and documents.
      </p>
    </section>
  );
}
