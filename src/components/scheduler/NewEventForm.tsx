import { Button } from "@/components/ui/Button";
import { ARKANSAS_COUNTIES } from "@/data/kelly-county-visits";
import { createSchedulerEventAction } from "@/app/scheduler/actions";

const SELECT_CLASS =
  "mt-1 w-full rounded-md border border-kelly-navy/20 bg-white px-3 py-2 font-body text-sm text-kelly-text";

const EVENT_TYPES = [
  ["APPEARANCE", "Appearance"],
  ["RALLY", "Rally"],
  ["MEETING", "Meeting"],
  ["FESTIVAL", "Fair / festival"],
  ["TRAINING", "Training"],
  ["CANVASS", "Canvass"],
  ["FUNDRAISER", "Fundraiser"],
  ["PRESS", "Press"],
  ["OTHER", "Other"],
] as const;

export function NewEventForm() {
  return (
    <form action={createSchedulerEventAction} className="space-y-5 rounded-card border border-kelly-navy/15 bg-white p-5">
      <label className="block">
        <span className="font-body text-xs font-semibold uppercase tracking-wider text-kelly-muted">Title</span>
        <input name="title" required className={SELECT_CLASS} />
      </label>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="font-body text-xs font-semibold uppercase tracking-wider text-kelly-muted">Date</span>
          <input name="date" type="date" required className={SELECT_CLASS} />
        </label>
        <label className="block">
          <span className="font-body text-xs font-semibold uppercase tracking-wider text-kelly-muted">Start</span>
          <input name="startTime" type="time" className={SELECT_CLASS} />
        </label>
        <label className="block">
          <span className="font-body text-xs font-semibold uppercase tracking-wider text-kelly-muted">End</span>
          <input name="endTime" type="time" className={SELECT_CLASS} />
        </label>
      </div>
      <label className="block">
        <span className="font-body text-xs font-semibold uppercase tracking-wider text-kelly-muted">Type</span>
        <select name="eventType" defaultValue="APPEARANCE" className={SELECT_CLASS}>
          {EVENT_TYPES.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="font-body text-xs font-semibold uppercase tracking-wider text-kelly-muted">Location</span>
        <input name="locationName" className={SELECT_CLASS} placeholder="Venue or city" />
      </label>
      <label className="block">
        <span className="font-body text-xs font-semibold uppercase tracking-wider text-kelly-muted">County</span>
        <select name="county" className={SELECT_CLASS} defaultValue="">
          <option value="">Not set</option>
          {ARKANSAS_COUNTIES.map((county) => (
            <option key={county} value={county}>
              {county}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="font-body text-xs font-semibold uppercase tracking-wider text-kelly-muted">Public summary</span>
        <textarea name="publicSummary" rows={3} className={SELECT_CLASS} />
      </label>
      <Button type="submit" variant="primary">
        Create draft
      </Button>
    </form>
  );
}
