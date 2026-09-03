import { Button } from "@/components/ui/Button";
import {
  FIELD_ATTENDANCE_VALUES,
  KELLY_ROLE_VALUES,
  MOBILIZE_VALUES,
  TABLING_VALUES,
  VOLUNTEERS_VALUES,
  type SchedulerPublicCard,
} from "@/lib/scheduler/public-card-fields";
import {
  archiveSchedulerEventAction,
  publishSchedulerEventAction,
  saveSchedulerEventAction,
  unpublishSchedulerEventAction,
} from "@/app/scheduler/actions";

const SELECT_CLASS =
  "mt-1 w-full rounded-md border border-kelly-navy/20 bg-white px-3 py-2 font-body text-sm text-kelly-text";

function SelectField({
  name,
  label,
  value,
  options,
}: {
  name: string;
  label: string;
  value: string | null;
  options: readonly string[];
}) {
  return (
    <label className="block">
      <span className="font-body text-xs font-semibold uppercase tracking-wider text-kelly-muted">{label}</span>
      <select name={name} defaultValue={value ?? ""} className={SELECT_CLASS}>
        <option value="">Not set</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt.replace(/_/g, " ")}
          </option>
        ))}
      </select>
    </label>
  );
}

export function EventFieldEditor({
  id,
  title,
  locationName,
  publicSummary,
  card,
  isLive,
  isArchived,
  publishedBy,
  publishedAt,
  archivedBy,
  archivedAt,
  archiveReason,
  archivePlace,
}: {
  id: string;
  title: string;
  locationName: string | null;
  publicSummary: string | null;
  card: SchedulerPublicCard;
  isLive: boolean;
  isArchived: boolean;
  publishedBy: string | null;
  publishedAt: Date | null;
  archivedBy: string | null;
  archivedAt: Date | null;
  archiveReason: string | null;
  archivePlace: string | null;
}) {
  return (
    <div className="space-y-6">
      <form action={saveSchedulerEventAction} className="space-y-5 rounded-card border border-kelly-navy/15 bg-white p-5">
        <input type="hidden" name="id" value={id} />
        <label className="block">
          <span className="font-body text-xs font-semibold uppercase tracking-wider text-kelly-muted">Title</span>
          <input name="title" required defaultValue={title} className={SELECT_CLASS} />
        </label>
        <label className="block">
          <span className="font-body text-xs font-semibold uppercase tracking-wider text-kelly-muted">Location</span>
          <input name="locationName" defaultValue={locationName ?? ""} className={SELECT_CLASS} />
        </label>
        <label className="block">
          <span className="font-body text-xs font-semibold uppercase tracking-wider text-kelly-muted">Public summary</span>
          <textarea name="publicSummary" rows={3} defaultValue={publicSummary ?? ""} className={SELECT_CLASS} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField name="fieldAttendance" label="Attendance" value={card.fieldAttendance} options={FIELD_ATTENDANCE_VALUES} />
          <SelectField name="kellyRole" label="Kelly role" value={card.kellyRole} options={KELLY_ROLE_VALUES} />
          <SelectField name="tabling" label="Table" value={card.tabling} options={TABLING_VALUES} />
          <SelectField name="volunteers" label="Volunteers" value={card.volunteers} options={VOLUNTEERS_VALUES} />
          <SelectField name="mobilize" label="Mobilize" value={card.mobilize} options={MOBILIZE_VALUES} />
        </div>
        <label className="block">
          <span className="font-body text-xs font-semibold uppercase tracking-wider text-kelly-muted">Mobilize link</span>
          <input name="mobilizeHref" defaultValue={card.mobilizeHref ?? ""} className={SELECT_CLASS} placeholder="https://" />
        </label>
        <label className="block">
          <span className="font-body text-xs font-semibold uppercase tracking-wider text-kelly-muted">Volunteer link</span>
          <input name="volunteerHref" defaultValue={card.volunteerHref ?? ""} className={SELECT_CLASS} placeholder="https://" />
        </label>
        <label className="flex items-center gap-2 font-body text-sm">
          <input type="checkbox" name="needsMoreInfo" defaultChecked={card.needsMoreInfo} />
          Needs more information
        </label>
        {isArchived ? null : (
          <div className="flex flex-wrap gap-3">
            <Button type="submit" variant="outline">
              Save draft
            </Button>
            <Button type="submit" formAction={publishSchedulerEventAction} variant="primary">
              Publish to /events
            </Button>
          </div>
        )}
      </form>
      {isArchived ? (
        <div className="rounded-card border border-kelly-navy/20 bg-kelly-navy/[0.04] p-5">
          <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-navy">Archive record</p>
          <p className="mt-2 font-body text-sm text-kelly-text">
            Taken off the calendar
            {archivedAt ? ` · ${archivedAt.toISOString().slice(0, 16).replace("T", " ")} UTC` : ""}
            {archivedBy ? ` · by ${archivedBy}` : ""}
            {archivePlace ? ` · ${archivePlace}` : ""}.
          </p>
          {archiveReason ? <p className="mt-3 font-body text-sm text-kelly-text/80">Reason: {archiveReason}</p> : null}
        </div>
      ) : (
        <>
          {isLive ? (
            <form action={unpublishSchedulerEventAction} className="rounded-card border border-kelly-navy/15 bg-kelly-navy/[0.04] p-5">
              <input type="hidden" name="id" value={id} />
              <p className="font-body text-sm text-kelly-text/80">
                Live on the public site
                {publishedBy ? ` · published by ${publishedBy}` : ""}
                {publishedAt ? ` · ${publishedAt.toISOString().slice(0, 16).replace("T", " ")} UTC` : ""}.
              </p>
              <div className="mt-3">
                <Button type="submit" variant="outline">
                  Unpublish
                </Button>
              </div>
            </form>
          ) : null}
          <form action={archiveSchedulerEventAction} className="rounded-card border border-[#8a2b2b]/25 bg-white p-5">
            <input type="hidden" name="id" value={id} />
            <p className="font-heading text-lg font-bold text-kelly-text">Take off the calendar</p>
            <p className="mt-1 font-body text-sm text-kelly-text/70">
              This does not erase the event. It leaves the public site and is stored in the archive with who, when, where, and why.
            </p>
            <label className="mt-4 block">
              <span className="font-body text-xs font-semibold uppercase tracking-wider text-kelly-muted">
                Reason (required)
              </span>
              <textarea
                name="archiveReason"
                required
                minLength={8}
                rows={3}
                className={SELECT_CLASS}
                placeholder="Host cancelled, date moved, duplicate, weather, etc."
              />
            </label>
            <div className="mt-3">
              <Button type="submit" variant="outline">
                Archive event
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
