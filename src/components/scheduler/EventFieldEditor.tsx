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
  publishedBy,
  publishedAt,
}: {
  id: string;
  title: string;
  locationName: string | null;
  publicSummary: string | null;
  card: SchedulerPublicCard;
  isLive: boolean;
  publishedBy: string | null;
  publishedAt: Date | null;
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
        <div className="flex flex-wrap gap-3">
          <Button type="submit" variant="outline">
            Save draft
          </Button>
          <Button type="submit" formAction={publishSchedulerEventAction} variant="primary">
            Publish to /events
          </Button>
        </div>
      </form>
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
    </div>
  );
}
